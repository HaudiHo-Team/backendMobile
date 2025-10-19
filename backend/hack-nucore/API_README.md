# HackNU Bank Backend API

Полноценный бэкенд для банковского мобильного приложения, построенный на NestJS с использованием TypeORM и SQLite.

## 🚀 Возможности

- **Аутентификация**: Регистрация, вход, JWT токены
- **Пользователи**: Управление профилем пользователя
- **Счета**: Основные и сберегательные счета с балансами
- **Транзакции**: История операций, фильтрация, категоризация
- **Карты**: Управление банковскими картами
- **Аналитика**: Финансовая статистика и отчеты

## 📋 API Endpoints

### Аутентификация (`/auth`)

- `POST /auth/register` - Регистрация нового пользователя
- `POST /auth/login` - Вход в систему

### Пользователи (`/user`)

- `GET /user/profile` - Получить профиль пользователя
- `PUT /user/profile` - Обновить профиль пользователя

### Счета (`/accounts`)

- `GET /accounts` - Получить все счета пользователя
- `GET /accounts/balance` - Получить общий баланс
- `GET /accounts/:id` - Получить конкретный счет
- `GET /accounts/:id/balance` - Получить баланс конкретного счета

### Транзакции (`/transactions`)

- `POST /transactions` - Создать новую транзакцию
- `GET /transactions` - Получить список транзакций с фильтрами
- `GET /transactions/recent` - Получить последние транзакции
- `GET /transactions/stats` - Получить статистику транзакций
- `GET /transactions/:id` - Получить конкретную транзакцию

### Карты (`/cards`)

- `POST /cards` - Создать новую карту
- `GET /cards` - Получить все карты пользователя
- `GET /cards/:id` - Получить конкретную карту
- `PATCH /cards/:id/activate` - Активировать карту
- `PATCH /cards/:id/block` - Заблокировать карту
- `PATCH /cards/:id/default` - Установить карту по умолчанию

### Аналитика (`/analytics`)

- `GET /analytics/overview` - Общий финансовый обзор
- `GET /analytics/categories` - Анализ по категориям расходов
- `GET /analytics/trends` - Месячные тренды
- `GET /analytics/top-transactions` - Топ транзакций

## 🛠 Технологии

- **NestJS** - Node.js фреймворк
- **TypeORM** - ORM для работы с базой данных
- **SQLite** - База данных
- **JWT** - Аутентификация
- **bcryptjs** - Хеширование паролей
- **class-validator** - Валидация данных
- **class-transformer** - Трансформация данных

## 📦 Установка и запуск

1. Установите зависимости:
```bash
npm install
```

2. Создайте файл `.env` (скопируйте из `.env.example`):
```bash
DB_DATABASE=hacknu.db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3000
```

3. Запустите в режиме разработки:
```bash
npm run start:dev
```

4. Соберите для продакшена:
```bash
npm run build
npm run start:prod
```

## 🗄 Структура базы данных

### Пользователи (users)
- `id` - UUID
- `name` - Имя пользователя
- `email` - Email (уникальный)
- `password` - Хешированный пароль
- `phone` - Телефон
- `avatar` - Аватар
- `isActive` - Активен ли аккаунт
- `isEmailVerified` - Подтвержден ли email
- `isPhoneVerified` - Подтвержден ли телефон

### Счета (accounts)
- `id` - UUID
- `accountNumber` - Номер счета
- `type` - Тип счета (main, savings, business)
- `balance` - Баланс
- `availableBalance` - Доступный баланс
- `isActive` - Активен ли счет
- `currency` - Валюта
- `userId` - ID пользователя

### Транзакции (transactions)
- `id` - UUID
- `type` - Тип транзакции (transfer, payment, deposit, etc.)
- `status` - Статус (pending, completed, failed, cancelled)
- `category` - Категория (food, transport, entertainment, etc.)
- `amount` - Сумма
- `fee` - Комиссия
- `description` - Описание
- `recipientName` - Имя получателя
- `recipientAccount` - Счет получателя
- `reference` - Референс
- `accountId` - ID счета

### Карты (cards)
- `id` - UUID
- `cardNumber` - Номер карты
- `maskedNumber` - Замаскированный номер
- `type` - Тип карты (debit, credit, prepaid)
- `status` - Статус (active, blocked, expired, pending)
- `holderName` - Имя держателя
- `expiryDate` - Дата истечения
- `cvv` - CVV код
- `isDefault` - Карта по умолчанию
- `bankName` - Название банка
- `cardDesign` - Дизайн карты
- `userId` - ID пользователя

## 🔐 Безопасность

- Пароли хешируются с помощью bcryptjs
- JWT токены для аутентификации
- Валидация всех входящих данных
- Защита от SQL инъекций через TypeORM
- CORS настроен для фронтенда

## 📝 Примеры использования

### Регистрация пользователя
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Тимур Есмагамбетов",
    "email": "timur@example.com",
    "password": "password123",
    "phone": "+7 777 123 4567"
  }'
```

### Вход в систему
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "timur@example.com",
    "password": "password123"
  }'
```

### Получение баланса
```bash
curl -X GET http://localhost:3000/accounts/balance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Создание транзакции
```bash
curl -X POST http://localhost:3000/transactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "amount": 1500.00,
    "description": "Покупка в магазине",
    "category": "shopping",
    "accountId": "ACCOUNT_UUID"
  }'
```

## 🚀 Развертывание

Для продакшена рекомендуется:

1. Изменить `JWT_SECRET` на сложный ключ
2. Установить `synchronize: false` в конфигурации TypeORM
3. Настроить миграции базы данных
4. Использовать PostgreSQL вместо SQLite
5. Настроить логирование
6. Добавить мониторинг и метрики


MIT License
