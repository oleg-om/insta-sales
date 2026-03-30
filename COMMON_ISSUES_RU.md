# Частые проблемы и решения

## 1. Backend постоянно перезапускается (Restarting)

### Симптомы:
```bash
docker compose ps
# insta-sales-backend  Restarting (1) XX seconds ago
```

### Причины и решения:

#### 🔴 Ошибка: "Error loading shared library libssl.so.1.1"

**Проблема:** Prisma не может найти OpenSSL в Alpine Linux

**Решение:** Уже исправлено в Dockerfile. Пересоберите:
```bash
docker compose build --no-cache backend
docker compose up -d backend
```

#### 🔴 Ошибка: "Cannot find module" или "MODULE_NOT_FOUND"

**Проблема:** Зависимости не установлены

**Решение:**
```bash
docker compose build --no-cache backend
docker compose up -d backend
```

#### 🔴 Ошибка: "ECONNREFUSED" или "Can't reach database server"

**Проблема:** Backend не может подключиться к PostgreSQL

**Проверка:**
```bash
# Проверьте что postgres запущен
docker compose ps postgres

# Проверьте DATABASE_URL
cat .env | grep DATABASE_URL
# Должно быть: postgresql://user:pass@postgres:5432/db
# ВАЖНО: хост должен быть "postgres", НЕ "localhost"!

# Проверьте подключение к БД
docker compose exec postgres pg_isready -U instasales
```

**Решение:**
```bash
# Исправьте DATABASE_URL в .env
nano .env

# Перезапустите в правильном порядке
docker compose down
docker compose up -d postgres
sleep 15
docker compose up -d backend
```

#### 🔴 Ошибка: "P1001: Can't reach database server at postgres:5432"

**Проблема:** Неправильный DATABASE_URL или postgres не готов

**Решение:**
```bash
# 1. Проверьте .env
cat .env | grep DATABASE_URL
# Должно быть точно так:
# DATABASE_URL=postgresql://instasales:PASSWORD@postgres:5432/instasales

# 2. Убедитесь что пароли совпадают
cat .env | grep -E "(POSTGRES_PASSWORD|DATABASE_URL)"

# 3. Перезапустите с правильным порядком
docker compose down
docker compose up -d postgres
sleep 20
docker compose up -d backend frontend
```

## 2. 502 Bad Gateway

### Симптомы:
Браузер показывает "502 Bad Gateway" при обращении к `/auth/register` или другим API endpoints.

### Причины и решения:

#### 🔴 Backend не запущен

```bash
# Проверка
docker compose ps backend

# Если "Exited" или "Restarting", смотрите логи
docker compose logs backend --tail=50

# Решение - см. раздел "Backend постоянно перезапускается"
```

#### 🔴 Backend запущен, но не отвечает

```bash
# Проверьте из frontend контейнера
docker compose exec frontend wget -qO- http://backend:3001/health

# Если timeout или connection refused:
docker compose restart backend
sleep 20
docker compose exec frontend wget -qO- http://backend:3001/health
```

#### 🔴 Nginx конфигурация устарела

```bash
# Проверьте наличие proxy_pass
docker compose exec frontend cat /etc/nginx/conf.d/default.conf | grep -A 3 "location /auth"

# Должно быть:
# location /auth {
#     proxy_pass http://backend:3001;

# Если нет, пересоберите frontend
docker compose build --no-cache frontend
docker compose up -d frontend
```

## 3. CORS ошибки в браузере

### Симптомы:
```
Access to XMLHttpRequest blocked by CORS policy
```

### Причина:
Frontend делает запросы напрямую на `backend:3001` вместо через nginx proxy.

### Решение:

```bash
# 1. Проверьте что frontend использует relative URLs
docker compose exec frontend cat /usr/share/nginx/html/assets/*.js | grep -o 'baseURL[^,]*' | head -1

# 2. Убедитесь что VITE_API_URL не установлен или пустой
cat .env | grep VITE_API_URL
# Должно быть закомментировано или пусто

# 3. Пересоберите frontend если нужно
docker compose build --no-cache frontend
docker compose up -d frontend
```

## 4. Миграции не применились

