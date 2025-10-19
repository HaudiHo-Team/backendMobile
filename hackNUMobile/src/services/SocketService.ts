import { io, Socket } from 'socket.io-client';
import { ChatMessage } from './ApiService';

const SOCKET_URL = 'http://localhost:3000';

export interface SocketEvents {
  // События подключения
  connected: (data: { userId: string }) => void;
  error: (data: { message: string }) => void;
  
  // События чата
  joined_chat: (data: { chatId: string; chat: any }) => void;
  left_chat: (data: { chatId: string }) => void;
  user_joined: (data: { userId: string; chatId: string }) => void;
  user_left: (data: { userId: string; chatId: string }) => void;
  
  // События сообщений
  new_message: (data: { message: ChatMessage; chatId: string }) => void;
  message_read: (data: { messageId: string }) => void;
  
  // События печати
  user_typing: (data: { userId: string; chatId: string; isTyping: boolean }) => void;
  
  // Уведомления
  notification: (data: any) => void;
}

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    this.token = token;
    this.socket = io(`${SOCKET_URL}/chat`, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Подключен к серверу чатов');
    });

    this.socket.on('disconnect', () => {
      console.log('Отключен от сервера чатов');
    });

    this.socket.on('error', (error) => {
      console.error('Ошибка Socket.IO:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Подписаться на события
  on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]) {
    if (this.socket) {
      this.socket.on(event, callback as any);
    }
  }

  // Отписаться от событий
  off<K extends keyof SocketEvents>(event: K, callback?: SocketEvents[K]) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback as any);
      } else {
        this.socket.off(event);
      }
    }
  }

  // Присоединиться к чату
  joinChat(chatId: string) {
    if (this.socket) {
      this.socket.emit('join_chat', { chatId });
    }
  }

  // Покинуть чат
  leaveChat(chatId: string) {
    if (this.socket) {
      this.socket.emit('leave_chat', { chatId });
    }
  }

  // Отправить сообщение
  sendMessage(data: {
    chatId: string;
    type: 'text' | 'image' | 'file';
    content: string;
    fileName?: string;
    fileUrl?: string;
    replyToId?: string;
  }) {
    if (this.socket) {
      this.socket.emit('send_message', data);
    }
  }

  // Отметить сообщение как прочитанное
  markAsRead(messageId: string) {
    if (this.socket) {
      this.socket.emit('mark_as_read', { messageId });
    }
  }

  // Уведомить о печати
  typing(chatId: string, isTyping: boolean) {
    if (this.socket) {
      this.socket.emit('typing', { chatId, isTyping });
    }
  }

  // Проверить статус подключения
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Получить ID сокета
  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

export const socketService = new SocketService();
