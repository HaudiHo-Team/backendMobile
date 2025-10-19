import axios from 'axios';
import {Goal} from "../types";

const API_BASE_URL = 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('Токен авторизации отсутствует для запроса:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Получена 401 ошибка - очищаем авторизацию');
      clearStoredAuth();
    }
    return Promise.reject(error);
  }
);

const getStoredToken = (): string | null => {
  return global.authToken || null;
};

const clearStoredAuth = () => {
  global.authToken = null;
  global.userData = null;
};

const isAuthenticated = (): boolean => {
  const token = getStoredToken();
  return !!token;
};

const requireAuth = () => {
  if (!isAuthenticated()) {
    throw new Error('Требуется авторизация для выполнения этого действия');
  }
};
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

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

export interface Account {
  id: string;
  accountNumber: string;
  type: 'main' | 'savings' | 'business';
  balance: number;
  availableBalance: number;
  currency: string;
}

export interface Transaction {
  id: string;
  type: string;
  status: string;
  category: string;
  amount: number;
  description?: string;
  createdAt: string;
}

export interface Card {
  id: string;
  maskedNumber: string;
  type: 'debit' | 'credit' | 'prepaid';
  status: 'active' | 'blocked' | 'expired' | 'pending';
  holderName: string;
  expiryDate: string;
  isDefault: boolean;
}

export interface Chat {
  id: string;
  type: 'support' | 'user_to_user' | 'group';
  title?: string;
  description?: string;
  participants: any[];
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageDto {
  chatId: string;
  type: 'text' | 'image' | 'file' | 'system';
  content: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  userId: string;
  type: 'text' | 'image' | 'file' | 'system';
  content: string;
  fileName?: string;
  fileUrl?: string;
  replyToId?: string;
  isRead: boolean;
  createdAt: string;
  user: User;
}

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    const data = response.data;

    global.authToken = data.token;
    global.userData = data.user;

    return data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', credentials);
    const data = response.data;

    global.authToken = data.token;
    global.userData = data.user;

    return data;
  },

  logout: () => {
    clearStoredAuth();
  },
};

