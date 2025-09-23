import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoinsController } from './coins.controller';
import { CoinsService } from './coins.service';
import { CoinTransaction } from './entities/coin-transaction.entity';
import { User } from '../users/entities/user.entity';
import { RoomMember } from '../rooms/entities/room-member.entity';
import { Room } from '../rooms/entities/room.entity';
import { RankingModule } from '../ranking/ranking.module';
// TransactionLimitService 제거 (방 제한만 사용)

@Module({
  imports: [
    TypeOrmModule.forFeature([CoinTransaction, User, RoomMember, Room]),
    RankingModule,
  ],
  controllers: [CoinsController],
  providers: [CoinsService],
  exports: [CoinsService],
})
export class CoinsModule {} 