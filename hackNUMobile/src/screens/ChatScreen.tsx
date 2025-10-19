import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ScreenProps } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { Layout } from '../ui/components';
import { useLanguage } from '../contexts/LanguageContext';
import { chatAPI, ChatMessage, Chat } from '../services/ApiService';
import { socketService } from '../services/SocketService';
import { useAuth } from '../contexts/AuthContext';

const ChatScreen: React.FC<ScreenProps> = ({ navigation }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadChats();
    setupSocketListeners();

    return () => {
      socketService.off('new_message');
      socketService.off('user_typing');
      socketService.off('joined_chat');
      socketService.off('error');
    };
  }, []);

  useEffect(() => {
    if (currentChat) {
      loadMessages();
      socketService.joinChat(currentChat.id);
    }

    return () => {
      if (currentChat) {
        socketService.leaveChat(currentChat.id);
      }
    };
  }, [currentChat]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 200);
    }
  }, [messages]);

  const loadChats = async () => {
    try {
      const chatsData = await chatAPI.getChats();
      setChats(chatsData);

      // Если есть чаты, выбираем первый
      if (chatsData.length > 0) {
        setCurrentChat(chatsData[0]);
      } else {
        // Создаем чат поддержки
        const supportChat = await chatAPI.createSupportChat();
        setChats([supportChat]);
        setCurrentChat(supportChat);
      }
    } catch (error) {
      console.error('Ошибка загрузки чатов:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить чаты');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!currentChat) return;

    try {
      const messagesData = await chatAPI.getChatMessages(currentChat.id);
      setMessages(messagesData.reverse()); // Переворачиваем для правильного порядка

      // Автоматически прокручиваем вниз после загрузки сообщений
      setTimeout(() => {
        scrollToBottom();
      }, 500);
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить сообщения');
    }
  };

  const setupSocketListeners = () => {
    socketService.on('new_message', data => {
      if (data.chatId === currentChat?.id) {
        setMessages(prev => [...prev, data.message]);
      }
    });

    socketService.on('user_typing', data => {
      if (data.chatId === currentChat?.id) {
        if (data.isTyping) {
          setTypingUsers(prev => [
            ...prev.filter(id => id !== data.userId),
            data.userId,
          ]);
        } else {
          setTypingUsers(prev => prev.filter(id => id !== data.userId));
        }
      }
    });

    socketService.on('joined_chat', data => {
      console.log('Присоединились к чату:', data);
    });

    socketService.on('error', data => {
      console.error('Ошибка Socket.IO:', data.message);
      Alert.alert('Ошибка соединения', data.message);
    });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentChat) return;

    try {
      socketService.sendMessage({
        chatId: currentChat.id,
        type: 'text',
        content: newMessage.trim(),
      });

      setNewMessage('');
      setIsTyping(false);

      // Останавливаем индикатор печати
      socketService.typing(currentChat.id, false);
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      Alert.alert('Ошибка', 'Не удалось отправить сообщение');
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);

    if (!currentChat) return;

    // Управляем индикатором печати
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      socketService.typing(currentChat.id, true);
    } else if (!value.trim() && isTyping) {
      setIsTyping(false);
      socketService.typing(currentChat.id, false);
    }

    // Сбрасываем таймер
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Автоматически останавливаем индикатор печати через 3 секунды
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.typing(currentChat.id, false);
    }, 3000);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMessage = (message: ChatMessage) => {
    const isOwnMessage = message.userId === user?.id;
    const isSystemMessage = message.type === 'system';

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        {!isOwnMessage && !isSystemMessage && (
          <Text style={styles.senderName}>{message.user.name}</Text>
        )}
        <View
          style={[
            styles.messageBubble,
            isOwnMessage
              ? styles.ownMessageBubble
              : isSystemMessage
              ? styles.systemMessageBubble
              : styles.otherMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isOwnMessage
                ? styles.ownMessageText
                : isSystemMessage
                ? styles.systemMessageText
                : styles.otherMessageText,
            ]}
          >
            {message.content}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime,
            ]}
          >
            {formatTime(message.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <Layout
        headerTitle="Поддержка"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Загрузка чата...</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout
      headerTitle="Поддержка"
      showBackButton={true}
      onBackPress={() => navigation.goBack()}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Chat List */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chatList}
        >
          {chats.map(chat => (
            <TouchableOpacity
              key={chat.id}
              style={[
                styles.chatItem,
                currentChat?.id === chat.id && styles.activeChatItem,
              ]}
              onPress={() => setCurrentChat(chat)}
            >
              <Text
                style={[
                  styles.chatTitle,
                  currentChat?.id === chat.id && styles.activeChatTitle,
                ]}
              >
                {chat.title}
              </Text>
              <Text style={styles.chatType}>
                {chat.type === 'support' ? 'Поддержка' : 'Пользовательский чат'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollToBottom()}
        >
          {messages.map(renderMessage)}

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <View style={styles.typingContainer}>
              <View style={styles.typingBubble}>
                <Text style={styles.typingText}>
                  {typingUsers.length === 1
                    ? 'Печатает...'
                    : `${typingUsers.length} пользователя печатают...`}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={handleTyping}
            placeholder="Введите сообщение..."
            placeholderTextColor={COLORS.textSecondary}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !newMessage.trim() && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Text style={styles.sendButtonText}>Отправить</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  chatList: {
    maxHeight: 80,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  chatItem: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeChatItem: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chatTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
  },
  activeChatTitle: {
    color: COLORS.white,
  },
  chatType: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  messageContainer: {
    marginVertical: SPACING.xs,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 2,
    marginLeft: SPACING.sm,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 16,
  },
  ownMessageBubble: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 4,
  },
  systemMessageBubble: {
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    borderRadius: 8,
  },
  messageText: {
    fontSize: FONT_SIZES.md,
    lineHeight: 20,
  },
  ownMessageText: {
    color: COLORS.white,
  },
  otherMessageText: {
    color: COLORS.text,
  },
  systemMessageText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  messageTime: {
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  ownMessageTime: {
    color: COLORS.white,
    opacity: 0.7,
  },
  otherMessageTime: {
    color: COLORS.textSecondary,
  },
  typingContainer: {
    alignItems: 'flex-start',
    marginVertical: SPACING.xs,
  },
  typingBubble: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  typingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    maxHeight: 100,
    marginRight: SPACING.sm,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  sendButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
});

export default ChatScreen;
