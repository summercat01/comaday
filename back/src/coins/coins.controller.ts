import { Controller, Post, Body, Get, Param, UseGuards, Request, Put } from '@nestjs/common';
import { CoinsService } from './coins.service';
import { CoinTransaction } from './entities/coin-transaction.entity';
import { TransactionLimit } from './entities/transaction-limit.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TransactionLimitService } from './services/transaction-limit.service';

@Controller('coins')
export class CoinsController {
  constructor(
    private readonly coinsService: CoinsService,
    private readonly transactionLimitService: TransactionLimitService,
  ) {}

  @Post('transfer')
  async transfer(
    @Body('senderId') senderId: number,
    @Body('receiverId') receiverId: number,
    @Body('amount') amount: number,
    @Body('roomCode') roomCode?: string,
  ): Promise<CoinTransaction> {
    return this.coinsService.transfer(senderId, receiverId, amount, roomCode);
  }

  @Get('history/:userId')
  async getTransactions(@Param('userId') userId: string): Promise<CoinTransaction[]> {
    return this.coinsService.getTransactions(+userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('transactions')
  async getAllTransactions(): Promise<CoinTransaction[]> {
    return this.coinsService.getAllTransactions();
  }

  @Post('earn')
  async earnCoins(
    @Request() req,
    @Body('amount') amount: number,
    @Body('description') description: string,
  ): Promise<CoinTransaction> {
    return this.coinsService.earnCoins(req.user.id, amount, description);
  }

  // 거래 제한 설정 관리 API
  @Get('limits')
  async getTransactionLimits(
    @Param('scope') scope?: string,
    @Param('scopeId') scopeId?: string,
  ): Promise<TransactionLimit[]> {
    return this.transactionLimitService.getLimits(scope, scopeId);
  }

  @Put('limits/:id')
  async updateTransactionLimit(
    @Param('id') id: string,
    @Body() updates: Partial<TransactionLimit>,
  ): Promise<TransactionLimit> {
    return this.transactionLimitService.updateLimit(+id, updates);
  }

  @Post('limits/check')
  async checkTransactionLimit(
    @Body('senderId') senderId: number,
    @Body('receiverId') receiverId: number,
    @Body('scope') scope: string = 'GLOBAL',
  ): Promise<{ allowed: boolean; reason?: string }> {
    return this.transactionLimitService.checkTransactionLimit(senderId, receiverId, scope);
  }
} 