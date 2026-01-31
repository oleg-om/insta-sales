# 🚀 Быстрый старт

## Локальная разработка

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка окружения

Файл `.env` уже создан в корне проекта. Проверьте настройки:

```bash
# База данных (Docker)
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/insta_sales
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=insta_sales

# Backend
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3001

# Instagram OAuth (Facebook App)
INSTAGRAM_CLIENT_ID=your_facebook_app_id
INSTAGRAM_CLIENT_SECRET=your_facebook_app_secret
INSTAGRAM_REDIRECT_URI=http://localhost:3001/api/auth/instagram/callback

# Frontend
VITE_API_URL=http://localhost:3001

# Domain (Nginx будет использовать это значение)
DOMAIN=localhost
# Для production: DOMAIN=yourdomain.com
```

### 3. Запуск приложения

```bash
# Запустить все сервисы в Docker
npm run docker:up

# Или через Make
make dev
```

Приложение будет доступно:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **PostgreSQL**: localhost:5433

### 4. Остановка

```bash
npm run docker:down

# Или
make down
```

---

## Деплой на сервер

### Вариант 1: Деплой через SSH (БЕЗ Docker Hub) ✅ РЕКОМЕНДУЕТСЯ

#### Шаг 1: Создайте SSH ключ

```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/insta-sales-deploy
```

#### Шаг 2: Скопируйте ключ на сервер

```bash
ssh-copy-id -i ~/.ssh/insta-sales-deploy.pub root@YOUR_SERVER_IP
```

#### Шаг 3: Подготовьте сервер

```bash
ssh root@YOUR_SERVER_IP

# Установите Docker
curl -fsSL https://get.docker.com | sh

# Установите Git
apt update && apt install git -y

# Создайте директорию
mkdir -p /opt/insta-sales

exit
```

#### Шаг 4: Добавьте GitHub Secrets

Перейдите: **Repository → Settings → Secrets → Actions → New repository secret**

Добавьте следующие секреты:

```
SERVER_HOST = IP вашего сервера
SERVER_USER = root
SERVER_SSH_KEY = содержимое ~/.ssh/insta-sales-deploy
SERVER_PORT = 22

POSTGRES_USER = postgres
POSTGRES_PASSWORD = ваш_надежный_пароль
POSTGRES_DB = insta_sales

JWT_SECRET = ваш_секретный_ключ_32_символа
INSTAGRAM_CLIENT_ID = ваш_facebook_app_id
INSTAGRAM_CLIENT_SECRET = ваш_facebook_app_secret
INSTAGRAM_REDIRECT_URI = https://yourdomain.com/api/auth/instagram/callback
VITE_API_URL = https://yourdomain.com
DOMAIN = yourdomain.com
```

#### Шаг 5: Запустите деплой

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

GitHub Actions автоматически задеплоит приложение на сервер!

---

### Вариант 2: Деплой через Docker Hub (опционально)

Если у вас есть Docker Hub аккаунт, добавьте дополнительные секреты:

```
DOCKER_USERNAME = ваш_docker_hub_username
DOCKER_PASSWORD = ваш_docker_hub_token
```

И запустите вручную: **Actions → Deploy to Production (with Docker Hub) → Run workflow**

---

## Настройка Instagram OAuth

### 1. Создайте Facebook App

1. Перейдите на https://developers.facebook.com/
2. **My Apps → Create App**
3. Выберите **Business** тип
4. Заполните название и email

### 2. Добавьте Instagram Graph API

1. В Dashboard → **Add Product**
2. Найдите **Instagram Graph API** → Setup
3. **Settings → Basic**:
   - Скопируйте **App ID** → `INSTAGRAM_CLIENT_ID`
   - Скопируйте **App Secret** → `INSTAGRAM_CLIENT_SECRET`

### 3. Настройте OAuth Redirect URIs

1. **Facebook Login → Settings**
2. **Valid OAuth Redirect URIs**:
   ```
   http://localhost:3001/api/auth/instagram/callback
   https://yourdomain.com/api/auth/instagram/callback
   ```
3. Сохраните изменения

### 4. Подключите Instagram Business Account

1. Убедитесь, что у вас есть:
   - Instagram Business Account (не Personal!)
   - Facebook Page, связанная с Instagram
2. В настройках приложения добавьте тестовых пользователей

### 5. Опубликуйте приложение (для production)

1. **App Review → Permissions and Features**
2. Запросите разрешения:
   - `instagram_basic`
   - `pages_show_list`
   - `business_management`
3. Заполните форму и отправьте на проверку

---

## Полезные команды

```bash
# Разработка
make dev              # Запустить в Docker
make install          # Установить зависимости
make build            # Собрать проекты

# Docker
make docker-build     # Собрать образы
make docker-up        # Запустить контейнеры
make docker-down      # Остановить контейнеры
make docker-logs      # Показать логи

# Деплой
make deploy           # Деплой на сервер (локально)
./scripts/deploy.sh   # Деплой скрипт
./scripts/status.sh   # Статус сервисов
./scripts/logs.sh     # Логи сервисов
./scripts/backup.sh   # Бэкап базы данных
```

---

## Troubleshooting

### Порт 5432 уже занят

Если у вас запущен локальный PostgreSQL:

```bash
# Остановите локальный PostgreSQL
brew services stop postgresql
# или
sudo systemctl stop postgresql
```

Или используйте другой порт в `.env`:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/insta_sales
```

### Instagram OAuth не работает

1. Проверьте, что используете **Facebook App** (не Instagram Basic Display)
2. Убедитесь, что Instagram аккаунт - **Business**, не Personal
3. Проверьте **Valid OAuth Redirect URIs** в настройках Facebook App
4. Убедитесь, что Facebook Page связана с Instagram Business Account

### Docker build ошибки

```bash
# Очистите кэш Docker
docker system prune -a

# Пересоберите образы
docker-compose build --no-cache
```

---

## Документация

- 📖 [README.md](./README.md) - Основная документация
- 🎯 [DEPLOY_OPTIONS.md](./DEPLOY_OPTIONS.md) - Варианты деплоя
- 🚀 [SSH_QUICKSTART.md](./SSH_QUICKSTART.md) - Настройка SSH за 5 минут
- 📋 [SSH_SETUP.md](./SSH_SETUP.md) - Детальная настройка SSH
- 🔐 [.github/SECRETS.md](./.github/SECRETS.md) - GitHub Secrets
- 🐛 [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Решение проблем

---

## Поддержка

Если возникли проблемы:

1. Проверьте [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Посмотрите логи: `docker-compose logs`
3. Проверьте статус: `docker-compose ps`
4. Проверьте переменные окружения в `.env`

---

## Что дальше?

После успешного запуска:

1. ✅ Зарегистрируйте аккаунт на http://localhost:5173
2. ✅ Войдите в личный кабинет
3. ✅ Подключите Instagram через OAuth
4. ✅ Настройте деплой на production сервер
5. ✅ Настройте домен и SSL сертификат

Готово! 🎉
