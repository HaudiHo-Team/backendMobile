import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsEmail, IsOptional, IsString, IsPhoneNumber } from 'class-validator';
import { Exclude } from 'class-transformer';
import { AccountEntity } from '../../account/entities/account.entity';
import { CardEntity } from '../../card/entities/card.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  @Index()
  id: string;

  @Column({ unique: true })
  @IsString()
  name: string;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column()
  @IsString()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  @IsPhoneNumber('KZ')
  @IsOptional()
  phone?: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  avatar?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: false })
  isPhoneVerified: boolean;

  @OneToMany(() => AccountEntity, account => account.user)
  accounts: AccountEntity[];

  @OneToMany(() => CardEntity, card => card.user)
  cards: CardEntity[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
