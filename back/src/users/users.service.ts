import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { RankingService } from '../ranking/ranking.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private rankingService: RankingService,
  ) {}

  async create(username: string): Promise<User> {
    const user = this.usersRepository.create({ 
      username,
      coinCount: 0,
      isGuest: true
    });
    const savedUser = await this.usersRepository.save(user);
    await this.rankingService.updateOrCreateRanking(savedUser.id);
    return savedUser;
  }

  async createWithPassword(username: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({ 
      username, 
      password: hashedPassword,
      coinCount: 0,
      isGuest: true,
      lastLoginAt: new Date()
    });
    const savedUser = await this.usersRepository.save(user);
    await this.rankingService.updateOrCreateRanking(savedUser.id);
    return savedUser;
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

  async updateCoins(id: number, amount: number): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    // 코인 차감 시 보유 코인보다 많이 차감할 수 없도록 검증
    if (amount < 0 && Math.abs(amount) > user.coinCount) {
      throw new Error('보유한 코인보다 더 많이 차감할 수 없습니다.');
    }

    user.coinCount += amount;
    const savedUser = await this.usersRepository.save(user);
    await this.rankingService.updateOrCreateRanking(savedUser.id);
    return savedUser;
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
    const savedUser = await this.usersRepository.save(user);
    await this.rankingService.updateOrCreateRanking(savedUser.id);
    return savedUser;
  }

  async findAllExcept(myId: number): Promise<{id: number, username: string}[]> {
    const users = await this.usersRepository.find({
      where: { id: Not(myId) },
      select: ['id', 'username'],
    });
    return users;
  }
} 