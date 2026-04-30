# css-lab — REDESIGN PLAN: lightweight visual refresh + corporate-search gap

**Branch:** `feature/lightweight-redesign`
**Audience:** `css-design-specialist` (исполнитель)
**Контекст:** делаем библиотеку заметно «легче» (по мотивам Open WebUI и `motor-selector/styles.css`) и достраиваем компоненты под `corporate-search/search-ui` (Vespa hybrid search по wiki + forum + каталог).

---

## 1. Что «тяжёлого» в текущем стиле css-lab

1. **Зелёный enterprise accent в light-теме.** В `variables.css`: `--accent: #2E8A3C` (mdm-зелёный) и `--accent-700: #236B2E`. Это «1С-зелёный», читается как корпоративный AS400. Поисковику нужен нейтральный синий типа `#1d4ed8` (motor-selector) или `#2563eb` (search-ui), без узнаваемого индустриального зелёного.
2. **Общий box-shadow слишком плотный.** `--shadow: 0 2px 10px rgba(0,0,0,0.06)` — это «один большой блюр». В motor-selector используют **слоистую тонкую тень**: `0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.10)` — даёт ощущение «лежит на бумаге», а не «приподнято над сценой». Та же ошибка в `card-elevated:hover { box-shadow: 0 12px 32px rgba(0,0,0,0.14) }` — слишком крупный лифт для поисковой выдачи.
3. **Border-radius половинчатый.** `--radius: 10px`, `--radius-sm: 6px`, `--radius-lg: 16px`. У кнопок и инпутов в реальности применяется 6–10px — это «середина 2010-х». Open WebUI / motor-selector используют **12–16px** на карточках и **8–10px** на инпутах/кнопках, что визуально мягче.
4. **Dark-тема — буквально AutoTrassir.** В `dark.css` — 9 уровней surface (`--surface-0..--surface-8`), 10 оттенков primary blue, фон `#0a0a0f`, тяжёлая тень `0 4px 25px rgba(0,0,0,0.5)`, photo-card hover `transform: translateY(-4px) + box-shadow 0 8px 32px rgba(0,0,0,0.5)`. Это VMS-dashboard дизайн (24/7 monitoring), не «лёгкий продуктовый UI».
5. **Border-цвет в light слишком серый.** `--border: #e1e1e1` + `--card-border: #d1d5db` — два разных серых, причём card-border темнее, чем общий border. Это даёт «обведённость» каждой карточки. У motor-selector один `--border: #d7dbe2` чуть холоднее и одинаковый везде — спокойнее.
6. **Кнопка `.btn` имеет ripple-эффект через `::after`** (50px анимация на `:active`). Это material-3 паттерн, не подходит к «лёгкому» Open-WebUI-стилю — там кнопка просто меняет фон без ripple.

---

## 2. Дизайн-философия (manifesto)

### Принцип 1. Тонкие границы вместо box-shadow
Карточки и панели разделяются **1px-границей** + **двойной тонкой тенью** (`0 1px 2px + 0 1px 3px`). Никаких `0 4px 20px` для элементов в потоке. Большие тени (`shadow-lg`) — только для floating-слоёв (modal, dropdown, command-palette, toast).

### Принцип 2. Нейтральная палитра + один низкоконтрастный accent
Уходим от mdm-зелёного `#2E8A3C` и от bright-blue `#2196f3` AutoTrassir. Один accent на всю light-тему — `#2563eb` (синхронно с `corporate-search/search-ui`), для dark — чуть светлее `#60a5fa`. Никаких параллельных акцентов «синий + зелёный + амбер» в одном экране. Семантические цвета (success/warning/error/info) — только для алертов и статус-индикаторов, не как декорация.

### Принцип 3. Воздух важнее декора
Padding'и в карточках 16→**20px**, в section'ах 16→**24px**. Между группами фильтров FacetSidebar — 16→**18-20px**. Snippet line-height 1.5→**1.55-1.6**. Лучше пустое поле, чем бордюр или цветная плашка-разделитель.

