export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const API_ENDPOINTS = {
  users: `${API_BASE_URL}/users`,
  coins: `${API_BASE_URL}/coins`,
  ranking: `${API_BASE_URL}/ranking`,
}; 