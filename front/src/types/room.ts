export interface Room {
  id: number;
  roomCode: string;
  name: string;
  description?: string;
  hostUserId: number;
  maxMembers: number;
  status: 'ACTIVE' | 'CLOSED';
  startedAt?: string;
  endedAt?: string;
  members: RoomMember[];
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  isActive: boolean;
  canJoin: boolean;
}

export interface RoomMember {
  id: number;
  roomId: number;
  userId: number;
  status: 'ACTIVE' | 'LEFT' | 'KICKED';
  joinedAt?: string;
  leftAt?: string;
  user: {
    id: number;
    username: string;
    coinCount: number;
  };
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isHost: boolean;
}

export interface CreateRoomDto {
  name: string;
  description?: string;
  maxMembers?: number;
  hostUserId: number;
}

export interface RoomListResponse {
  rooms: Room[];
  total: number;
}
