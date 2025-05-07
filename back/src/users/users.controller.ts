import { Controller, Get, Post, Body, Param, Put, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Not } from 'typeorm';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body('username') username: string): Promise<User> {
    return this.usersService.create(username);
  }

  @Post('register')
  async register(@Body() userData: { username: string; password: string }): Promise<any> {
    try {
      // 필수 필드 검증
      if (!userData.username || !userData.password) {
        throw new HttpException('사용자명과 비밀번호는 필수 입력 항목입니다.', HttpStatus.BAD_REQUEST);
      }

      // 사용자명 중복 확인
      const existingUser = await this.usersService.findByUsername(userData.username);
      if (existingUser) {
        throw new HttpException('이미 사용 중인 사용자명입니다.', HttpStatus.CONFLICT);
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await this.usersService.createWithPassword(
        userData.username,
        hashedPassword
      );
      
      const { password, ...result } = user;
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('사용자 등록 에러:', error);
      throw new HttpException('사용자 등록 중 오류가 발생했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('guest-login')
  async guestLogin(@Body() loginData: { username: string; password: string }): Promise<any> {
    try {
      if (!loginData.username || !loginData.password) {
        throw new HttpException('사용자명과 비밀번호는 필수 입력 항목입니다.', HttpStatus.BAD_REQUEST);
      }

      const user = await this.usersService.guestLogin(loginData.username, loginData.password);
      const { password, ...result } = user;
      return result;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.error('비회원 로그인 에러:', error);
      throw new HttpException('로그인 중 오류가 발생했습니다.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
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