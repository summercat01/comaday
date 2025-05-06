import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  private generateMemberNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `M${timestamp}${random}`;
  }

  async create(username: string): Promise<User> {
    const user = this.usersRepository.create({ 
      username,
      memberNumber: this.generateMemberNumber(),
      coinCount: 0,
      isGuest: true
    });
    return this.usersRepository.save(user);
  }

  async createWithPassword(username: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({ 
      username, 
      password: hashedPassword,
      memberNumber: this.generateMemberNumber(),
      coinCount: 0,
      isGuest: true,
      lastLoginAt: new Date()
    });
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: number): Promise<User> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByUsername(username: string): Promise<User> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async updateCoins(id: number, amount: number): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }
    user.coinCount += amount;
    return this.usersRepository.save(user);
  }

  async guestLogin(username: string, password: string): Promise<User> {
    const user = await this.findByUsername(username);
    
    if (!user) {
      // 새로운 비회원 계정 생성
      return this.createWithPassword(username, password);
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('아이디 또는 비밀번호가 일치하지 않습니다.');
    }

    // 마지막 로그인 시간 업데이트
    user.lastLoginAt = new Date();
    return this.usersRepository.save(user);
  }
} 