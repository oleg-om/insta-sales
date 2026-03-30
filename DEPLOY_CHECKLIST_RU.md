# ✅ Чеклист для деплоя

## Что было исправлено

✅ **TypeScript ошибки исправлены**
- Добавлены интерфейсы для ответов Instagram API
- Исправлены ошибки типов в `social.ts`
- Код теперь успешно компилируется

✅ **Docker инфраструктура создана**
- `server/Dockerfile` - backend образ
- `client/Dockerfile` - frontend образ с nginx
- `docker-compose.yml` - оркестрация сервисов
- `nginx.conf` - reverse proxy конфигурация
- `.dockerignore` - оптимизация образов

✅ **GitHub Action обновлен**
- Корректные переменные SSH подключения
- Правильная последовательность деплоя
- Health checks для проверки
- Автоматические миграции БД

✅ **Документация создана**
- `DEPLOYMENT.md` - руководство по деплою (EN)
- `DEPLOYMENT_RU.md` - руководство по деплою (RU)
- `GITHUB_SECRETS.md` - инструкция по настройке секретов

## Следующие шаги для деплоя

### 1. Настройте GitHub Secrets ⚠️ ВАЖНО

Перейдите: **GitHub → Settings → Secrets and variables → Actions**

#### Обязательные секреты:

```yaml
SERVER_HOST: ваш-ip-или-домен
SERVER_USER: ubuntu  # или другой пользователь
SERVER_SSH_KEY: |
  -----BEGIN RSA PRIVATE KEY-----
  ...ваш приватный ключ...
  -----END RSA PRIVATE KEY-----
POSTGRES_PASSWORD: сгенерированный-пароль
JWT_SECRET: сгенерированный-секрет
FRONTEND_URL: https://ваш-домен.com
VITE_API_URL: https://ваш-домен.com
```

#### Сгенерировать секреты:

```bash
# JWT Secret
openssl rand -base64 32

# PostgreSQL Password
openssl rand -base64 24

# Получить SSH ключ
cat ~/.ssh/id_rsa
```

**Подробная инструкция:** [GITHUB_SECRETS.md](GITHUB_SECRETS.md)

### 2. Подготовьте сервер

```bash
# На сервере
# 1. Установите Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 2. Установите Docker Compose
sudo apt install docker-compose-plugin -y

# 3. Создайте директорию
sudo mkdir -p /opt/insta-sales
sudo chown $USER:$USER /opt/insta-sales

# 4. Настройте файрвол
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 3. Запустите деплой

После настройки секретов и сервера:

```bash
# На локальной машине
git push origin main
```

GitHub Action автоматически:
- Подключится к серверу по SSH
- Загрузит код
- Создаст `.env` из секретов
- Соберет Docker образы
- Запустит контейнеры
- Выполнит миграции БД
- Проверит health checks

### 4. Проверьте деплой

1. **Откройте GitHub → Actions**
   - Найдите последний workflow run
   - Следите за логами в реальном времени

2. **После успешного деплоя:**
   ```bash
   # Проверьте backend
   curl https://ваш-домен.com/health
   # Должно вернуть: {"status":"ok"}
   
   # Откройте frontend
   # https://ваш-домен.com
   ```

3. **Проверьте на сервере:**
   ```bash
   ssh ваш-сервер
   cd /opt/insta-sales
   
   # Проверьте статус
   docker compose ps
   
   # Посмотрите логи
   docker compose logs -f
   ```

## Структура деплоя

```
На сервере (/opt/insta-sales/):
├── docker-compose.yml    # Запускает 3 контейнера
│   ├── postgres         # База данных
│   ├── backend          # API (порт 3001)
│   └── frontend         # React app (порт 80)
│
├── .env                 # Создается автоматически из GitHub Secrets
├── server/              # Backend код
└── client/              # Frontend код
```

## Частые проблемы

### ❌ TypeScript ошибки (ИСПРАВЛЕНО)

~~Было:~~
```
error TS18046: 'profileData' is of type 'unknown'
```

✅ Исправлено в коммите `69056dd`

### ❌ GitHub Action не может подключиться по SSH

**Проверьте:**
1. `SERVER_HOST` корректный (IP или домен)
2. `SERVER_USER` существует на сервере
3. `SERVER_SSH_KEY` полный ключ (включая BEGIN/END)
4. Порт 22 открыт в файрволе
5. SSH ключ добавлен на сервер: `cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys`

### ❌ Docker не найден на сервере

```bash
# Установите Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

