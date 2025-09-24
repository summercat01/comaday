import { API_ENDPOINTS } from '../config';
import axiosInstance from '../axiosInstance';
import { Room, RoomMember, CreateRoomDto, LobbyStatusResponse, RoomListResponse } from '../../types/room';

export interface CreateRoomRequest {
  name: string;
  description: string;
  maxMembers: number;
  hostUserId: number;
}

export interface JoinRoomRequest {
  userId: number;
}

export interface LeaveRoomRequest {
  userId: number;
}

export interface UpdateRoomDescriptionRequest {
  userId: number;
  description: string;
}

export interface UpdateRoomNameRequest {
  userId: number;
  name: string;
}

export interface UpdateGameNameRequest {
  userId: number;
  gameName: string;
}

export interface HeartbeatRequest {
  userId: number;
}

// LobbyRoom과 LobbyStatusResponse는 types/room.ts에서 가져옴
export interface RoomsResponse {
  rooms: Room[];
  total: number;
}

export interface MembershipResponse {
  isMember: boolean;
  memberInfo?: {
    joinedAt: string;
    lastHeartbeat: string;
    isHost: boolean;
  };
}

export interface ApiError {
  success: false;
  statusCode: number;
  errorCode: string;
  errorType: string;
  message: string;
  timestamp: string;
  path: string;
  method: string;
}

/**
 * 방 관리 관련 API 서비스
 */
