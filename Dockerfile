# Этап сборки
FROM node:24.11.1-alpine AS build

WORKDIR /storage-system-front

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем React приложение
RUN npm run build

# Этап production
FROM nginx:alpine

# Копируем собранное приложение - ИСПРАВЛЕНО: /storage-system-front/build
COPY --from=build /storage-system-front/build /usr/share/nginx/html

# Копируем конфигурацию nginx (если есть)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]

# Билд
# docker build -t storage-system-front .

# Запуск
# docker run -d -p 3000:80 --name storage-system-front

# Запущенные контейнеры
#docker ps

# Остановить контейнер
#docker stop storage-system-front

# Удалить контейнер
#docker rm storage-system-front