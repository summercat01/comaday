import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Ranking } from './entities/ranking.entity';
export declare class RankingService {
    private userRepository;
    private rankingRepository;
    constructor(userRepository: Repository<User>, rankingRepository: Repository<Ranking>);
    getRankings(): Promise<Ranking[]>;
    getUserRanking(userId: number): Promise<Ranking>;
}
