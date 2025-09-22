import { 
  Controller, 
  Get, 
  Post, 
  Put,
  Delete,
  Body, 
  Param, 
  Query,
  BadRequestException,
  UseGuards,
  Request
} from '@nestjs/common';
import { RoomsService, CreateRoomDto } from './rooms.service';
import { Room } from './entities/room.entity';
import { RoomMember } from './entities/room-member.entity';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  /**
   * 방 생성
   */
  @Post()
  async createRoom(
    @Body() createRoomDto: CreateRoomDto & { hostUserId: number }
  ): Promise<Room> {
    const { hostUserId, ...roomData } = createRoomDto;
    return this.roomsService.createRoom(hostUserId, roomData);
  }

  /**
   * 방 목록 조회
   */
  @Get()
  async getRooms(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<{ rooms: Room[], total: number }> {
    return this.roomsService.getRooms(page, limit);
  }

  /**
   * 방 상세 조회
   */
  @Get(':roomCode')
  async getRoomByCode(@Param('roomCode') roomCode: string): Promise<Room> {
    return this.roomsService.getRoomByCode(roomCode);
  }

  /**
   * 방 입장
   */
  @Post(':roomCode/join')
  async joinRoom(
    @Param('roomCode') roomCode: string,
    @Body('userId') userId: number
  ): Promise<RoomMember> {
    if (!userId) {
      throw new BadRequestException('사용자 ID가 필요합니다.');
    }
    return this.roomsService.joinRoom(roomCode, userId);
  }

  /**
   * 방 나가기
   */
  @Post(':roomCode/leave')
  async leaveRoom(
    @Param('roomCode') roomCode: string,
    @Body('userId') userId: number
  ): Promise<{ message: string }> {
    if (!userId) {
      throw new BadRequestException('사용자 ID가 필요합니다.');
    }
    await this.roomsService.leaveRoom(roomCode, userId);
    return { message: '방에서 나갔습니다.' };
  }

  /**
   * 방 닫기 (방장만 가능)
   */
  @Post(':roomCode/close')
  async closeRoom(
    @Param('roomCode') roomCode: string,
    @Body('hostUserId') hostUserId: number
  ): Promise<Room> {
    if (!hostUserId) {
      throw new BadRequestException('방장 ID가 필요합니다.');
    }
    return this.roomsService.closeRoom(roomCode, hostUserId);
  }
}
