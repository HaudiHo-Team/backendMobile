import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { MessageType, ChatType } from '../entities/chat.entity';

export class CreateChatDto {
  @IsEnum(ChatType)
  type: ChatType;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class SendMessageDto {
  @IsUUID()
  chatId: string;

  @IsEnum(MessageType)
  type: MessageType;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsUUID()
  replyToId?: string;
}

export class JoinChatDto {
  @IsUUID()
  chatId: string;
}
