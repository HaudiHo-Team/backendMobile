import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Animated,
  Dimensions,
} from 'react-native';
import { ScreenProps } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { Layout } from '../ui/components';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useGoals } from '../contexts/GoalsContext';
import { Goal } from '../types';

interface GoalModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (goal: Partial<Goal>) => void;
  editingGoal?: Goal | null;
}

interface AddMoneyModalProps {
  visible: boolean;
  onClose: () => void;
  onAddMoney: (amount: number) => void;
  goalTitle: string;
}

const GoalModal: React.FC<GoalModalProps> = ({
  visible,
  onClose,
  onSave,
  editingGoal,
}) => {
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title);
      setTargetDate(editingGoal.targetDate.split('T')[0]); // Format date for input
      setTargetAmount(editingGoal.targetAmount.toString());
      setDescription(editingGoal.description || '');
    } else {
      setTitle('');
      setTargetDate('');
      setTargetAmount('');
      setDescription('');
    }
  }, [editingGoal, visible]);

  const handleSave = () => {
    if (!title.trim() || !targetDate || !targetAmount) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все обязательные поля');
      return;
    }

    // Валидация даты
    const dateObj = new Date(targetDate);
    if (isNaN(dateObj.getTime())) {
      Alert.alert(
        'Ошибка',
        'Пожалуйста, введите корректную дату в формате YYYY-MM-DD',
      );
      return;
    }

    // Проверяем, что дата не в прошлом
    if (dateObj < new Date()) {
      Alert.alert('Ошибка', 'Дата цели не может быть в прошлом');
      return;
    }

    // Валидация суммы
    const amount = parseFloat(targetAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Ошибка', 'Пожалуйста, введите корректную сумму больше 0');
      return;
    }

    const goalData = {
      title: title.trim(),
      description: description.trim(),
      targetDate: dateObj.toISOString(),
      targetAmount: amount,
      type: 'other' as const,
    };

    onSave(goalData);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingGoal ? 'Редактировать цель' : 'Новая финансовая цель'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Название *</Text>
              <TextInput
                style={styles.textInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Например: Покупка квартиры"
                placeholderTextColor={COLORS.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Крайний срок *</Text>
              <TextInput
                style={styles.textInput}
                value={targetDate}
                onChangeText={setTargetDate}
                placeholder="2025-12-31"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="numeric"
              />
              <Text style={styles.inputHint}>
                Формат: YYYY-MM-DD (например: 2025-12-31)
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Сколько надо (₸) *</Text>
              <TextInput
                style={styles.textInput}
                value={targetAmount}
                onChangeText={setTargetAmount}
                placeholder="5000000"
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Описание</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Дополнительная информация о цели"
                placeholderTextColor={COLORS.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {editingGoal ? 'Сохранить' : 'Создать'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const AddMoneyModal: React.FC<AddMoneyModalProps> = ({
  visible,
  onClose,
  onAddMoney,
  goalTitle,
}) => {
  const [amount, setAmount] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(300));

  // Быстрые суммы для удобства
  const quickAmounts = [1000, 5000, 10000, 25000, 50000];

  useEffect(() => {
    if (visible) {
      setAmount('');
      // Анимация появления
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Анимация исчезновения
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleAddMoney = () => {
    console.log('💰 AddMoneyModal: Обрабатываем добавление денег');
    console.log('📝 Введенная сумма (строка):', amount);
    
    if (!amount || amount.trim() === '') {
      Alert.alert('Ошибка', 'Пожалуйста, введите сумму');
      return;
    }
    
    const numAmount = parseFloat(amount);
    console.log('🔢 Преобразованная сумма (число):', numAmount);
    console.log('📊 Тип суммы:', typeof numAmount);
    console.log('✅ Валидная сумма:', !isNaN(numAmount) && numAmount > 0);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Ошибка', 'Пожалуйста, введите корректную сумму больше 0');
      return;
    }

    console.log('✅ Отправляем сумму:', numAmount);
    onAddMoney(numAmount);
    onClose();
  };

  const handleQuickAmount = (quickAmount: number) => {
    console.log('⚡ AddMoneyModal: Быстрая сумма выбрана:', quickAmount);
    setAmount(quickAmount.toString());
  };

  const formatAmount = (amount: number) => {
    // Проверяем, что amount является числом и не undefined/null
    if (typeof amount !== 'number' || isNaN(amount) || amount === null || amount === undefined) {
      return '0';
    }
    return new Intl.NumberFormat('ru-RU').format(amount);
  };

  return (
    <Modal visible={visible} animationType="none" transparent>
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <Animated.View 
          style={[
            styles.addMoneyModalContainer, 
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* Заголовок с иконкой */}
          <View style={styles.addMoneyModalHeader}>
            <View style={styles.addMoneyModalIconContainer}>
              <Text style={styles.addMoneyModalIcon}>💰</Text>
            </View>
            <View style={styles.addMoneyModalTitleContainer}>
              <Text style={styles.addMoneyModalTitle}>Добавить деньги</Text>
              <Text style={styles.addMoneyModalSubtitle}>к цели "{goalTitle}"</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.addMoneyCloseButton}>
              <Text style={styles.addMoneyCloseButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.addMoneyModalContent}>
            {/* Быстрые суммы */}
            <View style={styles.quickAmountsContainer}>
              <Text style={styles.quickAmountsTitle}>Быстрые суммы</Text>
              <View style={styles.quickAmountsGrid}>
                {quickAmounts.map((quickAmount) => (
                  <TouchableOpacity
                    key={quickAmount}
                    style={[
                      styles.quickAmountButton,
                      amount === quickAmount.toString() && styles.quickAmountButtonActive
                    ]}
                    onPress={() => handleQuickAmount(quickAmount)}
                  >
                    <Text style={[
                      styles.quickAmountText,
                      amount === quickAmount.toString() && styles.quickAmountTextActive
                    ]}>
                      {formatAmount(quickAmount)} ₸
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Поле ввода суммы */}
            <View style={styles.addMoneyInputContainer}>
              <Text style={styles.addMoneyInputLabel}>Или введите свою сумму</Text>
              <View style={styles.addMoneyInputWrapper}>
                <TextInput
                  style={styles.addMoneyInput}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0"
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.textSecondary}
                  autoFocus
                />
                <Text style={styles.addMoneyCurrency}>₸</Text>
              </View>
            </View>

            {/* Информация о цели */}
            <View style={styles.goalInfoContainer}>
              <View style={styles.goalInfoItem}>
                <Text style={styles.goalInfoLabel}>Цель:</Text>
                <Text style={styles.goalInfoValue}>{goalTitle}</Text>
              </View>
              <View style={styles.goalInfoItem}>
                <Text style={styles.goalInfoLabel}>Сумма:</Text>
                <Text style={styles.goalInfoValue}>
                  {amount ? `${formatAmount(parseFloat(amount) || 0)} ₸` : '0 ₸'}
                </Text>
              </View>
            </View>
          </View>

          {/* Кнопки действий */}
          <View style={styles.addMoneyModalFooter}>
            <TouchableOpacity
              style={styles.addMoneyCancelButton}
              onPress={onClose}
            >
              <Text style={styles.addMoneyCancelButtonText}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.addMoneyConfirmButton,
                (!amount || parseFloat(amount) <= 0) && styles.addMoneyConfirmButtonDisabled
              ]}
              onPress={handleAddMoney}
              disabled={!amount || parseFloat(amount) <= 0}
            >
              <Text style={styles.addMoneyConfirmButtonText}>
                💰 Добавить деньги
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const GoalsScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const { t } = useLanguage();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { goals, loading, addToGoal, createGoal, updateGoal, deleteGoal } = useGoals();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [addMoneyModalVisible, setAddMoneyModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const handleSaveGoal = async (goalData: Partial<Goal>) => {
    try {
      if (editingGoal) {
        await updateGoal(editingGoal.id, goalData);
        Alert.alert('Успех', 'Цель успешно обновлена!');
      } else {
        await createGoal(goalData);
        Alert.alert('Успех', 'Цель успешно создана!');
      }
      setModalVisible(false);
    } catch (error) {
      console.error('Ошибка сохранения цели:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить цель');
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    Alert.alert(
      'Удалить цель', 
      'Вы уверены, что хотите удалить эту цель? Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGoal(goalId);
              Alert.alert('Успех', 'Цель успешно удалена!');
            } catch (error) {
              console.error('Ошибка удаления цели:', error);
              Alert.alert('Ошибка', 'Не удалось удалить цель');
            }
          },
        },
      ]
    );
  };

  const handleAddMoney = (goal: Goal) => {
    setSelectedGoal(goal);
    setAddMoneyModalVisible(true);
  };

  const handleAddMoneyToGoal = async (amount: number) => {
    if (!selectedGoal) return;

    try {
      // Округляем сумму до целого числа перед отправкой
      const roundedAmount = Math.round(amount);
      console.log('💰 Отправляем округленную сумму:', roundedAmount, 'вместо', amount);
      
      await addToGoal(selectedGoal.id, roundedAmount);
      setAddMoneyModalVisible(false);
      Alert.alert('Успех', `Добавлено ₸${roundedAmount.toLocaleString()} к цели "${selectedGoal.title}"`);
    } catch (error: any) {
      console.error('Ошибка при добавлении денег:', error);
      Alert.alert('Ошибка', error.response?.data?.message || 'Не удалось добавить деньги к цели');
    }
  };

  const handleCreateGoal = () => {
    setEditingGoal(null);
    setModalVisible(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setModalVisible(true);
  };

  const getProgressPercentage = (
    currentAmount: number,
    targetAmount: number,
  ) => {
    // Проверяем, что параметры являются числами
    if (typeof currentAmount !== 'number' || typeof targetAmount !== 'number' || 
        isNaN(currentAmount) || isNaN(targetAmount) || targetAmount <= 0) {
      return 0;
    }
    
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
      month: 'long',
      year: 'numeric',
    });
  };

  const getGoalColor = (index: number) => {
    const colors = [COLORS.primary, '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];
    return colors[index % colors.length];
  };

  const renderGoalCard = (goal: Goal, index: number) => {
    const progress = getProgressPercentage(
      goal.currentAmount,
      goal.targetAmount,
    );
    const color = getGoalColor(index);

    return (
      <View key={goal.id} style={styles.goalCard}>
        <View style={[styles.goalColorBar, { backgroundColor: color }]} />

        <View style={styles.goalContent}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>{goal.title}</Text>
            <TouchableOpacity
              onPress={() => handleEditGoal(goal)}
              style={styles.optionsButton}
            >
              <Text style={styles.optionsText}>⋮</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.goalDeadline}>
            До {formatDate(goal.targetDate)}
          </Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%`, backgroundColor: color },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.currentAmount}>
              {formatAmount(goal.currentAmount)} ₸
            </Text>
            <Text style={styles.targetAmount}>
              из {formatAmount(goal.targetAmount)} ₸
            </Text>
          </View>

          <View style={styles.goalActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.addMoneyButton]}
              onPress={() => handleAddMoney(goal)}
            >
              <Text style={styles.actionButtonText}>💰 Добавить</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteGoal(goal.id)}
            >
              <Text style={styles.actionButtonText}>🗑️ Удалить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <Layout
        headerTitle="Финансовые цели"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Загрузка целей...</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout
      headerTitle="Финансовые цели"
      showBackButton={true}
      onBackPress={() => navigation.goBack()}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>🎯</Text>
            </View>
            <Text style={styles.headerTitle}>Финансовые цели</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleCreateGoal}>
            <Text style={styles.addButtonText}>+ Добавить</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.goalsList}
          showsVerticalScrollIndicator={false}
        >
          {goals.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🎯</Text>
              <Text style={styles.emptyStateTitle}>Нет финансовых целей</Text>
              <Text style={styles.emptyStateText}>
                Создайте свою первую финансовую цель
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={handleCreateGoal}
              >
                <Text style={styles.emptyStateButtonText}>Создать цель</Text>
              </TouchableOpacity>
            </View>
          ) : (
            goals.map(renderGoalCard)
          )}
        </ScrollView>
      </View>

      <GoalModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveGoal}
        editingGoal={editingGoal}
      />

      <AddMoneyModal
        visible={addMoneyModalVisible}
        onClose={() => setAddMoneyModalVisible(false)}
        onAddMoney={handleAddMoneyToGoal}
        goalTitle={selectedGoal?.title || ''}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  headerIconText: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  goalsList: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  goalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalColorBar: {
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  goalContent: {
    flex: 1,
    padding: SPACING.md,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  goalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  optionsButton: {
    padding: SPACING.sm,
  },
  optionsText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  goalDeadline: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.text,
    minWidth: 40,
    textAlign: 'right',
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentAmount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  targetAmount: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  emptyStateButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 25,
  },
  emptyStateButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  modalContent: {
    padding: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputHint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.border,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  goalActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  addMoneyButton: {
    backgroundColor: COLORS.success,
  },
  deleteButton: {
    backgroundColor: COLORS.danger,
  },
  actionButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  goalTitleText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  
  // AddMoneyModal styles
  addMoneyModalContainer: {
    width: '95%',
    maxWidth: 400,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  addMoneyModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.primary + '10',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  addMoneyModalIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  addMoneyModalIcon: {
    fontSize: 24,
  },
  addMoneyModalTitleContainer: {
    flex: 1,
  },
  addMoneyModalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  addMoneyModalSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  addMoneyCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMoneyCloseButtonText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  addMoneyModalContent: {
    padding: SPACING.xl,
  },
  quickAmountsContainer: {
    marginBottom: SPACING.xl,
  },
  quickAmountsTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  quickAmountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  quickAmountButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  quickAmountButtonActive: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  quickAmountText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  quickAmountTextActive: {
    color: COLORS.primary,
  },
  addMoneyInputContainer: {
    marginBottom: SPACING.xl,
  },
  addMoneyInputLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  addMoneyInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  addMoneyInput: {
    flex: 1,
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  addMoneyCurrency: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  goalInfoContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  goalInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  goalInfoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  goalInfoValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '600',
  },
  addMoneyModalFooter: {
    flexDirection: 'row',
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.md,
  },
  addMoneyCancelButton: {
    flex: 1,
    backgroundColor: COLORS.border,
    paddingVertical: SPACING.md,
    borderRadius: 16,
    alignItems: 'center',
  },
  addMoneyCancelButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  addMoneyConfirmButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addMoneyConfirmButtonDisabled: {
    backgroundColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  addMoneyConfirmButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});

export default GoalsScreen;
