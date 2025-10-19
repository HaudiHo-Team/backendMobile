import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AccountService } from './account.service';

@Controller('accounts')
@UseGuards(AuthGuard('jwt'))
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get()
  async getUserAccounts(@Request() req) {
    return this.accountService.getUserAccounts(req.user.id);
  }

  @Get('balance')
  async getTotalBalance(@Request() req) {
    return this.accountService.getTotalBalance(req.user.id);
  }

  @Get(':id')
  async getAccountById(@Param('id') accountId: string, @Request() req) {
    return this.accountService.getAccountById(accountId, req.user.id);
  }

  @Get(':id/balance')
  async getAccountBalance(@Param('id') accountId: string, @Request() req) {
    return this.accountService.getAccountBalance(accountId, req.user.id);
  }
}
