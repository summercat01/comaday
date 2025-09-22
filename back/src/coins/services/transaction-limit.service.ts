import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoinTransaction } from '../entities/coin-transaction.entity';
import { TransactionLimit } from '../entities/transaction-limit.entity';

@Injectable()
export class TransactionLimitService {
  constructor(
    @InjectRepository(CoinTransaction)
    private coinTransactionRepository: Repository<CoinTransaction>,
    @InjectRepository(TransactionLimit)
    private transactionLimitRepository: Repository<TransactionLimit>,
  ) {}

  /**
   * 연속 거래 제한 체크
   * @param senderId 보내는 사람 ID
   * @param receiverId 받는 사람 ID
   * @param scope 제한 범위 (현재는 GLOBAL만 사용)
   * @param scopeId 세션/방 ID (나중에 사용)
   */
  async checkTransactionLimit(
    senderId: number,
    receiverId: number,
    scope: string = 'GLOBAL',
    scopeId?: string
  ): Promise<{ allowed: boolean; reason?: string; limit?: TransactionLimit }> {
    // 활성화된 제한 설정 조회
    const limits = await this.transactionLimitRepository.find({
      where: { 
        scope: scope as any, 
        scopeId: scopeId || null,
        isActive: true 
      },
    });

    if (limits.length === 0) {
      return { allowed: true };
    }

    // 각 제한 규칙에 대해 체크
    for (const limit of limits) {
      const checkResult = await this.checkSpecificLimit(senderId, receiverId, limit);
      if (!checkResult.allowed) {
        return checkResult;
      }
    }

    return { allowed: true };
  }

  /**
   * 특정 제한 규칙 체크
   */
  private async checkSpecificLimit(
    senderId: number,
    receiverId: number,
    limit: TransactionLimit
  ): Promise<{ allowed: boolean; reason?: string; limit?: TransactionLimit }> {
    let timeCondition = {};
    
    // 시간 윈도우가 설정된 경우
    if (limit.timeWindowMinutes > 0) {
      const timeAgo = new Date();
      timeAgo.setMinutes(timeAgo.getMinutes() - limit.timeWindowMinutes);
      timeCondition = { createdAt: { $gte: timeAgo } };
    }

    switch (limit.limitType) {
      case 'CONSECUTIVE_PAIR':
        return await this.checkConsecutivePairLimit(senderId, receiverId, limit, timeCondition);
      
      case 'CONSECUTIVE_SEND':
        return await this.checkConsecutiveSendLimit(senderId, receiverId, limit, timeCondition);
      
      case 'CONSECUTIVE_RECEIVE':
        return await this.checkConsecutiveReceiveLimit(senderId, receiverId, limit, timeCondition);
      
      default:
        return { allowed: true };
    }
  }

  /**
   * 양방향 연속 거래 제한 체크 (A↔B 패턴)
   */
  private async checkConsecutivePairLimit(
    senderId: number,
    receiverId: number,
    limit: TransactionLimit,
    timeCondition: any
  ): Promise<{ allowed: boolean; reason?: string; limit?: TransactionLimit }> {
    // 최근 거래 내역을 시간순으로 조회
    let query = this.coinTransactionRepository
      .createQueryBuilder('t')
      .where('((t.senderId = :senderId AND t.receiverId = :receiverId) OR (t.senderId = :receiverId AND t.receiverId = :senderId))', 
        { senderId, receiverId })
      .andWhere('t.type = :type', { type: 'TRANSFER' });

    // 시간 제한이 있는 경우
    if (limit.timeWindowMinutes > 0) {
      const timeAgo = new Date();
      timeAgo.setMinutes(timeAgo.getMinutes() - limit.timeWindowMinutes);
      query = query.andWhere('t.createdAt >= :timeAgo', { timeAgo });
    }

    const recentTransactions = await query
      .orderBy('t.createdAt', 'DESC')
      .limit(20) // 최근 20개만 체크 (성능 고려)
      .getMany();

    if (recentTransactions.length === 0) {
      return { allowed: true };
    }

    // 연속 거래 카운트
    let consecutiveCount = 0;
    
    for (const transaction of recentTransactions) {
      // A↔B 간의 거래인지 확인
      const isPairTransaction = 
        (transaction.senderId === senderId && transaction.receiverId === receiverId) ||
        (transaction.senderId === receiverId && transaction.receiverId === senderId);
      
      if (isPairTransaction) {
        consecutiveCount++;
      } else {
        // 다른 사람과의 거래가 끼어들면 연속성 중단
        break;
      }
    }

    if (consecutiveCount >= limit.maxCount) {
      return {
        allowed: false,
        reason: `같은 사용자와 ${limit.maxCount}회 연속 거래는 제한됩니다. 다른 사용자와 거래 후 다시 시도해주세요.`,
        limit
      };
    }

    return { allowed: true };
  }

