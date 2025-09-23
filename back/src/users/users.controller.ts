import { Controller, Get, Post, Body, Param, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { 
  InvalidUserDataException,
  UsernameAlreadyExistsException,
  UserRegistrationFailedException,
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

  @Post('register')
  async register(@Body() userData: { username: string; password: string }): Promise<any> {
    try {
      // 필수 필드 검증
      if (!userData.username || !userData.password) {
        throw new InvalidUserDataException(ERROR_MESSAGES.USER.USERNAME_AND_PASSWORD_REQUIRED);
      }

      // 사용자명 중복 확인
      const existingUser = await this.usersService.findByUsername(userData.username);
      if (existingUser) {
        throw new UsernameAlreadyExistsException(ERROR_MESSAGES.USER.USERNAME_ALREADY_EXISTS);
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await this.usersService.createWithPassword(
        userData.username,
        hashedPassword
      );
      
      const { password, ...result } = user;
      return result;
    } catch (error) {
      // 커스텀 예외는 그대로 전파
      if (error instanceof InvalidUserDataException || 
          error instanceof UsernameAlreadyExistsException) {
        throw error;
      }
      
      // 예상치 못한 에러는 UserRegistrationFailedException으로 래핑
      console.error('사용자 등록 에러:', error);
      throw new UserRegistrationFailedException(ERROR_MESSAGES.USER.REGISTRATION_FAILED);
    }
  }

  @Post('guest-login')
  async guestLogin(@Body() loginData: { username: string; password: string }): Promise<any> {
    try {
      if (!loginData.username || !loginData.password) {
        throw new InvalidUserDataException(ERROR_MESSAGES.USER.USERNAME_AND_PASSWORD_REQUIRED);
      }

      const user = await this.usersService.guestLogin(loginData.username, loginData.password);
      const { password, ...result } = user;
      return result;
    } catch (error) {
      // 커스텀 예외는 그대로 전파
      if (error instanceof InvalidUserDataException) {
        throw error;
      }
      
      // UsersService에서 발생하는 에러는 그대로 전파 (이미 적절한 예외로 변환됨)
      console.error('게스트 로그인 에러:', error);
      throw new UserRegistrationFailedException(ERROR_MESSAGES.USER.LOGIN_FAILED);
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