import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoinTransaction } from './entities/coin-transaction.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CoinsService {
  constructor(
    @InjectRepository(CoinTransaction)
    private coinTransactionRepository: Repository<CoinTransaction>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async transfer(senderId: number, receiverId: number, amount: number): Promise<CoinTransaction> {
    const sender = await this.userRepository.findOne({ where: { id: senderId } });
    const receiver = await this.userRepository.findOne({ where: { id: receiverId } });

    if (!sender || !receiver) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    if (sender.coinCount < amount) {
      throw new BadRequestException('코인이 부족합니다.');
    }

    sender.coinCount -= amount;
    receiver.coinCount += amount;

    await this.userRepository.save([sender, receiver]);

    const transaction = this.coinTransactionRepository.create({
      userId: senderId,
      amount: -amount,
      type: 'SPEND',
      description: `${receiver.username}님에게 코인 전송`,
    });

    return this.coinTransactionRepository.save(transaction);
  }

  async getTransactions(userId: number): Promise<CoinTransaction[]> {
    return this.coinTransactionRepository.find({
      where: { userId },
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
      userId,
      amount,
      type: 'EARN',
      description,
    });

    return this.coinTransactionRepository.save(transaction);
  }
} 