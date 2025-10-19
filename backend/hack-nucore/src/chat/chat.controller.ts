import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';
import { CreateChatDto, SendMessageDto, JoinChatDto } from './dto/chat.dto';

@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async createChat(@Body() createChatDto: CreateChatDto, @Request() req) {
    return this.chatService.createChat(createChatDto, req.user.id);
  }

  @Post('support')
  async createSupportChat(@Request() req) {
    return this.chatService.createSupportChat(req.user.id);
  }

  @Get()
  async getUserChats(@Request() req) {
    return this.chatService.getUserChats(req.user.id);
  }

  @Get(':id')
  async getChatById(@Param('id') chatId: string, @Request() req) {
    return this.chatService.getChatById(chatId, req.user.id);
  }

  @Get(':id/messages')
  async getChatMessages(
    @Param('id') chatId: string,
    @Request() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const limitNum = limit ? parseInt(limit) : 50;
    const offsetNum = offset ? parseInt(offset) : 0;
    return this.chatService.getChatMessages(chatId, req.user.id, limitNum, offsetNum);
  }

  @Get(':id/messages-simple')
  async getChatMessagesSimple(@Param('id') chatId: string, @Request() req) {
    return this.chatService.getChatMessagesSimple(chatId, req.user.id);
  }

  @Post('join')
  async joinChat(@Body() joinChatDto: JoinChatDto, @Request() req) {
    return this.chatService.joinChat(joinChatDto, req.user.id);
  }

  @Post('message')
  async sendMessage(@Body() sendMessageDto: SendMessageDto, @Request() req) {
    return this.chatService.sendMessage(sendMessageDto, req.user.id);
  }

  @Post('message/:messageId/read')
  async markMessageAsRead(@Param('messageId') messageId: string, @Request() req) {
    return this.chatService.markMessageAsRead(messageId, req.user.id);
  }

  @Get('unread/count')
  async getUnreadMessagesCount(@Request() req) {
    return this.chatService.getUnreadMessagesCount(req.user.id);
  }
}
