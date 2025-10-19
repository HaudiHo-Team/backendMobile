import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ScreenProps } from '../types';
import { COLORS, FONT_SIZES, SPACING } from '../constants';
import { Layout } from '../ui/components';
import PieChart from 'react-native-pie-chart';

const ProfileScreen: React.FC<ScreenProps> = ({ navigation: _navigation }) => {
  const financialData = {
    income: 150000,
    expenses: 95000,
    balance: 55000,
  };

  const expenseCategories = [
    { name: 'Еда и продукты', amount: 35000, color: '#2196F3' },
    { name: 'Транспорт', amount: 12000, color: '#9C27B0' },
    { name: 'Развлечения', amount: 18000, color: '#E91E63' },
    { name: 'Коммунальные услуги', amount: 8000, color: '#FF9800' },
    { name: 'Здоровье', amount: 15000, color: '#4CAF50' },
    { name: 'Прочее', amount: 7000, color: '#9E9E9E' },
  ];

  const totalAmount = expenseCategories.reduce(
    (total, category) => total + category.amount,
    0,
  );

  const series = expenseCategories.map(category => ({
    value: category.amount,
    color: category.color,
    label: {
      text: `${((category.amount / totalAmount) * 100).toFixed(1)}%`,
      fontWeight: 'bold',
      fontSize: 12,
      fill: '#fff',
    },
  }));

  const widthAndHeight = 250;

  const handleCategoryPress = (categoryName: string) => {
    console.log('Выбрана категория:', categoryName);
  };

  const handleLogout = () => {
    console.log('Выход из приложения');
  };

  const renderCategoryItem = (category: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.categoryItem}
      onPress={() => handleCategoryPress(category.name)}
    >
      <View style={styles.categoryInfo}>
        <View
          style={[styles.categoryDot, { backgroundColor: category.color }]}
        />
        <Text style={styles.categoryName}>{category.name}</Text>
      </View>
      <Text style={styles.categoryAmount}>
        {category.amount.toLocaleString()}₸
      </Text>
    </TouchableOpacity>
  );

  return (
    <Layout
      headerTitle="Профиль"
      showBackButton={false}
      headerRightComponent={
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutIcon}>⎘</Text>
        </TouchableOpacity>
      }
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Имя пользователя */}
        <View style={styles.userSection}>
          <Text style={styles.userName}>ТИМУР ЕСМАГАМБЕТОВ</Text>
        </View>

        {/* Финансовая сводка */}
        <View style={styles.financialSummary}>
          <View style={styles.summaryHeader}>
            <Text style={styles.chartIcon}>📈</Text>
            <Text style={styles.summaryTitle}>Анализ финансов</Text>
          </View>

          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Доходы</Text>
              <Text style={[styles.statValue, { color: COLORS.success }]}>
                +{financialData.income.toLocaleString()} ₸
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Расходы</Text>
              <Text style={[styles.statValue, { color: COLORS.error }]}>
                -{financialData.expenses.toLocaleString()} ₸
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Баланс</Text>
              <Text style={[styles.statValue, { color: COLORS.primary }]}>
                +{financialData.balance.toLocaleString()} ₸
              </Text>
            </View>
          </View>
        </View>

        {/* Диаграмма расходов */}
        <View style={styles.pieChart}>
          <PieChart widthAndHeight={widthAndHeight} series={series} />
        </View>

        {/* Легенда категорий */}
        <View style={styles.legendContainer}>
          <View style={styles.legendGrid}>
            {expenseCategories.map((category, index) => (
              <View key={index} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: category.color },
                  ]}
                />
                <Text style={styles.legendText}>{category.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Детальный список расходов */}
        <View style={styles.expensesList}>
          {expenseCategories.map(renderCategoryItem)}
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  logoutIcon: {
    fontSize: 20,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  pieChart: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userSection: {
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  userName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: 1,
  },
  financialSummary: {
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    borderRadius: 12,
    padding: SPACING.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  chartIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
  },
  legendContainer: {
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    borderRadius: 12,
    padding: SPACING.lg,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: SPACING.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  legendText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    flex: 1,
  },
  expensesList: {
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    borderRadius: 12,
    padding: SPACING.lg,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.md,
  },
  categoryName: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    flex: 1,
  },
  categoryAmount: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});

export default ProfileScreen;
