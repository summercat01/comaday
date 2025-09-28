import { API_ENDPOINTS } from '../config';
import axiosInstance from '../axiosInstance';
import { User } from '../../types/user';

export interface LoginRequest {
  username: string;
  password: string;
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
 * 인증 관련 API 서비스
 */
export const authService = {
  /**
   * 로그인 (계정이 없으면 자동 생성)
   * POST /auth/login
   */
  async login(data: LoginRequest): Promise<User> {
    try {
      const response = await axiosInstance.post<{ user: User }>(`${API_ENDPOINTS.auth}/login`, data);
      return response.data.user; // user 객체 추출
    } catch (error: any) {
      const apiError: ApiError = error.response?.data;
      throw new Error(apiError?.message || '로그인에 실패했습니다.');
    }
  },

};
