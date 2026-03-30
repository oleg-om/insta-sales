# Nginx конфигурация

## Как это работает

Приложение использует **единый порт 80** для фронтенда и API благодаря nginx reverse proxy.

```
┌─────────────────────────────────────────┐
│  Клиент (Браузер)                       │
└─────────────────┬───────────────────────┘
                  │
                  │ HTTP :80
                  │
┌─────────────────▼───────────────────────┐
│  Frontend Nginx Container               │
│  ┌───────────────────────────────────┐  │
│  │  nginx (порт 80)                  │  │
│  │                                   │  │
│  │  /           → React app          │  │
│  │  /auth/*     → proxy → backend    │  │
│  │  /social/*   → proxy → backend    │  │
│  │  /health     → proxy → backend    │  │
│  └───────────────┬───────────────────┘  │
└──────────────────┼───────────────────────┘
                   │
                   │ Внутренняя сеть (app-network)
                   │
┌──────────────────▼───────────────────────┐
│  Backend Container                       │
│  Node.js + Express (порт 3001)           │
└──────────────────────────────────────────┘
```

## Преимущества

✅ **Единая точка входа** - всё на порту 80
✅ **Нет CORS проблем** - API на том же домене
✅ **Проще деплой** - нужен только один порт
✅ **Лучше для production** - стандартный подход
✅ **SSL проще** - нужен сертификат только для порта 80/443

## Конфигурация nginx

### Frontend nginx (`client/nginx.conf`)

```nginx
server {
    listen 80;
    
    # API прокси
    location /auth {
        proxy_pass http://backend:3001;
        # ... proxy headers
    }
    
    location /social {
        proxy_pass http://backend:3001;
        # ... proxy headers
    }
    
    # Статические файлы React
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Что происходит:

1. **Клиент запрашивает** `http://yoursite.com/auth/login`
2. **Nginx получает** запрос на порт 80
3. **Nginx проксирует** на `http://backend:3001/auth/login`
4. **Backend обрабатывает** запрос
5. **Nginx возвращает** ответ клиенту

## API клиент (frontend)

Frontend автоматически использует правильный URL:

```typescript
// client/src/lib/api.ts

const getBaseURL = () => {
  // Явно указан VITE_API_URL
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Production: относительные URL (через nginx proxy)
  if (import.meta.env.PROD) {
    return ''; // Запросы на тот же домен
  }
  
  // Development: localhost
  return 'http://localhost:3001';
};
```

### Примеры запросов:

**Development** (npm run dev):
```
Frontend: http://localhost:5173
API: http://localhost:3001/auth/login
```

**Production** (Docker):
```
Всё на порту 80: http://yoursite.com
Frontend: http://yoursite.com/
API: http://yoursite.com/auth/login (nginx proxy → backend:3001)
```

## Переменные окружения

### Для Development

```bash
# .env (локально)
VITE_API_URL=http://localhost:3001
```

### Для Production (Docker)

```bash
# .env (на сервере)
# VITE_API_URL не нужен! Frontend будет использовать relative URLs
FRONTEND_URL=https://yoursite.com  # Для backend redirects
```

### GitHub Secrets

```yaml
# Обязательные
FRONTEND_URL: https://yoursite.com

# Опциональные (обычно не нужен)
VITE_API_URL: ""  # Пустое значение = relative URLs
```

## Проверка

### 1. Локальная разработка

```bash
# Terminal 1: Backend
cd server
npm run dev
# Запущен на http://localhost:3001

# Terminal 2: Frontend
cd client
npm run dev
# Запущен на http://localhost:5173
# API запросы идут на localhost:3001
```

### 2. Docker (Production)

```bash
# Запустить
docker compose up -d

# Проверить порты
docker compose ps
# frontend: 0.0.0.0:80->80/tcp
# backend: 3001/tcp (внутренний)

# Проверить API через nginx
curl http://localhost/health
# {"status":"ok"}

# Открыть в браузере
open http://localhost
```

## Продвинутая конфигурация

### Опция 1: Простой деплой (текущая настройка)

```yaml
# docker-compose.yml
services:
  frontend:  # nginx с proxy
    ports:
      - "80:80"
  backend:   # только внутренний порт
    expose:
      - 3001
```

**Использование:** `docker compose up -d`

### Опция 2: С отдельным nginx reverse proxy

```yaml
# docker-compose.yml
services:
  frontend:
    # без прямого доступа
  backend:
    # без прямого доступа
  nginx:     # главный reverse proxy
    ports:
      - "80:80"
      - "443:443"
    profiles:
      - with-proxy
```

**Использование:** `docker compose --profile with-proxy up -d`

**Преимущества:**
- Rate limiting
- SSL termination
- Более гибкая конфигурация
- Логи в одном месте

## SSL/HTTPS

Для production с SSL:

### Вариант 1: Let's Encrypt + Certbot

```bash
# На сервере
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yoursite.com
```

Certbot автоматически обновит nginx конфигурацию.

### Вариант 2: Cloudflare

1. Добавьте домен в Cloudflare
2. Включите Proxy (оранжевое облако)
3. Cloudflare автоматически добавит SSL

```bash
# На сервере остается HTTP :80
# Cloudflare обрабатывает HTTPS :443
```

## Troubleshooting

### API запросы не работают (404)

**Проблема:** `GET /auth/login 404 Not Found`

**Решение:**
```bash
# Проверьте nginx конфигурацию
docker compose exec frontend cat /etc/nginx/conf.d/default.conf

# Перезапустите frontend
docker compose restart frontend
```

### CORS ошибки

**Проблема:** `Access-Control-Allow-Origin` ошибка

**Причина:** Запросы идут напрямую на backend:3001 вместо через nginx

**Решение:**
```javascript
// Проверьте api.ts
console.log('API baseURL:', api.defaults.baseURL);
// Должно быть: "" (пусто) или ваш домен, НЕ "http://backend:3001"
```

### Backend недоступен из nginx

**Проблема:** `502 Bad Gateway`

**Решение:**
```bash
# Проверьте что backend запущен
docker compose ps backend

# Проверьте логи backend
docker compose logs backend

# Проверьте сеть
docker compose exec frontend ping backend
```

### Неправильный baseURL в production

**Проблема:** Frontend делает запросы на localhost:3001

**Причина:** VITE_API_URL установлен во время build

**Решение:**
```bash
# Пересоберите frontend без VITE_API_URL
docker compose build --no-cache frontend
docker compose up -d frontend
```

## Мониторинг

```bash
# Nginx access logs
docker compose logs frontend | grep -v "GET /health"

# API requests through nginx
docker compose logs frontend | grep "POST /auth"

# Backend logs
docker compose logs backend

# Real-time logs
docker compose logs -f frontend backend
```

## Резюме

✅ Frontend на порту 80 (nginx)
✅ Backend на внутреннем порту 3001
✅ Nginx проксирует `/auth` и `/social` на backend
✅ Всё доступно через один порт 80
✅ В production не нужен VITE_API_URL
✅ Готово для SSL/HTTPS

---

**См. также:**
- [DEPLOYMENT_RU.md](DEPLOYMENT_RU.md) - Полное руководство по деплою
- [docker-compose.yml](docker-compose.yml) - Конфигурация сервисов
- [client/nginx.conf](client/nginx.conf) - Nginx конфигурация
