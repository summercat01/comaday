import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from "typeorm";

@Entity("rankings")
export class Ranking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  username: string;

  @Column()
  totalCoins: number;

  @Column({ default: 0 })
  rank: number;

  @CreateDateColumn()
  createdAt: Date;
}
