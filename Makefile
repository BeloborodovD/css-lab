# Управление витриной компонентов css-lab.
# Модуль: docker. Зависимости: docker-compose.yml, Dockerfile, docker/nginx.conf.
#
# GNU Make 4.4.1 (portable, ~/tools/make/bin). Рецепты исполняются через sh из
# состава Git for Windows — короткий путь 8.3 нужен, потому что make ломается
# на пробелах в значении SHELL.

ifeq ($(OS),Windows_NT)
    SHELL := C:/PROGRA~1/Git/usr/bin/sh.exe
    .SHELLFLAGS := -c
    OPEN := start
else
    OPEN := xdg-open
endif

DC        := docker compose
DC_ALL    := docker compose --profile prod
DEV_URL   := http://localhost:48621/
PROD_URL  := http://localhost:48620/
IMAGE     := css-lab:latest

.DEFAULT_GOAL := help

# ==================== Справка ====================

# [BLOCK:make.help]
# Текст справки намеренно на ASCII: make собран под Windows32 и прогоняет
# рецепты через ANSI-кодировку, из-за чего UTF-8 кириллица в echo превращается
# в мусор независимо от codepage консоли. Комментарии этим не затронуты.
## help: показать этот список команд
help:
	@echo ""
	@echo "  css-lab -- CSS component showcase"
	@echo ""
	@echo "  Design work (live-server, hot reload):"
	@echo "    make up          start dev container            $(DEV_URL)"
	@echo "    make open        open dev in browser"
	@echo "    make logs        follow logs of all containers (Ctrl+C to exit)"
	@echo "    make logs-dev    follow dev logs only"
	@echo ""
	@echo "  Production (nginx, static baked into image):"
	@echo "    make prod        build image and start nginx     $(PROD_URL)"
	@echo "    make open-prod   open prod in browser"
	@echo "    make build       build image only, do not start"
	@echo "    make rebuild     rebuild image and recreate web"
	@echo ""
	@echo "  Lifecycle:"
	@echo "    make stop        stop containers, keep them"
	@echo "    make start       start stopped containers again"
	@echo "    make restart     restart everything"
	@echo "    make down        stop and remove containers"
	@echo "    make ps          container status"
	@echo "    make health      check both profiles respond"
	@echo ""
	@echo "  Debug:"
	@echo "    make shell       shell into prod container (nginx)"
	@echo "    make shell-dev   shell into dev container (node)"
	@echo "    make nginx-test  validate nginx.conf syntax"
	@echo "    make size        image size and layers"
	@echo ""
	@echo "  Cleanup:"
	@echo "    make clean       down + remove css-lab image"
	@echo "    make prune       clean + prune dangling docker images"
	@echo ""
# </BLOCK:make.help>

# ==================== Разработка ====================

## up: поднять dev-контейнер с автоперезагрузкой
up:
	$(DC) up -d
	@echo ""
	@echo "dev is up: $(DEV_URL)"

## logs: логи всех контейнеров
logs:
	$(DC_ALL) logs -f

## logs-dev: логи только dev-контейнера
logs-dev:
	$(DC) logs -f dev

## open: открыть dev в браузере
open:
	$(OPEN) $(DEV_URL)

# ==================== Боевой режим ====================

## prod: собрать образ и поднять nginx
prod:
	$(DC_ALL) up -d --build
	@echo ""
	@echo "prod is up: $(PROD_URL)"

## build: только собрать образ
build:
	$(DC_ALL) build web

## rebuild: пересобрать образ и пересоздать web
rebuild:
	$(DC_ALL) up -d --build --force-recreate web

## open-prod: открыть prod в браузере
open-prod:
	$(OPEN) $(PROD_URL)

# ==================== Управление ====================

## stop: остановить контейнеры, не удаляя
stop:
	$(DC_ALL) stop

## start: запустить остановленные контейнеры
start:
	$(DC_ALL) start

## restart: перезапустить контейнеры
restart:
	$(DC_ALL) restart

## down: остановить и удалить контейнеры
down:
	$(DC_ALL) down

## ps: статус контейнеров
ps:
	$(DC_ALL) ps

# [BLOCK:make.health]
## health: проверить отдачу обоих профилей
health:
	@printf 'dev   $(DEV_URL)  -> '
	@curl -s -o /dev/null -w '%{http_code}\n' $(DEV_URL) 2>/dev/null || echo 'unreachable'
	@printf 'prod  $(PROD_URL)  -> '
	@curl -s -o /dev/null -w '%{http_code}\n' $(PROD_URL) 2>/dev/null || echo 'unreachable'
	@printf 'healthz              -> '
	@curl -s -o /dev/null -w '%{http_code}\n' $(PROD_URL)healthz 2>/dev/null || echo 'unreachable'
# </BLOCK:make.health>

# ==================== Отладка ====================

## shell: shell внутрь prod-контейнера
shell:
	docker exec -it css-lab-web sh

## shell-dev: shell внутрь dev-контейнера
shell-dev:
	docker exec -it css-lab-dev sh

## nginx-test: проверить синтаксис конфига nginx
nginx-test:
	docker exec css-lab-web nginx -t

## size: размер образа и его слоёв
size:
	@docker images $(IMAGE) --format 'image: {{.Repository}}:{{.Tag}}  {{.Size}}'
	@docker history $(IMAGE) --format '{{.Size}}\t{{.CreatedBy}}' --no-trunc | head -8

# ==================== Очистка ====================

## clean: down + удалить образ
clean: down
	-docker rmi $(IMAGE)

## prune: clean + подчистить висячие образы
prune: clean
	docker image prune -f

.PHONY: help up logs logs-dev open prod build rebuild open-prod \
        stop start restart down ps health shell shell-dev \
        nginx-test size clean prune
