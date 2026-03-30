# Fix DATABASE_URL Error

## Проблема

```
Error parsing connection string: invalid port number in database URL
```

Это означает, что формат DATABASE_URL неправильный.

## Правильный формат DATABASE_URL

```bash
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE"
```

### Для Docker (в .env файле):

```bash
DATABASE_URL=postgresql://instasales:YOUR_PASSWORD@postgres:5432/instasales
```

**Важно:**
- Хост должен быть `postgres` (имя контейнера), НЕ `localhost`
- Порт должен быть `5432`
- Кавычки не нужны (если нет специальных символов)

## Частые ошибки

### ❌ Неправильно:

```bash
# Пробелы в URL
DATABASE_URL=postgresql://instasales: password@postgres:5432/instasales

# Localhost вместо postgres
DATABASE_URL=postgresql://instasales:password@localhost:5432/instasales

# Неправильный порт
DATABASE_URL=postgresql://instasales:password@postgres:3001/instasales

# Специальные символы в пароле без экранирования
DATABASE_URL=postgresql://instasales:p@ss#word!@postgres:5432/instasales

# Опечатки
DATABASE_URL=postgresql:/instasales:password@postgres:5432/instasales  # одна /
DATABASE_URL=postgresq://instasales:password@postgres:5432/instasales  # postgresq
```

### ✅ Правильно:

```bash
# Простой пароль
DATABASE_URL=postgresql://instasales:mypassword123@postgres:5432/instasales

# Пароль со специальными символами (экранирован)
DATABASE_URL=postgresql://instasales:p%40ss%23word%21@postgres:5432/instasales

# Или используйте пароль без спецсимволов
DATABASE_URL=postgresql://instasales:aB3dE5fG7hI9jK1lM3nO5pQ@postgres:5432/instasales
```

## Экранирование специальных символов

Если в пароле есть специальные символы, их нужно экранировать:

| Символ | Экранированный | Пример |
|--------|----------------|--------|
| `@`    | `%40`         | `p@ss` → `p%40ss` |
| `#`    | `%23`         | `p#ss` → `p%23ss` |
| `!`    | `%21`         | `p!ss` → `p%21ss` |
| `$`    | `%24`         | `p$ss` → `p%24ss` |
| `%`    | `%25`         | `p%ss` → `p%25ss` |
| `&`    | `%26`         | `p&ss` → `p%26ss` |
| `/`    | `%2F`         | `p/ss` → `p%2Fss` |
| `:`    | `%3A`         | `p:ss` → `p%3Ass` |
| `?`    | `%3F`         | `p?ss` → `p%3Fss` |

## Рекомендация: Используйте простой пароль

Чтобы избежать проблем с экранированием, используйте пароль только с:
- Латинскими буквами: `a-z`, `A-Z`
- Цифрами: `0-9`

**Генерация безопасного пароля без спецсимволов:**

```bash
# Вариант 1: только буквы и цифры
openssl rand -base64 24 | tr -d '+/=' | head -c 24

# Вариант 2: используйте pwgen (если установлен)
pwgen -s 24 1

# Вариант 3: вручную
# Например: aB3dE5fG7hI9jK1lM3nO5pQ7
```

## Исправление на сервере

### Шаг 1: Остановите контейнеры

```bash
cd ~/insta-sales
docker compose down
```

### Шаг 2: Отредактируйте .env

```bash
nano .env
```

### Шаг 3: Исправьте DATABASE_URL

Должен быть **ТОЧНО** в таком формате:

```bash
POSTGRES_USER=instasales
POSTGRES_PASSWORD=ваш_пароль_без_спецсимволов
POSTGRES_DB=instasales
DATABASE_URL=postgresql://instasales:ваш_пароль_без_спецсимволов@postgres:5432/instasales
```

**Проверьте:**
- ✅ Нет пробелов
- ✅ Хост = `postgres` (не localhost)
- ✅ Порт = `5432`
- ✅ Пароль в POSTGRES_PASSWORD совпадает с паролем в DATABASE_URL
- ✅ Нет кавычек вокруг URL

### Шаг 4: Сохраните и запустите

```bash
# Сохраните файл (Ctrl+X, Y, Enter)

# Запустите заново
docker compose up -d

# Подождите
sleep 30

# Проверьте
docker compose ps
docker compose logs backend --tail=20
curl http://localhost/health
```

## Пример правильного .env файла

```bash
# Database
POSTGRES_USER=instasales
POSTGRES_PASSWORD=aB3dE5fG7hI9jK1lM3nO5pQ7
POSTGRES_DB=instasales
DATABASE_URL=postgresql://instasales:aB3dE5fG7hI9jK1lM3nO5pQ7@postgres:5432/instasales

# Server
PORT=3001
NODE_ENV=production
JWT_SECRET=vW8xY0zA2bC4dE6fG8hI0jK2lM4nO6pQ8rS0tU2vW4xY

# Instagram OAuth (пока оставьте пустым или закомментируйте)
# INSTAGRAM_CLIENT_ID=
# INSTAGRAM_CLIENT_SECRET=
# INSTAGRAM_REDIRECT_URI=

# Frontend
FRONTEND_URL=http://v2995829.hosted-by-vdsina.ru
```

## Проверка DATABASE_URL

Перед запуском проверьте формат:

```bash
# Посмотрите текущий DATABASE_URL
cat .env | grep DATABASE_URL

# Проверьте что это одна строка без переносов
cat .env | grep DATABASE_URL | wc -l
# Должно быть: 1

# Проверьте что нет лишних пробелов
cat .env | grep DATABASE_URL | sed 's/ /[SPACE]/g'
# Не должно быть [SPACE]
```

## Быстрое исправление (скопируйте на сервер)

```bash
cd ~/insta-sales

# Остановите
docker compose down

# Сгенерируйте новый простой пароль
NEW_PASSWORD=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 24 | head -n 1)
echo "Generated password: $NEW_PASSWORD"

# Обновите .env
cat > .env << ENVEOF
POSTGRES_USER=instasales
POSTGRES_PASSWORD=$NEW_PASSWORD
POSTGRES_DB=instasales
DATABASE_URL=postgresql://instasales:$NEW_PASSWORD@postgres:5432/instasales
PORT=3001
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)
INSTAGRAM_CLIENT_ID=
INSTAGRAM_CLIENT_SECRET=
INSTAGRAM_REDIRECT_URI=
FRONTEND_URL=http://v2995829.hosted-by-vdsina.ru
ENVEOF

# Покажите что получилось (без паролей)
echo "✅ .env created. DATABASE_URL format:"
cat .env | grep DATABASE_URL | sed 's/:[^@]*@/:****@/'

# Запустите
docker compose up -d

# Проверьте через 30 секунд
sleep 30
docker compose ps
curl http://localhost/health
```

## Проверка после исправления

```bash
# 1. Backend должен быть Up (не Restarting)
docker compose ps backend

# 2. Не должно быть ошибок в логах
docker compose logs backend --tail=20

# 3. Health check работает
curl http://localhost/health
# {"status":"ok"}

# 4. Можно регистрироваться
curl -X POST http://localhost/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
# Должен вернуть токен
```

Если всё работает - откройте в браузере и тестируйте! 🎉
