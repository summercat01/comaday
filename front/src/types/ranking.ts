export interface RankingUser {
  id: number;
  userId: number;
  username: string;
  totalCoins: number;
  createdAt: string;
  rank?: number; // 클라이언트에서 계산되는 순위
}