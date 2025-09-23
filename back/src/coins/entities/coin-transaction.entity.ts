import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from "typeorm";

@Entity("coin_transactions")
export class CoinTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  senderId: number;

  @Column({ nullable: true })
  receiverId: number;

  @Column()
  amount: number;

  @Column()
  type: "EARN" | "SPEND" | "TRANSFER";

  @Column()
  description: string;

  @Column({ nullable: true, comment: '일괄거래 그룹 ID (UUID)' })
  groupId: string;

  @Column({ nullable: true, comment: '거래가 발생한 방 코드' })
  roomCode: string;

  @CreateDateColumn()
  createdAt: Date;
}
