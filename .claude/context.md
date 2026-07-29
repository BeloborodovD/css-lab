---
_meta:
  type: session-context
  project: css-lab
  updated: 2026-07-29
  export: false
---

# Контекст проекта css-lab

- **Последняя сессия:** 2026-07-29
- **Текущая задача:** витрина-библиотека элементов из проектов воркспейса + корпоративные темы брендов. Выполнено и проверено в браузере.

## Что сделано

### Бренды (переключатель в хедере и секции #brand, `data-brand` на body, дефолт — VEZA)

- **VEZA** (`themes/veza.css`): UI-акцент #2A7F37 (AA; эталон #2E8A3C в `--brand-veza` для плашек/печати), Roboto Medium/Light (fallback Arial), dark #5FC16F (hue 130° бренда).
- **Уралэлектро** (`themes/uralelectro.css`): #374A51 RAL 5008 (брендбук 2025; патина RAL 6026 удалена из базы), Wadik (заголовки, font-synthesis off) + NT Somic, dark #8FA6AE.
- **HEMAH** (`themes/hemah.css`): UI-акцент #2D6274 (AA), плашки #367589, CTA #2FC6F6 только как фон (текст `--brand-secondary-text`), Manrope + Open Sans; legacy-блок `.hemah` сохранён + dark.
- У всех: light/dark (селекторы `.dark[data-brand]`, `.dark [data-brand]` и `@media prefers-color-scheme`), брендовые highlight, `--brand-plate-bg` (не инвертируется), логотипы цвет/белый в `assets/logos/`.
- Шрифты в `assets/fonts/` (woff2): Wadik (SIL OFL + лицензия), NT Somic ×4, Roboto ×4, Manrope ×2, Open Sans ×2. `base/fonts.css`.

### Токены (`base/variables-v2.css` + `base/motion.css`)

- motion.css — единственный источник кривых (дубли `--ease-*` из variables удалены, `--ease` → алиас), reduced-motion — одна стратегия (200ms).
- Новое: `--font-display`, `--color-overlay`, `--color-on-accent-*` (слои на акценте), `--color-scrim-light/--color-on-scrim/--color-swatch-inset`, `--color-error-soft-hover`, `--duration-pulse`; фокус-кольцо двухслойное (WCAG 2.4.13), авто-перекрашивается темами.

### Компоненты `components-v3/` (новые, все на токенах, BEM + is-*)

user-menu, presence-strip («кто на портале»: стек аватаров + дропдаун ФИО/должность/раздел), brand-mark + brand-switcher, skeleton, drawer (z-modal, inert, focus-возврат), accordion (grid-rows + contain), picklist (чипы+чекбоксы+поиск, toggle-кнопка без nested-interactive), swatch-picker (RAL, скрим-плашки), quiz, form-section / row-card / save-status / rte (разнесены атомарно), filter-pills, spec-sheet (+`__footer`, `__text`, print-палитра), code-panel. Все панели: visibility-скрытие для a11y, transform-origin от триггера.

### Витрина `index-v3.html` + `main.js`

- Хедер: бренд-лого (паттерн DeepSearch), компактный brand-switcher, presence-strip; баннер/шапка/сайдбары не перекрываются (`--banner-h`).
- Ресайз сайдбаров двигает отступы центра (`--sidebar-w-left/right`).
- Date Picker переписан: dropdown из поля, режимы single/range, inline; генератор в main.js.
- Log viewer: тумблер Текст/JSON работает.
- Правки a11y по ревью: disclosure вместо role=menu, aria-pressed на свотчах/тумблерах, progressbar, aria-live в quiz, sr-only + aria-busy у skeleton, autocomplete, цели ≥24px.

### Отдельные страницы

- **`/print-forms.html`** — печатные формы A4 (даташит АДМ 132 S4 + опросный лист R&D): шапка листа с логотипом, таблицы, текстовые примечания, подвал «Лист N из M», @page-колонтитулы, переключатель бренда листа.
- **`/ral-colors.html`** — все 216 RAL Classic: код + русское название + HEX, поиск, копирование кода, печать. Ссылки на обе — внизу левого меню витрины.

### Ревью

5 локальных агентов (brand-identity, css, motion, a11y, frontend) отработали, ~90 находок; критичные и major исправлены. Отложено (minor): миграция combobox на is-*, консолидация 4 реализаций чипов в один блок, брейкпоинт-сетка 560/768/1024, roving tabindex в rte-toolbar.

### Доводка по замечаниям пользователя (вторая волна)

- Логотипы: viewBox всех SVG обрезан по контенту (UE пересчитан в нативных единицах — svgelements масштабирует мм→px, bbox надо умножать обратно; скрипт в скретчпаде `fix_ue_logo.py`), scale-хаки убраны, единая высота; `print-color-adjust: exact` на `.brand-mark` — лого печатается.
- VEZA — бренд по умолчанию, «нейтральный» убран из переключателей.
- Рабочий интерактив: строки формы (`.form-rows__add`/`.row-card__remove`, renumber), RTE-тулбар (Ж/К/Ч/З/списки/сброс через execCommand), swatch-picker — настоящий dropdown с 41 цветом (скролл), чипы-опции (`.chip-choice` + `[data-chip-multi]`), лог Текст/JSON, date-picker (dropdown single/range + inline, генератор в main.js).
- `index.html` в корне — редирект на `/index-v3.html` (вместо листинга live-server).
- Ссылки на страницы: кнопки «📄 Формы» и «🎨 RAL» в шапке + сайдбар + из секций.
- HEMAH добавлен в палитру (`--brand-hemah-*` в variables-v2, light/dark) и в переключатель print-forms.

### Сайт-витрина (архитектура агентов dev-ux + dev-css, реализация workflow)

- Слои: `styles/core.css` (единый бандл base→layout→components→themes; index-v3.css — алиас), `styles/layout/` (site-header/site-footer/page-shell/print-sheet), `styles/pages/<name>.css` (по-страничные, префиксы .hub-/.catalog-/.ds-/.dash-/.fp-/.login-/.pf-/.ral-), `js/site.js` (бренд+тема из localStorage, шапка).
- **Страницы**: `index.html` — hub в стиле engcalc (hero+штамп+нумерованные карточки); `pages/catalog.html` (живые фильтры motor-datasheet: filter-panel.css, пресеты, счётчики, диапазон, пилюли, сортировка); `pages/login.html`; `pages/datasheet.html`, `pages/dashboard.html`, `pages/form.html` (построены workflow: 3 агента параллельно). Все 9 страниц прошли Playwright-верификацию (PASS, без ошибок консоли).
- Шапка сайта копируется между маркерами `[BLOCK:site-header]`; бренд/тема живут в localStorage (css-lab-brand/-theme), анти-FOUC сниппет в head.
- **Тёмные темы**: решение зафиксировано — одна нейтральная zinc-база + брендовые акценты (аргументы в отчёте dev-css).
- **Emil/Apple-аудит** (14 находок) применён: тактильность ссылок-карточек и пунктов (:active), фокус и focus-visible в date-picker, exit-анимация и hover-пауза тостов, hover-intent тултипов (delay 400ms), асимметрия enter/exit поповеров (`--duration-exit` 140ms / `--duration-modal-exit` 240ms в motion.css), toast-progress через scaleX, цели ≥24px, login-спиннер без сдвига. Не применены (низкий приоритет): свайп мобильного date-picker, стрелочная навигация user-menu, кнопка в пустом состоянии каталога.

## Следующий шаг

Закоммитить, затем по желанию: доделки аудита (свайп bottom-sheet, стрелки в меню), консолидация чипов, миграция combobox-нэйминга.
