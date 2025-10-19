import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity
} from 'react-native';
import { ScreenProps } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { Layout } from '../ui/components';
import { useLanguage } from '../contexts/LanguageContext';

const OperationsScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const { t } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const handleOperationPress = (operationId: string) => {
    console.log('Детали операции:', operationId);
  };

  const handleFilterPress = (filter: string) => {
    setSelectedFilter(filter);
    console.log('Выбран фильтр:', filter);
  };

  const handleShowAllPress = () => {
    console.log('Показать все операции');
  };

  const operations = [
    {
      id: '1',
      title: 'Перевод на карту другого банка',
      amount: '-15 000 ₸',
      date: '19 октября',
      status: 'completed',
      icon: '💳'
    },
    {
      id: '2',
      title: 'Пополнение счета',
      amount: '+50 000 ₸',
      date: '18 октября',
      status: 'completed',
      icon: '💰'
    },
    {
      id: '3',
      title: 'Оплата коммунальных услуг',
      amount: '-8 500 ₸',
      date: '17 октября',
      status: 'completed',
      icon: '🏠'
    },
    {
      id: '4',
      title: 'Перевод другу',
      amount: '-5 000 ₸',
      date: '16 октября',
      status: 'completed',
      icon: '👤'
    },
    {
      id: '5',
      title: 'Покупка в магазине',
      amount: '-2 300 ₸',
      date: '15 октября',
      status: 'completed',
      icon: '🛒'
    }
  ];

  const renderOperation = (operation: any) => (
    <TouchableOpacity key={operation.id} style={styles.operationItem} onPress={() => handleOperationPress(operation.id)}>
      <View style={styles.operationIcon}>
        <Text style={styles.iconText}>{operation.icon}</Text>
      </View>
      <View style={styles.operationContent}>
        <Text style={styles.operationTitle}>{operation.title}</Text>
        <Text style={styles.operationDate}>{operation.date}</Text>
      </View>
      <View style={styles.operationAmount}>
        <Text style={[
          styles.amountText,
          operation.amount.startsWith('+') ? styles.positiveAmount : styles.negativeAmount
        ]}>
          {operation.amount}
        </Text>
        <Text style={styles.statusText}>Выполнено</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Layout 
      headerTitle="Операции" 
      showBackButton={true}
      onBackPress={() => navigation.goBack()}
    >
      <ScrollView style={styles.container}>
        {/* Статистика */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Операций за месяц</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>₸ 85 200</Text>
            <Text style={styles.statLabel}>Общая сумма</Text>
          </View>
        </View>

        {/* Фильтры */}
        <View style={styles.filtersContainer}>
          <TouchableOpacity 
            style={selectedFilter === 'all' ? styles.filterButton : [styles.filterButton, styles.inactiveFilter]}
            onPress={() => handleFilterPress('all')}
          >
            <Text style={selectedFilter === 'all' ? styles.filterText : styles.inactiveFilterText}>Все</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={selectedFilter === 'income' ? styles.filterButton : [styles.filterButton, styles.inactiveFilter]}
            onPress={() => handleFilterPress('income')}
          >
            <Text style={selectedFilter === 'income' ? styles.filterText : styles.inactiveFilterText}>Пополнения</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={selectedFilter === 'expense' ? styles.filterButton : [styles.filterButton, styles.inactiveFilter]}
            onPress={() => handleFilterPress('expense')}
          >
            <Text style={selectedFilter === 'expense' ? styles.filterText : styles.inactiveFilterText}>Списания</Text>
          </TouchableOpacity>
        </View>

        {/* Список операций */}
        <View style={styles.operationsList}>
          {operations.map(renderOperation)}
        </View>

        {/* Кнопка "Показать все" */}
        <TouchableOpacity style={styles.showAllButton} onPress={handleShowAllPress}>
          <Text style={styles.showAllText}>Показать все операции</Text>
        </TouchableOpacity>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    borderRadius: 12,
    padding: SPACING.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  filterButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  inactiveFilter: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    fontWeight: '500',
  },
  inactiveFilterText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  operationsList: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  operationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  operationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  iconText: {
    fontSize: 20,
  },
  operationContent: {
    flex: 1,
  },
  operationTitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
    marginBottom: 2,
  },
  operationDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  operationAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  positiveAmount: {
    color: COLORS.success,
  },
  negativeAmount: {
    color: COLORS.error,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  showAllButton: {
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  showAllText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default OperationsScreen;
