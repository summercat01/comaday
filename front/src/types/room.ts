export interface Room {
  id: number;
  roomCode: string;
  name: string;
  gameName?: string;
  description: string;
  originalDescription: string;
  hostUserId: number;
  maxMembers: number;
  status: 'ACTIVE' | 'CLOSED';
  startedAt: string;
  members: RoomMember[];
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  isActive: boolean;
}

export interface RoomMember {
  id: number;
  roomId: number;
  userId: number;
  joinedAt: string;
  lastHeartbeat: string;
  user: {
    id: number;
    username: string;
    coinCount: number;
  };
  createdAt: string;
  updatedAt: string;
  isHost: boolean;
  status?: string;
  isActive?: boolean;
}

export interface CreateRoomDto {
  name: string;
  description: string;
  maxMembers: number;
  hostUserId: number;
}

export interface LobbyRoom {
  roomCode: string;
  roomNumber: number;
  name: string;
  memberCount: number;
  maxMembers: number;
}

export interface RoomListResponse {
  rooms: Room[];
  total: number;
}

export interface LobbyStatusResponse {
  rooms: LobbyRoom[];
  totalRooms: number;
}