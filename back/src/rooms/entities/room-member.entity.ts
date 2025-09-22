import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from "typeorm";
import { Room } from "./room.entity";
import { User } from "../../users/entities/user.entity";

@Entity("room_members")
@Index(['roomId', 'userId'], { unique: true }) // 같은 방에 같은 사용자는 한 번만
export class RoomMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ comment: '방 ID' })
  roomId: number;

  @Column({ comment: '사용자 ID' })
  userId: number;

  // 포인트는 User 엔티티에서 추적, 방별 포인트 관리 안함

  @Column({ default: 'ACTIVE', comment: '멤버 상태' })
  status: 'ACTIVE' | 'LEFT' | 'KICKED';

  @Column({ default: () => 'CURRENT_TIMESTAMP', comment: '방 입장 시간' })
  joinedAt: Date;

  @Column({ nullable: true, comment: '방 퇴장 시간' })
  leftAt: Date;

  @ManyToOne(() => Room, room => room.members, { onDelete: 'CASCADE' })
  room: Room;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 편의 메서드들
  get isActive(): boolean {
    return this.status === 'ACTIVE';
  }

  get isHost(): boolean {
    return this.room?.hostUserId === this.userId;
  }
}