### Симптомы:
```
Prisma schema does not match database
Invalid `prisma.xxx.findMany()` invocation
```

### Решение:

```bash
# Применить миграции
docker compose exec backend npx prisma migrate deploy

# Перезапустить backend
docker compose restart backend

# Проверить статус
docker compose exec backend npx prisma migrate status
```

## 5. Не могу зарегистрироваться / войти

### Симптомы:
- Форма отправляется, но ничего не происходит
- Ошибка 500 Internal Server Error

### Диагностика:

```bash
# 1. Проверьте логи backend
docker compose logs backend --tail=50

# 2. Проверьте health
curl http://localhost/health
# Должно вернуть: {"status":"ok"}

# 3. Попробуйте через curl
curl -X POST http://localhost/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Должно вернуть токен и user object
```

## 6. Frontend не загружается (белый экран)

### Причины:

#### 🔴 Frontend контейнер не запущен

```bash
docker compose ps frontend
# Должен быть: Up X minutes

# Если нет
docker compose up -d frontend
```

#### 🔴 Nginx упал

```bash
# Логи
docker compose logs frontend --tail=30

# Перезапуск
docker compose restart frontend
```

#### 🔴 Порт 80 занят другим процессом

```bash
# Проверка
sudo lsof -i :80

# Если есть другой процесс, остановите его
sudo systemctl stop nginx  # если установлен системный nginx

# Перезапустите контейнер
docker compose up -d frontend
```

## 7. Volumes / данные базы потеряны

### Восстановление:

```bash
# Если есть backup
docker compose exec -T postgres psql -U instasales instasales < backup.sql

# Если нет backup, пересоздайте БД
docker compose down -v  # ВНИМАНИЕ: удалит все данные!
docker compose up -d postgres
sleep 15
docker compose exec backend npx prisma migrate deploy
docker compose up -d backend frontend
```

## 8. Docker сеть не работает

### Симптомы:
Контейнеры не могут общаться между собой

### Решение:

```bash
# Полный перезапуск с пересозданием сети
docker compose down
docker network prune -f
docker compose up -d

# Проверьте сеть
docker network inspect insta-sales_app-network
# Должны быть все 3 контейнера
```

## 9. Недостаточно памяти / диска

### Симптомы:
Контейнеры падают, или docker compose не может собрать образ

### Решение:

```bash
# Очистка старых образов
docker image prune -af

# Очистка volumes (ОСТОРОЖНО!)
docker volume prune -f

# Проверка места
df -h
docker system df
```

## Быстрая полная перезагрузка

Если ничего не помогает:

```bash
cd ~/insta-sales

# Остановите всё
docker compose down

# Обновите код
git pull origin main

# Пересоберите всё
docker compose build --no-cache

# Запустите по порядку
docker compose up -d postgres
sleep 20
docker compose up -d backend
sleep 10
docker compose up -d frontend

# Проверьте
docker compose ps
docker compose logs --tail=20
curl http://localhost/health
```

## Полезные команды для диагностики

```bash
# Статус всех контейнеров
docker compose ps

# Логи всех сервисов
docker compose logs -f

# Логи конкретного сервиса
docker compose logs backend --tail=100

# Проверка здоровья backend изнутри
docker compose exec frontend wget -qO- http://backend:3001/health

# Проверка PostgreSQL
docker compose exec postgres pg_isready -U instasales

# Проверка переменных окружения
cat .env
docker compose exec backend env | grep DATABASE_URL

# Использование ресурсов
docker stats

# Место на диске
docker system df
```

## Контакты для помощи

Если проблема не решается, соберите диагностическую информацию:

```bash
cd ~/insta-sales

echo "=== Container Status ==="
docker compose ps

echo -e "\n=== Backend Logs ==="
docker compose logs backend --tail=50

echo -e "\n=== Environment Check ==="
cat .env | grep -v PASSWORD | grep -v SECRET

echo -e "\n=== Network Test ==="
docker compose exec frontend wget -qO- http://backend:3001/health 2>&1 || echo "Failed"

echo -e "\n=== Disk Space ==="
df -h
docker system df
```

Отправьте весь вывод для диагностики.
