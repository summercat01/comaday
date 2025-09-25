import { API_ENDPOINTS } from '../config';
import axiosInstance from '../axiosInstance';
import { User } from '../../types/user';

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

export interface ReceiverUser {
  id: number;
  username: string;
  coinCount: number;
  isAdmin: boolean;
}

/**
 * 사용자 관련 API 서비스
 */
export const userService = {
  /**
   * 모든 사용자 목록 조회
   * GET /users
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await axiosInstance.get<User[]>(API_ENDPOINTS.users);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data;
      throw new Error(apiError?.message || '사용자 목록 조회에 실패했습니다.');
    }
  },

  /**
   * 특정 사용자 정보 조회
   * GET /users/{id}
   */
  async getUserById(id: number): Promise<User> {
    try {
      const response = await axiosInstance.get<User>(`${API_ENDPOINTS.users}/${id}`);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data;
      throw new Error(apiError?.message || '사용자 정보 조회에 실패했습니다.');
    }
  },

  /**
   * 사용자 코인 수량 직접 수정 (관리자용)
   * PUT /users/{id}/coins
   */
  async updateUserCoins(id: number, amount: number): Promise<User> {
    try {
      const response = await axiosInstance.put<User>(`${API_ENDPOINTS.users}/${id}/coins`, {
        amount,
      });
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data;
      throw new Error(apiError?.message || '코인 수정에 실패했습니다.');
    }
  },

  /**
   * 수신 가능한 사용자 목록 (코인 전송 대상)
   * GET /users/receivers/{myId}
   */
  async getReceivers(myId: number): Promise<ReceiverUser[]> {
    try {
      const response = await axiosInstance.get<ReceiverUser[]>(`${API_ENDPOINTS.users}/receivers/${myId}`);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data;
      throw new Error(apiError?.message || '수신자 목록 조회에 실패했습니다.');
    }
  },

  /**
   * 게스트 로그인 (호환성 유지)
   * POST /users/guest-login
   */
  async guestLogin(username: string, password: string): Promise<User> {
    try {
      const response = await axiosInstance.post<User>(`${API_ENDPOINTS.users}/guest-login`, {
        username,
        password,
      });
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data;
      throw new Error(apiError?.message || '게스트 로그인에 실패했습니다.');
    }
  },

  /**
   * 현재 사용자 정보 조회 (호환성 유지)
   */
  async getCurrentUser(): Promise<User> {
    // 임시로 로컬 스토리지에서 사용자 정보 반환
    // 실제로는 세션 기반 API 구현 필요
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      return JSON.parse(savedUser);
    }
    throw new Error('로그인이 필요합니다.');
  },

  /**
   * 사용자 정보 업데이트 (호환성 유지)
   */
  async updateUser(userId: number, data: Partial<User>): Promise<User> {
    // 현재 백엔드 API에서는 사용자 코인만 수정 가능
    if (data.coinCount !== undefined) {
      const currentUser = await this.getUserById(userId);
      const amount = data.coinCount - currentUser.coinCount;
      if (amount === 0) {
        return currentUser;
      }
      return this.updateUserCoins(userId, amount);
    }
    throw new Error('지원하지 않는 사용자 정보 업데이트입니다.');
  },
};