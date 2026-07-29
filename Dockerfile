# Образ сайта-витрины css-lab: статика под nginx.
# Модуль: docker. Зависимости: docker/nginx.conf, страницы сайта, styles/, js/, assets/.
# Сборки нет — проект на чистых CSS/JS без бандлера, файлы кладутся как есть.
#
# BASE_PATH — префикс размещения за reverse-proxy (например /css-lab для
# dashboard.veza.ru/css-lab/). При заданном префиксе корневые ссылки
# ("/styles/…", "/pages/…", url("/assets/…")) переписываются на этапе сборки.
# Пустой BASE_PATH (по умолчанию) — образ для корня домена, файлы не трогаются.

# Unprivileged-вариант официального nginx: процесс работает от nginx (101),
# слушает 8080 — закрывает Trivy DS-0002 (no root user)
FROM nginxinc/nginx-unprivileged:1.29-alpine

ARG BASE_PATH=""

LABEL org.opencontainers.image.title="css-lab" \
      org.opencontainers.image.description="Дизайн-система и сайт-витрина VEZA / Уралэлектро / HEMAH" \
      org.opencontainers.image.source="https://gitlab.veza.ru/beloborodov.dv/css-lab"

# Конфиг сайта вместо дефолтного (COPY от root: далее пути только на чтение)
USER root
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Статика сайта
WORKDIR /usr/share/nginx/html
COPY index.html components.html index-v3.html print-forms.html ral-colors.html main.js ./
COPY js/ ./js/
COPY pages/ ./pages/
COPY styles/ ./styles/
COPY assets/ ./assets/

# Переписывание корневых путей под BASE_PATH (только если префикс задан):
# html: href="/… src="/… url=/… (meta-refresh) и строки '/…' в инлайн-скриптах;
# css: url("/assets/…; js: строки '/pages/…' и т.п.
RUN if [ -n "$BASE_PATH" ]; then \
      find . -name '*.html' -exec sed -i \
        -e "s|href=\"/|href=\"${BASE_PATH}/|g" \
        -e "s|src=\"/|src=\"${BASE_PATH}/|g" \
        -e "s|url=/|url=${BASE_PATH}/|g" \
        -e "s|'/pages/|'${BASE_PATH}/pages/|g" \
        -e "s|'/components.html'|'${BASE_PATH}/components.html'|g" \
        -e "s|'/index.html'|'${BASE_PATH}/index.html'|g" \
        {} + ; \
      find . -name '*.css' -exec sed -i \
        -e "s|url(\"/|url(\"${BASE_PATH}/|g" \
        {} + ; \
      find . -name '*.js' -exec sed -i \
        -e "s|'/pages/|'${BASE_PATH}/pages/|g" \
        -e "s|'/components.html'|'${BASE_PATH}/components.html'|g" \
        -e "s|'/index.html'|'${BASE_PATH}/index.html'|g" \
        -e "s|'/assets/|'${BASE_PATH}/assets/|g" \
        {} + ; \
      # Файлы переезжают в физическую подпапку префикса: root-отдача nginx
      # без alias/rewrite-трюков (alias+try_files — известная ловушка)
      sub="${BASE_PATH#/}"; \
      mkdir /tmp/site && mv ./* /tmp/site/ && \
      mkdir -p "./${sub}" && mv /tmp/site/* "./${sub}/" && rmdir /tmp/site; \
    fi

# Обратно на непривилегированного пользователя образа
USER nginx

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
