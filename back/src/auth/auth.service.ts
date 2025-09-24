import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
  ) {}

  async login(username: string, password: string) {
    let user = await this.usersService.findByUsername(username);
    
    if (!user) {
      // 계정이 없으면 자동으로 생성 (자동 회원가입)
      user = await this.usersService.createWithPassword(username, password);
    } else {
      // 계정이 있으면 비밀번호 확인
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    }

    const { password: _, ...result } = user;
    return {
      user: result,
    };
  }
} 