import { IsString, IsEnum, IsOptional } from 'class-validator';
import { MessageType, AssistantRole } from '../entities/ai-conversation.entity';

export class SendMessageDto {
  @IsString()
  message: string;

  @IsEnum(MessageType)
  @IsOptional()
  messageType?: MessageType;

  @IsOptional()
  metadata?: any;
}

export class VoiceMessageDto {
  @IsString()
  audioUrl: string;

  @IsOptional()
  metadata?: any;
}

export class AIResponseDto {
  message: string;
  role: AssistantRole;
}
