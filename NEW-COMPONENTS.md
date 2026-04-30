# NEW-COMPONENTS — Roadmap для css-lab v2

Roadmap новых компонентов, которые требуются для corporate-search и других UI-проектов
(motor-selector, motor-datasheet, ragstack frontend). Все опираются на токены из
`styles/base/variables-v2.css`.

## Приоритеты

- **P0** — критично, без этого corporate-search не запустить
- **P1** — важно, расширяет UX до production-quality
- **P2** — nice-to-have, debug/admin/edge-case

## Таблица

| # | Компонент | Файл | Приоритет | Описание |
|---|-----------|------|-----------|----------|
| 1 | `search-result-card` | `styles/components/search-result-card.css` | **P0** | Карточка результата поиска. Прототип готов. Wrapper + header + snippet + meta + actions. Модификаторы `--compact`, `--selected`, `--skeleton`. Source-stripe слева. |
| 2 | `source-badge` | `styles/components/source-badge.css` | **P0** | Pill-бейдж wiki/forum/catalog. Варианты: solid (на nav), soft (в meta-row), outline. Цветная точка перед текстом. Размеры `--sm`/`--md`. |
| 3 | `snippet` | `styles/components/snippet.css` | **P0** | Параграф с markdown highlights, code, KaTeX. Стили для `mark.hl`, `code`, inline-formula. Reuse в search-result-card, ask-bubble, citation-tooltip. |
| 4 | `facet-sidebar` | `styles/components/facet-sidebar.css` | **P0** | Левая панель фильтров. Группы (collapsible), facet-item с count-pill, search inside facet, "show more". Sticky на desktop, drawer на mobile. |
| 5 | `facet-item` | `styles/components/facet-item.css` | **P0** | Один пункт фасета: checkbox/radio + label + count. Hover, selected, disabled (count=0). |
| 6 | `skeleton-search-result` | `styles/components/skeleton.css` | **P0** | Loading-плейсхолдеры. Варианты: card, line, avatar, badge. Pulse animation. |
| 7 | `search-input` | `styles/components/search-input.css` | **P0** | Большой главный input поиска. Иконка слева, clear-button справа, dropdown с suggestions. Sticky-вариант для results-page. |
| 8 | `ask-bubble` | `styles/components/ask-bubble.css` | **P1** | Chat-сообщение для AskMessage. Варианты `--user` / `--assistant`. Avatar, timestamp, copy-button, markdown-content. |
| 9 | `citation-link` | `styles/components/citation.css` | **P1** | Inline-ссылка `[1]` в ответе агента. Hover показывает tooltip. Click — flash-подсветка карточки-источника. |
| 10 | `citation-tooltip` | `styles/components/citation.css` | **P1** | Popover с превью источника (title + 2 строки snippet + source-badge). Позиционирование auto. |
| 11 | `confidence-badge` | `styles/components/confidence-badge.css` | **P1** | Бейдж уверенности high/medium/low. Иконка + текст + tooltip с объяснением. Для AskMessage header. |
| 12 | `spec-chip` | `styles/components/spec-chip.css` | **P1** | Чип со spec-параметром (5.5 kW, IP55, 1500 RPM). Варианты: solid, outline, removable (с ×), interactive (filter). |
| 13 | `drawer-right` | `styles/components/drawer.css` | **P1** | Правая выезжающая панель для SimilarDocs, Settings, FullText preview. Backdrop, focus-trap, escape-close. Width 420px desktop, 100% mobile. |
| 14 | `empty-search-state` | `styles/components/empty-state.css` | **P1** | "Ничего не найдено" + suggestions ("попробуйте", "уберите фильтр"). Иллюстрация (SVG/emoji), 2-3 quick-action chips. |
| 15 | `segmented-control` | `styles/components/segmented-control.css` | **P1** | Toggle-группа для ProfileSelector (Engineer/Manager/Search). Pill-style, animated thumb, keyboard-navigable. |
| 16 | `pagination-cursor` | `styles/components/pagination.css` | **P1** | "Загрузить ещё 10" + Prev/Next + jump-to-page. Cursor-based (не offset). Loading-state. |
| 17 | `kg-card` | `styles/components/kg-card.css` | **P2** | Knowledge Graph card справа от results. Entity name + type + properties + related-links. Compact/expanded. |
| 18 | `answer-box` | `styles/components/answer-box.css` | **P2** | Featured snippet наверху SERP — прямой ответ от LLM с citations. Большой radius (16px), мягкий accent border-left, copy-button. |
| 19 | `match-features-bar` | `styles/components/match-features.css` | **P2** | Debug-bars: BM25 / vector / rerank scores как горизонтальные 4px-полосы под карточкой. Только для admin/debug. |
| 20 | `glossary-hover` | `styles/components/glossary.css` | **P2** | Подчёркнутые термины (`<dfn>` / `data-glossary`) с hover-tooltip с определением. Для домен-специфичных слов (HVAC, electrical). |
| 21 | `breadcrumbs` | `styles/components/breadcrumbs.css` | **P2** | Хлебные крошки для каталога (motor-selector → series → motor). С separator (›/.), truncate-middle на mobile. |
| 22 | `tag-cloud` | `styles/components/tag-cloud.css` | **P2** | Облако тэгов для browse-режима. Размер шрифта по частоте, hover. |
| 23 | `result-list-toolbar` | `styles/components/result-toolbar.css` | **P1** | Sort + view-mode (cards/list/dense) + bulk-actions toolbar над results-list. |
| 24 | `query-builder-row` | `styles/components/query-builder.css` | **P2** | Advanced search: `field operator value` rows с AND/OR connectors. Add/remove buttons. |
| 25 | `notification-toast` | `styles/components/toast.css` | **P1** | Toast уведомления (success/error/info). Top-right corner, auto-dismiss, swipe-to-close, queue. |
| 26 | `keyboard-shortcuts-modal` | `styles/components/shortcuts.css` | **P2** | `?`-helper. Список всех keyboard shortcuts grouped by section (search/navigation/actions). `<kbd>` styling. |
| 27 | `command-palette` | `styles/components/command-palette.css` | **P2** | `Ctrl+K` palette. Fuzzy-search, sections, keyboard nav, recent commands. |
| 28 | `theme-toggle` | `styles/components/theme-toggle.css` | **P1** | Переключатель light/dark/system. Animated icon (sun→moon), 3-state. |
| 29 | `inline-error` | `styles/components/form-error.css` | **P1** | Inline-валидация под input. Иконка + текст error/warning. Анимация slide-in. |
| 30 | `loading-bar-top` | `styles/components/loading-bar.css` | **P1** | Тонкая 2px полоса прогресса наверху страницы (NProgress-style). Indeterminate animation. |

