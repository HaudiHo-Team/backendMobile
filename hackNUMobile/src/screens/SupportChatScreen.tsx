import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { ScreenProps } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { Layout, VoiceRecorder } from '../ui/components';
import { useLanguage } from '../contexts/LanguageContext';
import {
  chatAPI,
  aiAPI,
  Chat,
  ChatMessage,
  AIConversationMessage,
  AIMessageDto,
} from '../services/ApiService';
import { socketService } from '../services/SocketService';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

const SupportChatScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const { t } = useLanguage();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [messages, setMessages] = useState<AIConversationMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  };

  const loadBotConversation = useCallback(async () => {
    try {
      console.log('Загружаем историю разговора с ботом...');
      const botHistory = await aiAPI.getConversationHistory(50);
      setMessages(botHistory);
    } catch (error) {
      console.error('Ошибка загрузки истории бота:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    if (isAuthenticated && !authLoading) {
      loadBotConversation();
    }
  }, [isAuthenticated, authLoading, fadeAnim, slideAnim, loadBotConversation]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 200);
    }
  }, [messages]);

  useEffect(() => {
    setTimeout(() => {
      scrollToBottom();
    }, 1000);
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messageText = newMessage.trim();

      const userMessage: AIConversationMessage = {
        id: Date.now().toString(),
        userId: user?.id || '',
        message: messageText,
        messageType: 'text',
        role: 'user',
        createdAt: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage]);
      setNewMessage('');
      setIsBotTyping(true);

      const botResponse = await aiAPI.sendMessage({
        message: messageText,
        messageType: 'text',
      });

      const botMessage: AIConversationMessage = {
        id: (Date.now() + 1).toString(),
        userId: 'ai-bot',
        message: botResponse.message,
        messageType: 'text',
        role: 'assistant',
        createdAt: new Date().toISOString(),
      };

      setMessages(prev => [...prev, botMessage]);
      setIsBotTyping(false);
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      Alert.alert('Ошибка', 'Не удалось отправить сообщение');
      setIsBotTyping(false);
    }
  };

  const handleQuickReply = async (replyText: string) => {
    try {
      const messageText = replyText.trim();

      const userMessage: AIConversationMessage = {
        id: Date.now().toString(),
        userId: user?.id || '',
        message: messageText,
        messageType: 'text',
        role: 'user',
        createdAt: new Date().toISOString(),
      };

      setMessages(prev => [...prev, userMessage]);
      setIsBotTyping(true);

      const botResponse = await aiAPI.sendMessage({
        message: messageText,
        messageType: 'text',
      });

      const botMessage: AIConversationMessage = {
        id: (Date.now() + 1).toString(),
        userId: 'ai-bot',
        message: botResponse.message,
        messageType: 'text',
        role: 'assistant',
        createdAt: new Date().toISOString(),
      };

      setMessages(prev => [...prev, botMessage]);
      setIsBotTyping(false);
    } catch (error) {
      console.error('Ошибка отправки быстрого ответа:', error);
      Alert.alert('Ошибка', 'Не удалось отправить сообщение');
      setIsBotTyping(false);
    }
  };

  const handleMicPress = () => {
    setShowVoiceRecorder(true);
  };

  const handleVoiceRecordingComplete = async (audioUri: string) => {
    try {
      setNewMessage(`🎤 Голосовое сообщение: ${audioUri}`);
      setShowVoiceRecorder(false);
    } catch (error) {
      console.error('Ошибка отправки голосового сообщения:', error);
      Alert.alert('Ошибка', 'Не удалось отправить голосовое сообщение');
    }
  };

  const handleVoiceRecordingCancel = () => {
    setShowVoiceRecorder(false);
  };

  const handleAvatarPress = () => {
    console.log('Информация о поддержке');
  };

  const renderAIMessage = (msg: AIConversationMessage, _index: number) => {
    const isFromUser = msg.role === 'user';
    const timestamp = new Date(msg.createdAt).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <Animated.View
        key={msg.id}
        style={[
          styles.messageContainer,
          isFromUser ? styles.userMessage : styles.supportMessage,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 50],
                  outputRange: [0, 20],
                }),
              },
            ],
          },
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isFromUser ? styles.userBubble : styles.supportBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isFromUser ? styles.userText : styles.supportText,
            ]}
          >
            {msg.message}
          </Text>
          <Text
            style={[
              styles.timestamp,
              isFromUser ? styles.userTimestamp : styles.supportTimestamp,
            ]}
          >
            {timestamp}
          </Text>
        </View>
      </Animated.View>
    );
  };

  if (authLoading || isLoading) {
    return (
      <Layout
        headerTitle="Поддержка"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {authLoading ? 'Авторизация...' : 'Загрузка чата поддержки...'}
          </Text>
        </View>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout
        headerTitle="Поддержка"
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
      headerTitle={t('support')}
      showBackButton={true}
      onBackPress={() => navigation.goBack()}
      scrollable={false}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View
          style={[
            styles.chatHeader,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerGradient}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={handleAvatarPress}
            >
              <View style={styles.avatarGlow}>
                <Image
                  source={require('../assets/images/лого.png')}
                  style={styles.supportLogo}
                />
              </View>
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.supportName}>AI Помощник</Text>
              <View style={styles.statusContainer}>
                <View style={[styles.onlineDot, styles.aiDot]} />
                <Text style={styles.onlineStatus}>AI Активен</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollToBottom()}
        >
          {messages.map((msg, index) => renderAIMessage(msg, index))}
          {isBotTyping && (
            <Animated.View
              style={[
                styles.messageContainer,
                styles.supportMessage,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={[styles.messageBubble, styles.supportBubble]}>
                <Text style={[styles.messageText, styles.supportText]}>
                  Бот печатает...
                </Text>
              </View>
            </Animated.View>
          )}

          <Animated.View
            style={[
              styles.quickRepliesContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.quickRepliesTitle}>Частые вопросы</Text>
            <View style={styles.quickReplies}>
              <TouchableOpacity
                style={styles.quickReplyButton}
                onPress={() => handleQuickReply('Как выпустить карту?')}
              >
                <Text style={styles.quickReplyText}>Как выпустить карту?</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickReplyButton}
                onPress={() =>
                  handleQuickReply('Какие условия обслуживания карты?')
                }
              >
                <Text style={styles.quickReplyText}>
                  Условия обслуживания карты
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickReplyButton}
                onPress={() =>
                  handleQuickReply('Какие транзакционные лимиты по карте?')
                }
              >
                <Text style={styles.quickReplyText}>Транзакционные лимиты</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>

        <Animated.View
          style={[
            styles.inputContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder={t('message')}
              placeholderTextColor={COLORS.textSecondary}
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={500}
            />
            <TouchableOpacity style={styles.micButton} onPress={handleMicPress}>
              <Text style={styles.micIcon}>🎤</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sendButton,
                !newMessage.trim() && styles.sendButtonDisabled,
              ]}
              onPress={sendMessage}
              disabled={!newMessage.trim()}
            >
              <View style={styles.sendButtonInner}>
                <Text style={styles.sendIcon}>📤</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>

      {showVoiceRecorder && (
        <VoiceRecorder
          onRecordingComplete={handleVoiceRecordingComplete}
          onCancel={handleVoiceRecordingCancel}
        />
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  chatHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: SPACING.md,
    backgroundColor: 'transparent',
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginHorizontal: SPACING.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarContainer: {
    marginRight: SPACING.md,
  },
  avatarGlow: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  supportLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerInfo: {
    flex: 1,
  },
  supportName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  onlineStatus: {
    fontSize: FONT_SIZES.sm,
    color: '#4CAF50',
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 18,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  messagesContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
  },
  messageContainer: {
    marginBottom: SPACING.md,
  },
  supportMessage: {
    alignItems: 'flex-start',
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  supportBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 6,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  userBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 6,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
  },
  messageText: {
    fontSize: FONT_SIZES.md,
    lineHeight: 22,
    marginBottom: 4,
  },
  supportText: {
    color: '#2c3e50',
  },
  userText: {
    color: '#ffffff',
  },
  timestamp: {
    fontSize: FONT_SIZES.xs,
    opacity: 0.7,
    marginTop: 2,
  },
  supportTimestamp: {
    color: '#7f8c8d',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  quickRepliesContainer: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  quickRepliesTitle: {
    fontSize: FONT_SIZES.md,
    color: '#7f8c8d',
    marginBottom: SPACING.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  quickReplies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'center',
  },
  quickReplyButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#e1e8ed',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickReplyText: {
    fontSize: FONT_SIZES.sm,
    color: '#2c3e50',
    fontWeight: '500',
  },
  inputContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: 'transparent',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#ffffff',
    borderRadius: 25,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  textInput: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: '#2c3e50',
    maxHeight: 100,
    marginRight: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  micButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  micIcon: {
    fontSize: 20,
  },
  sendButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonInner: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendIcon: {
    fontSize: 20,
    color: '#ffffff',
  },
  voiceMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  playIcon: {
    fontSize: 16,
  },
  voiceMessageText: {
    fontSize: FONT_SIZES.md,
    fontStyle: 'italic',
  },
  aiDot: {
    backgroundColor: '#9C27B0',
  },
});

export default SupportChatScreen;