export const userAPI = {
  getProfile: async (): Promise<User> => {
    requireAuth();
    const response = await apiClient.get('/user/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    requireAuth();
    const response = await apiClient.put('/user/profile', data);
    return response.data;
  },
};

export const accountAPI = {
  getAccounts: async (): Promise<Account[]> => {
    requireAuth();
    const response = await apiClient.get('/accounts');
    return response.data;
  },

  getTotalBalance: async () => {
    requireAuth();
    const response = await apiClient.get('/accounts/balance');
    return response.data;
  },

  getAccountById: async (id: string): Promise<Account> => {
    requireAuth();
    const response = await apiClient.get(`/accounts/${id}`);
    return response.data;
  },
};

export const transactionAPI = {
  getTransactions: async (params?: any): Promise<Transaction[]> => {
    requireAuth();
    const response = await apiClient.get('/transactions', { params });
    return response.data;
  },

  getRecentTransactions: async (limit?: number): Promise<Transaction[]> => {
    requireAuth();
    const response = await apiClient.get('/transactions/recent', {
      params: { limit }
    });
    return response.data;
  },

  getTransactionStats: async (params?: any) => {
    requireAuth();
    const response = await apiClient.get('/transactions/stats', { params });
    return response.data;
  },

  createTransaction: async (data: any): Promise<Transaction> => {
    requireAuth();
    const response = await apiClient.post('/transactions', data);
    return response.data;
  },
};

export const cardAPI = {
  getCards: async (): Promise<Card[]> => {
    requireAuth();
    const response = await apiClient.get('/cards');
    return response.data;
  },

  createCard: async (data: any): Promise<Card> => {
    requireAuth();
    const response = await apiClient.post('/cards', data);
    return response.data;
  },

  activateCard: async (id: string): Promise<Card> => {
    requireAuth();
    const response = await apiClient.patch(`/cards/${id}/activate`);
    return response.data;
  },

  blockCard: async (id: string): Promise<Card> => {
    requireAuth();
    const response = await apiClient.patch(`/cards/${id}/block`);
    return response.data;
  },
};

export const analyticsAPI = {
  getOverview: async (params?: any) => {
    requireAuth();
    const response = await apiClient.get('/analytics/overview', { params });
    return response.data;
  },

  getCategories: async (params?: any) => {
    requireAuth();
    const response = await apiClient.get('/analytics/categories', { params });
    return response.data;
  },

  getTrends: async (months?: number) => {
    requireAuth();
    const response = await apiClient.get('/analytics/trends', {
      params: { months }
    });
    return response.data;
  },
};

export const goalsAPI = {
  getGoals: async (): Promise<Goal[]> => {
    requireAuth();
    const response = await apiClient.get('/goals');
    return response.data;
  },

  createGoal: async (goalData: Partial<Goal>): Promise<Goal> => {
    requireAuth();
    const response = await apiClient.post('/goals', goalData);
    return response.data;
  },

  updateGoal: async (goalId: string, goalData: Partial<Goal>): Promise<Goal> => {
    requireAuth();
    const response = await apiClient.put(`/goals/${goalId}`, goalData);
    return response.data;
  },

  deleteGoal: async (goalId: string): Promise<void> => {
    requireAuth();
    await apiClient.delete(`/goals/${goalId}`);
  },

  addToGoal: async (goalId: string, amount: number): Promise<Goal> => {
    requireAuth();
    
    console.log('🌐 ApiService: Отправляем запрос на добавление денег');
    console.log('📊 Goal ID:', goalId);
    console.log('💰 Amount:', amount, 'Type:', typeof amount);
    
    const requestBody = { amount };
    console.log('📤 Request body:', requestBody);
    
    const response = await apiClient.post(`/goals/${goalId}/add`, requestBody);
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response data:', response.data);
    
    return response.data;
  },
};

export interface AIMessageDto {
  message: string;
  messageType?: 'text' | 'voice';
  metadata?: any;
}

export interface AIVoiceMessageDto {
  audioUrl: string;
  metadata?: any;
}

export interface AIResponseDto {
  message: string;
  role: 'user' | 'assistant';
}

export interface AIConversationMessage {
  id: string;
  userId: string;
  message: string;
  messageType: 'text' | 'voice';
  role: 'user' | 'assistant';
  metadata?: any;
  createdAt: string;
}

export const aiAPI = {
  sendMessage: async (messageData: AIMessageDto): Promise<AIResponseDto> => {
    requireAuth();
    const response = await apiClient.post('/ai/message', messageData);
    return response.data;
  },

  sendVoiceMessage: async (voiceData: AIVoiceMessageDto): Promise<AIResponseDto> => {
    requireAuth();
    const response = await apiClient.post('/ai/voice', voiceData);
    return response.data;
  },

  getConversationHistory: async (limit?: number): Promise<AIConversationMessage[]> => {
    requireAuth();
    const response = await apiClient.get('/ai/conversation', {
      params: limit ? { limit } : {}
    });
    return response.data;
  },

  clearConversationHistory: async (): Promise<void> => {
    requireAuth();
    await apiClient.delete('/ai/conversation');
  },
};

export const chatAPI = {
  getChats: async (): Promise<Chat[]> => {
    requireAuth();
    const response = await apiClient.get('/chat');
    return response.data;
  },

  getChatById: async (id: string): Promise<Chat> => {
    requireAuth();
    const response = await apiClient.get(`/chat/${id}`);
    return response.data;
  },

  getChatMessages: async (id: string, params?: any): Promise<ChatMessage[]> => {
    requireAuth();
    const response = await apiClient.get(`/chat/${id}/messages`, { params });
    return response.data;
  },

  getChatMessagesSimple: async (id: string): Promise<ChatMessage[]> => {
    requireAuth();
    const response = await apiClient.get(`/chat/${id}/messages-simple`);
    return response.data;
  },

  createSupportChat: async (): Promise<Chat> => {
    requireAuth();
    const response = await apiClient.post('/chat/support');
    return response.data;
  },

  joinChat: async (chatId: string) => {
    requireAuth();
    const response = await apiClient.post('/chat/join', { chatId });
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    requireAuth();
    const response = await apiClient.get('/chat/unread/count');
    return response.data;
  },

  sendMessage: async (message: SendMessageDto): Promise<ChatMessage> => {
    requireAuth();
    const response = await apiClient.post('/chat/message', message);
    return response.data;
  },

  sendVoiceToAI: async (voiceData: { audioUrl: string; metadata?: any }) => {
    requireAuth();
    const response = await apiClient.post('/ai/voice', voiceData);
    return response.data;
  },
};

export default apiClient;
