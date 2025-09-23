import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { RoomCleanupService } from './services/room-cleanup.service';
import { Room } from './entities/room.entity';
import { RoomMember } from './entities/room-member.entity';
import { User } from '../users/entities/user.entity';
import { CoinsModule } from '../coins/coins.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, RoomMember, User]),
    // CoinsModule 제거됨 (TransactionLimitService 미사용)
  ],
  controllers: [RoomsController],
  providers: [RoomsService, RoomCleanupService],
  exports: [RoomsService],
})
export class RoomsModule {}
