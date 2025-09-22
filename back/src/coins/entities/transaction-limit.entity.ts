import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("transaction_limits")
export class TransactionLimit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '제한 범위: GLOBAL(전역), SESSION(세션), ROOM(방)' })
  scope: 'GLOBAL' | 'SESSION' | 'ROOM';

  @Column({ nullable: true, comment: '세션/방 ID (나중에 사용)' })
  scopeId: string;

  @Column({ comment: '제한 유형: 양방향 연속거래, 일방향 연속발송, 일방향 연속수신' })
  limitType: 'CONSECUTIVE_PAIR' | 'CONSECUTIVE_SEND' | 'CONSECUTIVE_RECEIVE';

  @Column({ default: 3, comment: '최대 연속 거래 횟수' })
  maxCount: number;

  @Column({ default: 60, comment: '시간 윈도우 (분, 0이면 무제한)' })
  timeWindowMinutes: number;

  @Column({ default: true, comment: '활성화 여부' })
  isActive: boolean;

  @Column({ nullable: true, comment: '제한 설명' })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