export const roomService = {
  /**
   * 새로운 방 생성
   * POST /rooms
   */
  async createRoom(data: CreateRoomRequest): Promise<Room> {
    try {
      const response = await axiosInstance.post<Room>(API_ENDPOINTS.rooms, data);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data;
      throw new Error(apiError?.message || '방 생성에 실패했습니다.');
    }
  },

  /**
   * 방 목록 조회 (페이징 지원)
   * GET /rooms
   */
  async getRooms(page: number = 1, limit: number = 10): Promise<RoomsResponse> {
    try {
      const response = await axiosInstance.get<RoomsResponse>(`${API_ENDPOINTS.rooms}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data;
      throw new Error(apiError?.message || '방 목록 조회에 실패했습니다.');
    }
  },

  /**
   * 대기방 상태 조회 (간소화된 방 정보)
   * GET /rooms/lobby-status
   */
  async getLobbyStatus(): Promise<LobbyStatusResponse> {
    try {
      const response = await axiosInstance.get<LobbyStatusResponse>(`${API_ENDPOINTS.rooms}/lobby-status`);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data;
      throw new Error(apiError?.message || '대기방 상태 조회에 실패했습니다.');
    }
  },

  /**
   * 특정 방 상세 정보 조회
   * GET /rooms/{roomCode}
   */
  async getRoomByCode(roomCode: string): Promise<Room> {
    try {
      const response = await axiosInstance.get<Room>(`${API_ENDPOINTS.rooms}/${roomCode}`);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data;
      throw new Error(apiError?.message || '방 정보 조회에 실패했습니다.');
    }
  },

  /**
   * 방 입장
   * POST /rooms/{roomCode}/join
   */
  async joinRoom(roomCode: string, userId: number): Promise<RoomMember> {
    try {
      const data: JoinRoomRequest = { userId };
      console.log('🚀 방 입장 API 요청:', { 
        url: `${API_ENDPOINTS.rooms}/${roomCode}/join`, 
        data,
        userId,
        type: typeof userId 
      });
      
      const response = await axiosInstance.post<RoomMember>(`${API_ENDPOINTS.rooms}/${roomCode}/join`, data);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data;
      console.error('❌ 방 입장 API 에러:', { apiError, originalError: error });
      throw new Error(apiError?.message || '방 입장에 실패했습니다.');
    }
  },

  /**
   * 방 나가기
   * POST /rooms/{roomCode}/leave
   */
  async leaveRoom(roomCode: string, userId: number): Promise<{ success: boolean; message: string }> {
    try {
      const data: LeaveRoomRequest = { userId };
      const response = await axiosInstance.post<{success: boolean; message: string}>(`${API_ENDPOINTS.rooms}/${roomCode}/leave`, data);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data;
      throw new Error(apiError?.message || '방 나가기에 실패했습니다.');
    }
  },

  /**
   * 즉시 방 나가기 (페이지 이탈시)
   * POST /rooms/{roomCode}/leave-immediately
   */
  async leaveRoomImmediately(roomCode: string, userId: number): Promise<{ success: boolean; message: string }> {
    try {
      const data: LeaveRoomRequest = { userId };
      const response = await axiosInstance.post<{success: boolean; message: string}>(`${API_ENDPOINTS.rooms}/${roomCode}/leave-immediately`, data);
      return response.data;
    } catch (error: any) {
      // 에러가 발생해도 관대하게 처리 (페이지 이탈시 사용)
      console.warn('즉시 방 나가기 오류:', error);
      return { success: true, message: '방에서 나갔습니다.' };
    }
  },

  /**
   * 멤버십 확인
   * GET /rooms/{roomCode}/check-member/{userId}
   */
  async checkMembership(roomCode: string, userId: number): Promise<MembershipResponse> {
    try {
      const response = await axiosInstance.get<MembershipResponse>(`${API_ENDPOINTS.rooms}/${roomCode}/check-member/${userId}`);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data;
      throw new Error(apiError?.message || '멤버십 확인에 실패했습니다.');
    }
  },

  /**
   * 방 닫기 (방장만 가능)
   * POST /rooms/{roomCode}/close
   */
  async closeRoom(roomCode: string, userId: number): Promise<{ success: boolean; message: string }> {
    try {
      const data = { userId };
      const response = await axiosInstance.post<{success: boolean; message: string}>(`${API_ENDPOINTS.rooms}/${roomCode}/close`, data);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data;
      throw new Error(apiError?.message || '방 닫기에 실패했습니다.');
    }
  },

  /**
   * 방 설명 변경
   * PUT /rooms/{roomCode}/description
   */
  async updateRoomDescription(roomCode: string, userId: number, description: string): Promise<Room> {
    try {
      const data: UpdateRoomDescriptionRequest = { userId, description };
      const response = await axiosInstance.put<Room>(`${API_ENDPOINTS.rooms}/${roomCode}/description`, data);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data;
      throw new Error(apiError?.message || '방 설명 변경에 실패했습니다.');
    }
  },

  /**
   * 방 제목 변경
   * PUT /rooms/{roomCode}/name
   */
  async updateRoomName(roomCode: string, userId: number, name: string): Promise<Room> {
    try {
      const data: UpdateRoomNameRequest = { userId, name };
      const response = await axiosInstance.put<Room>(`${API_ENDPOINTS.rooms}/${roomCode}/name`, data);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data;
      throw new Error(apiError?.message || '방 제목 변경에 실패했습니다.');
    }
  },

  /**
   * 게임명 변경
   * PUT /rooms/{roomCode}/game-name
   */
  async updateGameName(roomCode: string, userId: number, gameName: string): Promise<Room> {
    try {
      const data: UpdateGameNameRequest = { userId, gameName };
      const response = await axiosInstance.put<Room>(`${API_ENDPOINTS.rooms}/${roomCode}/game-name`, data);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data;
      throw new Error(apiError?.message || '게임명 변경에 실패했습니다.');
    }
  },

  /**
   * 하트비트 전송 (활성 상태 갱신)
   * POST /rooms/{roomCode}/heartbeat
   */
  async sendHeartbeat(roomCode: string, userId: number): Promise<{ success: boolean; message: string; lastHeartbeat: string }> {
    try {
      const data: HeartbeatRequest = { userId };
      const response = await axiosInstance.post<{success: boolean; message: string; lastHeartbeat: string}>(`${API_ENDPOINTS.rooms}/${roomCode}/heartbeat`, data);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data;
      throw new Error(apiError?.message || '하트비트 전송에 실패했습니다.');
    }
  },
};