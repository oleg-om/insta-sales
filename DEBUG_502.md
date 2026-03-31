# Debugging 502 Bad Gateway

## Что означает 502?

**502 Bad Gateway** = Frontend nginx не может подключиться к backend контейнеру.

## Быстрая диагностика

Подключитесь к серверу и выполните:

```bash
ssh your-server
cd /opt/insta-sales

# 1. Проверьте статус контейнеров
docker compose ps

# 2. Проверьте логи backend
docker compose logs backend --tail=50

# 3. Проверьте логи frontend (nginx)
docker compose logs frontend --tail=50

# 4. Проверьте здоровье backend изнутри frontend
docker compose exec frontend wget -qO- http://backend:3001/health
```

## Возможные проблемы и решения

### Проблема 1: Backend не запущен

```bash
# Проверка
docker compose ps backend

# Если статус "Exited" или "Restarting"
# Смотрим логи
docker compose logs backend

# Перезапускаем
docker compose restart backend

# Или полная пересборка
docker compose down
docker compose up -d
```

### Проблема 2: Backend не готов (нужно больше времени)

```bash
# Проверьте когда контейнер запустился
docker compose ps backend

# Подождите 30-60 секунд после старта
# Backend может компилироваться или ждать БД

# Проверьте health check
docker compose exec backend wget -qO- http://localhost:3001/health
```

### Проблема 3: База данных не готова

```bash
# Проверка postgres
docker compose ps postgres
docker compose logs postgres --tail=30

# Проверьте что postgres здоров
docker compose exec postgres pg_isready -U instasales

# Если БД не готова, перезапустите в правильном порядке
docker compose down
docker compose up -d postgres
# Подождите 15 секунд
docker compose up -d backend
docker compose up -d frontend
```

### Проблема 4: Неправильная конфигурация nginx

```bash
# Проверьте nginx конфигурацию
docker compose exec frontend cat /etc/nginx/conf.d/default.conf | grep -A 5 "location /auth"

# Должно быть:
# location /auth {
#     proxy_pass http://backend:3001;
#     ...
# }

# Если конфигурация старая, пересоберите frontend
docker compose build --no-cache frontend
docker compose up -d frontend
```

### Проблема 5: Docker network проблемы

```bash
# Проверьте что контейнеры в одной сети
docker network inspect insta-sales_app-network

# Должны быть оба контейнера: frontend и backend

# Перезапустите с пересозданием сети
docker compose down
docker network prune -f
docker compose up -d
```

### Проблема 6: Переменные окружения не загружены

```bash
# Проверьте .env файл
cat .env | grep -E "(DATABASE_URL|JWT_SECRET|FRONTEND_URL)"

# Проверьте переменные в backend контейнере
docker compose exec backend env | grep -E "(DATABASE_URL|JWT_SECRET)"

# Если переменных нет, обновите .env и перезапустите
docker compose down
docker compose up -d
```

## Пошаговая диагностика

### Шаг 1: Проверка контейнеров

```bash
cd /opt/insta-sales
docker compose ps
```

**Ожидаемый вывод:**
```
NAME                      STATUS         PORTS
insta-sales-backend       Up X minutes   3001/tcp
insta-sales-frontend      Up X minutes   0.0.0.0:80->80/tcp
insta-sales-postgres      Up X minutes   5432/tcp
```

❌ Если backend в статусе "Exited" → Смотрите логи
❌ Если backend постоянно перезапускается → Проблема с кодом или БД

### Шаг 2: Логи backend

```bash
docker compose logs backend --tail=100
```

**Ищите:**
- ✅ "Server running on http://localhost:3001" - всё ОК
- ❌ "Error: " - ошибка в коде
- ❌ "ECONNREFUSED" - не может подключиться к БД
- ❌ "MODULE_NOT_FOUND" - проблема с зависимостями

### Шаг 3: Проверка связи между контейнерами

```bash
# Из frontend попробуйте достучаться до backend
docker compose exec frontend wget -qO- http://backend:3001/health

# Должно вернуть: {"status":"ok"}
```

❌ Если timeout → backend не запущен или не слушает порт
❌ Если "could not resolve host" → проблема с Docker network

### Шаг 4: Проверка БД

```bash
# Проверка postgres
docker compose exec postgres pg_isready -U instasales

# Должно вернуть: "accepting connections"

# Проверка подключения из backend
docker compose exec backend env | grep DATABASE_URL
```

### Шаг 5: Проверка миграций

```bash
# Проверьте применены ли миграции
docker compose exec backend npx prisma migrate status

# Если нет, примените
docker compose exec backend npx prisma migrate deploy
```

## Быстрое решение (если всё сломано)

```bash
cd /opt/insta-sales

# Полная перезагрузка
docker compose down -v  # -v удалит volumes (ОСТОРОЖНО: удалятся данные БД!)
docker compose build --no-cache
docker compose up -d

# Подождите минуту
sleep 60

# Проверьте
curl http://localhost/health
```

## Проверка после исправления

```bash
# 1. Health check
curl http://your-domain.com/health
# Должно вернуть: {"status":"ok"}

# 2. Попробуйте регистрацию через curl
curl -X POST http://your-domain.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Должно вернуть токен и user object

# 3. Откройте в браузере
open http://your-domain.com
```

## Частые ошибки в логах и их решения

### "Error: connect ECONNREFUSED 127.0.0.1:5432"

**Проблема:** Backend не может подключиться к PostgreSQL

**Решение:**
```bash
# Проверьте что postgres запущен
docker compose ps postgres

# Проверьте DATABASE_URL
docker compose exec backend env | grep DATABASE_URL
# Должен быть: postgresql://user:pass@postgres:5432/db
# НЕ localhost, а postgres!

# Перезапустите в правильном порядке
docker compose down
docker compose up -d postgres
sleep 15
docker compose up -d backend frontend
```

### "Error: Cannot find module"

**Проблема:** Не установлены зависимости или проблема при сборке

**Решение:**
```bash
# Пересоберите с нуля
docker compose build --no-cache backend
docker compose up -d backend
```

### "Error: P1001: Can't reach database server"

**Проблема:** Database URL неправильный

**Решение:**
```bash
# Проверьте .env
cat .env | grep DATABASE_URL

# Должно быть:
# DATABASE_URL=postgresql://instasales:PASSWORD@postgres:5432/instasales

# Обновите и перезапустите
docker compose down
docker compose up -d
```

### "502 Bad Gateway" в логах nginx

```bash
# Смотрим что пишет frontend nginx
docker compose logs frontend | grep "upstream"

# Типичная ошибка:
# connect() failed (111: Connection refused) while connecting to upstream

# Это значит backend не отвечает
```

## Мониторинг в реальном времени

```bash
# Следите за логами всех сервисов
docker compose logs -f

# Или только критичных
docker compose logs -f backend frontend
```

## Контакт с разработчиком

Если проблема не решается, отправьте вывод команд:

```bash
cd /opt/insta-sales

echo "=== Docker Compose Status ==="
docker compose ps

echo -e "\n=== Backend Logs (last 100 lines) ==="
docker compose logs backend --tail=100

echo -e "\n=== Frontend Logs (last 50 lines) ==="
docker compose logs frontend --tail=50

echo -e "\n=== Postgres Status ==="
docker compose exec postgres pg_isready -U instasales

echo -e "\n=== Network Test ==="
docker compose exec frontend wget -qO- http://backend:3001/health 2>&1

echo -e "\n=== Environment Check ==="
docker compose exec backend env | grep -E "(DATABASE_URL|JWT_SECRET|NODE_ENV)"
```

Скопируйте весь вывод и отправьте мне.
