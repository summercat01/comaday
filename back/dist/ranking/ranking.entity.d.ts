import { User } from '../users/entities/user.entity';
export declare class Ranking {
    id: number;
    user: User;
    rank: number;
    totalCoins: number;
    createdAt: Date;
}
