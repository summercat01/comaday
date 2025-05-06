import { Repository } from 'typeorm';
import { CoinTransaction } from './entities/coin-transaction.entity';
import { User } from '../users/entities/user.entity';
export declare class CoinsService {
    private coinTransactionRepository;
    private userRepository;
    constructor(coinTransactionRepository: Repository<CoinTransaction>, userRepository: Repository<User>);
    transfer(senderId: number, receiverId: number, amount: number): Promise<CoinTransaction>;
    getTransactions(userId: number): Promise<CoinTransaction[]>;
    getAllTransactions(): Promise<CoinTransaction[]>;
    earnCoins(userId: number, amount: number, description: string): Promise<CoinTransaction>;
}
