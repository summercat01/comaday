import { Controller, Get, Param } from '@nestjs/common';
import { RankingService } from './ranking.service';
import { Ranking } from './entities/ranking.entity';

@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Get()
  async getRankings(): Promise<Ranking[]> {
    return this.rankingService.getRankings();
  }

  @Get('user/:userId')
  async getUserRanking(@Param('userId') userId: string): Promise<Ranking> {
    return this.rankingService.getUserRanking(+userId);
  }
} 