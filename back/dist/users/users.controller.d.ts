import { UsersService } from './users.service';
import { User } from './entities/user.entity';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(username: string): Promise<User>;
    register(userData: {
        username: string;
        password: string;
    }): Promise<any>;
    guestLogin(loginData: {
        username: string;
        password: string;
    }): Promise<any>;
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    updateCoins(id: string, amount: number): Promise<User>;
}
