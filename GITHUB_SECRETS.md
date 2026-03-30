# GitHub Secrets Configuration

Для автоматического деплоя через GitHub Actions нужно настроить следующие секреты.

## Как добавить секреты

1. Откройте ваш репозиторий на GitHub
2. Перейдите в `Settings` → `Secrets and variables` → `Actions`
3. Нажмите `New repository secret`
4. Добавьте каждый секрет из списка ниже

## Обязательные секреты

### SSH Connection
```
SERVER_HOST
Описание: IP адрес или домен вашего сервера
Пример: 123.456.789.0 или myserver.com
```

```
SERVER_USER
Описание: Имя пользователя SSH
Пример: ubuntu (для Ubuntu) или root
```

```
SERVER_SSH_KEY
Описание: Приватный SSH ключ для подключения
Как получить: cat ~/.ssh/id_rsa
Должен включать:
-----BEGIN RSA PRIVATE KEY-----
...весь ключ...
-----END RSA PRIVATE KEY-----
```

```
SERVER_PORT (опционально)
Описание: SSH порт
Значение по умолчанию: 22
```

### Database
```
POSTGRES_PASSWORD
Описание: Пароль для PostgreSQL
Как сгенерировать: openssl rand -base64 24
Пример: aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU
```

```
POSTGRES_USER (опционально)
Описание: Имя пользователя PostgreSQL
Значение по умолчанию: instasales
```

```
POSTGRES_DB (опционально)
Описание: Название базы данных
Значение по умолчанию: instasales
```

### Security
```
JWT_SECRET
Описание: Секретный ключ для подписи JWT токенов
Как сгенерировать: openssl rand -base64 32
Пример: vW8xY0zA2bC4dE6fG8hI0jK2lM4nO6pQ8rS0tU2vW4xY
```

### Application URLs
```
FRONTEND_URL
Описание: URL вашего фронтенда (домен или IP)
Пример: https://myapp.com или http://123.456.789.0
```

```
VITE_API_URL
Описание: URL API для фронтенда (обычно такой же как FRONTEND_URL)
Пример: https://myapp.com или http://123.456.789.0
```

## Опциональные секреты (Instagram OAuth)

```
INSTAGRAM_CLIENT_ID
Описание: Instagram App ID из Facebook Developers
Как получить: developers.facebook.com → Ваше приложение → Basic Settings
```

```
INSTAGRAM_CLIENT_SECRET
Описание: Instagram App Secret из Facebook Developers
Как получить: developers.facebook.com → Ваше приложение → Basic Settings → Show
```

```
INSTAGRAM_REDIRECT_URI
Описание: OAuth redirect URI
Формат: https://ваш-домен.com/auth/instagram/callback
Пример: https://myapp.com/auth/instagram/callback
Важно: Должен точно совпадать с настройками в Facebook Developers
```

## Быстрая генерация секретов

Выполните на своей локальной машине:

```bash
# JWT Secret
echo "JWT_SECRET: $(openssl rand -base64 32)"

# PostgreSQL Password
echo "POSTGRES_PASSWORD: $(openssl rand -base64 24)"

# SSH Key
echo "SERVER_SSH_KEY:"
cat ~/.ssh/id_rsa
```

## Проверка секретов

После добавления всех секретов, у вас должно быть минимум:

✅ SERVER_HOST
✅ SERVER_USER
✅ SERVER_SSH_KEY
✅ POSTGRES_PASSWORD
✅ JWT_SECRET
✅ FRONTEND_URL
✅ VITE_API_URL

## Пример полного набора секретов

```
SERVER_HOST=123.456.789.0
SERVER_USER=ubuntu
SERVER_SSH_KEY=-----BEGIN RSA PRIVATE KEY-----...-----END RSA PRIVATE KEY-----
SERVER_PORT=22
POSTGRES_USER=instasales
POSTGRES_PASSWORD=aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU
POSTGRES_DB=instasales
JWT_SECRET=vW8xY0zA2bC4dE6fG8hI0jK2lM4nO6pQ8rS0tU2vW4xY
FRONTEND_URL=https://myapp.com
VITE_API_URL=https://myapp.com
INSTAGRAM_CLIENT_ID=123456789012345
INSTAGRAM_CLIENT_SECRET=abcdef1234567890abcdef1234567890
INSTAGRAM_REDIRECT_URI=https://myapp.com/auth/instagram/callback
```

## После добавления секретов

1. Сделайте push в ветку `main`:
   ```bash
   git push origin main
   ```

2. Перейдите в `Actions` на GitHub

3. Следите за процессом деплоя

4. После успешного деплоя приложение будет доступно по адресу `FRONTEND_URL`

## Безопасность

- ❌ **Никогда** не коммитьте секреты в git
- ❌ **Никогда** не публикуйте секреты в Issues или Pull Requests
- ✅ Используйте сложные пароли
- ✅ Регулярно меняйте JWT_SECRET
- ✅ Используйте HTTPS в production
- ✅ Ограничьте SSH доступ только для вашего IP

## Помощь

Если деплой не работает:

1. Проверьте логи в GitHub Actions
2. Убедитесь что все обязательные секреты добавлены
3. Проверьте что SSH ключ корректный (включая BEGIN/END строки)
4. Убедитесь что у пользователя SERVER_USER есть права на docker
5. Проверьте что сервер доступен по SSH вручную

---

Подробнее см. [DEPLOYMENT.md](DEPLOYMENT.md) или [DEPLOYMENT_RU.md](DEPLOYMENT_RU.md)
