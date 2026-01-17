import axios from 'axios';

const API_URL = '/api';

export interface RegisterResponse {
  success: boolean;
  data: {
    sessionId: string;
    phoneNumber: string;
    expiresAt: string;
    message: string;
  };
}

export interface VerifyResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface LoginByPhoneResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: {
      id: string;
      phoneNumber: string;
      displayName: string;
      username?: string;
      bio?: string;
      profilePicture?: string;
    };
    isNewUser: boolean;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });
          
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export const authApi = {
  register: async (phoneNumber: string): Promise<RegisterResponse> => {
    const response = await api.post('/auth/register', { phoneNumber });
    return response.data;
  },

  verify: async (
    sessionId: string,
    code: string,
    displayName: string,
    password?: string
  ): Promise<VerifyResponse> => {
    const response = await api.post('/auth/verify', {
      sessionId,
      code,
      displayName,
      password,
    });
    return response.data;
  },

  login: async (phoneNumber: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', { phoneNumber, password });
    return response.data;
  },

  loginByPhone: async (phoneNumber: string): Promise<LoginByPhoneResponse> => {
    const response = await api.post('/auth/login-phone', { phoneNumber });
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};

export default api;
