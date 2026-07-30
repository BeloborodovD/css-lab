# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Дизайн-система и сайт-витрина трёх брендов (VEZA / Уралэлектро / HEMAH). Чистые HTML/CSS/JS без сборщика и фреймворков. Ответы пользователю — на русском; комментарии в коде русские, идентификаторы и классы — английские.

Дополнительно обязателен [.claude/CLAUDE.md](.claude/CLAUDE.md): локальные агенты (`dev-ux` → `dev-brand-identity` → `dev-css` → `dev-web-animation` → `dev-frontend` → `dev-accessibility`), локальные скиллы и **свод правил движения** `.claude/skills/ui-motion-craft/RULES.md` — значения токенов копируются буквально; соблюдение принудительно проверяет хук `.claude/hooks/motion-lint.py`.

## Команды

```bash
npm run dev                      # live-server :5173, hot reload
npm run serve                    # http-server :5173 (без reload; его поднимает Playwright)
npm run test:e2e                 # все e2e-тесты (Playwright сам стартует serve)
npx playwright test -g "каталог" # один тест по имени
npx playwright test e2e/smoke.e2e.spec.ts --headed   # с браузером

make up / make prod / make health   # docker: dev :48621 / prod nginx :48620 / проверка
```

Тесты живут в `e2e/smoke.e2e.spec.ts` — смоук всех страниц (ошибки консоли, переключение бренда, интерактив). Новая страница или крупный компонент — добавь тест туда же.

## Архитектура каскада

Один бандл `styles/core.css` (`@import`-цепочка), порядок жёсткий и значимый:

1. `base/motion.css` — **единственный** источник кривых и длительностей (`--ease-out`, `--duration-*`). Хардкод `cubic-bezier`/`ms` в компонентах — дефект.
2. `base/variables-v2.css` — все остальные токены (цвета, шрифты, тени, z-index). В компонентах ни одного литерала цвета/отступа — только `var()`.
3. `base/fonts.css`, `reset.css`, `utilities.css`, `responsive.css`.
4. `layout/` — каркас сайта: site-header, site-footer, page-shell, print-sheet.
5. `components-v3/*.css` — один компонент = один файл, BEM + состояния `is-*`.
6. `themes/` — последними: `dark-v3.css` (нейтральная тёмная база), затем бренды `veza.css` / `uralelectro.css` / `hemah.css`.

`base/animations.css` в core **не входит** (легаси-зверинец, конфликтует с motion-контрактом) — его подключает только витрина `components.html` отдельным `<link>`.

## Брендинг и темы

- Бренд — атрибут `data-brand` на `<body>` (`veza` — дефолт, `uralelectro`, `hemah`); тёмная тема — класс `.dark`. Комбинации перекрываются селекторами `.dark[data-brand]` / `.dark [data-brand]` + `@media (prefers-color-scheme: dark)`.
- Выбор хранится в localStorage: `css-lab-brand`, `css-lab-theme`; читается анти-FOUC-сниппетом в `<head>` каждой страницы и `js/site.js`.
- Тема бренда переопределяет токены (`--color-accent`, `--font-display`, `--brand-logo`...) — компоненты о брендах не знают.
- Логотипы в `assets/logos/` (цвет + `-mono-light`), шрифты в `assets/fonts/` (woff2, лицензии рядом).

## Страницы

- `index.html` — хаб (вход сайта), `components.html` — витрина компонентов (`index-v3.html` — редирект-заглушка на неё), `pages/*` — примеры (catalog, login, datasheet, dashboard, form), `print-forms.html`, `ral-colors.html`.
- Каждая страница: `core.css` + свой `styles/pages/<name>.css` с уникальным префиксом классов (`.hub-`, `.catalog-`, `.ds-`, `.dash-`, `.fp-`, `.pf-`, `.ral-`). Шапка сайта копируется между маркерами `[BLOCK:site-header]`.
- Интерактив витрины — `main.js` (только components.html), общий хром страниц — `js/site.js`. Данные RAL — общий `assets/ral-data.js` (216 цветов).
- Чек-лист добавления страницы — в `.claude/context.md`.

## Код-стайл

- Каждый логический блок обёрнут тегами `[BLOCK:name]` / `</BLOCK:name>` (также `CONFIG`, `TEST`) — это grep-цели, имена стабильны.
- Файлы писать только инструментами Write/Edit: PowerShell `Set-Content`/`Out-File` добавляет UTF-8 BOM, ломающий кириллицу и реестр агентов.
- Панели/дропдауны: скрытие через `visibility` + `opacity` (не `display`), `transform-origin` от триггера, асимметрия enter/exit (`--duration-exit`), hover-эффекты за `@media (hover: hover) and (pointer: fine)`.

## CI и деплой

- CI — Gitea Actions (`.gitea/workflows/ci.yml`, devstack `gitea_admin/css-lab`): e2e-гейт (без continue-on-error) + Trivy/Gitleaks/Semgrep (SARIF) → SonarQube (гейт информативный). Основной репозиторий — GitLab `beloborodov.dv/css-lab`.
- Прод — `Dockerfile` на `nginx-unprivileged` (:8080, non-root). Build-arg `BASE_PATH` переписывает абсолютные пути sed-ом и переносит файлы в физическую подпапку образа — для деплоя за префиксом `dashboard.veza.ru/css-lab/` (`docker-compose.hr.yml`, внешняя сеть `frontend`). `alias`+`try_files` в nginx для этого не работает — не возвращаться к нему.
