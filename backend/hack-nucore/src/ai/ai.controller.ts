import { Controller, Post, Get, Delete, Body, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AIService } from './ai.service';
import { SendMessageDto, VoiceMessageDto } from './dto/ai.dto';

@Controller('ai')
@UseGuards(AuthGuard('jwt'))
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('message')
  async sendMessage(@Body() sendMessageDto: SendMessageDto, @Request() req) {
    return this.aiService.processTextMessage(req.user.id, sendMessageDto);
  }

  @Post('voice')
  async sendVoiceMessage(@Body() voiceMessageDto: VoiceMessageDto, @Request() req) {
    return this.aiService.processVoiceMessage(req.user.id, voiceMessageDto);
  }

  @Get('conversation')
  async getConversationHistory(
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit) : 50;
    return this.aiService.getConversationHistory(req.user.id, limitNum);
  }

  @Delete('conversation')
  async clearConversationHistory(@Request() req) {
    await this.aiService.clearConversationHistory(req.user.id);
    return { message: 'История разговора очищена' };
  }
}