## Чек-листы качества для каждого нового компонента

- [ ] Использует ТОЛЬКО токены из `variables-v2.css`, без hardcoded цветов
- [ ] BEM-naming: `.block__element--modifier`
- [ ] Light + dark работают через CSS-переменные (а не `.dark .component { ... }` для каждого свойства)
- [ ] `:focus-visible` отдельно от `:focus`, использует `--shadow-focus`
- [ ] `prefers-reduced-motion` уважается (анимации отключаются автоматически через `--t-*`)
- [ ] WCAG AA контраст ≥4.5:1 для text/bg, ≥3:1 для UI-элементов
- [ ] Responsive: mobile (< 640px), tablet (640-1024), desktop (> 1024)
- [ ] Комментарии на русском для нетривиальных layout-решений
- [ ] Skeleton/loading state где применимо
- [ ] aria-* атрибуты задокументированы в комментарии

## Порядок реализации

**Sprint 1 (P0, MVP corporate-search):**
1. snippet (база для всех текстовых компонентов)
2. source-badge
3. search-result-card (прототип готов, доработать)
4. skeleton-search-result
5. search-input
6. facet-item → facet-sidebar

**Sprint 2 (P1, Q&A + UX polish):**
7. ask-bubble
8. citation-link + citation-tooltip
9. confidence-badge
10. spec-chip
11. drawer-right
12. segmented-control
13. empty-search-state
14. pagination-cursor
15. theme-toggle
16. notification-toast
17. inline-error
18. loading-bar-top
19. result-list-toolbar

**Sprint 3 (P2, advanced):**
20. kg-card
21. answer-box
22. command-palette
23. keyboard-shortcuts-modal
24. match-features-bar (debug)
25. остальное по запросу
