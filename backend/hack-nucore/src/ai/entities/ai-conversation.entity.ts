import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { IsString, IsUUID, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { UserEntity } from '../../user/entities/user.entity';

export enum MessageType {
  TEXT = 'text',
  VOICE = 'voice',
  SYSTEM = 'system',
}

export enum AssistantRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

@Entity('ai_conversations')
export class AIConversationEntity {
  @PrimaryGeneratedColumn('uuid')
  @Index()
  id: string;

  @Column()
  @IsUUID()
  userId: string;

  @Column({ type: 'text' })
  @IsString()
  message: string;

  @Column({ type: 'enum', enum: MessageType, default: MessageType.TEXT })
  @IsEnum(MessageType)
  messageType: MessageType;

  @Column({ type: 'enum', enum: AssistantRole })
  @IsEnum(AssistantRole)
  role: AssistantRole;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  metadata?: any;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  audioUrl?: string;

  @Column({ default: false })
  isProcessed: boolean;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
