import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PieChart from 'react-native-pie-chart';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { Goal } from '../../types';

interface GoalsPieChartProps {
  goals: Goal[];
}

const GoalsPieChart: React.FC<GoalsPieChartProps> = ({ goals }) => {
  // Фильтруем только активные цели
  const activeGoals = goals.filter(goal => goal.status === 'active');
  
  if (activeGoals.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Нет активных целей</Text>
      </View>
    );
  }

  // Создаем данные для диаграммы
  const series = activeGoals.map((goal, index) => {
    const colors = ['#007AFF', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'];
    return {
      value: goal.currentAmount,
      color: colors[index % colors.length],
      label: {
        text: `${Math.round((goal.currentAmount / goal.targetAmount) * 100)}%`,
        fontSize: 12,
        fontWeight: 'bold' as const,
        fill: '#FFFFFF',
        stroke: '#000000',
        strokeWidth: 1,
      },
    };
  });

  const widthAndHeight = 200;

  // Вычисляем общий прогресс
  const totalTargetAmount = activeGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrentAmount = activeGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Прогресс по целям</Text>
      
      <View style={styles.chartContainer}>
        <PieChart
          widthAndHeight={widthAndHeight}
          series={series}
          coverRadius={0.6}
          coverFill={COLORS.surface}
        />
        
        {/* Центральный текст с общим прогрессом */}
        <View style={styles.centerTextContainer}>
          <Text style={styles.overallProgress}>{Math.round(overallProgress)}%</Text>
          <Text style={styles.overallLabel}>Общий прогресс</Text>
        </View>
      </View>

      {/* Легенда */}
      <View style={styles.legend}>
        {activeGoals.map((goal, index) => {
          const colors = ['#007AFF', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'];
          const color = colors[index % colors.length];
          const progress = Math.round((goal.currentAmount / goal.targetAmount) * 100);
          
          return (
            <View key={goal.id} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: color }]} />
              <View style={styles.legendTextContainer}>
                <Text style={styles.legendTitle} numberOfLines={1}>
                  {goal.title}
                </Text>
                <Text style={styles.legendProgress}>
                  {progress}% • {formatAmount(goal.currentAmount)} / {formatAmount(goal.targetAmount)} ₸
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('ru-RU').format(amount);
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    marginVertical: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  emptyContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.xl,
    marginVertical: SPACING.md,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    position: 'relative',
  },
  centerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overallProgress: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  overallLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  legend: {
    gap: SPACING.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  legendProgress: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
});

export { GoalsPieChart };
