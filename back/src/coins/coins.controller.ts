import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { CoinsService } from './coins.service';
import { CoinTransaction } from './entities/coin-transaction.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('coins')
export class CoinsController {
  constructor(private readonly coinsService: CoinsService) {}

  @Post('transfer')
  async transfer(
    @Body('senderId') senderId: number,
    @Body('receiverId') receiverId: number,
    @Body('amount') amount: number,
  ): Promise<CoinTransaction> {
    return this.coinsService.transfer(senderId, receiverId, amount);
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
} 