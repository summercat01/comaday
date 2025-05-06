export interface User {
  id: number;
  username: string;
  memberNumber: string;
  coinCount: number;
  isGuest: boolean;
  lastLoginAt: string;
  name?: string;
  coin?: number;
} 