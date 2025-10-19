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
import { IsEnum, IsNumber, IsString, IsUUID, IsOptional } from 'class-validator';
import { AccountEntity } from '../../account/entities/account.entity';

export enum TransactionType {
  TRANSFER = 'transfer',
  PAYMENT = 'payment',
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  PURCHASE = 'purchase',
  UTILITY_PAYMENT = 'utility_payment',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum TransactionCategory {
  FOOD = 'food',
  TRANSPORT = 'transport',
  ENTERTAINMENT = 'entertainment',
  UTILITIES = 'utilities',
  HEALTH = 'health',
  SHOPPING = 'shopping',
  OTHER = 'other',
}

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  @Index()
  id: string;

  @Column({ type: 'enum', enum: TransactionType })
  @IsEnum(TransactionType)
  type: TransactionType;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
  @IsEnum(TransactionStatus)
  status: TransactionStatus;

  @Column({ type: 'enum', enum: TransactionCategory, default: TransactionCategory.OTHER })
  @IsEnum(TransactionCategory)
  category: TransactionCategory;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  @IsNumber()
  amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  @IsNumber()
  @IsOptional()
  fee?: number;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  recipientName?: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  recipientAccount?: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  reference?: string;

  @Column()
  @IsUUID()
  accountId: string;

  @ManyToOne(() => AccountEntity, account => account.transactions)
  @JoinColumn({ name: 'accountId' })
  account: AccountEntity;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
