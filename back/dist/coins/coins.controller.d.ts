import { CoinsService } from './coins.service';
import { CoinTransaction } from './entities/coin-transaction.entity';
export declare class CoinsController {
    private readonly coinsService;
    constructor(coinsService: CoinsService);
    transfer(senderId: number, receiverId: number, amount: number): Promise<CoinTransaction>;
    getTransactions(userId: string): Promise<CoinTransaction[]>;
    getAllTransactions(): Promise<CoinTransaction[]>;
    earnCoins(req: any, amount: number, description: string): Promise<CoinTransaction>;
}
