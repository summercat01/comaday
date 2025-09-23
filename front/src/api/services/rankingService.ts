import { API_ENDPOINTS } from '../config';
import axiosInstance from '../axiosInstance';
import { RankingUser } from '../../types/ranking';

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
 * 랭킹 관련 API 서비스
 */
export const rankingService = {
  /**
   * 전체 랭킹 조회 (코인 보유량 기준)
   * GET /ranking
   */
  async getRankings(): Promise<RankingUser[]> {
    try {
      const response = await axiosInstance.get<RankingUser[]>(API_ENDPOINTS.ranking);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data;
      throw new Error(apiError?.message || '랭킹 조회에 실패했습니다.');
    }
  },

  /**
   * 특정 사용자의 랭킹 정보 조회
   * GET /ranking/user/{userId}
   */
  async getUserRanking(userId: number): Promise<RankingUser> {
    try {
      const response = await axiosInstance.get<RankingUser>(`${API_ENDPOINTS.ranking}/user/${userId}`);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data;
      throw new Error(apiError?.message || '사용자 랭킹 조회에 실패했습니다.');
    }
  },

  /**
   * 랭킹 데이터를 순위와 함께 반환 (클라이언트 계산)
   */
  async getRankingsWithRank(): Promise<(RankingUser & { rank: number })[]> {
    try {
      const rankings = await this.getRankings();
      return rankings.map((user, index) => ({
        ...user,
        rank: index + 1
      }));
    } catch (error: any) {
      throw error;
    }
  },
};