import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TransactionService, TransactionFilters } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('transactions')
@UseGuards(AuthGuard('jwt'))
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async createTransaction(@Body() createTransactionDto: CreateTransactionDto, @Request() req) {
    return this.transactionService.createTransaction(createTransactionDto, req.user.id);
  }

  @Get()
  async getUserTransactions(
    @Request() req,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const filters: TransactionFilters = {
      type: type as any,
      status: status as any,
      category: category as any,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    };

    return this.transactionService.getUserTransactions(req.user.id, filters);
  }

  @Get('recent')
  async getRecentTransactions(@Request() req, @Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 5;
    return this.transactionService.getRecentTransactions(req.user.id, limitNum);
  }

  @Get('stats')
  async getTransactionStats(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.transactionService.getTransactionStats(req.user.id, start, end);
  }

  @Get(':id')
  async getTransactionById(@Param('id') transactionId: string, @Request() req) {
    return this.transactionService.getTransactionById(transactionId, req.user.id);
  }
}
