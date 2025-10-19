import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { IsString, IsUUID, IsOptional, IsEnum } from 'class-validator';
import { UserEntity } from '../../user/entities/user.entity';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
}

export enum ChatType {
  SUPPORT = 'support',
  USER_TO_USER = 'user_to_user',
  GROUP = 'group',
}

@Entity('chats')
export class ChatEntity {
  @PrimaryGeneratedColumn('uuid')
  @Index()
  id: string;

  @Column({ type: 'enum', enum: ChatType, default: ChatType.SUPPORT })
  @IsEnum(ChatType)
  type: ChatType;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => ChatParticipantEntity, participant => participant.chat)
  participants: ChatParticipantEntity[];

  @OneToMany(() => ChatMessageEntity, message => message.chat)
  messages: ChatMessageEntity[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

@Entity('chat_messages')
export class ChatMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  @Index()
  id: string;

  @Column()
  @IsUUID()
  chatId: string;

  @Column()
  @IsUUID()
  userId: string;

  @Column({ type: 'enum', enum: MessageType, default: MessageType.TEXT })
  @IsEnum(MessageType)
  type: MessageType;

  @Column('text')
  @IsString()
  content: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  fileName?: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  fileUrl?: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  replyToId?: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ default: false })
  isEdited: boolean;

  @ManyToOne(() => ChatEntity)
  @JoinColumn({ name: 'chatId' })
  chat: ChatEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

@Entity('chat_participants')
export class ChatParticipantEntity {
  @PrimaryGeneratedColumn('uuid')
  @Index()
  id: string;

  @Column()
  @IsUUID()
  chatId: string;

  @Column()
  @IsUUID()
  userId: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  role?: string;

  @ManyToOne(() => ChatEntity)
  @JoinColumn({ name: 'chatId' })
  chat: ChatEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
