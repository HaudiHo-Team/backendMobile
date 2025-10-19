import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { ScreenProps } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import {
  AnimatedButton,
  AnimatedCard,
  Title,
  Layout,
  GoalsBlock,
} from '../ui/components';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../contexts/LanguageContext';

const HomeScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const { t, language, setLanguage } = useLanguage();

  const handleNavigateToProfile = () => {
    navigation.navigate('Profile');
  };

  const toggleLanguage = () => {
    const languages: Language[] = ['ru', 'kz', 'en'];
    const currentIndex = languages.indexOf(language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex]);
  };

  const handleTransfer = () => {
    console.log('Перевод');
  };

  const handlePay = () => {
    console.log('Оплата');
  };

  const handleDeposit = () => {
    console.log('Пополнение');
  };

  const handleHistory = () => {
    navigation.navigate('Operations' as never);
  };

  const handleSupportChat = () => {
    navigation.navigate('Chat' as never);
  };

  const handleGoals = () => {
    navigation.navigate('Goals' as never);
  };

  const handleBalancePress = () => {
    console.log('Показать детали баланса');
  };

  const handleTransactionPress = (transactionId: string) => {
    console.log('Детали транзакции:', transactionId);
  };

  const handleCardPress = () => {
    console.log('Детали карты');
  };

  const handleSeeAllTransactions = () => {
    navigation.navigate('Operations' as never);
  };

  const handleUserNamePress = () => {
    console.log('Нажато имя пользователя');
  };

  const handleMainAccountPress = () => {
    console.log('Нажато на основной счет');
  };

  const handleSavingsPress = () => {
    console.log('Нажато на сберегательный счет');
  };

  const handleQuickActionsTitlePress = () => {
    console.log('Нажато на заголовок быстрых действий');
  };

  const handleRecentTransactionsTitlePress = () => {
    console.log('Нажато на заголовок последних транзакций');
  };

  const handleMyCardsTitlePress = () => {
    console.log('Нажато на заголовок моих карт');
  };

  const handleWelcomePress = () => {
    console.log('Нажато на приветствие');
  };

  const handleTotalBalancePress = () => {
    console.log('Нажато на общий баланс');
  };

  return (
    <Layout headerTitle="Мой банк" showFooter={false}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.greetingSection}>
          <View style={styles.greetingHeader}>
            <TouchableOpacity onPress={handleWelcomePress}>
              <Text style={styles.greeting}>{t('welcome')}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleUserNamePress}>
            <Text style={styles.userName}>Тимур Есмагамбетов</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleBalancePress}>
          <AnimatedCard
            animationType="slide"
            delay={100}
            style={styles.balanceCard}
          >
            <View style={styles.balanceHeader}>
              <TouchableOpacity onPress={handleTotalBalancePress}>
                <Text style={styles.balanceLabel}>{t('totalBalance')}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleTotalBalancePress}>
              <Text style={styles.balanceAmount}>₸ 1,234,567.89</Text>
            </TouchableOpacity>
            <View style={styles.balanceDetails}>
              <TouchableOpacity
                style={styles.balanceItem}
                onPress={handleMainAccountPress}
              >
                <Text style={styles.balanceItemLabel}>{t('mainAccount')}</Text>
                <Text style={styles.balanceItemAmount}>₸ 987,654.32</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.balanceItem}
                onPress={handleSavingsPress}
              >
                <Text style={styles.balanceItemLabel}>{t('savings')}</Text>
                <Text style={styles.balanceItemAmount}>₸ 246,913.57</Text>
              </TouchableOpacity>
            </View>
          </AnimatedCard>
        </TouchableOpacity>

        <AnimatedCard
          animationType="slide"
          delay={300}
          style={styles.transactionsCard}
        >
          <View style={styles.transactionsHeader}>
            <TouchableOpacity onPress={handleRecentTransactionsTitlePress}>
              <Text style={styles.sectionTitle}>{t('recentTransactions')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSeeAllTransactions}>
              <Text style={styles.seeAllText}>{t('all')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.transactionList}>
            <TouchableOpacity
              style={styles.transactionItem}
              onPress={() => handleTransactionPress('1')}
            >
              <View style={styles.transactionIcon}>
                <Text style={styles.transactionEmoji}>🛒</Text>
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionTitle}>{t('purchase')}</Text>
                <Text style={styles.transactionDate}>{t('today')}, 14:30</Text>
              </View>
              <Text style={styles.transactionAmount}>-₸ 1,250.00</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.transactionItem}
              onPress={() => handleTransactionPress('2')}
            >
              <View style={styles.transactionIcon}>
                <Text style={styles.transactionEmoji}>💸</Text>
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionTitle}>
                  {t('transferFromFriend')}
                </Text>
                <Text style={styles.transactionDate}>
                  {t('yesterday')}, 18:45
                </Text>
              </View>
              <Text
                style={[styles.transactionAmount, { color: COLORS.success }]}
              >
                +₸ 5,000.00
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.transactionItem}
              onPress={() => handleTransactionPress('3')}
            >
              <View style={styles.transactionIcon}>
                <Text style={styles.transactionEmoji}>🏠</Text>
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionTitle}>
                  {t('utilityPayment')}
                </Text>
                <Text style={styles.transactionDate}>2 {t('daysAgo')}</Text>
              </View>
              <Text style={styles.transactionAmount}>-₸ 8,500.00</Text>
            </TouchableOpacity>
          </View>
        </AnimatedCard>

        <AnimatedCard
          animationType="scale"
          delay={400}
          style={styles.cardsSection}
        >
          <TouchableOpacity onPress={handleMyCardsTitlePress}>
            <Text style={styles.sectionTitle}>{t('myCards')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cardItem} onPress={handleCardPress}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{t('mainCard')}</Text>
              <Text style={styles.cardNumber}>**** 1234</Text>
            </View>
            <View style={styles.cardBalance}>
              <Text style={styles.cardBalanceAmount}>₸ 987,654.32</Text>
            </View>
          </TouchableOpacity>
        </AnimatedCard>

        {/* Финансовые цели */}
        <GoalsBlock onNavigateToGoals={handleGoals} />

      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  greetingSection: {
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  greetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  languageButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
  },
  languageText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
  },
  greeting: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  userName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  balanceCard: {
    margin: SPACING.lg,
    marginTop: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: SPACING.lg,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  balanceLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    opacity: 0.9,
  },
  eyeButton: {
    padding: SPACING.xs,
  },
  eyeIcon: {
    fontSize: FONT_SIZES.lg,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.lg,
  },
  balanceDetails: {
    gap: SPACING.sm,
  },
  balanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceItemLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    opacity: 0.8,
  },
  balanceItemAmount: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.white,
  },
  quickActionsCard: {
    margin: SPACING.lg,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionEmoji: {
    fontSize: 24,
  },
  quickActionLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
  },
  transactionsCard: {
    margin: SPACING.lg,
    marginTop: 0,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  seeAllText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  transactionList: {
    gap: SPACING.md,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  transactionEmoji: {
    fontSize: 18,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  transactionAmount: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.danger,
  },
  cardsSection: {
    margin: SPACING.lg,
    marginTop: 0,
  },
  cardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardNumber: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  cardBalance: {
    alignItems: 'flex-end',
  },
  cardBalanceAmount: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  profileButton: {
    margin: SPACING.lg,
    marginTop: 0,
  },
});

export default HomeScreen;
