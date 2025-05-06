import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Ranking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  username: string;

  @Column()
  memberNumber: string;

  @Column()
  totalCoins: number;

  @Column()
  rank: number;

  @CreateDateColumn()
  createdAt: Date;
} 