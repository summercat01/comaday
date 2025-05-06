import axiosInstance from '../axiosInstance';
import { API_ENDPOINTS } from '../endpoints';
import { RankingUser } from '../../types/ranking';

export const rankingService = {
  getRankings: async (): Promise<RankingUser[]> => {
    const response = await axiosInstance.get<RankingUser[]>(API_ENDPOINTS.ranking);
    return response.data;
  },

  getMyRanking: async (): Promise<RankingUser> => {
    const response = await axiosInstance.get<RankingUser>(API_ENDPOINTS.ranking + '/me');
    return response.data;
  },
}; 