import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { Goal } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useGoals } from '../../contexts/GoalsContext';

interface GoalsBlockProps {
  onNavigateToGoals: () => void;
}

const GoalsBlock: React.FC<GoalsBlockProps> = ({ onNavigateToGoals }) => {
  const [animatedProgress, setAnimatedProgress] = useState<{[key: string]: Animated.Value}>({});
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { goals, loading } = useGoals();

  // Обновляем анимацию при изменении целей
  useEffect(() => {
    if (goals.length > 0) {
      const activeGoals = goals.filter(goal => goal.status === 'active').slice(0, 3);
      activeGoals.forEach(goal => {
        const progress = getProgressPercentage(goal.currentAmount, goal.targetAmount);
        setTimeout(() => {
          animateProgress(goal.id, progress);
        }, 100 * activeGoals.indexOf(goal)); // Небольшая задержка для последовательной анимации
      });
    }
  }, [goals]);


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
    
    // Для очень маленьких сумм показываем минимум 2 знака после запятой
    if (amount < 1) {
      return amount.toFixed(2);
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

  const animateProgress = (goalId: string, progress: number) => {
    if (!animatedProgress[goalId]) {
      animatedProgress[goalId] = new Animated.Value(0);
      setAnimatedProgress({...animatedProgress});
    }

    // Округляем прогресс для анимации
    const roundedProgress = Math.round(progress * 100) / 100;

    Animated.timing(animatedProgress[goalId], {
      toValue: roundedProgress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  const renderGoalItem = (goal: Goal, index: number) => {
    const progress = getProgressPercentage(goal.currentAmount, goal.targetAmount);
    const color = getGoalColor(index);
    const remainingAmount = goal.targetAmount - goal.currentAmount;
    const isCompleted = progress >= 100;
    const isNearCompletion = progress >= 80;

    return (
      <View key={goal.id} style={[styles.goalItem, isCompleted && styles.completedGoal]}>
        {/* Цветная полоса сверху */}
        <View style={[styles.goalColorBar, { backgroundColor: color }]} />
        
        {/* Иконка цели */}
        <View style={styles.goalIconContainer}>
          <Text style={styles.goalIcon}>
            {isCompleted ? '🎉' : isNearCompletion ? '🔥' : '🎯'}
          </Text>
        </View>

        <View style={styles.goalContent}>
          <View style={styles.goalHeader}>
            <Text style={[styles.goalTitle, isCompleted && styles.completedText]} numberOfLines={2}>
              {goal.title}
            </Text>
            <View style={[styles.progressBadge, { backgroundColor: color }]}>
              <Text style={styles.progressText}>
                {Math.round(progress)}%
              </Text>
            </View>
          </View>

          {/* Улучшенная полоса прогресса с анимацией */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { 
                    width: `${Math.round(progress)}%`,
                    backgroundColor: color,
                    shadowColor: color,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    elevation: 3,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressLabel}>
              {isCompleted ? 'Выполнено!' : `${Math.round(progress)}% выполнено`}
            </Text>
          </View>

          <View style={styles.goalDetails}>
            <View style={styles.amountContainer}>
              <Text style={[styles.currentAmount, { color: color }]}>
                {formatAmount(goal.currentAmount)} ₸
              </Text>
              <Text style={styles.targetAmount}>
                из {formatAmount(goal.targetAmount)} ₸
              </Text>
            </View>
            
            {!isCompleted && (
              <View style={styles.remainingContainer}>
                <Text style={styles.remainingLabel}>Осталось:</Text>
                <Text style={[styles.remainingAmount, { color: color }]}>
                  {formatAmount(remainingAmount)} ₸
                </Text>
              </View>
            )}
            
            <View style={styles.dateContainer}>
              <Text style={styles.dateIcon}>📅</Text>
              <Text style={styles.goalDate}>
                До {formatDate(goal.targetDate)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Не показываем компонент если пользователь не авторизован
  if (!isAuthenticated) {
    return null;
  }

  // Получаем активные цели для отображения
  const activeGoals = goals.filter(goal => goal.status === 'active').slice(0, 3);

  if (loading || authLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🎯 Финансовые цели</Text>
          <TouchableOpacity onPress={onNavigateToGoals}>
            <Text style={styles.seeAllText}>Все</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Загрузка целей...</Text>
        </View>
      </View>
    );
  }

  if (activeGoals.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>🎯 Финансовые цели</Text>
          <TouchableOpacity onPress={onNavigateToGoals}>
            <Text style={styles.seeAllText}>Создать</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Нет активных целей</Text>
          <Text style={styles.emptySubtext}>Создайте свою первую цель</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎯 Финансовые цели</Text>
        <TouchableOpacity onPress={onNavigateToGoals}>
          <Text style={styles.seeAllText}>Все</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.goalsScroll}
        contentContainerStyle={styles.goalsContent}
      >
        {activeGoals.map(renderGoalItem)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    margin: SPACING.md,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '700',
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  loadingContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  emptyState: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  goalsScroll: {
    marginHorizontal: -SPACING.sm,
  },
  goalsContent: {
    paddingHorizontal: SPACING.sm,
  },
  goalItem: {
    width: 240,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedGoal: {
    borderColor: '#10B981',
    backgroundColor: '#10B981' + '10',
  },
  goalColorBar: {
    height: 4,
    width: '100%',
  },
  goalIconContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  goalIcon: {
    fontSize: 24,
  },
  goalContent: {
    padding: SPACING.md,
    paddingTop: 0,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  goalTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
    lineHeight: 20,
  },
  completedText: {
    color: '#10B981',
  },
  progressBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: 'white',
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginBottom: SPACING.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  goalDetails: {
    gap: SPACING.sm,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  currentAmount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
  },
  targetAmount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  remainingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  remainingLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  remainingAmount: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateIcon: {
    fontSize: FONT_SIZES.sm,
    marginRight: SPACING.xs,
  },
  goalDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

export { GoalsBlock };
