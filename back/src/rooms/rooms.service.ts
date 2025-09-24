import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { RoomMember } from './entities/room-member.entity';
import { User } from '../users/entities/user.entity';
// TransactionLimitService 제거 (방 제한만 사용)

export interface CreateRoomDto {
  name: string;
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
    // transactionLimitService 제거 (방 제한만 사용)
  ) {}

  /**
   * 방 생성
   */
  async createRoom(createRoomDto: CreateRoomDto): Promise<Room> {
    // 6자리 랜덤 방 코드 생성
    const roomCode = this.generateRoomCode();
    
    // 방 코드 중복 확인
    const existingRoom = await this.roomRepository.findOne({ 
      where: { roomCode },
      relations: ['members'] 
    });
    if (existingRoom) {
      // 재귀적으로 다시 시도 (중복 확률은 매우 낮음)
      return this.createRoom(createRoomDto);
    }

    const room = this.roomRepository.create({
      roomCode,
      name: createRoomDto.name,
      originalName: createRoomDto.name, // 원래 이름 저장
      gameName: null,
      originalGameName: null, // 원래 게임 이름 저장
      maxMembers: createRoomDto.maxMembers || 4,
      startedAt: new Date(),
    });

    const savedRoom = await this.roomRepository.save(room);

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

    if (room.memberCount >= room.maxMembers) {
      throw new BadRequestException('방이 가득 찼습니다.');
    }

    // 이미 참가 중인지 확인
    const existingMember = await this.roomMemberRepository.findOne({
      where: { roomId: room.id, userId }
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
    });

    return this.roomMemberRepository.save(roomMember);
  }

  /**
   * 방 나가기
   */
  async leaveRoom(roomCode: string, userId: number): Promise<void> {
    const room = await this.getRoomByCode(roomCode);
    
    const member = await this.roomMemberRepository.findOne({
      where: { roomId: room.id, userId }
    });

    if (!member) {
      throw new NotFoundException('방 멤버를 찾을 수 없습니다.');
    }

    // 멤버 레코드 삭제 (방 나가기)
    await this.roomMemberRepository.delete({ roomId: room.id, userId });

    // 마지막 멤버가 나갔는지 확인
    const remainingMembers = await this.roomMemberRepository.count({
      where: { roomId: room.id }
    });
    
    if (remainingMembers === 0) {
      // 시스템 룸(ROOM01-ROOM11)은 이름과 게임명 초기화, 사용자 생성 방은 삭제
      if (room.roomCode.match(/^ROOM\d{2}$/)) {
        await this.resetRoomToOriginal(room.id);
      } else {
        await this.deleteRoom(room.id);
      }
    }
  }

  /**
   * 방 삭제 (사용자 생성 방만 가능, 시스템 룸은 삭제 불가)
   */
  async closeRoom(roomCode: string): Promise<{ message: string }> {
    const room = await this.getRoomByCode(roomCode);

    // 시스템 룸(ROOM01-ROOM11)은 삭제할 수 없음
    if (room.roomCode.match(/^ROOM\d{2}$/)) {
      throw new BadRequestException('시스템 룸은 삭제할 수 없습니다.');
    }

    await this.deleteRoom(room.id);
    return { message: '방이 삭제되었습니다.' };
  }


  /**
   * 방 제목 변경 (방 멤버 누구나 가능)
   */
  async updateRoomName(roomCode: string, userId: number, newName: string): Promise<Room> {
    const room = await this.getRoomByCode(roomCode);
    
    const member = await this.roomMemberRepository.findOne({
      where: { roomId: room.id, userId }
    });
    if (!member) {
      throw new ForbiddenException('방 멤버만 제목을 변경할 수 있습니다.');
    }
    if (!newName || newName.trim().length === 0) {
      throw new BadRequestException('방 제목은 필수 입력 항목입니다.');
    }
    room.name = newName.trim();
    return this.roomRepository.save(room);
  }

  /**
   * 게임명 변경 (방 멤버 누구나 가능)
   */
  async updateGameName(roomCode: string, userId: number, newGameName: string): Promise<Room> {
    const room = await this.getRoomByCode(roomCode);
    
    const member = await this.roomMemberRepository.findOne({
      where: { roomId: room.id, userId }
    });
    if (!member) {
      throw new ForbiddenException('방 멤버만 게임명을 변경할 수 있습니다.');
    }
    room.gameName = newGameName ? newGameName.trim() : null;
    return this.roomRepository.save(room);
  }

  /**
   * 방 이름과 게임명을 원래대로 초기화 (모든 멤버가 나갔을 때 호출)
   */
  private async resetRoomToOriginal(roomId: number): Promise<void> {
    const room = await this.roomRepository.findOne({ where: { id: roomId } });
    if (room) {
      if (room.originalName !== undefined) {
        room.name = room.originalName;
      }
      if (room.originalGameName !== undefined) {
        room.gameName = room.originalGameName;
      }
      await this.roomRepository.save(room);
    }
  }

  /**
   * 방 목록 조회
   */
  async getRooms(page: number = 1, limit: number = 20): Promise<{ rooms: Room[], total: number }> {
    const [rooms, total] = await this.roomRepository.findAndCount({
      relations: ['members', 'members.user'],
      order: { 
        createdAt: 'ASC'   // 생성 순서대로
      },
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
   * 대기방용 모든 방 기본 정보 조회 (UI 전용)
   * 프론트엔드에서 인원수 기반으로 색상 처리
   */
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
    const allRooms = await this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.members', 'members')
      .where('room.roomCode LIKE :pattern', { pattern: 'ROOM__' }) // ROOM01-ROOM11 패턴
      .orderBy('room.roomCode', 'ASC')
      .getMany();

    const formattedRooms = allRooms.map(room => {
      // ROOM01 -> 1, ROOM02 -> 2 형태로 방 번호 추출
      const roomNumber = parseInt(room.roomCode.replace('ROOM', ''));
      const activeMemberCount = room.members?.length || 0;

      return {
        roomCode: room.roomCode,
        roomNumber: roomNumber,
        name: room.name,
        gameName: room.gameName,
        memberCount: activeMemberCount,
        maxMembers: room.maxMembers
      };
    });

    return {
      rooms: formattedRooms,
      totalRooms: allRooms.length
    };
  }

  /**
   * 오프라인 방에 대응하는 기본 룸 11개 생성
   */
  async createDefaultRooms(): Promise<void> {
    // 이미 룸이 존재하는지 확인
    const existingRooms = await this.roomRepository.count();
    if (existingRooms > 0) {
      console.log(`📋 이미 ${existingRooms}개의 룸이 존재합니다. 기본 룸 생성을 건너뜁니다.`);
      return;
    }

    console.log('🏗️ 오프라인 방에 대응하는 11개의 온라인 룸을 생성합니다...');

    for (let i = 1; i <= 11; i++) {
        // 1-6번 방: 최대 2명, 7-11번 방: 최대 3명
        const maxMembers = i <= 6 ? 2 : 3;
        
        const room = this.roomRepository.create({
          roomCode: `ROOM${i.toString().padStart(2, '0')}`, // ROOM01, ROOM02, ... ROOM11
          name: `${i}번 방`,
          originalName: `${i}번 방`, // 초기화용 원래 이름 저장
          gameName: null, // 게임명은 사용자가 설정
          originalGameName: null, // 초기화용 원래 게임 이름 저장
          maxMembers: maxMembers,
          startedAt: new Date(),
        });

      await this.roomRepository.save(room);
      console.log(`✅ ${i}번 방 (ROOM${i.toString().padStart(2, '0')}) 생성 완료`);
    }

    console.log('🎉 모든 기본 룸 생성이 완료되었습니다!');
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
  /**
   * 즉시 방 나가기 (페이지 벗어날 때 사용)
   * 일반 leaveRoom과 동일하지만 에러 처리를 더 관대하게
   */
  async leaveRoomImmediately(roomCode: string, userId: number): Promise<{ success: boolean; message: string }> {
    try {
      await this.leaveRoom(roomCode, userId);
      return { success: true, message: '방에서 나갔습니다.' };
    } catch (error) {
      // 이미 나간 상태이거나 방이 없어도 성공으로 처리
      console.log(`즉시 나가기 - 사용자 ${userId}, 방 ${roomCode}:`, error.message);
      return { success: true, message: '이미 나간 상태입니다.' };
    }
  }

  /**
   * 사용자가 특정 방의 멤버인지 확인
   */
  async checkMembership(roomCode: string, userId: number): Promise<{ isMember: boolean; memberInfo?: any }> {
    try {
      const room = await this.roomRepository.findOne({ where: { roomCode } });
      if (!room) {
        return { isMember: false };
      }

      const member = await this.roomMemberRepository.findOne({
        where: { roomId: room.id, userId },
        relations: ['user']
      });

      if (!member) {
        return { isMember: false };
      }

      return {
        isMember: true,
        memberInfo: {
          joinedAt: member.joinedAt
        }
      };
    } catch (error) {
      console.error('멤버십 확인 실패:', error);
      return { isMember: false };
    }
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
