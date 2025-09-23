// 개발 환경에서는 Next.js 프록시 사용, 프로덕션에서는 직접 API 호출
const isDevelopment = process.env.NODE_ENV === 'development';
export const API_BASE_URL = isDevelopment 
  ? '' // Next.js 프록시 사용 (CORS 우회)
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// API 글로벌 prefix
const API_PREFIX = '/api';

export const API_ENDPOINTS = {
  // 인증 API
  auth: `${API_BASE_URL}${API_PREFIX}/auth`,
  
  // 사용자 API
  users: `${API_BASE_URL}${API_PREFIX}/users`,
  
  // 코인 거래 API
  coins: `${API_BASE_URL}${API_PREFIX}/coins`,
  
  // 방 관리 API
  rooms: `${API_BASE_URL}${API_PREFIX}/rooms`,
  
  // 랭킹 API
  ranking: `${API_BASE_URL}${API_PREFIX}/ranking`,
}; 