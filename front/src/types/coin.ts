export interface CoinTransaction {
  id: number;
  userId: number;
  amount: number;
  type: 'EARN' | 'SPEND';
  description: string;
  createdAt: string;
} 