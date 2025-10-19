import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/chat.dto';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        console.log('WebSocket: Токен не предоставлен');
        client.disconnect();
        return;
      }

      // Используем тот же секрет, что и в AuthModule
      const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-hacknu-mobile-app-2024';
      
      try {
        const payload = this.jwtService.verify(token, { secret: jwtSecret });
        client.userId = payload.sub;
        
        if (client.userId) {
          this.connectedUsers.set(client.userId, client.id);
          console.log(`✅ Пользователь ${client.userId} подключился к чату`);
          
          // Уведомляем о подключении
          client.emit('connected', { userId: client.userId });
        } else {
          console.log('❌ WebSocket: Не удалось извлечь userId из токена');
          client.disconnect();
        }
      } catch (jwtError) {
        console.error('❌ WebSocket: Ошибка проверки JWT токена:', jwtError.message);
        client.disconnect();
      }
      
    } catch (error) {
      console.error('❌ WebSocket: Общая ошибка подключения:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      console.log(`Пользователь ${client.userId} отключился от чата`);
    }
  }

  @SubscribeMessage('join_chat')
  async handleJoinChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'Не авторизован' });
        return;
      }

      const chat = await this.chatService.getChatById(data.chatId, client.userId);
      client.join(data.chatId);
      
      client.emit('joined_chat', { chatId: data.chatId, chat });
      
      // Уведомляем других участников
      client.to(data.chatId).emit('user_joined', { 
        userId: client.userId, 
        chatId: data.chatId 
      });
      
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('leave_chat')
  async handleLeaveChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'Не авторизован' });
        return;
      }

      client.leave(data.chatId);
      client.emit('left_chat', { chatId: data.chatId });
      
      // Уведомляем других участников
      client.to(data.chatId).emit('user_left', { 
        userId: client.userId, 
        chatId: data.chatId 
      });
      
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: SendMessageDto,
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'Не авторизован' });
        return;
      }

      const message = await this.chatService.sendMessage(data, client.userId);
      
      // Отправляем сообщение всем участникам чата
      this.server.to(data.chatId).emit('new_message', {
        message,
        chatId: data.chatId,
      });
      
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string; isTyping: boolean },
  ) {
    try {
      if (!client.userId) {
        return;
      }

      // Уведомляем других участников о том, что пользователь печатает
      client.to(data.chatId).emit('user_typing', {
        userId: client.userId,
        chatId: data.chatId,
        isTyping: data.isTyping,
      });
      
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string },
  ) {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'Не авторизован' });
        return;
      }

      await this.chatService.markMessageAsRead(data.messageId, client.userId);
      
      client.emit('message_read', { messageId: data.messageId });
      
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  // Метод для отправки системных сообщений
  async sendSystemMessage(chatId: string, content: string) {
    const systemMessage = {
      id: `system_${Date.now()}`,
      chatId,
      userId: 'system',
      type: 'system',
      content,
      createdAt: new Date(),
      user: { name: 'Система', avatar: null },
    };

    this.server.to(chatId).emit('new_message', {
      message: systemMessage,
      chatId,
    });
  }

  // Метод для отправки уведомлений конкретному пользователю
  async sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
    }
  }
}
