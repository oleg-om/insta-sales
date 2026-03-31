# Проверка GitHub Secrets

## Проблема

После деплоя через GitHub Actions получаете ошибку:
```
Error parsing connection string: invalid port number in database URL
```

## Причина

GitHub Action **генерирует** `.env` файл из секретов. Если секреты не установлены или неправильные, DATABASE_URL будет некорректным.

## Решение: Проверьте GitHub Secrets

### 1. Откройте настройки секретов

1. Перейдите на GitHub: https://github.com/YOUR_USERNAME/insta-sales
2. Нажмите **Settings** (в репозитории)
3. Слева: **Secrets and variables** → **Actions**
4. Проверьте список секретов

### 2. Обязательные секреты для работы БД

Должны быть установлены:

| Secret Name | Пример значения | Проверка |
|-------------|-----------------|----------|
| `POSTGRES_PASSWORD` | `aB3dE5fG7hI9jK1lM3nO5pQ7` | ✅ Самый важный! |
| `JWT_SECRET` | `vW8xY0zA2bC4dE6fG8hI0jK2` | ✅ Обязателен |
| `FRONTEND_URL` | `http://v2995829.hosted-by-vdsina.ru` | ✅ Обязателен |

Опциональные (можно не устанавливать):
- `POSTGRES_USER` (по умолчанию: instasales)
- `POSTGRES_DB` (по умолчанию: instasales)

### 3. Добавьте секреты если их нет

#### Для POSTGRES_PASSWORD:

```bash
# Сгенерируйте пароль БЕЗ специальных символов
openssl rand -base64 24 | tr -d '+/=' | head -c 24
# Например: aB3dE5fG7hI9jK1lM3nO5pQ7
```

#### Для JWT_SECRET:

```bash
# Сгенерируйте JWT секрет
openssl rand -base64 32
```

#### Добавление в GitHub:

1. Нажмите **"New repository secret"**
2. Name: `POSTGRES_PASSWORD`
3. Secret: вставьте сгенерированный пароль
4. Нажмите **"Add secret"**

Повторите для `JWT_SECRET` и `FRONTEND_URL`.

### 4. Проверьте что секреты установлены

После добавления вы должны видеть в списке:

```
✅ POSTGRES_PASSWORD      Updated X minutes ago
✅ JWT_SECRET             Updated X minutes ago  
✅ FRONTEND_URL           Updated X minutes ago
✅ SERVER_HOST            Updated X days ago
✅ SERVER_USER            Updated X days ago
✅ SERVER_SSH_KEY         Updated X days ago
```

### 5. Запустите деплой заново

После установки секретов:

```bash
# На локальной машине
git commit --allow-empty -m "Trigger deploy after secrets setup"
git push origin main
```

Или через GitHub UI:
1. Actions → Deploy via SSH
2. Нажмите "Run workflow" → "Run workflow"

## Временное решение (только для сервера)

Пока вы не настроите GitHub Secrets, можно вручную исправить `.env` на сервере:

```bash
cd ~/insta-sales

# Создайте правильный .env вручную
cat > .env << 'ENVEOF'
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
ENVEOF

# Перезапустите
docker compose down -v
docker compose up -d
sleep 30
docker compose exec backend npx prisma migrate deploy
docker compose restart backend
```

**Но это временно!** При следующем деплое через GitHub Actions `.env` перезапишется.

## Полный список секретов для идеального деплоя

```
# SSH подключение (обязательно)
SERVER_HOST=123.456.789.0
SERVER_USER=root
SERVER_SSH_KEY=-----BEGIN RSA PRIVATE KEY-----...-----END RSA PRIVATE KEY-----
SERVER_PORT=22  # опционально

# База данных (обязательно)
POSTGRES_PASSWORD=aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU2vW4xY6zA8bC4dE6

# Безопасность (обязательно)
JWT_SECRET=vW8xY0zA2bC4dE6fG8hI0jK2lM4nO6pQ8rS0tU2vW4xY6zA8bC4dE6fG8hI0jK2lM4nO6pQ

# Frontend (обязательно)
FRONTEND_URL=http://v2995829.hosted-by-vdsina.ru

# Instagram (опционально)
INSTAGRAM_CLIENT_ID=your_instagram_app_id
INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret
INSTAGRAM_REDIRECT_URI=http://v2995829.hosted-by-vdsina.ru/auth/instagram/callback
```

## Проверка после настройки

```bash
# После деплоя проверьте на сервере
ssh root@v2995829.hosted-by-vdsina.ru
cd ~/insta-sales

# Проверьте что .env правильный
cat .env | grep DATABASE_URL
# Должно быть: postgresql://instasales:ПАРОЛЬ@postgres:5432/instasales

# Проверьте что backend видит правильный URL
docker compose exec backend printenv DATABASE_URL

# Проверьте health
curl http://localhost/health
```

## Если всё равно не работает

Отправьте мне:

```bash
cd ~/insta-sales
cat .env | sed 's/PASSWORD=.*/PASSWORD=***HIDDEN***/' | sed 's/SECRET=.*/SECRET=***HIDDEN***/'
```

И я помогу найти проблему!
