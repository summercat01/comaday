import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity("coin_transactions")
export class CoinTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  user: User;

  @Column({ nullable: true })
  senderId: number;

  @ManyToOne(() => User)
  sender: User;

  @Column({ nullable: true })
  receiverId: number;

  @ManyToOne(() => User)
  receiver: User;

  @Column()
  amount: number;

  @Column()
  type: "EARN" | "SPEND" | "TRANSFER";

  @Column()
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}
