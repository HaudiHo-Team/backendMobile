import { User, ApiResponse } from '../types';
import { authAPI, userAPI } from './ApiService';
import { socketService } from './SocketService';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await authAPI.login(credentials);
      
      // Подключаемся к Socket.IO
      socketService.connect(response.token);
      
      return {
        success: true,
        data: response,
      };
    } catch (error: any) {
      return {
        success: false,
        data: null as AuthResponse,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  async register(credentials: RegisterCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await authAPI.register(credentials);
      
      // Подключаемся к Socket.IO
      socketService.connect(response.token);
      
      return {
        success: true,
        data: response,
      };
    } catch (error: any) {
      return {
        success: false,
        data: null as AuthResponse,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  async logout(): Promise<ApiResponse<void>> {
    try {
      authAPI.logout();
      
      // Отключаемся от Socket.IO
      socketService.disconnect();
      
      return {
        success: true,
        data: null as void,
      };
    } catch (error: any) {
      return {
        success: false,
        data: null as void,
        error: error.message,
      };
    }
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    try {
      // В реальном приложении здесь должен быть endpoint для обновления токена
      const response = await userAPI.getProfile();
      
      return {
        success: true,
        data: { token: global.authToken || '' },
      };
    } catch (error: any) {
      return {
        success: false,
        data: null as { token: string },
        error: error.message,
      };
    }
  }

  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await userAPI.getProfile();
      
      return {
        success: true,
        data: response,
      };
    } catch (error: any) {
      return {
        success: false,
        data: null as User,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await userAPI.updateProfile(userData);
      
      return {
        success: true,
        data: response,
      };
    } catch (error: any) {
      return {
        success: false,
        data: null as User,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  async validateToken(): Promise<boolean> {
    try {
      const response = await this.getProfile();
      return response.success;
    } catch {
      return false;
    }
  }
}

export const authService = new AuthService();
