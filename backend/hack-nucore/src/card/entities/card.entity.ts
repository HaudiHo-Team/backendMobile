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
import { IsEnum, IsString, IsUUID, IsOptional, IsDateString } from 'class-validator';
import { UserEntity } from '../../user/entities/user.entity';

export enum CardType {
  DEBIT = 'debit',
  CREDIT = 'credit',
  PREPAID = 'prepaid',
}

export enum CardStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  EXPIRED = 'expired',
  PENDING = 'pending',
}

@Entity('cards')
export class CardEntity {
  @PrimaryGeneratedColumn('uuid')
  @Index()
  id: string;

  @Column()
  @IsString()
  cardNumber: string;

  @Column()
  @IsString()
  maskedNumber: string;

  @Column({ type: 'enum', enum: CardType })
  @IsEnum(CardType)
  type: CardType;

  @Column({ type: 'enum', enum: CardStatus, default: CardStatus.PENDING })
  @IsEnum(CardStatus)
  status: CardStatus;

  @Column()
  @IsString()
  holderName: string;

  @Column()
  @IsDateString()
  expiryDate: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  cvv?: string;

  @Column({ default: true })
  isDefault: boolean;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  bankName?: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  cardDesign?: string;

  @Column()
  @IsUUID()
  userId: string;

  @ManyToOne(() => UserEntity, user => user.cards)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
