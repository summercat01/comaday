import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoinTransaction } from './entities/coin-transaction.entity';
import { User } from '../users/entities/user.entity';
import { RoomMember } from '../rooms/entities/room-member.entity';
import { Room } from '../rooms/entities/room.entity';
import { RankingService } from '../ranking/ranking.service';
import { TransactionLimitService } from './services/transaction-limit.service';

@Injectable()
export class CoinsService {
  constructor(
    @InjectRepository(CoinTransaction)
    private coinTransactionRepository: Repository<CoinTransaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RoomMember)
    private roomMemberRepository: Repository<RoomMember>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    private rankingService: RankingService,
    private transactionLimitService: TransactionLimitService,
  ) {}

  async transfer(senderId: number, receiverId: number, amount: number, roomCode?: string): Promise<CoinTransaction> {
    // 방 내 거래인지 일반 거래인지 구분
    if (roomCode) {
      return this.transferInRoom(senderId, receiverId, amount, roomCode);
    } else {
      return this.transferGlobal(senderId, receiverId, amount);
    }
  }

  /**
   * 일반 포인트 거래 (User.coinCount 사용)
   */
  private async transferGlobal(senderId: number, receiverId: number, amount: number): Promise<CoinTransaction> {
    const sender = await this.userRepository.findOne({ where: { id: senderId } });
    const receiver = await this.userRepository.findOne({ where: { id: receiverId } });

    if (!sender || !receiver) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    if (sender.coinCount < amount) {
      throw new BadRequestException('코인이 부족합니다.');
    }

    // 전역 연속 거래 제한 체크
    const limitCheck = await this.transactionLimitService.checkTransactionLimit(
      senderId,
      receiverId,
      'GLOBAL'
    );

    if (!limitCheck.allowed) {
      throw new BadRequestException(limitCheck.reason || '거래가 제한되었습니다.');
    }

    sender.coinCount -= amount;
    receiver.coinCount += amount;

    await this.userRepository.save([sender, receiver]);

    const transaction = this.coinTransactionRepository.create({
      senderId: senderId,
      receiverId: receiverId,
      amount: amount,
      type: 'TRANSFER',
      description: `${receiver.username}님에게 코인 전송`,
    });

    const savedTransaction = await this.coinTransactionRepository.save(transaction);
    await this.rankingService.updateOrCreateRanking(senderId);
    await this.rankingService.updateOrCreateRanking(receiverId);
    return savedTransaction;
  }

  /**
   * 방 내 포인트 거래 (RoomMember.currentPoints 사용)
   */
  private async transferInRoom(senderId: number, receiverId: number, amount: number, roomCode: string): Promise<CoinTransaction> {
    // 방 존재 여부 확인
    const room = await this.roomRepository.findOne({ where: { roomCode } });
    if (!room) {
      throw new BadRequestException('방을 찾을 수 없습니다.');
    }

    // 방 상태 확인 (활성 상태인 방에서만 거래 가능)
    if (room.status !== 'ACTIVE') {
      throw new BadRequestException('활성 상태인 방에서만 포인트 거래가 가능합니다.');
    }

    // 방 멤버 확인
    const senderMember = await this.roomMemberRepository.findOne({
      where: { roomId: room.id, userId: senderId, status: 'ACTIVE' },
      relations: ['user']
    });
    const receiverMember = await this.roomMemberRepository.findOne({
      where: { roomId: room.id, userId: receiverId, status: 'ACTIVE' },
      relations: ['user']
    });

    if (!senderMember || !receiverMember) {
      throw new BadRequestException('방에 참가하지 않은 사용자입니다.');
    }

    // 방 내 거래는 실제로는 전역 포인트(User.coinCount)를 사용
    const sender = senderMember.user;
    const receiver = receiverMember.user;

    if (sender.coinCount < amount) {
      throw new BadRequestException('코인이 부족합니다.');
    }

    // 글로벌 연속 거래 제한 체크 (방 구분 없이 전역적으로 관리)
    const limitCheck = await this.transactionLimitService.checkTransactionLimit(
      senderId,
      receiverId,
      'GLOBAL'
    );

    if (!limitCheck.allowed) {
      throw new BadRequestException(limitCheck.reason || '거래가 제한되었습니다.');
    }

    // 전역 포인트 변경 (실제 코인 이동)
    sender.coinCount -= amount;
    receiver.coinCount += amount;

    await this.userRepository.save([sender, receiver]);

    const transaction = this.coinTransactionRepository.create({
      senderId: senderId,
      receiverId: receiverId,
      amount: amount,
      type: 'TRANSFER',
      description: `방 "${room.name}"에서 ${receiverMember.user.username}님에게 포인트 전송`,
    });

    return this.coinTransactionRepository.save(transaction);
  }

  async getTransactions(userId: number): Promise<CoinTransaction[]> {
    return this.coinTransactionRepository.find({
      where: { senderId: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllTransactions(): Promise<CoinTransaction[]> {
    return this.coinTransactionRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async earnCoins(userId: number, amount: number, description: string): Promise<CoinTransaction> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    user.coinCount += amount;
    await this.userRepository.save(user);

    const transaction = this.coinTransactionRepository.create({
      senderId: userId,
      amount,
      type: 'EARN',
      description,
    });

    return this.coinTransactionRepository.save(transaction);
  }
} 