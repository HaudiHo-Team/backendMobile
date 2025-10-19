import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountEntity, AccountType } from './entities/account.entity';
import { UserEntity } from '../user/entities/user.entity';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountEntity)
    private accountRepository: Repository<AccountEntity>,
  ) {}

  async getUserAccounts(userId: string): Promise<AccountEntity[]> {
    return this.accountRepository.find({
      where: { userId, isActive: true },
      order: { createdAt: 'ASC' },
    });
  }

  async getAccountById(accountId: string, userId: string): Promise<AccountEntity> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId, userId },
    });

    if (!account) {
      throw new NotFoundException('Счет не найден');
    }

    return account;
  }

  async getAccountBalance(accountId: string, userId: string) {
    const account = await this.getAccountById(accountId, userId);
    
    return {
      accountId: account.id,
      accountNumber: account.accountNumber,
      type: account.type,
      balance: account.balance,
      availableBalance: account.availableBalance,
      currency: account.currency,
    };
  }

  async getTotalBalance(userId: string) {
    const accounts = await this.getUserAccounts(userId);
    
    const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance), 0);
    const totalAvailableBalance = accounts.reduce((sum, account) => sum + Number(account.availableBalance), 0);

    const mainAccount = accounts.find(account => account.type === AccountType.MAIN);
    const savingsAccount = accounts.find(account => account.type === AccountType.SAVINGS);

    return {
      totalBalance,
      totalAvailableBalance,
      mainAccount: mainAccount ? {
        balance: mainAccount.balance,
        availableBalance: mainAccount.availableBalance,
      } : null,
      savingsAccount: savingsAccount ? {
        balance: savingsAccount.balance,
        availableBalance: savingsAccount.availableBalance,
      } : null,
      accounts: accounts.map(account => ({
        id: account.id,
        accountNumber: account.accountNumber,
        type: account.type,
        balance: account.balance,
        availableBalance: account.availableBalance,
        currency: account.currency,
      })),
    };
  }

  async updateBalance(accountId: string, amount: number, userId: string) {
    const account = await this.getAccountById(accountId, userId);
    
    const newBalance = Number(account.balance) + amount;
    
    if (newBalance < 0) {
      throw new BadRequestException('Недостаточно средств на счете');
    }

    account.balance = newBalance;
    account.availableBalance = newBalance; // В реальном приложении здесь может быть логика блокировки средств

    return this.accountRepository.save(account);
  }

  async createAccount(userId: string, type: AccountType, initialBalance: number = 0) {
    const accountNumber = this.generateAccountNumber();
    
    const account = this.accountRepository.create({
      accountNumber,
      type,
      balance: initialBalance,
      availableBalance: initialBalance,
      currency: 'KZT',
      userId,
    });

    return this.accountRepository.save(account);
  }

  private generateAccountNumber(): string {
    const randomDigits = Math.floor(Math.random() * 10000000000000000000).toString().padStart(20, '0');
    return `KZ${randomDigits}`;
  }
}
