import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { Goal } from '../../types';
import { goalsAPI } from '../../services/ApiService';
import { useAuth } from '../../contexts/AuthContext';

interface GoalsPreviewProps {
  onNavigateToGoals: () => void;
}

const GoalsPreview: React.FC<GoalsPreviewProps> = ({ onNavigateToGoals }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadGoals();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const goalsData = await goalsAPI.getGoals();
      // Показываем только первые 3 активные цели
      const activeGoals = goalsData.filter(goal => goal.status === 'active').slice(0, 3);
      setGoals(activeGoals);
    } catch (error) {
      console.error('Ошибка загрузки целей:', error);
      // Не показываем ошибку пользователю, просто оставляем пустой список
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (currentAmount: number, targetAmount: number) => {
    if (targetAmount <= 0) return 0;
    
    // Используем Math.round для избежания проблем с плавающей точкой
    const percentage = (currentAmount / targetAmount) * 100;
    const roundedPercentage = Math.round(percentage * 100) / 100; // Округляем до 2 знаков после запятой
    
    return Math.min(roundedPercentage, 100);
  };

  const formatAmount = (amount: number) => {
    // Проверяем, что amount является числом и не undefined/null
    if (typeof amount !== 'number' || isNaN(amount) || amount === null || amount === undefined) {
      return '0';
    }
    return new Intl.NumberFormat('ru-RU').format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      month: 'short',
      year: 'numeric',
    });
  };

  const getGoalColor = (index: number) => {
    const colors = [COLORS.primary, '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];
    return colors[index % colors.length];
  };

  const renderGoalItem = (goal: Goal, index: number) => {
    const progress = getProgressPercentage(goal.currentAmount, goal.targetAmount);
    const color = getGoalColor(index);

    return (
      <View key={goal.id} style={styles.goalItem}>
        <View style={[styles.goalColorBar, { backgroundColor: color }]} />
        
        <View style={styles.goalContent}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle} numberOfLines={1}>
              {goal.title}
            </Text>
            <Text style={styles.goalProgress}>{Math.round(progress)}%</Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%`, backgroundColor: color },
                ]}
              />
            </View>
          </View>

          <View style={styles.goalFooter}>
            <Text style={styles.goalDeadline}>
              До {formatDate(goal.targetDate)}
            </Text>
            <Text style={styles.goalAmount}>
              {formatAmount(goal.currentAmount)} / {formatAmount(goal.targetAmount)} ₸
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerIcon}>🎯</Text>
            <Text style={styles.headerTitle}>Финансовые цели</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      </View>
    );
  }

  if (!isAuthenticated) {
    return null; // Не показываем блок если пользователь не авторизован
  }

  if (goals.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerIcon}>🎯</Text>
            <Text style={styles.headerTitle}>Финансовые цели</Text>
          </View>
          <TouchableOpacity onPress={onNavigateToGoals}>
            <Text style={styles.addButton}>+</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.emptyState} onPress={onNavigateToGoals}>
          <Text style={styles.emptyStateIcon}>🎯</Text>
          <Text style={styles.emptyStateTitle}>Создайте первую цель</Text>
          <Text style={styles.emptyStateText}>
            Начните копить на свои мечты
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>🎯</Text>
          <Text style={styles.headerTitle}>Финансовые цели</Text>
        </View>
        <TouchableOpacity onPress={onNavigateToGoals}>
          <Text style={styles.seeAllButton}>Все</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.goalsList} 
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {goals.map(renderGoalItem)}
      </ScrollView>

      {goals.length >= 3 && (
        <TouchableOpacity style={styles.moreButton} onPress={onNavigateToGoals}>
          <Text style={styles.moreButtonText}>Показать все цели</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    margin: SPACING.lg,
    marginTop: 0,
    padding: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addButton: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  seeAllButton: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  goalsList: {
    maxHeight: 200, // Ограничиваем высоту для компактности
  },
  goalItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
  },
  goalColorBar: {
    width: 4,
  },
  goalContent: {
    flex: 1,
    padding: SPACING.sm,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  goalTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.xs,
  },
  goalProgress: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  progressContainer: {
    marginBottom: SPACING.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalDeadline: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  goalAmount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  moreButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  moreButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
});

export { GoalsPreview };
