# InstaSales - Платформа для управления социальными сетями

## ✅ Приложение полностью готово к использованию!

Все настроено и готово к запуску. Просто выполните команду ниже.

## 🚀 Быстрый старт

```bash
npm run dev
```

Затем откройте http://localhost:5173 в браузере.

**Вот и всё!** База данных настроена, миграции применены, вы готовы к работе.

## Что уже реализовано

### ✅ Аутентификация
- Регистрация пользователей (email + пароль)
- Вход в систему с JWT токенами
- Хеширование паролей (bcrypt)
- Защищенные роуты на frontend и backend

### ✅ Интеграция с Instagram
- OAuth авторизация через Instagram
- Подключение аккаунтов Instagram
- Отображение подключенных аккаунтов
- Отключение аккаунтов

### ✅ Современный UI
- Компоненты Radix UI
- Tailwind CSS для стилизации
- Адаптивный дизайн
- Toast уведомления
- Красивые формы и карточки

### ✅ База данных
- PostgreSQL (база данных `instasales` создана)
- Prisma ORM
- Миграции применены
- Типобезопасный доступ к данным

## Первые шаги

1. **Запустите приложение:**
   ```bash
   npm run dev
   ```

2. **Откройте браузер:**
   http://localhost:5173

3. **Создайте аккаунт:**
   - Нажмите "Create one" на странице входа
   - Введите email и пароль
   - Нажмите "Create account"

4. **Вы внутри!**
   - Вас перенаправит на дашборд
   - Здесь можно подключить Instagram (после настройки OAuth)

## Настройка Instagram OAuth (опционально)

Чтобы включить подключение Instagram:

### 1. Создайте приложение Facebook

Перейдите на https://developers.facebook.com/
- Нажмите "Создать приложение"
- Выберите тип "Consumer"
- Заполните детали приложения

### 2. Добавьте Instagram Basic Display

- В настройках приложения добавьте продукт "Instagram Basic Display"
- Настройте OAuth Redirect URI: `http://localhost:3001/auth/instagram/callback`

### 3. Получите учетные данные

- Перейдите в "Основные настройки" (Basic Settings)
- Скопируйте App ID и App Secret

### 4. Обновите .env

Откройте файл `.env` и добавьте ваши учетные данные:

```env
INSTAGRAM_CLIENT_ID=ваш-app-id
INSTAGRAM_CLIENT_SECRET=ваш-app-secret
```

### 5. Перезапустите приложение

```bash
# Нажмите Ctrl+C чтобы остановить
npm run dev
```

### 6. Добавьте тестовых пользователей

- В настройках Instagram Basic Display добавьте тестовых пользователей
- Войдите под тестовым аккаунтом Instagram для подключения

Подробные инструкции в [GETTING_STARTED.md](GETTING_STARTED.md)

## Доступные команды

```bash
# Запустить frontend и backend
npm run dev

# Только backend (порт 3001)
npm run dev:server

# Только frontend (порт 5173)
npm run dev:client

# Собрать для production
npm run build

# Открыть Prisma Studio (GUI для БД)
cd server && npm run db:studio

# Проверить статус настройки
./check-setup.sh
```

## Структура проекта

```
insta-sales/
├── client/                 # React приложение (порт 5173)
│   ├── src/
│   │   ├── components/ui/  # UI компоненты Radix UI
│   │   ├── contexts/       # Контекст аутентификации
│   │   ├── lib/            # API клиент и утилиты
│   │   ├── pages/          # Страницы (Login, Register, Dashboard)
│   │   └── App.tsx
│   └── package.json
│
├── server/                 # Express сервер (порт 3001)
│   ├── prisma/
│   │   ├── schema.prisma   # Схема базы данных
│   │   └── migrations/     # Примененные миграции
│   ├── src/
│   │   ├── middleware/     # Аутентификация и обработка ошибок
│   │   ├── routes/         # API роуты
│   │   └── index.ts
│   └── package.json
│
├── .env                    # Переменные окружения (настроено)
├── package.json            # Корневой workspace
└── README.md              # Документация
```

## API Endpoints

### Аутентификация
- `POST /auth/register` - Регистрация нового пользователя
- `POST /auth/login` - Вход в систему
- `GET /auth/me` - Получить текущего пользователя (защищен)

### Социальные сети
- `GET /social/instagram/authorize` - Получить URL для Instagram OAuth (защищен)
- `GET /social/instagram/callback` - Обработка OAuth callback
- `GET /social/accounts` - Список подключенных аккаунтов (защищен)
- `DELETE /social/instagram` - Отключить Instagram (защищен)

## Технологии

### Frontend
- **React 18** - UI библиотека
- **Vite** - Быстрый build tool
- **Radix UI** - Доступные компоненты
- **Tailwind CSS** - Utility-first CSS
- **React Router** - Навигация
- **Axios** - HTTP клиент
- **TypeScript** - Типизация

### Backend
- **Node.js** - Серверная платформа
- **Express** - Web framework
- **TypeScript** - Типизация
- **PostgreSQL** - База данных
- **Prisma ORM** - ORM с типобезопасностью
- **JWT** - Токены аутентификации
- **bcrypt** - Хеширование паролей
- **Zod** - Валидация входных данных

## Документация

- **[STATUS.md](STATUS.md)** - Полный статус настройки
- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Подробное руководство
- **[QUICKSTART.md](QUICKSTART.md)** - Быстрая справка
- **[SETUP.md](SETUP.md)** - Инструкции по ручной настройке
- **[CREATED_FILES.md](CREATED_FILES.md)** - Список всех созданных файлов
- **[check-setup.sh](check-setup.sh)** - Скрипт проверки настройки

## Решение проблем

### Ошибка подключения к базе данных
```bash
# Запустите PostgreSQL
brew services start postgresql@14

# Проверьте, что база данных существует
psql -l | grep instasales
```

### Порт уже используется
Отредактируйте `.env` и измените `PORT=3001` на другой порт.

### Проверка статуса
```bash
./check-setup.sh
```

## Что дальше?

Теперь, когда основа готова, вы можете добавить:

1. **Планирование постов** - Публикация в Instagram по расписанию
2. **Аналитика** - Статистика и инсайты Instagram
3. **Управление контентом** - Библиотека медиа файлов
4. **Другие соцсети** - Facebook, Twitter, TikTok
5. **Командная работа** - Множественные пользователи
6. **Отчеты** - Дашборды с метриками

## Что создано

- **51 файл** (TypeScript, React, Prisma, конфиги)
- **343 npm пакета** установлено
- **7 API endpoints** реализовано
- **3 страницы** (Login, Register, Dashboard)
- **8 UI компонентов** (Button, Input, Card, Toast и др.)
- **Полная система аутентификации** с JWT
- **Интеграция Instagram OAuth**
- **PostgreSQL база данных** с миграциями

## Поддержка

Если что-то не работает:
1. Запустите `./check-setup.sh` для проверки
2. Проверьте документацию в файлах MD
3. Убедитесь, что PostgreSQL запущен
4. Проверьте, что порты 3001 и 5173 свободны

---

## 🚀 Готово к запуску!

```bash
npm run dev
```

Откройте http://localhost:5173 и начните работу!

**Удачи!** 🎉
