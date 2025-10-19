import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'ru' | 'kz' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  ru: {
    welcome: 'Добро пожаловать!',
    totalBalance: 'Общий баланс',
    mainAccount: 'Основной счет',
    savings: 'Накопительный',
    quickActions: 'Быстрые действия',
    transfer: 'Перевод',
    payment: 'Оплата',
    deposit: 'Пополнить',
    history: 'История',
    recentTransactions: 'Последние операции',
    all: 'Все',
    myCards: 'Мои карты',
    mainCard: 'Основная карта',
    purchase: 'Покупка в магазине',
    transferFromFriend: 'Перевод от друга',
    utilityPayment: 'Оплата ЖКХ',
    today: 'Сегодня',
    yesterday: 'Вчера',
    daysAgo: 'дня назад',
    support: 'Поддержка',
    online: 'онлайн',
    hello: 'Здравствуйте',
    quickReplies: 'Быстрые ответы',
    message: 'Сообщение...',
    send: 'Отправить',
    back: 'Назад',
    supportMessage: 'Добро пожаловать! Чем могу помочь?',
    quickReply1: 'Проблема с переводом',
    quickReply2: 'Не приходят уведомления',
    quickReply3: 'Другое',
    messages: 'Сообщения',
    notifications: 'Уведомления',
    operations: 'Операции',
    support: 'Поддержка',
    supportSubtitle: 'Всегда готовы помочь',
    operationsSubtitle: 'Перевод на карту другого банка',
    notificationsSubtitle: 'Zaman bank',
  },
  kz: {
    welcome: 'Қош келдіңіз!',
    totalBalance: 'Жалпы баланс',
    mainAccount: 'Негізгі шот',
    savings: 'Жинақтау',
    quickActions: 'Жылдам әрекеттер',
    transfer: 'Аударым',
    payment: 'Төлем',
    deposit: 'Толтыру',
    history: 'Тарих',
    recentTransactions: 'Соңғы операциялар',
    all: 'Барлығы',
    myCards: 'Менің карталарым',
    mainCard: 'Негізгі карта',
    purchase: 'Дүкенде сатып алу',
    transferFromFriend: 'Досынан аударым',
    utilityPayment: 'Коммуналдық төлем',
    today: 'Бүгін',
    yesterday: 'Кеше',
    daysAgo: 'күн бұрын',
    support: 'Қолдау',
    online: 'онлайн',
    hello: 'Сәлеметсіз бе',
    quickReplies: 'Жылдам жауаптар',
    message: 'Хабарлама...',
    send: 'Жіберу',
    back: 'Артқа',
    supportMessage: 'Қош келдіңіз! Қалай көмектесе аламын?',
    quickReply1: 'Аударым мәселесі',
    quickReply2: 'Хабарландырулар келмейді',
    quickReply3: 'Басқа',
    messages: 'Хабарламалар',
    notifications: 'Хабарландырулар',
    operations: 'Операциялар',
    support: 'Қолдау',
    supportSubtitle: 'Әрқашан көмектесуге дайын',
    operationsSubtitle: 'Басқа банк картасына аударым',
    notificationsSubtitle: 'Zaman bank',
  },
  en: {
    welcome: 'Welcome!',
    totalBalance: 'Total Balance',
    mainAccount: 'Main Account',
    savings: 'Savings',
    quickActions: 'Quick Actions',
    transfer: 'Transfer',
    payment: 'Payment',
    deposit: 'Deposit',
    history: 'History',
    recentTransactions: 'Recent Transactions',
    all: 'All',
    myCards: 'My Cards',
    mainCard: 'Main Card',
    purchase: 'Store Purchase',
    transferFromFriend: 'Transfer from Friend',
    utilityPayment: 'Utility Payment',
    today: 'Today',
    yesterday: 'Yesterday',
    daysAgo: 'days ago',
    support: 'Support',
    online: 'online',
    hello: 'Hello',
    quickReplies: 'Quick Replies',
    message: 'Message...',
    send: 'Send',
    back: 'Back',
    supportMessage: 'Welcome! How can I help you?',
    quickReply1: 'Transfer issue',
    quickReply2: 'No notifications',
    quickReply3: 'Other',
    messages: 'Messages',
    notifications: 'Notifications',
    operations: 'Operations',
    support: 'Support',
    supportSubtitle: 'Always ready to help',
    operationsSubtitle: 'Transfer to another bank card',
    notificationsSubtitle: 'Zaman bank',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ru');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
