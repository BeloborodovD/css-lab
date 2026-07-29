# Образ витрины компонентов css-lab: статика под nginx.
# Модуль: docker. Зависимости: docker/nginx.conf, index-v3.html, styles/, assets/, main.js.
# Сборки нет — проект на чистых CSS/JS без бандлера, файлы кладутся как есть.

FROM nginx:1.29-alpine

LABEL org.opencontainers.image.title="css-lab" \
      org.opencontainers.image.description="Витрина CSS-компонентов VEZA / Уралэлектро" \
      org.opencontainers.image.source="https://github.com/veza/css-lab"

# Конфиг сайта вместо дефолтного
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Статика витрины
WORKDIR /usr/share/nginx/html
COPY index-v3.html main.js ./
COPY styles/ ./styles/
COPY assets/ ./assets/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1/healthz || exit 1
