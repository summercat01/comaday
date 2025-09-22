import axiosInstance from '../axiosInstance';
import { API_ENDPOINTS } from '../endpoints';
import { Room, RoomMember, CreateRoomDto, RoomListResponse } from '../../types/room';

export const roomService = {
  // 방 생성
  createRoom: async (createRoomDto: CreateRoomDto): Promise<Room> => {
    const response = await axiosInstance.post<Room>(API_ENDPOINTS.rooms, createRoomDto);
    return response.data;
  },

  // 방 목록 조회
  getRooms: async (page: number = 1, limit: number = 10): Promise<RoomListResponse> => {
    const response = await axiosInstance.get<RoomListResponse>(
      `${API_ENDPOINTS.rooms}?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  // 방 상세 조회
  getRoomByCode: async (roomCode: string): Promise<Room> => {
    const response = await axiosInstance.get<Room>(`${API_ENDPOINTS.rooms}/${roomCode}`);
    return response.data;
  },

  // 방 입장
  joinRoom: async (roomCode: string, userId: number): Promise<RoomMember> => {
    const response = await axiosInstance.post<RoomMember>(
      `${API_ENDPOINTS.rooms}/${roomCode}/join`,
      { userId }
    );
    return response.data;
  },

  // 방 나가기
  leaveRoom: async (roomCode: string, userId: number): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ message: string }>(
      `${API_ENDPOINTS.rooms}/${roomCode}/leave`,
      { userId }
    );
    return response.data;
  },

  // 방 닫기 (방장만 가능)
  closeRoom: async (roomCode: string, hostUserId: number): Promise<Room> => {
    const response = await axiosInstance.post<Room>(
      `${API_ENDPOINTS.rooms}/${roomCode}/close`,
      { hostUserId }
    );
    return response.data;
  },
};
