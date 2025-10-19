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
import { IsEnum, IsNumber, IsString, IsUUID } from 'class-validator';
import { UserEntity } from '../../user/entities/user.entity';
import { TransactionEntity } from '../../transaction/entities/transaction.entity';

export enum AccountType {
  MAIN = 'main',
  SAVINGS = 'savings',
  BUSINESS = 'business',
}

@Entity('accounts')
export class AccountEntity {
  @PrimaryGeneratedColumn('uuid')
  @Index()
  id: string;

  @Column()
  @IsString()
  accountNumber: string;

  @Column({ type: 'enum', enum: AccountType, default: AccountType.MAIN })
  @IsEnum(AccountType)
  type: AccountType;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @IsNumber()
  balance: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  @IsNumber()
  availableBalance: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  @IsString()
  currency: string;

  @Column()
  @IsUUID()
  userId: string;

  @ManyToOne(() => UserEntity, user => user.accounts)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @OneToMany(() => TransactionEntity, transaction => transaction.account)
  transactions: TransactionEntity[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
