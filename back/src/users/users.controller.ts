import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { 
  UserNotFoundException,
  RequiredFieldException
} from '../common/exceptions/custom.exceptions';
import { ERROR_MESSAGES } from '../common/constants/error-messages';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body('username') username: string): Promise<User> {
    return this.usersService.create(username);
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findOne(+id);
  }

  @Put(':id/coins')
  async updateCoins(
    @Param('id') id: string,
    @Body('amount') amount: number,
  ): Promise<User> {
    return this.usersService.updateCoins(+id, amount);
  }

  @Get('receivers/:myId')
  async getReceivers(@Param('myId') myId: string): Promise<{id: number, username: string}[]> {
    return this.usersService.findAllExcept(+myId);
  }
} 