import { RankingService } from './ranking.service';
import { Ranking } from './entities/ranking.entity';
export declare class RankingController {
    private readonly rankingService;
    constructor(rankingService: RankingService);
    getRankings(): Promise<Ranking[]>;
    getUserRanking(userId: string): Promise<Ranking>;
}