### ❌ Permission denied при запуске docker

```bash
# Добавьте пользователя в группу docker
sudo usermod -aG docker $USER
newgrp docker
```

### ❌ База данных не подключается

**Проверьте:**
1. Контейнер postgres запущен: `docker compose ps postgres`
2. Логи postgres: `docker compose logs postgres`
3. `POSTGRES_PASSWORD` добавлен в GitHub Secrets
4. Дождитесь ~15 секунд после старта postgres

### ❌ Backend health check failed

```bash
# Посмотрите логи backend
docker compose logs backend

# Проверьте порт
docker compose exec backend wget -qO- http://localhost:3001/health

# Перезапустите если нужно
docker compose restart backend
```

## Полезные команды

```bash
# На сервере
cd /opt/insta-sales

# Статус всех сервисов
docker compose ps

# Логи
docker compose logs -f
docker compose logs -f backend
docker compose logs --tail=100 postgres

# Перезапуск
docker compose restart
docker compose restart backend

# Остановка
docker compose down

# Запуск
docker compose up -d

# Миграции БД
docker compose exec backend npx prisma migrate deploy

# Доступ к БД
docker compose exec postgres psql -U instasales -d instasales

# Очистка старых образов
docker image prune -af
```

## Instagram OAuth (опционально)

Если хотите включить Instagram подключение:

1. **Facebook Developers**
   - https://developers.facebook.com/
   - Создайте приложение (Consumer)
   - Добавьте "Instagram Basic Display"

2. **Добавьте в GitHub Secrets:**
   ```
   INSTAGRAM_CLIENT_ID=ваш-app-id
   INSTAGRAM_CLIENT_SECRET=ваш-app-secret
   INSTAGRAM_REDIRECT_URI=https://ваш-домен.com/auth/instagram/callback
   ```

3. **Перезапустите деплой:**
   ```bash
   git commit --allow-empty -m "Update Instagram OAuth"
   git push origin main
   ```

## Следующий деплой

Для следующих деплоев просто:

```bash
# Сделайте изменения в коде
git add .
git commit -m "Ваше сообщение"
git push origin main

# GitHub Action автоматически задеплоит
```

## Мониторинг

1. **GitHub Actions** - смотрите логи каждого деплоя
2. **Server logs** - `docker compose logs -f`
3. **Health check** - `curl https://ваш-домен.com/health`

## Откат

Если что-то пошло не так:

```bash
# На сервере
cd /opt/insta-sales

# Вернитесь к предыдущему коммиту
git log --oneline -10
git reset --hard <previous-commit-hash>

# Пересоберите
docker compose down
docker compose build
docker compose up -d
```

## Бэкапы

Настройте регулярные бэкапы БД:

```bash
# На сервере
# Бэкап
docker compose exec postgres pg_dump -U instasales instasales > backup_$(date +%Y%m%d).sql

# Восстановление
docker compose exec -T postgres psql -U instasales instasales < backup_20260330.sql
```

## Проверочный чеклист перед деплоем

- [ ] GitHub Secrets добавлены (минимум 7 обязательных)
- [ ] SSH ключ корректный (с BEGIN/END строками)
- [ ] Docker установлен на сервере
- [ ] Директория `/opt/insta-sales` создана
- [ ] Файрвол настроен (порты 22, 80, 443)
- [ ] Пользователь в группе docker
- [ ] Изменения закоммичены и запушены

## Ресурсы

- 📖 [DEPLOYMENT.md](DEPLOYMENT.md) - Полное руководство
- 🔐 [GITHUB_SECRETS.md](GITHUB_SECRETS.md) - Настройка секретов
- 🚀 [README_RU.md](README_RU.md) - Общая документация

---

**Готовы к деплою!** После настройки секретов просто сделайте `git push origin main` 🚀
