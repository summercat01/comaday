import { Controller, Post, Body, Get, Param, Request, Put } from '@nestjs/common';
import { CoinsService } from './coins.service';
import { CoinTransaction } from './entities/coin-transaction.entity';
// TransactionLimit 제거 (방 제한만 사용)
// TransactionLimitService 제거 (방 제한만 사용)
import { BulkTransferDto } from './dto/bulk-transfer.dto';

@Controller('coins')
export class CoinsController {
  constructor(
    private readonly coinsService: CoinsService,
    // transactionLimitService 제거 (방 제한만 사용)
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

  // 글로벌 거래 제한 API 제거됨 (방 기반 제한만 사용)

  /**
   * 방 기반 일괄 거래
   */
  @Post('bulk-transfer')
  async bulkTransfer(@Body() bulkTransferDto: BulkTransferDto): Promise<CoinTransaction[]> {
    return this.coinsService.bulkTransfer(bulkTransferDto);
  }

  /**
   * 방에서 사용자의 연속 거래 제한 체크
   */
  @Get('room-limit/:userId/:targetUserId/:roomCode')
  async checkRoomTransactionLimit(
    @Param('userId') userId: string,
    @Param('targetUserId') targetUserId: string,
    @Param('roomCode') roomCode: string,
  ): Promise<{ canTransact: boolean; message: string }> {
    const canTransact = await this.coinsService.checkRoomTransactionLimit(+userId, +targetUserId, roomCode);
    return {
      canTransact,
      message: canTransact ? '거래 가능' : '동일한 상대와 3회 연속 거래는 제한됩니다. 다른 사용자와 거래 후 다시 시도해주세요.'
    };
  }

  /**
   * 사용자의 방별 거래 통계 조회
   */
  @Get('room-stats/:userId/:roomCode')
  async getUserRoomTransactionStats(
    @Param('userId') userId: string,
    @Param('roomCode') roomCode: string,
  ) {
    return this.coinsService.getUserRoomTransactionStats(+userId, roomCode);
  }

  /**
   * 대기방용 모든 방의 거래 통계 조회 (특정 사용자 기준)
   */
  @Get('lobby-transaction-stats/:userId')
  async getLobbyTransactionStats(
    @Param('userId') userId: string,
  ): Promise<{
    [roomCode: string]: {
      totalTransactions: number;
      sentTransactions: number;
      receivedTransactions: number;
      canTransact: boolean;
      maxTransactions: number;
    };
  }> {
    return this.coinsService.getLobbyTransactionStats(+userId);
  }
} 