import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CoinTransaction } from './entities/coin-transaction.entity';
import { User } from '../users/entities/user.entity';
import { RoomMember } from '../rooms/entities/room-member.entity';
import { Room } from '../rooms/entities/room.entity';
import { RankingService } from '../ranking/ranking.service';
// TransactionLimitService 제거 (방 제한만 사용)
import { BulkTransferDto } from './dto/bulk-transfer.dto';
import { v4 as uuidv4 } from 'uuid';
import {
  InsufficientBalanceException,
  RoomNotFoundException,
  NotRoomMemberException,
  RoomNotActiveException,
  RoomTransactionLimitException,
  UserNotFoundException,
  SameUserTransferException,
  BulkTransferFailedException,
  InvalidTransferAmountException,
  // ConsecutiveTransactionLimitException 제거 (글로벌 제한 미사용)
} from '../common/exceptions/custom.exceptions';
import { ERROR_MESSAGES } from '../common/constants/error-messages';

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
    // transactionLimitService 제거 (방 제한만 사용)
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
      throw new UserNotFoundException('사용자를 찾을 수 없습니다.');
    }

    if (sender.coinCount < amount) {
      throw new InsufficientBalanceException(ERROR_MESSAGES.COIN.INSUFFICIENT_BALANCE);
    }

    // 방 기반 제한만 적용 (글로벌 제한 제거됨)

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
      throw new RoomNotFoundException(ERROR_MESSAGES.ROOM.NOT_FOUND);
    }

    // 방 상태 확인 (활성 상태인 방에서만 거래 가능)
    if (room.status !== 'ACTIVE') {
      throw new RoomNotActiveException(ERROR_MESSAGES.ROOM.ACTIVE_ROOM_ONLY);
    }

    // 방 멤버 확인
    const senderMember = await this.roomMemberRepository.findOne({
      where: { roomId: room.id, userId: senderId },
      relations: ['user']
    });
    const receiverMember = await this.roomMemberRepository.findOne({
      where: { roomId: room.id, userId: receiverId },
      relations: ['user']
    });

    if (!senderMember || !receiverMember) {
      throw new NotRoomMemberException(ERROR_MESSAGES.ROOM.NOT_MEMBER);
    }

    // 방 내 거래는 실제로는 전역 포인트(User.coinCount)를 사용
    const sender = senderMember.user;
    const receiver = receiverMember.user;

    if (sender.coinCount < amount) {
      throw new InsufficientBalanceException(ERROR_MESSAGES.COIN.INSUFFICIENT_BALANCE);
    }

    // 방 기반 거래 제한 체크
    const canTransact = await this.checkRoomTransactionLimit(senderId, roomCode);
    if (!canTransact) {
      throw new RoomTransactionLimitException(ERROR_MESSAGES.COIN.ROOM_TRANSACTION_LIMIT);
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
      throw new UserNotFoundException('사용자를 찾을 수 없습니다.');
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

  /**
   * 방 기반 일괄 거래
   */
  async bulkTransfer(bulkTransferDto: BulkTransferDto): Promise<CoinTransaction[]> {
    const { senderId, roomCode, transfers, description } = bulkTransferDto;

    // 방 존재 여부 확인
    const room = await this.roomRepository.findOne({ where: { roomCode } });
    if (!room) {
      throw new RoomNotFoundException(ERROR_MESSAGES.ROOM.NOT_FOUND);
    }

    // 방 상태 확인
    if (room.status !== 'ACTIVE') {
      throw new RoomNotActiveException(ERROR_MESSAGES.ROOM.ROOM_NOT_ACTIVE);
    }

    // 발송자가 방 멤버인지 확인
    const senderMember = await this.roomMemberRepository.findOne({
      where: { roomId: room.id, userId: senderId },
      relations: ['user']
    });

    if (!senderMember) {
      throw new NotRoomMemberException(ERROR_MESSAGES.ROOM.NOT_MEMBER);
    }

    // 방 기반 거래 제한 체크
    const canTransact = await this.checkRoomTransactionLimit(senderId, roomCode);
    if (!canTransact) {
      throw new RoomTransactionLimitException(ERROR_MESSAGES.COIN.ROOM_TRANSACTION_LIMIT);
    }

    const sender = senderMember.user;
    
    // 총 전송 금액 계산
    const totalAmount = transfers.reduce((sum, transfer) => sum + transfer.amount, 0);
    
    if (sender.coinCount < totalAmount) {
      throw new InsufficientBalanceException(ERROR_MESSAGES.COIN.INSUFFICIENT_BALANCE);
    }

    // 모든 수신자가 방 멤버인지 확인
    const receiverIds = transfers.map(t => t.receiverId);
    const receiverMembers = await this.roomMemberRepository.find({
      where: { 
        roomId: room.id, 
        userId: In(receiverIds), 
      },
      relations: ['user']
    });

    if (receiverMembers.length !== receiverIds.length) {
      throw new NotRoomMemberException('모든 수신자가 방 멤버여야 합니다.');
    }

    // 일괄거래 그룹 ID 생성
    const groupId = uuidv4();
    const transactions: CoinTransaction[] = [];

    // 발송자 코인 차감
    sender.coinCount -= totalAmount;
    await this.userRepository.save(sender);

    // 각 수신자별로 거래 생성 및 코인 지급
    for (const transfer of transfers) {
      const receiverMember = receiverMembers.find(m => m.userId === transfer.receiverId);
      if (!receiverMember) continue;

      // 수신자 코인 증가 (0코인도 기록)
      if (transfer.amount > 0) {
        receiverMember.user.coinCount += transfer.amount;
        await this.userRepository.save(receiverMember.user);
      }

      // 거래 기록 생성
      const transaction = this.coinTransactionRepository.create({
        senderId: senderId,
        receiverId: transfer.receiverId,
        amount: transfer.amount,
        type: 'TRANSFER',
        description: description || `방 "${room.name}"에서 일괄거래`,
        groupId: groupId,
        roomCode: roomCode,
      });

      transactions.push(await this.coinTransactionRepository.save(transaction));
    }

    // 랭킹 업데이트
    await this.rankingService.updateOrCreateRanking(senderId);
    for (const member of receiverMembers) {
      const transfer = transfers.find(t => t.receiverId === member.userId);
      if (transfer && transfer.amount > 0) {
        await this.rankingService.updateOrCreateRanking(member.userId);
      }
    }

    return transactions;
  }

  /**
   * 방에서 사용자의 거래 제한 체크 (보내기 + 받기 통합 2회까지)
   */
  async checkRoomTransactionLimit(userId: number, roomCode: string): Promise<boolean> {
    const transactionCount = await this.countUserTransactionsInRoom(userId, roomCode);
    return transactionCount < 2; // 2회까지만 허용
  }

  /**
   * 방에서 사용자의 총 거래 횟수 계산 (보내기 + 받기)
   */
  private async countUserTransactionsInRoom(userId: number, roomCode: string): Promise<number> {
    // 보낸 거래 횟수 (groupId 기준으로 중복 제거)
    const sentCount = await this.coinTransactionRepository
      .createQueryBuilder('transaction')
      .select('COUNT(DISTINCT transaction.groupId)', 'count')
      .where('transaction.senderId = :userId', { userId })
      .andWhere('transaction.roomCode = :roomCode', { roomCode })
      .andWhere('transaction.groupId IS NOT NULL')
      .getRawOne();

    // 받은 거래 횟수 (groupId 기준으로 중복 제거)
    const receivedCount = await this.coinTransactionRepository
      .createQueryBuilder('transaction')
      .select('COUNT(DISTINCT transaction.groupId)', 'count')
      .where('transaction.receiverId = :userId', { userId })
      .andWhere('transaction.roomCode = :roomCode', { roomCode })
      .andWhere('transaction.groupId IS NOT NULL')
      .getRawOne();

    return parseInt(sentCount.count || '0') + parseInt(receivedCount.count || '0');
  }

  /**
   * 사용자의 방별 거래 통계 조회
   */
  async getUserRoomTransactionStats(userId: number, roomCode: string): Promise<{
    totalTransactions: number;
    sentTransactions: number;
    receivedTransactions: number;
    canTransact: boolean;
  }> {
    const sentCount = await this.coinTransactionRepository
      .createQueryBuilder('transaction')
      .select('COUNT(DISTINCT transaction.groupId)', 'count')
      .where('transaction.senderId = :userId', { userId })
      .andWhere('transaction.roomCode = :roomCode', { roomCode })
      .andWhere('transaction.groupId IS NOT NULL')
      .getRawOne();

    const receivedCount = await this.coinTransactionRepository
      .createQueryBuilder('transaction')
      .select('COUNT(DISTINCT transaction.groupId)', 'count')
      .where('transaction.receiverId = :userId', { userId })
      .andWhere('transaction.roomCode = :roomCode', { roomCode })
      .andWhere('transaction.groupId IS NOT NULL')
      .getRawOne();

    const sentTransactions = parseInt(sentCount.count || '0');
    const receivedTransactions = parseInt(receivedCount.count || '0');
    const totalTransactions = sentTransactions + receivedTransactions;

    return {
      totalTransactions,
      sentTransactions,
      receivedTransactions,
      canTransact: totalTransactions < 2
    };
  }

  /**
   * 대기방용 모든 방의 거래 통계 조회 (특정 사용자 기준)
   */
  async getLobbyTransactionStats(userId: number): Promise<{
    [roomCode: string]: {
      totalTransactions: number;
      sentTransactions: number;
      receivedTransactions: number;
      canTransact: boolean;
      maxTransactions: number;
    };
  }> {
    // 모든 방 코드 조회 (ROOM01~ROOM11)
    const allRoomCodes = Array.from({ length: 11 }, (_, i) => 
      `ROOM${(i + 1).toString().padStart(2, '0')}`
    );

    const result: {
      [roomCode: string]: {
        totalTransactions: number;
        sentTransactions: number;
        receivedTransactions: number;
        canTransact: boolean;
        maxTransactions: number;
      };
    } = {};

    // 각 방별로 거래 통계 조회
    for (const roomCode of allRoomCodes) {
      const stats = await this.getUserRoomTransactionStats(userId, roomCode);
      result[roomCode] = {
        ...stats,
        maxTransactions: 2 // 방별 최대 거래 횟수
      };
    }

    return result;
  }
} 