import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Entity('rankings')
export class Ranking {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @Column()
  rank: number;

  @Column()
  totalCoins: number;

  @CreateDateColumn()
  createdAt: Date;
} 