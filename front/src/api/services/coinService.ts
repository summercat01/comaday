import axiosInstance from '../../api/axiosInstance';
import { API_ENDPOINTS } from '../../api/endpoints';
import { CoinTransaction } from '../../types/coin';

export const coinService = {
  getTransactions: async (): Promise<CoinTransaction[]> => {
    const response = await axiosInstance.get<CoinTransaction[]>(`${API_ENDPOINTS.coins}/transactions`);
    return response.data;
  },

  earnCoins: async (amount: number, description: string): Promise<CoinTransaction> => {
    const response = await axiosInstance.post<CoinTransaction>(`${API_ENDPOINTS.coins}/earn`, {
      amount,
      description,
    });
    return response.data;
  },

  transfer: async (senderId: number, receiverId: number, amount: number, roomCode?: string): Promise<CoinTransaction> => {
    const response = await axiosInstance.post<CoinTransaction>(`${API_ENDPOINTS.coins}/transfer`, {
      senderId,
      receiverId,
      amount,
      roomCode,
    });
    return response.data;
  },
}; 