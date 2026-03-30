# Руководство по развертыванию

Это руководство описывает развертывание InstaSales на production сервере с использованием Docker.

## Требования

### Требования к серверу
- Ubuntu 20.04+ или аналогичный Linux дистрибутив
- Docker и Docker Compose установлены
- Минимум 2GB RAM
- 20GB дискового пространства

### Локальные требования
- SSH доступ к серверу
- Доступ к GitHub репозиторию

## Настройка сервера

### 1. Установка Docker

```bash
# Обновить пакеты
sudo apt update && sudo apt upgrade -y

# Установить Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавить пользователя в группу docker
sudo usermod -aG docker $USER

# Установить Docker Compose
sudo apt install docker-compose-plugin -y

# Проверить установку
docker --version
docker compose version
```

### 2. Создать директорию приложения

```bash
sudo mkdir -p /opt/insta-sales
sudo chown $USER:$USER /opt/insta-sales
```

### 3. Настроить файрвол

```bash
# Разрешить SSH
sudo ufw allow 22/tcp

# Разрешить HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Включить файрвол
sudo ufw enable
```

## Настройка GitHub Secrets

Добавьте следующие секреты в ваш GitHub репозиторий (`Settings` → `Secrets and variables` → `Actions`):

### Обязательные секреты

| Название | Описание | Пример |
|----------|----------|--------|
| `SERVER_HOST` | IP или домен сервера | `123.456.789.0` |
| `SERVER_USER` | SSH пользователь | `ubuntu` |
| `SERVER_SSH_KEY` | Приватный SSH ключ | `-----BEGIN RSA PRIVATE KEY-----...` |
| `SERVER_PORT` | SSH порт (опционально) | `22` |
| `POSTGRES_PASSWORD` | Пароль базы данных | Сгенерируйте сложный пароль |
| `JWT_SECRET` | Секрет для JWT | Случайная строка 32+ символов |

### Опциональные секреты

| Название | Описание | По умолчанию |
|----------|----------|--------------|
| `POSTGRES_USER` | Имя пользователя БД | `instasales` |
| `POSTGRES_DB` | Название БД | `instasales` |
| `FRONTEND_URL` | URL фронтенда | `http://localhost` |
| `VITE_API_URL` | URL API для фронтенда | URL API сервера |
| `INSTAGRAM_CLIENT_ID` | Instagram OAuth Client ID | - |
| `INSTAGRAM_CLIENT_SECRET` | Instagram OAuth Secret | - |
| `INSTAGRAM_REDIRECT_URI` | Instagram OAuth Redirect | - |

### Генерация секретов

```bash
# Сгенерировать JWT_SECRET
openssl rand -base64 32

# Сгенерировать POSTGRES_PASSWORD
openssl rand -base64 24
```

### Получение SSH ключа

```bash
# На вашей локальной машине
cat ~/.ssh/id_rsa

# Скопируйте весь вывод включая:
# -----BEGIN RSA PRIVATE KEY-----
# ... содержимое ключа ...
# -----END RSA PRIVATE KEY-----
```

## Ручное развертывание (первый раз)

### 1. Клонировать репозиторий на сервер

```bash
cd /opt/insta-sales
git clone https://github.com/YOUR_USERNAME/insta-sales.git .
```

### 2. Создать файл `.env`

```bash
cat > .env << 'EOF'
# База данных
POSTGRES_USER=instasales
POSTGRES_PASSWORD=ваш-безопасный-пароль
POSTGRES_DB=instasales
DATABASE_URL=postgresql://instasales:ваш-безопасный-пароль@postgres:5432/instasales

# Сервер
PORT=3001
NODE_ENV=production
JWT_SECRET=ваш-jwt-секрет

# Instagram OAuth (опционально)
INSTAGRAM_CLIENT_ID=ваш-client-id
INSTAGRAM_CLIENT_SECRET=ваш-client-secret
INSTAGRAM_REDIRECT_URI=https://yourdomain.com/auth/instagram/callback

# Фронтенд
FRONTEND_URL=https://yourdomain.com
VITE_API_URL=https://yourdomain.com
EOF
```

### 3. Собрать и запустить сервисы

```bash
# Собрать образы
docker compose build

# Запустить сервисы
docker compose up -d

# Проверить статус
docker compose ps

# Посмотреть логи
docker compose logs -f
```

### 4. Запустить миграции базы данных

```bash
docker compose exec backend npx prisma migrate deploy
```

### 5. Проверить развертывание

```bash
# Проверить здоровье backend
curl http://localhost:3001/health

# Должно вернуть: {"status":"ok"}
```

## Автоматическое развертывание через GitHub Actions

После настройки GitHub Secrets, каждый push в ветку `main` будет автоматически разворачивать приложение:

1. **Push в GitHub:**
   ```bash
   git push origin main
   ```

2. **GitHub Action выполнит:**
   - Подключение к серверу по SSH
   - Загрузку последнего кода
   - Обновление `.env` с секретами
   - Сборку Docker образов
   - Запуск миграций БД
   - Запуск контейнеров
   - Проверку health checks

3. **Мониторинг развертывания:**
   - Перейдите в GitHub → вкладка Actions
   - Кликните на последний запуск workflow
   - Смотрите логи в реальном времени

## Docker команды

### Просмотр сервисов

