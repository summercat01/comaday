import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { RoomMember } from './entities/room-member.entity';
import { User } from '../users/entities/user.entity';
import { TransactionLimitService } from '../coins/services/transaction-limit.service';

export interface CreateRoomDto {
  name: string;
  description?: string;
  maxMembers?: number;
}

export interface JoinRoomDto {
  roomCode: string;
  userId: number;
}

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(RoomMember)
    private roomMemberRepository: Repository<RoomMember>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private transactionLimitService: TransactionLimitService,
  ) {}

  /**
   * 방 생성
   */
  async createRoom(hostUserId: number, createRoomDto: CreateRoomDto): Promise<Room> {
    const host = await this.userRepository.findOne({ where: { id: hostUserId } });
    if (!host) {
      throw new NotFoundException('방장 사용자를 찾을 수 없습니다.');
    }

    // 6자리 랜덤 방 코드 생성
    const roomCode = this.generateRoomCode();
    
    // 방 코드 중복 확인
    const existingRoom = await this.roomRepository.findOne({ 
      where: { roomCode },
      relations: ['members'] 
    });
    if (existingRoom) {
      // 재귀적으로 다시 시도 (중복 확률은 매우 낮음)
      return this.createRoom(hostUserId, createRoomDto);
    }

    const room = this.roomRepository.create({
      roomCode,
      name: createRoomDto.name,
      description: createRoomDto.description,
      hostUserId,
      maxMembers: createRoomDto.maxMembers || 4,
      status: 'ACTIVE',
      startedAt: new Date(),
    });

    const savedRoom = await this.roomRepository.save(room);

    // 방장을 자동으로 방에 추가
    await this.joinRoom(savedRoom.roomCode, hostUserId);

    // 연속 거래 제한은 글로벌하게 관리됨 (방별 설정 제거)

    return this.getRoomByCode(savedRoom.roomCode);
  }

  /**
   * 방 입장
   */
  async joinRoom(roomCode: string, userId: number): Promise<RoomMember> {
    const room = await this.roomRepository.findOne({ 
      where: { roomCode },
      relations: ['members', 'members.user'] 
    });

    if (!room) {
      throw new NotFoundException('방을 찾을 수 없습니다.');
    }

    if (!room.canJoin) {
      throw new BadRequestException('입장할 수 없는 방입니다.');
    }

    // 이미 참가 중인지 확인
    const existingMember = await this.roomMemberRepository.findOne({
      where: { roomId: room.id, userId, status: 'ACTIVE' }
    });

    if (existingMember) {
      throw new BadRequestException('이미 참가 중인 방입니다.');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const roomMember = this.roomMemberRepository.create({
      roomId: room.id,
      userId,
      status: 'ACTIVE',
    });

    return this.roomMemberRepository.save(roomMember);
  }

  /**
   * 방 나가기
   */
  async leaveRoom(roomCode: string, userId: number): Promise<void> {
    const room = await this.getRoomByCode(roomCode);
    
    const member = await this.roomMemberRepository.findOne({
      where: { roomId: room.id, userId, status: 'ACTIVE' }
    });

    if (!member) {
      throw new NotFoundException('방 멤버를 찾을 수 없습니다.');
    }

    // 방장이 나가는 경우
    if (room.hostUserId === userId) {
      // 다른 멤버가 있으면 첫 번째 멤버를 방장으로 변경
      const otherMembers = await this.roomMemberRepository.find({
        where: { roomId: room.id, status: 'ACTIVE' },
        relations: ['user']
      });

      const otherActiveMembers = otherMembers.filter(m => m.userId !== userId);
      
      if (otherActiveMembers.length > 0) {
        room.hostUserId = otherActiveMembers[0].userId;
        await this.roomRepository.save(room);
      } else {
        // 마지막 멤버가 나가면 방 삭제
        await this.deleteRoom(room.id);
        return;
      }
    }

    // 멤버 상태 변경
    member.status = 'LEFT';
    member.leftAt = new Date();
    await this.roomMemberRepository.save(member);
  }

  /**
   * 방 닫기 (호스트만 가능)
   */
  async closeRoom(roomCode: string, hostUserId: number): Promise<Room> {
    const room = await this.getRoomByCode(roomCode);

    if (room.hostUserId !== hostUserId) {
      throw new ForbiddenException('방장만 방을 닫을 수 있습니다.');
    }

    if (room.status !== 'ACTIVE') {
      throw new BadRequestException('활성 상태인 방만 닫을 수 있습니다.');
    }

    room.status = 'CLOSED';
    room.endedAt = new Date();
    
    return this.roomRepository.save(room);
  }

  /**
   * 방 목록 조회
   */
  async getRooms(page: number = 1, limit: number = 10): Promise<{ rooms: Room[], total: number }> {
    const [rooms, total] = await this.roomRepository.findAndCount({
      where: { status: 'ACTIVE' },
      relations: ['members', 'members.user'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return { rooms, total };
  }

  /**
   * 방 상세 조회 (코드로)
   */
  async getRoomByCode(roomCode: string): Promise<Room> {
    const room = await this.roomRepository.findOne({
      where: { roomCode },
      relations: ['members', 'members.user']
    });

    if (!room) {
      throw new NotFoundException('방을 찾을 수 없습니다.');
    }

    return room;
  }



  /**
   * 방 삭제
   */
  private async deleteRoom(roomId: number): Promise<void> {
    await this.roomRepository.delete(roomId);
  }

  /**
   * 6자리 랜덤 방 코드 생성
   */
  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
