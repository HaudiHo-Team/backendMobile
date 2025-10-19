# HackNU Bank API

Бэкенд для банковского приложения HackNU, построенный на NestJS.

## Возможности

- 🏦 Управление пользователями
- 💳 Управление банковскими счетами
- 💰 Управление транзакциями
- 🎴 Управление банковскими картами
- 📊 Статистика операций
- 📚 Swagger документация

## Установка

### Предварительные требования
- Node.js 18+
- PostgreSQL 12+

### Быстрый старт с Docker

1. Запустите PostgreSQL с помощью Docker Compose:
```bash
docker-compose up -d postgres
```

2. Установите зависимости:
```bash
npm install
```

3. Настройте переменные окружения (создайте файл .env):
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=hacknu_user
DB_PASSWORD=hacknu_password
DB_DATABASE=hacknu_db
NODE_ENV=development
PORT=3000
```

4. Запустите сервер:
```bash
npm run start:dev
```

5. Опционально: запустите Adminer для управления базой данных:
```bash
docker-compose up -d adminer
```
Adminer будет доступен по адресу: http://localhost:8080

### Ручная установка PostgreSQL

1. Установите PostgreSQL
2. Создайте базу данных:
```sql
CREATE DATABASE hacknu_db;
CREATE USER hacknu_user WITH PASSWORD 'hacknu_password';
GRANT ALL PRIVILEGES ON DATABASE hacknu_db TO hacknu_user;
```

3. Установите зависимости:
```bash
npm install
```

4. Настройте переменные окружения (создайте файл .env):
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=hacknu_user
DB_PASSWORD=hacknu_password
DB_DATABASE=hacknu_db
NODE_ENV=development
PORT=3000
```

5. Запустите сервер в режиме разработки:
```bash
npm run start:dev
```

6. Сервер будет доступен по адресу: `http://localhost:3000`

## Инициализация тестовых данных

Для создания тестовых данных выполните POST запрос:
```bash
curl -X POST http://localhost:3000/seed
```

Это создаст:
- Тестового пользователя (Тимур Есмагамбетов)
- Банковский счет с балансом
- Банковскую карту
- Несколько тестовых транзакций

## API Эндпоинты

### Пользователи
- `GET /users` - Получить всех пользователей
- `GET /users/:id` - Получить пользователя по ID
- `GET /users/email/:email` - Получить пользователя по email
- `POST /users` - Создать пользователя
- `PATCH /users/:id` - Обновить пользователя
- `DELETE /users/:id` - Удалить пользователя

### Аккаунты
- `GET /accounts` - Получить все аккаунты
- `GET /accounts/user/:userId` - Получить аккаунты пользователя
- `GET /accounts/:id` - Получить аккаунт по ID
- `POST /accounts` - Создать аккаунт
- `PATCH /accounts/:id` - Обновить аккаунт
- `DELETE /accounts/:id` - Удалить аккаунт

### Транзакции
- `GET /transactions` - Получить транзакции с фильтрацией
- `GET /transactions/stats/:userId` - Получить статистику транзакций
- `GET /transactions/:id` - Получить транзакцию по ID
- `POST /transactions` - Создать транзакцию
- `PATCH /transactions/:id` - Обновить транзакцию
- `DELETE /transactions/:id` - Удалить транзакцию

### Карты
- `GET /cards` - Получить все карты
- `GET /cards/user/:userId` - Получить карты пользователя
- `GET /cards/:id` - Получить карту по ID
- `POST /cards` - Создать карту
- `PATCH /cards/:id` - Обновить карту
- `DELETE /cards/:id` - Удалить карту

## Примеры запросов

### Создание пользователя
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "Иван Иванов"
  }'
```

### Получение транзакций пользователя
```bash
curl "http://localhost:3000/transactions?userId=USER_ID&limit=10&offset=0"
```

### Создание транзакции
```bash
curl -X POST http://localhost:3000/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "accountId": "ACCOUNT_ID",
    "type": "transfer",
    "amount": -1000,
    "description": "Перевод другу"
  }'
```

## База данных

Приложение использует PostgreSQL базу данных. Таблицы создаются автоматически при первом запуске благодаря `synchronize: true` в режиме разработки.

## Технологии

- **NestJS** - Node.js фреймворк
- **TypeORM** - ORM для работы с базой данных
- **PostgreSQL** - Реляционная база данных
- **Class Validator** - Валидация данных
- **CORS** - Настройка кросс-доменных запросов