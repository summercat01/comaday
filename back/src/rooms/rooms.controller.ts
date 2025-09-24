import { 
  Controller, 
  Get, 
  Post, 
  Put,
  Delete,
  Body, 
  Param, 
  Query,
  Request
} from '@nestjs/common';
import { RoomsService, CreateRoomDto } from './rooms.service';
import { Room } from './entities/room.entity';
import { RoomMember } from './entities/room-member.entity';
import { 
  RequiredFieldException
} from '../common/exceptions/custom.exceptions';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  /**
   * 방 생성
   */
  @Post()
  async createRoom(
    @Body() createRoomDto: CreateRoomDto
  ): Promise<Room> {
    return this.roomsService.createRoom(createRoomDto);
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
   * 대기방용 모든 방 기본 정보 조회 (통합 API)
   */
  @Get('lobby-status')
  async getLobbyStatus(): Promise<{
    rooms: Array<{
      roomCode: string;
      roomNumber: number;
      name: string;
      gameName?: string;
      memberCount: number;
      maxMembers: number;
    }>;
    totalRooms: number;
  }> {
    return this.roomsService.getLobbyStatus();
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
      throw new RequiredFieldException('사용자 ID');
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
      throw new RequiredFieldException('사용자 ID');
    }
    await this.roomsService.leaveRoom(roomCode, userId);
    return { message: '방에서 나갔습니다.' };
  }

  /**
   * 즉시 방 나가기 (페이지 벗어날 때 사용)
   */
  @Post(':roomCode/leave-immediately')
  async leaveRoomImmediately(
    @Param('roomCode') roomCode: string,
    @Body('userId') userId: number
  ): Promise<{ success: boolean; message: string }> {
    if (!userId) {
      throw new RequiredFieldException('사용자 ID');
    }
    return this.roomsService.leaveRoomImmediately(roomCode, userId);
  }

  /**
   * 사용자가 방 멤버인지 확인
   */
  @Get(':roomCode/check-member/:userId')
  async checkMembership(
    @Param('roomCode') roomCode: string,
    @Param('userId') userId: string
  ): Promise<{ isMember: boolean; memberInfo?: any }> {
    return this.roomsService.checkMembership(roomCode, +userId);
  }

  /**
   * 방 삭제 (사용자 생성 방만 가능)
   */
  @Post(':roomCode/close')
  async closeRoom(
    @Param('roomCode') roomCode: string
  ): Promise<{ message: string }> {
    return this.roomsService.closeRoom(roomCode);
  }


  /**
   * 방 제목 변경 (방 멤버 누구나 가능)
   */
  @Put(':roomCode/name')
  async updateRoomName(
    @Param('roomCode') roomCode: string,
    @Body('userId') userId: number,
    @Body('name') name: string
  ): Promise<Room> {
    if (!userId) {
      throw new RequiredFieldException('사용자 ID');
    }
    if (!name || name.trim().length === 0) {
      throw new RequiredFieldException('방 제목');
    }
    return this.roomsService.updateRoomName(roomCode, userId, name);
  }

  /**
   * 게임명 변경 (방 멤버 누구나 가능)
   */
  @Put(':roomCode/game-name')
  async updateGameName(
    @Param('roomCode') roomCode: string,
    @Body('userId') userId: number,
    @Body('gameName') gameName: string
  ): Promise<Room> {
    if (!userId) {
      throw new RequiredFieldException('사용자 ID');
    }
    return this.roomsService.updateGameName(roomCode, userId, gameName);
  }


}
