import { API_ENDPOINTS } from '../config';
import axiosInstance from '../axiosInstance';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  coinCount: number;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
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
      const response = await axiosInstance.post(`${API_ENDPOINTS.auth}/login`, data);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data;
      throw new Error(apiError?.message || '로그인에 실패했습니다.');
    }
  },

  /**
   * 사용자 등록 (명시적 계정 생성)
   * POST /users/register
   */
  async register(data: LoginRequest): Promise<User> {
    try {
      const response = await axiosInstance.post(`${API_ENDPOINTS.users}/register`, data);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data;
      throw new Error(apiError?.message || '회원가입에 실패했습니다.');
    }
  },

  /**
   * 게스트 로그인
   * POST /users/guest-login
   */
  async guestLogin(data: LoginRequest): Promise<User> {
    try {
      const response = await axiosInstance.post(`${API_ENDPOINTS.users}/guest-login`, data);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data;
      throw new Error(apiError?.message || '게스트 로그인에 실패했습니다.');
    }
  },
};
