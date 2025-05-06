import { User } from '../users/entities/user.entity';
export declare class CoinTransaction {
    id: number;
    sender: User;
    receiver: User;
    amount: number;
    createdAt: Date;
}
