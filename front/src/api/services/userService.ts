import axiosInstance from '../axiosInstance';
import { API_ENDPOINTS } from '../endpoints';
import { User } from '../../types/user';

export const userService = {
  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get<User>(API_ENDPOINTS.users + '/me');
    return response.data;
  },

  updateUser: async (userId: number, data: Partial<User>): Promise<User> => {
    const response = await axiosInstance.patch<User>(`${API_ENDPOINTS.users}/${userId}`, data);
    return response.data;
  },

  guestLogin: async (username: string, password: string): Promise<User> => {
    const response = await axiosInstance.post<User>(`${API_ENDPOINTS.users}/guest-login`, {
      username,
      password,
    });
    return response.data;
  },

  getReceivers: async (myId: number): Promise<Pick<User, 'id' | 'username'>[]> => {
    const response = await axiosInstance.get<Pick<User, 'id' | 'username'>[]>(`/users/receivers/${myId}`);
    return response.data;
  },
}; 