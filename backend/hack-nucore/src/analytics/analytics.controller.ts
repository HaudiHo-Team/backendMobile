import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnalyticsService, AnalyticsFilters } from './analytics.service';

@Controller('analytics')
@UseGuards(AuthGuard('jwt'))
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  async getFinancialOverview(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('accountId') accountId?: string,
  ) {
    const filters: AnalyticsFilters = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      accountId,
    };

    return this.analyticsService.getFinancialOverview(req.user.id, filters);
  }

  @Get('categories')
  async getCategoryAnalysis(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('accountId') accountId?: string,
  ) {
    const filters: AnalyticsFilters = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      accountId,
    };

    return this.analyticsService.getCategoryAnalysis(req.user.id, filters);
  }

  @Get('trends')
  async getMonthlyTrends(
    @Request() req,
    @Query('months') months?: string,
  ) {
    const monthsNum = months ? parseInt(months) : 12;
    return this.analyticsService.getMonthlyTrends(req.user.id, monthsNum);
  }

  @Get('top-transactions')
  async getTopTransactions(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('accountId') accountId?: string,
  ) {
    const filters: AnalyticsFilters = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      accountId,
    };

    const limitNum = limit ? parseInt(limit) : 10;
    return this.analyticsService.getTopTransactions(req.user.id, limitNum, filters);
  }
}
