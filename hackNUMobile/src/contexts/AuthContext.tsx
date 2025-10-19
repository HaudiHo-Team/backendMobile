import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { User, ApiResponse } from '../types';
import {
  authService,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from '../services/AuthService';
import { socketService } from '../services/SocketService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    // Автоматический вход для демонстрации
    autoLogin();
  }, []);

  const autoLogin = async () => {
    try {
      setIsLoading(true);

      // Автоматически входим с демо данными
      const credentials = {
        email: 'mobile@test.com',
        password: 'mobile123',
      };

      const response: ApiResponse<AuthResponse> = await authService.login(
        credentials,
      );

      if (response.success && response.data) {
        setUser(response.data.user);
        setToken(response.data.token);

        // Сохраняем токен в глобальную переменную для API
        global.authToken = response.data.token;
        global.userData = response.data.user;

        // Подключаемся к Socket.IO
        socketService.connect(response.data.token);

        console.log('Автоматический вход выполнен успешно');
      } else {
        console.warn('Автоматический вход не удался:', response.error);
        // Не выбрасываем ошибку, просто продолжаем без авторизации
      }
    } catch (error) {
      console.warn('Ошибка автоматического входа:', error);
      // Не выбрасываем ошибку, просто продолжаем без авторизации
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response: ApiResponse<AuthResponse> = await authService.login(
        credentials,
      );

      if (response.success && response.data) {
        setUser(response.data.user);
        setToken(response.data.token);

        // Сохраняем токен в глобальную переменную для API
        global.authToken = response.data.token;
        global.userData = response.data.user;

        // Подключаемся к Socket.IO
        socketService.connect(response.data.token);
      } else {
        throw new Error(response.error || 'Ошибка входа');
      }
    } catch (error) {
      console.error('Ошибка входа:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setIsLoading(true);
      const response: ApiResponse<AuthResponse> = await authService.register(
        credentials,
      );

      if (response.success && response.data) {
        setUser(response.data.user);
        setToken(response.data.token);

        // Сохраняем токен в глобальную переменную для API
        global.authToken = response.data.token;
        global.userData = response.data.user;

        // Подключаемся к Socket.IO
        socketService.connect(response.data.token);
      } else {
        throw new Error(response.error || 'Ошибка регистрации');
      }
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    global.authToken = null;
    global.userData = null;

    // Отключаемся от Socket.IO
    socketService.disconnect();

    // Вызываем logout на сервере
    authService.logout();
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      global.userData = updatedUser;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