  /**
   * 일방향 연속 발송 제한 체크 (A → B 패턴)
   */
  private async checkConsecutiveSendLimit(
    senderId: number,
    receiverId: number,
    limit: TransactionLimit,
    timeCondition: any
  ): Promise<{ allowed: boolean; reason?: string; limit?: TransactionLimit }> {
    let query = this.coinTransactionRepository
      .createQueryBuilder('t')
      .where('t.senderId = :senderId', { senderId })
      .andWhere('t.type = :type', { type: 'TRANSFER' });

    // 시간 제한이 있는 경우
    if (limit.timeWindowMinutes > 0) {
      const timeAgo = new Date();
      timeAgo.setMinutes(timeAgo.getMinutes() - limit.timeWindowMinutes);
      query = query.andWhere('t.createdAt >= :timeAgo', { timeAgo });
    }

    const recentTransactions = await query
      .orderBy('t.createdAt', 'DESC')
      .limit(20)
      .getMany();

    let consecutiveCount = 0;
    
    for (const transaction of recentTransactions) {
      if (transaction.receiverId === receiverId) {
        consecutiveCount++;
      } else {
        break;
      }
    }

    if (consecutiveCount >= limit.maxCount) {
      return {
        allowed: false,
        reason: `같은 사용자에게 ${limit.maxCount}회 연속 발송은 제한됩니다.`,
        limit
      };
    }

    return { allowed: true };
  }

  /**
   * 일방향 연속 수신 제한 체크 (A ← B 패턴)
   */
  private async checkConsecutiveReceiveLimit(
    senderId: number,
    receiverId: number,
    limit: TransactionLimit,
    timeCondition: any
  ): Promise<{ allowed: boolean; reason?: string; limit?: TransactionLimit }> {
    let query = this.coinTransactionRepository
      .createQueryBuilder('t')
      .where('t.receiverId = :receiverId', { receiverId })
      .andWhere('t.type = :type', { type: 'TRANSFER' });

    // 시간 제한이 있는 경우
    if (limit.timeWindowMinutes > 0) {
      const timeAgo = new Date();
      timeAgo.setMinutes(timeAgo.getMinutes() - limit.timeWindowMinutes);
      query = query.andWhere('t.createdAt >= :timeAgo', { timeAgo });
    }

    const recentTransactions = await query
      .orderBy('t.createdAt', 'DESC')
      .limit(20)
      .getMany();

    let consecutiveCount = 0;
    
    for (const transaction of recentTransactions) {
      if (transaction.senderId === senderId) {
        consecutiveCount++;
      } else {
        break;
      }
    }

    if (consecutiveCount >= limit.maxCount) {
      return {
        allowed: false,
        reason: `같은 사용자로부터 ${limit.maxCount}회 연속 수신은 제한됩니다.`,
        limit
      };
    }

    return { allowed: true };
  }

  /**
   * 기본 제한 설정 생성 (앱 초기화 시 호출)
   */
  async createDefaultLimits(): Promise<void> {
    const existingLimit = await this.transactionLimitRepository.findOne({
      where: { scope: 'GLOBAL', limitType: 'CONSECUTIVE_PAIR' }
    });

    if (!existingLimit) {
      const defaultLimit = this.transactionLimitRepository.create({
        scope: 'GLOBAL',
        scopeId: null,
        limitType: 'CONSECUTIVE_PAIR',
        maxCount: 3,
        timeWindowMinutes: 0, // 시간 제한 없음
        isActive: true,
        description: '전역 양방향 연속 거래 제한 (3회)'
      });

      await this.transactionLimitRepository.save(defaultLimit);
    }
  }

  /**
   * 제한 설정 조회
   */
  async getLimits(scope?: string, scopeId?: string): Promise<TransactionLimit[]> {
    const where: any = {};
    if (scope) where.scope = scope;
    if (scopeId) where.scopeId = scopeId;

    return this.transactionLimitRepository.find({ where });
  }

  /**
   * 제한 설정 업데이트
   */
  async updateLimit(id: number, updates: Partial<TransactionLimit>): Promise<TransactionLimit> {
    await this.transactionLimitRepository.update(id, updates);
    return this.transactionLimitRepository.findOne({ where: { id } });
  }
}
