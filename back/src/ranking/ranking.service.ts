import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Ranking } from './entities/ranking.entity';

@Injectable()
export class RankingService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Ranking)
    private rankingRepository: Repository<Ranking>,
  ) {}

  async getRankings(): Promise<Ranking[]> {
    const users = await this.userRepository.find();
    const sortedUsers = users.sort((a, b) => b.coinCount - a.coinCount);

    const rankings = sortedUsers.map((user, index) => {
      return this.rankingRepository.create({
        userId: user.id,
        username: user.username,
        memberNumber: user.memberNumber,
        totalCoins: user.coinCount,
        rank: index + 1,
      });
    });

    return this.rankingRepository.save(rankings);
  }

  async getUserRanking(userId: number): Promise<Ranking> {
    const rankings = await this.getRankings();
    return rankings.find(ranking => ranking.userId === userId);
  }
} 