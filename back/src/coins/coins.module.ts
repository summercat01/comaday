import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoinsController } from './coins.controller';
import { CoinsService } from './coins.service';
import { CoinTransaction } from './entities/coin-transaction.entity';
import { TransactionLimit } from './entities/transaction-limit.entity';
import { User } from '../users/entities/user.entity';
import { RoomMember } from '../rooms/entities/room-member.entity';
import { Room } from '../rooms/entities/room.entity';
import { RankingModule } from '../ranking/ranking.module';
import { TransactionLimitService } from './services/transaction-limit.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CoinTransaction, TransactionLimit, User, RoomMember, Room]),
    RankingModule,
  ],
  controllers: [CoinsController],
  providers: [CoinsService, TransactionLimitService],
  exports: [CoinsService, TransactionLimitService],
})
export class CoinsModule {} 