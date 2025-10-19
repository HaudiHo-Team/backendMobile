export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface NavigationProps {
  navigation: any;
  route: any;
}

export interface ScreenProps {
  navigation: any;
  route: any;
}

export type RootStackParamList = {
  MainTabs: undefined;
  Login: undefined;
  SupportChat: undefined;
  Chat: undefined;
  Operations: undefined;
  Notifications: undefined;
  Goals: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Messages: undefined;
  Profile: undefined;
};

export interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

export interface InputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  error?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface NavigationProps {
  navigation: any;
  route: any;
}

export interface ScreenProps {
  navigation: any;
  route: any;
}

export type RootStackParamList = {
  MainTabs: undefined;
  Login: undefined;
  SupportChat: undefined;
  Chat: undefined;
  Operations: undefined;
  Notifications: undefined;
  Goals: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Messages: undefined;
  Profile: undefined;
};

export interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

export interface InputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  error?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: 'apartment' | 'education' | 'purchase' | 'travel' | 'operation' | 'other';
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  id: string;
  userId: string;
  message: string;
  messageType: 'text' | 'voice';
  role: 'user' | 'assistant';
  metadata?: any;
  createdAt: string;
}

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
