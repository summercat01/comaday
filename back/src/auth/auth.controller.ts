import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { InvalidUserDataException } from '../common/exceptions/custom.exceptions';
import { ERROR_MESSAGES } from '../common/constants/error-messages';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: { username: string; password: string }) {
    // 입력 검증
    if (!loginDto.username || !loginDto.password) {
      throw new InvalidUserDataException(ERROR_MESSAGES.USER.USERNAME_AND_PASSWORD_REQUIRED);
    }

    // AuthService에서 에러 처리는 이미 구현되어 있으므로 그대로 위임
    return await this.authService.login(loginDto.username, loginDto.password);
  }
} 