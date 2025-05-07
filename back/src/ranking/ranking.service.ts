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
    return this.rankingRepository.find({ order: { rank: 'ASC' } });
  }

  async getUserRanking(userId: number): Promise<Ranking> {
    const rankings = await this.getRankings();
    return rankings.find(ranking => ranking.userId === userId);
  }

  async updateOrCreateRanking(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return;
    // 해당 유저의 랭킹 정보가 이미 있는지 확인
    let ranking = await this.rankingRepository.findOne({ where: { userId: user.id } });
    if (!ranking) {
      // 없으면 새로 생성
      ranking = this.rankingRepository.create({
        userId: user.id,
        username: user.username,
        totalCoins: user.coinCount,
        rank: 0, // 임시값, 전체 재정렬 필요
      });
    } else {
      // 있으면 정보만 갱신
      ranking.username = user.username;
      ranking.totalCoins = user.coinCount;
    }
    await this.rankingRepository.save(ranking);
    // 전체 랭킹 재정렬
    await this.reorderRanks();
  }

  private async reorderRanks(): Promise<void> {
    const allRankings = await this.rankingRepository.find({ order: { totalCoins: 'DESC' } });
    for (let i = 0; i < allRankings.length; i++) {
      allRankings[i].rank = i + 1;
    }
    await this.rankingRepository.save(allRankings);
  }
} 