```bash
# Список запущенных контейнеров
docker compose ps

# Просмотр логов
docker compose logs

# Следить за логами
docker compose logs -f backend

# Логи конкретного сервиса
docker compose logs -f postgres
```

### Перезапуск сервисов

```bash
# Перезапустить все сервисы
docker compose restart

# Перезапустить конкретный сервис
docker compose restart backend

# Остановить все сервисы
docker compose down

# Запустить все сервисы
docker compose up -d
```

### Управление базой данных

```bash
# Доступ к базе данных
docker compose exec postgres psql -U instasales -d instasales

# Запустить миграции
docker compose exec backend npx prisma migrate deploy

# Сбросить БД (ОПАСНО: удаляет все данные)
docker compose exec backend npx prisma migrate reset

# Бэкап базы данных
docker compose exec postgres pg_dump -U instasales instasales > backup.sql

# Восстановить БД
docker compose exec -T postgres psql -U instasales instasales < backup.sql
```

### Отладка

```bash
# Войти в backend контейнер
docker compose exec backend sh

# Войти в frontend контейнер
docker compose exec frontend sh

# Проверить здоровье backend
docker compose exec backend wget -qO- http://localhost:3001/health

# Просмотр переменных окружения
docker compose exec backend env
```

## Оптимизации для production

### 1. Включить HTTPS с Let's Encrypt

```bash
# Установить certbot
sudo apt install certbot python3-certbot-nginx -y

# Получить сертификат
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Автообновление
sudo systemctl enable certbot.timer
```

### 2. Настроить Nginx Reverse Proxy

Включенный `nginx.conf` предоставляет:
- Ограничение количества запросов
- Gzip сжатие
- Заголовки безопасности
- SSL/TLS терминацию

Чтобы использовать:

```bash
# Запустить с nginx proxy профилем
docker compose --profile with-proxy up -d
```

### 3. Настроить мониторинг

```bash
# Установить инструменты мониторинга
docker run -d --name watchtower \
  -v /var/run/docker.sock:/var/run/docker.sock \
  containrrr/watchtower --cleanup
```

### 4. Настроить бэкапы

```bash
# Создать скрипт бэкапа
cat > /opt/insta-sales/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"
mkdir -p $BACKUP_DIR

# Бэкап базы данных
docker compose exec -T postgres pg_dump -U instasales instasales > $BACKUP_DIR/db_$DATE.sql

# Бэкап .env
cp .env $BACKUP_DIR/env_$DATE

# Сохранять только последние 7 дней
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "env_*" -mtime +7 -delete

echo "Бэкап завершен: $DATE"
EOF

chmod +x /opt/insta-sales/backup.sh

# Добавить в crontab (ежедневно в 2 ночи)
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/insta-sales/backup.sh >> /var/log/backup.log 2>&1") | crontab -
```

## Решение проблем

### Контейнеры не запускаются

```bash
# Проверить логи
docker compose logs

# Удалить volumes и перезапустить
docker compose down -v
docker compose up -d
```

### Проблемы с подключением к БД

```bash
# Проверить что БД запущена
docker compose ps postgres

# Проверить логи БД
docker compose logs postgres

# Проверить DATABASE_URL в .env
cat .env | grep DATABASE_URL
```

### Ошибки миграций

```bash
# Проверить статус миграций
docker compose exec backend npx prisma migrate status

# Принудительная миграция
docker compose exec backend npx prisma migrate resolve --applied <migration_name>
```

### Нехватка памяти

```bash
# Проверить использование памяти
docker stats

# Перезапустить сервисы
docker compose restart

# Рассмотреть увеличение ресурсов сервера
```

### Порт уже используется

```bash
# Найти процесс использующий порт 80
sudo lsof -i :80

# Убить процесс
sudo kill -9 <PID>

# Или изменить порт в docker-compose.yml
```

## Откат развертывания

```bash
# На сервере
cd /opt/insta-sales

# Проверить историю коммитов
git log --oneline -10

# Откат к предыдущему коммиту
git reset --hard <commit-hash>

# Пересобрать и перезапустить
docker compose down
docker compose build
docker compose up -d
```

## Мониторинг и логи

### Просмотр логов приложения

```bash
# Все сервисы
docker compose logs -f

# Только backend
docker compose logs -f backend

# Последние 100 строк
docker compose logs --tail=100 backend
```

### Мониторинг ресурсов

```bash
# Статистика в реальном времени
docker stats

# Проверить использование диска
docker system df
```

### Health проверки

```bash
# Backend health
curl http://localhost:3001/health

# Database health
docker compose exec postgres pg_isready -U instasales

# Все сервисы
docker compose ps
```

## Лучшие практики безопасности

1. **Храните секреты в безопасности:**
   - Никогда не коммитьте `.env` в git
   - Используйте сложные пароли
   - Регулярно меняйте секреты

2. **Обновляйте Docker:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **Регулярно проверяйте логи:**
   ```bash
   docker compose logs --tail=100
   ```

4. **Включите файрвол:**
   ```bash
   sudo ufw status
   ```

5. **Настройте fail2ban:**
   ```bash
   sudo apt install fail2ban -y
   sudo systemctl enable fail2ban
   ```

## Поддержка

- Проверьте логи: `docker compose logs`
- Посмотрите статус: `docker compose ps`
- Проверьте GitHub Actions: Repository → вкладка Actions
- Изучите это руководство для решения типичных проблем

---

Для настройки разработки смотрите [README_RU.md](README_RU.md)
