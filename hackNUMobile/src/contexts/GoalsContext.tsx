import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Goal } from '../types';
import { goalsAPI } from '../services/ApiService';
import { useAuth } from './AuthContext';

interface GoalsContextType {
  goals: Goal[];
  loading: boolean;
  error: string | null;
  loadGoals: () => Promise<void>;
  addToGoal: (goalId: string, amount: number) => Promise<void>;
  createGoal: (goalData: Partial<Goal>) => Promise<void>;
  updateGoal: (goalId: string, goalData: Partial<Goal>) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  refreshGoals: () => Promise<void>;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export const useGoals = () => {
  const context = useContext(GoalsContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
};

interface GoalsProviderProps {
  children: ReactNode;
}

export const GoalsProvider: React.FC<GoalsProviderProps> = ({ children }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const loadGoals = async () => {
    if (!isAuthenticated) {
      setGoals([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('🔄 GoalsContext: Загружаем цели с сервера...');
      const goalsData = await goalsAPI.getGoals();
      console.log('📥 GoalsContext: Получены цели:', goalsData);
      
      setGoals(goalsData);
    } catch (err: any) {
      console.error('❌ GoalsContext: Ошибка загрузки целей:', err);
      setError(err.response?.data?.message || err.message);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const addToGoal = async (goalId: string, amount: number) => {
    try {
      console.log('🎯 GoalsContext: Добавляем деньги к цели');
      console.log('📊 Goal ID:', goalId);
      console.log('💰 Amount:', amount);
      
      // Округляем сумму до целого числа
      const roundedAmount = Math.round(amount);
      console.log('🔢 Округленная сумма:', roundedAmount);
      
      setError(null);
      
      // Оптимистичное обновление - сразу обновляем UI
      setGoals(prevGoals => {
        return prevGoals.map(goal => {
          if (goal.id === goalId) {
            const currentAmount = goal.currentAmount || 0;
            const newAmount = Math.round(currentAmount + roundedAmount);
            console.log('🔄 Обновляем локально:', {
              oldAmount: currentAmount,
              addedAmount: roundedAmount,
              newAmount: newAmount
            });
            return { ...goal, currentAmount: newAmount };
          }
          return goal;
        });
      });
      
      // Отправляем запрос на сервер
      const response = await goalsAPI.addToGoal(goalId, roundedAmount);
      console.log('✅ Ответ сервера:', response);
      
      // Обновляем с данными с сервера
      setGoals(prevGoals => {
        return prevGoals.map(goal => {
          if (goal.id === goalId) {
            return { ...goal, ...response };
          }
          return goal;
        });
      });
      
      console.log('✅ Деньги успешно добавлены к цели');
      
    } catch (err: any) {
      console.error('❌ Ошибка добавления денег к цели:', err);
      
      // Откатываем изменения при ошибке
      setGoals(prevGoals => {
        return prevGoals.map(goal => {
          if (goal.id === goalId) {
            const currentAmount = goal.currentAmount || 0;
            const oldAmount = currentAmount - Math.round(amount);
            console.log('🔄 Откатываем изменения:', {
              currentAmount: currentAmount,
              subtractedAmount: Math.round(amount),
              oldAmount: oldAmount
            });
            return { ...goal, currentAmount: Math.max(0, oldAmount) };
          }
          return goal;
        });
      });
      
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const createGoal = async (goalData: Partial<Goal>) => {
    try {
      setError(null);
      console.log('🎯 GoalsContext: Создаем новую цель');
      const newGoal = await goalsAPI.createGoal(goalData);
      console.log('✅ Цель создана:', newGoal);
      
      // Добавляем новую цель в список
      setGoals(prevGoals => [newGoal, ...prevGoals]);
      
    } catch (err: any) {
      console.error('❌ Ошибка создания цели:', err);
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const updateGoal = async (goalId: string, goalData: Partial<Goal>) => {
    try {
      setError(null);
      console.log('🎯 GoalsContext: Обновляем цель');
      const updatedGoal = await goalsAPI.updateGoal(goalId, goalData);
      console.log('✅ Цель обновлена:', updatedGoal);
      
      // Обновляем цель в списке
      setGoals(prevGoals => {
        return prevGoals.map(goal => {
          if (goal.id === goalId) {
            return { ...goal, ...updatedGoal };
          }
          return goal;
        });
      });
      
    } catch (err: any) {
      console.error('❌ Ошибка обновления цели:', err);
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      setError(null);
      console.log('🎯 GoalsContext: Удаляем цель');
      await goalsAPI.deleteGoal(goalId);
      console.log('✅ Цель удалена');
      
      // Удаляем цель из списка
      setGoals(prevGoals => {
        return prevGoals.filter(goal => goal.id !== goalId);
      });
      
    } catch (err: any) {
      console.error('❌ Ошибка удаления цели:', err);
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const refreshGoals = async () => {
    await loadGoals();
  };

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadGoals();
    } else if (!authLoading) {
      setGoals([]);
    }
  }, [isAuthenticated, authLoading]);

  const value: GoalsContextType = {
    goals,
    loading,
    error,
    loadGoals,
    addToGoal,
    createGoal,
    updateGoal,
    deleteGoal,
    refreshGoals,
  };

  return <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>;
};