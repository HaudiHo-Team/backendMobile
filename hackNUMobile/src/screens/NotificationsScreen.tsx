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

const NotificationsScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Zaman bank',
      message: 'Ваш платеж успешно обработан',
      time: '18 октября',
      isRead: false,
      icon: '🏦'
    },
    {
      id: '2',
      title: 'Система безопасности',
      message: 'Вход в приложение с нового устройства',
      time: '17 октября',
      isRead: false,
      icon: '🔒'
    },
    {
      id: '3',
      title: 'Обновление приложения',
      message: 'Доступна новая версия приложения',
      time: '16 октября',
      isRead: true,
      icon: '📱'
    },
    {
      id: '4',
      title: 'Пополнение счета',
      message: 'На ваш счет поступило 50 000 ₸',
      time: '15 октября',
      isRead: true,
      icon: '💰'
    },
    {
      id: '5',
      title: 'Напоминание',
      message: 'Не забудьте оплатить коммунальные услуги',
      time: '14 октября',
      isRead: true,
      icon: '⏰'
    }
  ]);

  const handleNotificationPress = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
    console.log('Нажато уведомление:', notificationId);
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    console.log('Все уведомления отмечены как прочитанные');
  };

  const handleSettingsPress = () => {
    console.log('Настройки уведомлений');
  };

  const handleShowAllPress = () => {
    console.log('Показать все уведомления');
  };

  const renderNotification = (notification: any) => (
    <TouchableOpacity key={notification.id} style={styles.notificationItem} onPress={() => handleNotificationPress(notification.id)}>
      <View style={styles.notificationIcon}>
        <Text style={styles.iconText}>{notification.icon}</Text>
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          {!notification.isRead && <View style={styles.unreadDot} />}
        </View>
        <Text style={[
          styles.notificationMessage,
          !notification.isRead && styles.unreadMessage
        ]}>
          {notification.message}
        </Text>
        <Text style={styles.notificationTime}>{notification.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Layout 
      headerTitle="Уведомления" 
      showBackButton={true}
      onBackPress={() => navigation.goBack()}
    >
      <ScrollView style={styles.container}>
        {/* Статистика */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Непрочитанных</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Всего</Text>
          </View>
        </View>

        {/* Действия */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleMarkAllRead}>
            <Text style={styles.actionText}>Отметить все как прочитанные</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleSettingsPress}>
            <Text style={styles.actionText}>Настройки уведомлений</Text>
          </TouchableOpacity>
        </View>

        {/* Список уведомлений */}
        <View style={styles.notificationsList}>
          {notifications.map(renderNotification)}
        </View>

        {/* Кнопка "Показать все" */}
        <TouchableOpacity style={styles.showAllButton} onPress={handleShowAllPress}>
          <Text style={styles.showAllText}>Показать все уведомления</Text>
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
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  notificationsList: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    borderRadius: 12,
    overflow: 'hidden',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  notificationIcon: {
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
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: 'bold',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  notificationMessage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  unreadMessage: {
    color: COLORS.text,
    fontWeight: '500',
  },
  notificationTime: {
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

export default NotificationsScreen;
