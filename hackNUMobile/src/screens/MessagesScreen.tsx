import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { ScreenProps } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import {
  Layout,
  BotAvatarIcon,
  BellIcon,
  OperationsIcon,
} from '../ui/components';
import { useLanguage } from '../contexts/LanguageContext';
import { chatAPI, Chat } from '../services/ApiService';
import { useAuth } from '../contexts/AuthContext';

interface ChatItem {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
  icon?: React.ReactNode;
  imageSource?: any;
  type: 'support' | 'operations' | 'notifications';
}

const MessagesScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const { t } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadChats();
    }
  }, [isAuthenticated, authLoading]);

  const loadChats = async () => {
    try {
      console.log('Загружаем список чатов...');

      // Получаем существующие чаты
      const chatsData = await chatAPI.getChats();

      // Создаем список чатов с правильными данными
      const chatItems: ChatItem[] = [
        {
          id: 'support',
          title: 'Поддержка',
          subtitle: 'Всегда готовы помочь',
          timestamp: '14:52',
          imageSource: require('../assets/images/лого.png'),
          type: 'support',
        },
        {
          id: 'operations',
          title: 'Операции',
          subtitle: 'Перевод на карту другого бан..',
          timestamp: '19 октября',
          icon: <OperationsIcon size={24} color={COLORS.white} />,
          type: 'operations',
        },
        {
          id: 'notifications',
          title: 'Уведомления',
          subtitle: 'Zaman bank',
          timestamp: '18 октября',
          icon: <BellIcon size={24} color={COLORS.white} />,
          type: 'notifications',
        },
      ];

      setChats(chatItems);
    } catch (error) {
      console.error('Ошибка загрузки чатов:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить чаты');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatPress = (chat: ChatItem) => {
    switch (chat.type) {
      case 'support':
        navigation.navigate('Support' as any);
        break;
      case 'operations':
        navigation.navigate('Operations' as any);
        break;
      case 'notifications':
        navigation.navigate('Notifications' as any);
        break;
    }
  };

  const renderChatItem = (chat: ChatItem) => (
    <TouchableOpacity
      key={chat.id}
      style={styles.chatItem}
      onPress={() => handleChatPress(chat)}
    >
      <View style={styles.chatIcon}>
        {chat.imageSource ? (
          <Image source={chat.imageSource} style={styles.chatImage} />
        ) : (
          chat.icon
        )}
      </View>
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatTitle}>{chat.title}</Text>
          <Text style={styles.chatTimestamp}>{chat.timestamp}</Text>
        </View>
        <Text style={styles.chatSubtitle}>{chat.subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  // Показываем загрузку если еще авторизуемся или загружаем данные
  if (authLoading || isLoading) {
    return (
      <Layout
        headerTitle="Сообщения"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {authLoading ? 'Авторизация...' : 'Загрузка сообщений...'}
          </Text>
        </View>
      </Layout>
    );
  }

  // Если не авторизован, показываем ошибку
  if (!isAuthenticated) {
    return (
      <Layout
        headerTitle="Сообщения"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Ошибка авторизации</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout
      headerTitle="Сообщения"
      showBackButton={true}
      onBackPress={() => navigation.goBack()}
    >
      <ScrollView style={styles.container}>
        {chats.map(renderChatItem)}
      </ScrollView>
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
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  chatImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  chatTitle: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  chatTimestamp: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },
  chatSubtitle: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
  },
});

export default MessagesScreen;
