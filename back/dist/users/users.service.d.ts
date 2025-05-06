import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    private generateMemberNumber;
    create(username: string): Promise<User>;
    createWithPassword(username: string, password: string): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: number): Promise<User>;
    findByUsername(username: string): Promise<User>;
    findByEmail(email: string): Promise<User>;
    updateCoins(id: number, amount: number): Promise<User>;
    guestLogin(username: string, password: string): Promise<User>;
}
