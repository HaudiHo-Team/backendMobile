import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TransactionEntity, TransactionType, TransactionStatus, TransactionCategory } from './entities/transaction.entity';
import { AccountEntity } from '../account/entities/account.entity';
import { AccountService } from '../account/account.service';

export interface CreateTransactionDto {
  type: TransactionType;
  amount: number;
  description?: string;
  recipientName?: string;
  recipientAccount?: string;
  category?: TransactionCategory;
  accountId: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  category?: TransactionCategory;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
    @InjectRepository(AccountEntity)
    private accountRepository: Repository<AccountEntity>,
    private accountService: AccountService,
  ) {}

  async createTransaction(createTransactionDto: CreateTransactionDto, userId: string) {
    const { accountId, amount, type, description, recipientName, recipientAccount, category } = createTransactionDto;

    // Проверяем существование счета
    const account = await this.accountService.getAccountById(accountId, userId);

    // Проверяем достаточность средств для списания
    if (type !== TransactionType.DEPOSIT && Number(account.availableBalance) < amount) {
      throw new BadRequestException('Недостаточно средств на счете');
    }

    // Создаем транзакцию
    const transaction = this.transactionRepository.create({
      type,
      amount,
      description,
      recipientName,
      recipientAccount,
      category: category || TransactionCategory.OTHER,
      accountId,
      status: TransactionStatus.PENDING,
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    // Обновляем баланс счета
    const balanceChange = type === TransactionType.DEPOSIT ? amount : -amount;
    await this.accountService.updateBalance(accountId, balanceChange, userId);

    // Обновляем статус транзакции
    savedTransaction.status = TransactionStatus.COMPLETED;
    await this.transactionRepository.save(savedTransaction);

    return savedTransaction;
  }

  async getUserTransactions(userId: string, filters: TransactionFilters = {}) {
    const query = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.account', 'account')
      .where('account.userId = :userId', { userId });

    if (filters.type) {
      query.andWhere('transaction.type = :type', { type: filters.type });
    }

    if (filters.status) {
      query.andWhere('transaction.status = :status', { status: filters.status });
    }

    if (filters.category) {
      query.andWhere('transaction.category = :category', { category: filters.category });
    }

    if (filters.startDate && filters.endDate) {
      query.andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    query.orderBy('transaction.createdAt', 'DESC');

    if (filters.limit) {
      query.limit(filters.limit);
    }

    if (filters.offset) {
      query.offset(filters.offset);
    }

    return query.getMany();
  }

  async getTransactionById(transactionId: string, userId: string) {
    const transaction = await this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.account', 'account')
      .where('transaction.id = :transactionId', { transactionId })
      .andWhere('account.userId = :userId', { userId })
      .getOne();

    if (!transaction) {
      throw new NotFoundException('Транзакция не найдена');
    }

    return transaction;
  }

  async getTransactionStats(userId: string, startDate?: Date, endDate?: Date) {
    const query = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.account', 'account')
      .where('account.userId = :userId', { userId })
      .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED });

    if (startDate && endDate) {
      query.andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const transactions = await query.getMany();

    const totalIncome = transactions
      .filter(t => t.type === TransactionType.DEPOSIT)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = transactions
      .filter(t => t.type !== TransactionType.DEPOSIT)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const categoryStats = transactions.reduce((acc, transaction) => {
      const category = transaction.category;
      if (!acc[category]) {
        acc[category] = { amount: 0, count: 0 };
      }
      acc[category].amount += Number(transaction.amount);
      acc[category].count += 1;
      return acc;
    }, {});

    return {
      totalTransactions: transactions.length,
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      categoryStats,
    };
  }

  async getRecentTransactions(userId: string, limit: number = 5) {
    return this.getUserTransactions(userId, { 
      limit,
      status: TransactionStatus.COMPLETED 
    });
  }
}
