import { API_ENDPOINTS } from '../config';
import axiosInstance from '../axiosInstance';

export interface CoinTransferRequest {
  senderId: number;
  receiverId: number;
  amount: number;
  roomCode?: string; // 방 내 거래인 경우
}

export interface BulkTransferRequest {
  senderId: number;
  roomCode?: string;
  description: string;
  transfers: {
    receiverId: number;
    amount: number;
  }[];
}

export interface CoinEarnRequest {
  userId: number;
  amount: number;
  description: string;
}

export interface CoinTransaction {
  id: number;
  senderId: number | null;
  receiverId: number | null;
  amount: number;
  type: 'EARN' | 'SPEND' | 'TRANSFER';
  description: string;
  groupId?: string;
  roomCode?: string;
  createdAt: string;
}

export interface TransactionLimitResponse {
  canTransact: boolean;
  message: string;
}

export interface RoomTransactionStats {
  userId: number;
  roomCode: string;
  sentCount: number;
  receivedCount: number;
  totalTransactions: number;
  sentTransactions: Array<{
    groupId: string;
    amount: number;
    createdAt: string;
  }>;
  receivedTransactions: Array<{
    groupId: string;
    amount: number;
    createdAt: string;
  }>;
}

export interface LobbyTransactionStats {
  userId: number;
  roomStats: Array<{
    roomCode: string;
    sentCount: number;
    receivedCount: number;
    totalTransactions: number;
  }>;
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
 * 코인 거래 관련 API 서비스
 */
export const coinService = {
  /**
   * 코인 전송 (일반 또는 방 내 거래)
   * POST /coins/transfer
   */
  async transfer(senderId: number, receiverId: number, amount: number, roomCode?: string): Promise<CoinTransaction> {
    try {
      const data: CoinTransferRequest = {
        senderId,
        receiverId,
        amount,
        ...(roomCode && { roomCode })
      };
      
      const response = await axiosInstance.post<CoinTransaction>(`${API_ENDPOINTS.coins}/transfer`, data);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data;
      throw new Error(apiError?.message || '코인 전송에 실패했습니다.');
    }
  },

  /**
   * 일괄 코인 전송
   * POST /coins/bulk-transfer
   */
  async bulkTransfer(data: BulkTransferRequest): Promise<CoinTransaction[]> {
    try {
      const response = await axiosInstance.post<CoinTransaction[]>(`${API_ENDPOINTS.coins}/bulk-transfer`, data);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data;
      throw new Error(apiError?.message || '일괄 코인 전송에 실패했습니다.');
    }
  },

  /**
   * 코인 적립 (시스템 지급)
   * POST /coins/earn
   */
  async earnCoins(data: CoinEarnRequest): Promise<CoinTransaction> {
    try {
      const response = await axiosInstance.post<CoinTransaction>(`${API_ENDPOINTS.coins}/earn`, data);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data;
      throw new Error(apiError?.message || '코인 적립에 실패했습니다.');
    }
  },

  /**
   * 사용자별 거래 내역 조회
   * GET /coins/history/{userId}
   */
  async getTransactionHistory(userId: number): Promise<CoinTransaction[]> {
    try {
      const response = await axiosInstance.get<CoinTransaction[]>(`${API_ENDPOINTS.coins}/history/${userId}`);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data;
      throw new Error(apiError?.message || '거래 내역 조회에 실패했습니다.');
    }
  },

  /**
   * 전체 거래 내역 조회 (관리자용)
   * GET /coins/transactions
   */
  async getAllTransactions(): Promise<CoinTransaction[]> {
    try {
      const response = await axiosInstance.get<CoinTransaction[]>(`${API_ENDPOINTS.coins}/transactions`);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data;
      throw new Error(apiError?.message || '전체 거래 내역 조회에 실패했습니다.');
    }
  },

  /**
   * 방별 거래 제한 확인
   * GET /coins/room-limit/{userId}/{roomCode}
   */
  async checkRoomTransactionLimit(userId: number, roomCode: string): Promise<TransactionLimitResponse> {
    try {
      const response = await axiosInstance.get<TransactionLimitResponse>(`${API_ENDPOINTS.coins}/room-limit/${userId}/${roomCode}`);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data;
      throw new Error(apiError?.message || '거래 제한 확인에 실패했습니다.');
    }
  },

  /**
   * 방별 거래 통계 조회
   * GET /coins/room-stats/{userId}/{roomCode}
   */
  async getRoomTransactionStats(userId: number, roomCode: string): Promise<RoomTransactionStats> {
    try {
      const response = await axiosInstance.get<RoomTransactionStats>(`${API_ENDPOINTS.coins}/room-stats/${userId}/${roomCode}`);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data;
      throw new Error(apiError?.message || '방별 거래 통계 조회에 실패했습니다.');
    }
  },

  /**
   * 대기방 거래 통계 조회 (모든 방)
   * GET /coins/lobby-transaction-stats/{userId}
   */
  async getLobbyTransactionStats(userId: number): Promise<LobbyTransactionStats> {
    try {
      const response = await axiosInstance.get<LobbyTransactionStats>(`${API_ENDPOINTS.coins}/lobby-transaction-stats/${userId}`);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = error.response?.data;
      throw new Error(apiError?.message || '대기방 거래 통계 조회에 실패했습니다.');
    }
  },
};