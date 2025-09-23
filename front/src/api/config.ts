export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const API_ENDPOINTS = {
  // 인증 API
  auth: `${API_BASE_URL}/auth`,
  
  // 사용자 API
  users: `${API_BASE_URL}/users`,
  
  // 코인 거래 API
  coins: `${API_BASE_URL}/coins`,
  
  // 방 관리 API
  rooms: `${API_BASE_URL}/rooms`,
  
  // 랭킹 API
  ranking: `${API_BASE_URL}/ranking`,
}; 