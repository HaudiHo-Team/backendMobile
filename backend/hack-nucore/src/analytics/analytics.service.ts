import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TransactionEntity, TransactionCategory, TransactionStatus } from '../transaction/entities/transaction.entity';
import { AccountEntity } from '../account/entities/account.entity';

export interface AnalyticsFilters {
  startDate?: Date;
  endDate?: Date;
  accountId?: string;
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
    @InjectRepository(AccountEntity)
    private accountRepository: Repository<AccountEntity>,
  ) {}

  async getFinancialOverview(userId: string, filters: AnalyticsFilters = {}) {
    const query = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.account', 'account')
      .where('account.userId = :userId', { userId })
      .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED });

    if (filters.startDate && filters.endDate) {
      query.andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    if (filters.accountId) {
      query.andWhere('transaction.accountId = :accountId', { accountId: filters.accountId });
    }

    const transactions = await query.getMany();

    const totalIncome = transactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = transactions
      .filter(t => t.type !== 'deposit')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const netBalance = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      netBalance,
      transactionCount: transactions.length,
    };
  }

  async getCategoryAnalysis(userId: string, filters: AnalyticsFilters = {}) {
    const query = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.account', 'account')
      .where('account.userId = :userId', { userId })
      .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED });

    if (filters.startDate && filters.endDate) {
      query.andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    if (filters.accountId) {
      query.andWhere('transaction.accountId = :accountId', { accountId: filters.accountId });
    }

    const transactions = await query.getMany();

    const categoryStats = transactions.reduce((acc, transaction) => {
      const category = transaction.category;
      if (!acc[category]) {
        acc[category] = { amount: 0, count: 0, percentage: 0 };
      }
      acc[category].amount += Number(transaction.amount);
      acc[category].count += 1;
      return acc;
    }, {});

    const totalExpenses = Object.values(categoryStats).reduce((sum: number, stat: any) => sum + stat.amount, 0) as number;

    // Вычисляем проценты
    Object.keys(categoryStats).forEach(category => {
      (categoryStats as any)[category].percentage = totalExpenses > 0 
        ? ((categoryStats as any)[category].amount / totalExpenses) * 100 
        : 0;
    });

    return {
      categories: categoryStats,
      totalExpenses,
    };
  }

  async getMonthlyTrends(userId: string, months: number = 12) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const query = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.account', 'account')
      .where('account.userId = :userId', { userId })
      .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED })
      .andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    const transactions = await query.getMany();

    const monthlyData = {};
    
    transactions.forEach(transaction => {
      const monthKey = transaction.createdAt.toISOString().substring(0, 7); // YYYY-MM
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          income: 0,
          expenses: 0,
          netBalance: 0,
        };
      }

      if (transaction.type === 'deposit') {
        monthlyData[monthKey].income += Number(transaction.amount);
      } else {
        monthlyData[monthKey].expenses += Number(transaction.amount);
      }
    });

    // Вычисляем чистый баланс для каждого месяца
    Object.keys(monthlyData).forEach(month => {
      monthlyData[month].netBalance = monthlyData[month].income - monthlyData[month].expenses;
    });

    return monthlyData;
  }

  async getTopTransactions(userId: string, limit: number = 10, filters: AnalyticsFilters = {}) {
    const query = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.account', 'account')
      .where('account.userId = :userId', { userId })
      .andWhere('transaction.status = :status', { status: TransactionStatus.COMPLETED });

    if (filters.startDate && filters.endDate) {
      query.andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    if (filters.accountId) {
      query.andWhere('transaction.accountId = :accountId', { accountId: filters.accountId });
    }

    return query
      .orderBy('transaction.amount', 'DESC')
      .limit(limit)
      .getMany();
  }
}