### Принцип 4. Скругления 12-16px на surface, 8-10px на controls
- Карточки, drawer, modal, panel: `12px` (search-result), `16px` (KGCard, AnswerBox).
- Кнопки, инпуты, селекты, badge: `8px`.
- Chip / pill: `9999px` (полный pill, остаётся).
- Tooltip, popover: `8px`.

### Принцип 5. Один плоский слой dark-темы вместо 9-уровневой иерархии
Dark редизайн оставляет максимум 3 surface-уровня (bg / panel / panel-elevated), а не 9. Граница вместо тени, как в light. AutoTrassir-компоненты (photo-card hover lift, lightbox, license-plate) выносим в отдельный namespace `.theme-autotrassir`, чтобы не тащились в дефолтную dark.

---

## 3. Gap-анализ: search-ui ↔ css-lab

| # | search-ui компонент | Аналог в css-lab | Что добавлять |
|---|---|---|---|
| 1 | `SearchInput` | `search` (есть `.search-input`) | Расширить: вариант `search-hero` (крупный, 56px высота, для главной) + slot под `RecentQueriesDropdown` снизу |
| 2 | `ResultCard` | `card` (общая) | Новый `.search-result` с tile-структурой `header → snippet → meta-row`, hover = только border-color + 1px shadow lift, левый цветной border 3px (`.card-source-{wiki,forum,catalog}`) |
| 3 | `SourceBadge` | `badge` | Новый `.source-badge` с тремя вариантами: `--wiki` (#16a34a), `--forum` (#9333ea), `--catalog` (#ea580c). Бекграунд — pastel `bg-{color}/10`, текст — насыщенный |
| 4 | `Highlight <mark>` | нет | `mark.hl` с `bg: #fff5b1`, `padding: 0 2px`, `border-radius: 3px`, `font-weight: 500`. Dark вариант: `bg: rgba(250,204,21,0.25); color: #fde68a` |
| 5 | `Snippet` | нет | `.snippet` — компактный prose: 13.5px / 1.55, `<strong>` semibold, `<code>` inline в `bg: #f1f5f9`, без `<h1-h6>` влияния |
| 6 | `FacetSidebar` | `sidebar` (общая) | Новый `.facet-list` + `.facet-item` (label + count, hover-bg, checkbox-вариант), `.facet-group` с collapsible header |
| 7 | `TagsFilter` | `chip` (есть multi-select) | Расширить `.chip` вариантом `.chip-filter` — toggle-state с галочкой, count-badge справа |
| 8 | `DateRangeFilter` | `date-picker` | Добавить `.date-range` wrapper: два инпута + presets (`Сегодня`, `Неделя`, `Месяц`) chip-row сверху |
| 9 | `Pagination` | `pagination` | Достаточно. Добавить компактный вариант `.page-bar-compact` (только prev/next + «N из M») |
| 10 | `SimilarDocs` | `modal` | Новый `.drawer` — right-side, 420px, sticky header «Похожие документы», close-btn, scrollable list |
| 11 | `AskInput` | `inputs` (textarea есть) | Новый `.ask-input` — multi-line с auto-grow, slot под кнопку send справа внизу, keybind hint `⌘+Enter` |
| 12 | `AskMessage` | нет | Новый `.chat-bubble` с двумя вариантами: `.chat-bubble--user` (bg accent-100, выровнено вправо) и `.chat-bubble--assistant` (bg panel, граница). Citation `[N]` — superscript-link |
| 13 | `ConfidenceBadge` | `badge` | Новый `.confidence-badge` 3 варианта: `--high` (success-tint), `--medium` (warning-tint), `--low` (error-tint), с lucide-иконкой |
| 14 | `CitationTooltip` | `tooltip` | Расширить: вариант `.tooltip-citation` шире (max 360px), с цитатой + «Открыть источник →» link + meta (date, author) |
| 15 | `GlossaryHover` | `tooltip` | Вариант `.tooltip-glossary` с dotted-underline на trigger, термин + определение + «Wikibase →» link |
| 16 | `ExampleQueriesChips` | `chip` | OK, нужен row-layout с горизонтальным scroll и `.chip-suggestion` (нейтральный фон, иконка `?`) |
| 17 | `RecentQueriesDropdown` | `dropdown` | Расширить: `.dropdown-history` с time-icon prefix + remove-x suffix per item, group-header «Недавние запросы» |
| 18 | `Suggestions` | `command-palette` (часть) | Достаточно — повторно использовать `.cmd-suggestion-list` с keybind hints |
| 19 | `ProfileSelector` | `dropdown` | OK, обычный dropdown |
| 20 | `FeedbackButtons` | `buttons` (icon-btn) | Новый `.feedback-row` — два icon-btn (👍/👎) + опциональное textarea-comment, разворачивается inline |
| 21 | `DebugPanel` | нет | Новый `.debug-panel` — collapsible под результатом, mono-font, table-like raw scores, color-coded BM25 vs vector |
| 22 | `Loading` | `spinner` | OK |
| 23 | `Empty` | `empty-state` | OK |
| 24 | `Banner` | `alerts` | OK |
| 25 | `ErrorToast` | `toast` | OK |
| 26 | `Nav` | `nav` | OK |
| 27 | `AuthBootstrap` | (technical, не UI) | — |
| 28 | `Filters` (wrapper) | `app-layout` | OK — это композиция facet+source+tags |

### Дополнительно из roadmap (Phase 7-14, см. corporate-search/TODO.md)

| # | Будущий компонент | Что нужно |
|---|---|---|
| 29 | `KGCard` (Wikibase entity) | Новый `.kg-card` — увеличенная карточка 16px radius, header с photo + entity-title, table-like properties, «See in Wikibase →» link |
| 30 | `AnswerBox` (featured snippet) | Новый `.answer-box` — крупный блок над выдачей, 16px radius, accent left-border 4px, body text 16px, source attribution внизу |
| 31 | `DataChip` (kW, IP54, RPM) | Новый `.spec-chip` — `value + unit` стиль, моно-шрифт для value, серый unit, без bg (или very-light) |
| 32 | `AdminPanel` (synonym CRUD, reindex) | Использовать существующие `table` + `modal` + `progress`. Доп. `.reindex-progress` с этапами steps + log-tail |
| 33 | `MatchFeaturesBar` | Новый `.match-bar` (debug) — горизонтальный stacked-bar BM25/vector/recency с tooltip на каждый сегмент |
| 34 | Onboarding tooltips | Расширить `tooltip` вариантом `.tooltip-tour` с кнопками «Назад/Далее/Пропустить» и step-indicator |

---

## 4. Рекомендации по dark-теме

Текущий `dark.css` — это AutoTrassir VMS dashboard. Для поисковика и каталога его надо **раздвоить**: оставить `theme-autotrassir.css` как есть для проекта Trassir, а `dark.css` сделать лёгкой версией.

Изменения в новом lightweight dark:

1. **Базовый surface светлее.** `--bg: #13151a` вместо `#0a0a0f` (как у Open WebUI / Linear / GitHub dark). `--panel: #1a1d24` (один уровень выше).
2. **Свернуть 9 surface-уровней до 3.** `--surface-bg`, `--surface-panel`, `--surface-elevated`. Остальные `surface-4..8` — выкинуть из основной dark, оставить только в `theme-autotrassir.css`.
3. **Убрать photo-card transform на hover.** `transform: translateY(-4px)` + `box-shadow: 0 8px 32px` — это AutoTrassir-специфичное «фото вылетает». В обычной search-result карточке оставить только border-color на hover, без translate.
4. **Тени — мягче.** `--shadow: 0 1px 2px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.4)` (слоистая, как в light), а не `0 4px 25px rgba(0,0,0,0.5)`.
5. **Accent — менее «электрик»**. `#2196f3` (material) → `#60a5fa` (tailwind blue-400, мягче на тёмном фоне, лучше WCAG на panel).
6. **Border видимый, но не пиксельно-резкий.** `--border: #2a2f3a` (между surface и panel по светлоте) — карточки разделяются, но не вырезаются как на белом.
7. **Selection/highlight для mark.** `bg: rgba(250,204,21,0.22); color: #fde68a` — пастельно-жёлтый на dark.

---

## 5. Цветовые токены — предложение

### Light theme (default)

```
--bg:              #f5f6f8   /* page background, нейтральный холодный */
--surface:         #ffffff   /* cards, panels */
--surface-muted:   #f9fafb   /* secondary blocks (facet group bg, snippet code-bg) */
--border:          #e5e7eb   /* default border */
--border-strong:   #d1d5db   /* hover/active border */

--text:            #111827   /* primary, contrast 16:1 на bg */
--text-secondary:  #4b5563   /* secondary, contrast 7:1 — WCAG AAA для small */
--text-muted:      #6b7280   /* muted captions, contrast 4.6:1 — WCAG AA для normal */
--text-disabled:   #9ca3af

--accent:          #2563eb   /* primary action, contrast 4.5:1 на white — AA */
--accent-hover:    #1d4ed8
--accent-soft:     #eff6ff   /* tint background для chip-active, badge */

--success:         #16a34a
--warning:         #d97706   /* darker amber для лучшего контраста на белом */
--error:           #dc2626
--info:            #0284c7

--highlight:       #fff5b1   /* mark.hl — пастельно-жёлтый */

--source-wiki:     #16a34a   /* зелёный — синхронно с search-ui */
--source-forum:    #9333ea   /* фиолетовый */
--source-catalog:  #ea580c   /* оранжевый */

--shadow-xs:       0 1px 2px rgba(16,24,40,0.06)
--shadow-sm:       0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.10)
--shadow-md:       0 4px 8px rgba(16,24,40,0.06), 0 2px 4px rgba(16,24,40,0.08)
--shadow-lg:       0 12px 24px rgba(16,24,40,0.10), 0 4px 8px rgba(16,24,40,0.06)

--radius-sm:       6px      /* small elements */
--radius:          8px      /* buttons, inputs, badges */
--radius-md:       12px     /* cards, panels */
--radius-lg:       16px     /* KGCard, AnswerBox, modal */
--radius-pill:     9999px
```

### Dark theme (lightweight, не AutoTrassir)

```
--bg:              #13151a
--surface:         #1a1d24
--surface-muted:   #20242d
--surface-elevated:#262a35  /* для floating: dropdown, modal, popover */
--border:          #2a2f3a
--border-strong:   #3a4050

--text:            #e5e7eb
--text-secondary:  #9ca3af   /* contrast 7:1 на bg — AAA */
--text-muted:      #6b7280   /* AA */
--text-disabled:   #4b5563

--accent:          #60a5fa   /* blue-400, мягче для dark */
--accent-hover:    #93c5fd
--accent-soft:     rgba(96,165,250,0.12)

--success:         #34d399
--warning:         #fbbf24
--error:           #f87171
--info:            #38bdf8

--highlight:       rgba(250,204,21,0.22)   /* yellow tint для mark */
--highlight-text:  #fde68a

--source-wiki:     #4ade80
--source-forum:    #c084fc
--source-catalog:  #fb923c

--shadow-xs:       0 1px 2px rgba(0,0,0,0.3)
--shadow-sm:       0 1px 2px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.4)
--shadow-md:       0 4px 8px rgba(0,0,0,0.4)
--shadow-lg:       0 12px 24px rgba(0,0,0,0.5)
```

### Обоснование

- **`#2563eb` accent (light)** — синхронно с `corporate-search/tailwind.config.ts` (исключаем drift). Контраст 4.5:1 на белом — WCAG AA для normal text, 3:1 для UI components — AA.
- **`text-muted #6b7280` → `text-secondary #4b5563`** — два уровня вместо одного. Secondary для важной meta (date, author), muted для captions/placeholders. Search-ui уже сделал такой сдвиг (`muted: #4b5563` AAA).
- **`#fff5b1` highlight** — точно как в search-ui, не меняем (UX-консистентность через приложения).
- **Source colors** взяты из search-ui Tailwind, в dark — сдвинуты в lighter shade (tailwind 400 вместо 600), чтобы давать AA на тёмном фоне.
- **Двойная тень `shadow-sm`** — паттерн motor-selector, дешевле визуально чем одинарная 0 2px 10px.

---

## 6. Чек-лист задач для css-design-specialist

### P0 — фундамент (без этого нельзя двигаться дальше)

1. **[P0] Переписать `styles/base/variables.css`** под новую токен-систему: убрать зелёный, ввести два уровня text, два уровня border, три уровня shadow, четыре уровня radius. Добавить source-color токены.
2. **[P0] Создать `styles/themes/light.css`** (сейчас он implicit в `:root`) — вынести явно, чтобы можно было переключаться `theme-light`/`theme-dark` без media-query.
3. **[P0] Переписать `styles/themes/dark.css`** в lightweight-вариант (3 surface-уровня, мягкие тени, без AutoTrassir-специфики).
4. **[P0] Создать `styles/themes/theme-autotrassir.css`** — перенести туда photo-card, lightbox, license-plate, 9-уровневый surface, тяжёлые тени. Подключается опционально для проекта AutoTrassir.

### P1 — критичные search-ui компоненты

5. **[P1] `components/search-result.css`** — карточка результата (title + snippet + meta-row), source-border-left, hover без transform, source-coded variants.
6. **[P1] `components/source-badge.css`** — badge с тремя вариантами `wiki/forum/catalog`, поддержка size sm/md.
7. **[P1] `components/highlight.css`** — `mark.hl`, light + dark, не наезжает на baseline KaTeX.
8. **[P1] `components/snippet.css`** — компактный prose (13.5px / 1.55), code/strong/ul/ol правила, гасит h1-h6.
9. **[P1] `components/facet.css`** — `.facet-list`, `.facet-item` (с count), `.facet-group` collapsible header.
10. **[P1] Расширить `components/chip.css`** — добавить `.chip-filter` (toggle с галочкой и count), `.chip-suggestion`, `.spec-chip` (data-chip с unit).
11. **[P1] `components/drawer.css`** — right-side drawer 420px для SimilarDocs (sticky header, scroll-body, close-btn).
12. **[P1] Сгладить `components/buttons.css` и `cards.css`** — убрать ripple на `.btn`, заменить `--shadow-lg` на двойную тонкую тень в `.card-elevated`, уменьшить hover translate с -3px до -1px.

### P2 — расширенные и debug-компоненты

13. **[P2] `components/chat-bubble.css`** — `.chat-bubble--user/--assistant` для AskMessage, citation `[N]` стиль (superscript link).
14. **[P2] `components/confidence-badge.css`** — 3 варианта high/medium/low с tint.
15. **[P2] Расширить `components/tooltip.css`** — варианты `.tooltip-citation` (wide, with link), `.tooltip-glossary` (dotted underline trigger), `.tooltip-tour` (onboarding с кнопками).
16. **[P2] `components/answer-box.css`** — featured snippet блок (16px radius, accent left-border 4px, large body).
17. **[P2] `components/kg-card.css`** — Wikibase entity card (16px radius, header с photo, table-properties).
18. **[P2] `components/debug-panel.css`** — collapsible debug блок + `.match-bar` stacked для скорингов.
19. **[P2] Расширить `components/inputs.css`** — `.ask-input` multi-line auto-grow с send-button slot и keybind hint.
20. **[P2] Обновить `index.html`** — добавить демо-секции для всех новых компонентов с light + dark toggle.

### P3 — полировка

21. **[P3] WCAG-аудит** всех вариантов: проверить contrast на bg / panel / chip-active, прогнать Pa11y или axe-core.
22. **[P3] Reduced-motion** — обернуть hover-transform и skeleton-shimmer в `@media (prefers-reduced-motion: no-preference)`.
23. **[P3] Документация** — короткий `STYLEGUIDE.md` с примерами composition (когда `card-source-wiki` + `source-badge`, когда `confidence-badge` + `chat-bubble`).

---

**Примечание по AutoTrassir:** не удалять компоненты — переносить в namespace `theme-autotrassir.css`. Проект автоТрассира не должен сломаться от этого редизайна.

**Принцип согласованности:** все токены для search-ui (accent, source-colors, highlight) держать **бит-в-бит** как в `corporate-search/tailwind.config.ts`. Если меняем здесь — обновляем там. Цель — единая дизайн-система между css-lab и Tailwind-проектами.
