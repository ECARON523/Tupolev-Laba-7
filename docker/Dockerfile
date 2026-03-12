# Используем легковесный образ nginx
FROM nginx:alpine

# Копируем конфиг nginx
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Копируем файлы фронтенда
# frontend/src (код) идет в корень сервера
COPY frontend/src /usr/share/nginx/html
# frontend/public (картинки и манифест) в папку public
COPY frontend/public /usr/share/nginx/html/public

# Открываем порт 8080
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]