# Правильный .env файл для сервера

## 🚀 КОМАНДА ДЛЯ СОЗДАНИЯ .env НА СЕРВЕРЕ

**Скопируйте и выполните ЦЕЛИКОМ:**

```bash
cd ~/insta-sales && \
docker compose down && \
cat > .env << 'ENVEOF'
# Database - отдельные переменные для postgres контейнера
POSTGRES_USER=instasales
POSTGRES_PASSWORD=aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU2vW4xY6zA8bC4dE6
POSTGRES_DB=instasales

# Database URL - для backend (должен совпадать с переменными выше!)
DATABASE_URL=postgresql://instasales:aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU2vW4xY6zA8bC4dE6@postgres:5432/instasales

# Server
PORT=3001
NODE_ENV=production

# JWT Secret
JWT_SECRET=vW8xY0zA2bC4dE6fG8hI0jK2lM4nO6pQ8rS0tU2vW4xY6zA8bC4dE6fG8hI0jK2lM4nO6pQ

# Instagram OAuth (оставьте пустым пока не настроите)
INSTAGRAM_CLIENT_ID=
INSTAGRAM_CLIENT_SECRET=
INSTAGRAM_REDIRECT_URI=

# Frontend URL
FRONTEND_URL=http://v2995829.hosted-by-vdsina.ru
ENVEOF
echo "✅ .env file created" && \
echo "" && \
echo "📋 Verifying .env content:" && \
echo "" && \
cat .env | sed 's/PASSWORD=.*/PASSWORD=***HIDDEN***/g' | sed 's/SECRET=.*/SECRET=***HIDDEN***/g' && \
echo "" && \
echo "▶️  Starting services..." && \
git pull origin main && \
docker compose up -d && \
echo "⏳ Waiting 40 seconds for services to start..." && \
sleep 40 && \
echo "" && \
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" && \
echo "📊 CONTAINER STATUS:" && \
docker compose ps && \
echo "" && \
echo "📝 BACKEND LOGS (last 30 lines):" && \
docker compose logs backend --tail=30 && \
echo "" && \
echo "🏥 HEALTH CHECK:" && \
curl -s http://localhost/health && echo "" && \
echo "" && \
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" && \
echo "" && \
echo "✅ If backend is 'Up' and health returns {\"status\":\"ok\"}, you're good!" && \
echo "🌐 Open: http://v2995829.hosted-by-vdsina.ru" && \
echo ""
```

## Почему нужны обе вещи?

### 1. Отдельные переменные (POSTGRES_*)

```yaml
# docker-compose.yml - postgres service
postgres:
  environment:
    POSTGRES_USER: ${POSTGRES_USER}      ← Нужно!
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}  ← Нужно!
    POSTGRES_DB: ${POSTGRES_DB}          ← Нужно!
```

Postgres контейнер использует эти переменные для создания пользователя и базы данных.

### 2. DATABASE_URL

```yaml
# docker-compose.yml - backend service
backend:
  environment:
    DATABASE_URL: ${DATABASE_URL}  ← Нужно!
```

Backend (Prisma) использует DATABASE_URL для подключения к БД.

## Правильный .env должен содержать:

```bash
# Для postgres контейнера
POSTGRES_USER=instasales
POSTGRES_PASSWORD=ваш_пароль
POSTGRES_DB=instasales

# Для backend (Prisma) - тот же пароль!
DATABASE_URL=postgresql://instasales:ваш_пароль@postgres:5432/instasales

# Остальные переменные
PORT=3001
NODE_ENV=production
JWT_SECRET=ваш_jwt_секрет
FRONTEND_URL=http://v2995829.hosted-by-vdsina.ru
```

## ⚠️ ВАЖНО:

Пароль в `POSTGRES_PASSWORD` **ДОЛЖЕН** совпадать с паролем в `DATABASE_URL`!

## Что делает команда выше:

1. ✅ Останавливает контейнеры
2. ✅ Создает правильный `.env` с ОБЕИМИ группами переменных
3. ✅ Показывает содержимое (без паролей)
4. ✅ Загружает последний код
5. ✅ Запускает контейнеры
6. ✅ Ждет 40 секунд
7. ✅ Показывает статус и логи
8. ✅ Проверяет health

## Альтернатива: Вручную

Если хотите создать вручную:

```bash
cd ~/insta-sales
nano .env
```

Вставьте:

```bash
POSTGRES_USER=instasales
POSTGRES_PASSWORD=aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU2vW4xY6zA8bC4dE6
POSTGRES_DB=instasales
DATABASE_URL=postgresql://instasales:aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU2vW4xY6zA8bC4dE6@postgres:5432/instasales
PORT=3001
NODE_ENV=production
JWT_SECRET=vW8xY0zA2bC4dE6fG8hI0jK2lM4nO6pQ8rS0tU2vW4xY6zA8bC4dE6fG8hI0jK2lM4nO6pQ
INSTAGRAM_CLIENT_ID=
INSTAGRAM_CLIENT_SECRET=
INSTAGRAM_REDIRECT_URI=
FRONTEND_URL=http://v2995829.hosted-by-vdsina.ru
```

Затем:

```bash
docker compose down
docker compose up -d
sleep 40
docker compose ps
curl http://localhost/health
```

После этого должно заработать! 🎉
