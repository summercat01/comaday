import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { RoomMember } from "./room-member.entity";

@Entity("rooms")
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, comment: '방 코드 (사용자가 입장할 때 사용)' })
  roomCode: string;

  @Column({ comment: '방 제목' })
  name: string;

  @Column({ nullable: true, comment: '게임 이름' })
  gameName: string;

  @Column({ nullable: true, comment: '방 설명 (현재 표시되는 설명)' })
  description: string;

  @Column({ nullable: true, comment: '원래 방 설명 (초기화용)' })
  originalDescription: string;

  @Column({ comment: '방장 사용자 ID' })
  hostUserId: number;

  @Column({ default: 10, comment: '최대 참가자 수' })
  maxMembers: number;

  @Column({ default: 'ACTIVE', comment: '방 상태: ACTIVE(활성), CLOSED(종료)' })
  status: 'ACTIVE' | 'CLOSED';

  @Column({ nullable: true, comment: '방 생성 시간' })
  startedAt: Date;

  @OneToMany(() => RoomMember, roomMember => roomMember.room, { cascade: true })
  members: RoomMember[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // 편의 메서드들
  get memberCount(): number {
    return this.members?.length || 0;
  }

  get isActive(): boolean {
    return this.status === 'ACTIVE';
  }
}
