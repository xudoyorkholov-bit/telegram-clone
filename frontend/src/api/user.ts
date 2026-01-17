import api from './auth';

export interface UserProfile {
  id: string;
  phoneNumber: string;
  username?: string;
  displayName: string;
  profilePicture?: string;
  bio?: string;
  isOnline: boolean;
  lastSeen?: string;
  createdAt?: string;
}

export interface ProfileUpdateData {
  displayName?: string;
  username?: string;
  bio?: string;
}

export const userApi = {
  // Get current user profile
  getMe: async (): Promise<{ success: boolean; data: UserProfile }> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Search users
  searchUsers: async (query: string, limit: number = 20): Promise<{ success: boolean; data: UserProfile[] }> => {
    const response = await api.get('/users/search', {
      params: { query, limit },
    });
    return response.data;
  },

  // Update profile
  updateProfile: async (data: ProfileUpdateData): Promise<{ success: boolean; data: UserProfile }> => {
    const response = await api.put('/users/me/update', data);
    return response.data;
  },

  // Update profile picture
  updatePhoto: async (photo: string): Promise<{ success: boolean; data: { id: string; profilePicture: string } }> => {
    const response = await api.put('/users/me/photo', { photo });
    return response.data;
  },

  // Remove profile picture
  removePhoto: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete('/users/me/photo');
    return response.data;
  },
};
