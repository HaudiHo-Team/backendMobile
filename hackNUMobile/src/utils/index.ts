import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants';

export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('ru-RU');
};

export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleString('ru-RU');
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getStorageItem = async (key: string): Promise<string | null> => {
  try {
    return null;
  } catch (error) {
    console.error('Error getting storage item:', error);
    return null;
  }
};

export const setStorageItem = async (key: string, value: string): Promise<boolean> => {
  try {
    return true;
  } catch (error) {
    console.error('Error setting storage item:', error);
    return false;
  }
};

export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = 'https://api.example.com';
  return `${baseUrl}${endpoint}`;
};

export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error) return error.error;
  return 'Произошла неизвестная ошибка';
};

export const getScreenDimensions = () => {
  return { width: 375, height: 812 }; // Значения по умолчанию
};

export const isIOS = (): boolean => {
  return true; // Значение по умолчанию
};

export const isAndroid = (): boolean => {
  return false; // Значение по умолчанию
};
