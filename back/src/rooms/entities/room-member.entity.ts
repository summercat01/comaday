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
  // 레코드 존재 = 방 참여중, 레코드 삭제 = 방 나감

  @Column({ default: () => 'CURRENT_TIMESTAMP', comment: '방 입장 시간' })
  joinedAt: Date;

  @ManyToOne(() => Room, room => room.members, { onDelete: 'CASCADE' })
  room: Room;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 편의 메서드들 - 레코드 존재 자체가 활성 상태
}
