---
_meta:
  type: pipeline-backlog
  pipeline: redesign-by-css-lab
  export: false
---

# Backlog библиотеки

Сюда уходят находки, которые нельзя чинить «на ходу» внутри шага 03 (см.
предохранители в [steps/03-library-first.md](steps/03-library-first.md)): попутные
улучшения, замеченные дефекты соседних компонентов, идеи. Разбирается отдельной
работой, а не посреди редизайна.

Формат строки: `- [ ] <что> — <почему> (нашёл: шаг/прогон)`.

## Открыто

- [ ] Шапки CSS-файлов ссылаются на внутренние проекты-доноры («порт потребности
      опросного листа R&D») — для внешних коллег, у которых доступа к этим
      проектам нет, это шум. Переписать на общее описание случая применения,
      донора оставить максимум как пометку в скобках. (Реестр паспортов уже
      пишется по этому правилу — привести код в соответствие.)
- [ ] README библиотеки для внешнего потребителя: что это, как подключить к
      своему проекту (vendor-слой, порядок каскада, тема бренда), где смотреть
      витрину, где реестр паспортов. Сейчас входная точка — CLAUDE.md, написанный
      для агентов, а не для человека со стороны.
- [ ] Миграция каскада на CSS `@layer` (сейчас приоритеты держатся на порядке
      `@import` — хрупко, см. §3 скилла css-architecture-craft).
- [ ] Консолидация четырёх реализаций чипов в один компонент.
- [ ] Миграция combobox на нейминг `is-*` (сейчас двойные алиасы `.open`/`.is-open`).
- [ ] Тёмная тема для страниц `print-forms.html` и `ral-colors.html`.
- [ ] Заголовкам h1–h6 не назначена токен-шкала `--fs-*` — размеры браузерные
      (2em…0.67em), в паспортах и типографике это видно как пробел.

### Найдено при написании паспортов и скилла (2026-07-30)

#### Дефекты разметки и мёртвый код

- [ ] Двойной разделитель хлебных крошек: `nav.css` рисует `::after` с «/» без
      ограничения родителем, а страницы каталога и даташита ставят ещё и явный
      `.breadcrumb-separator`. Реальный визуальный баг.
- [ ] Расхождение имён классов между витриной и CSS — демо не работают как
      задумано: `command-palette`, `empty-state`, `avatar` (статус), `divider`
      (подпись через `data-text`, CSS ждёт `.divider-text`), `file-upload`
      (оверлей превью не раскрывается).
- [ ] Мёртвый код: `.demo-app-layout/-sidebar/-content` (нет в разметке),
      `components/footer.css .footer` (живёт `layout/site-footer.css`),
      `nav.css .nav/.page-nav`, `search-result-card` (ноль вхождений в HTML/JS).
- [ ] Секция Dropdown на витрине без `id` — на компонент нечем сослаться;
      у autotrassir якорь по смыслу чужой (`#logs`).
- [ ] Нет демо-секций: `app-layout`, `filter-panel`, `presence-strip`,
      `search-result-card`; `row-card`/`rte`/`save-status` показаны внутри чужой
      секции `#form-section`.

#### Дубликаты (кандидаты на консолидацию)

- [ ] `.tag*` (badge.css) ↔ `.chip*` — одна роль, разные имена, оба на витрине.
- [ ] `.alert-box*` (logs.css) ↔ `.alert*` (alerts.css) — две реализации
      info/warning/error/success.
- [ ] Три реализации точки статуса: autotrassir, `.footer-status-dot`,
      `.avatar-status-*`.
- [ ] `.sidebar` объявлен и в `layout.css`, и в `sidebar.css`, а разметка
      использует третий вариант `.app-sidebar`; `.search-bar` переопределён в
      двух файлах — поведение зависит от порядка импорта.
- [ ] Шторки: `modal.css .modal-drawer/.modal-bottom-sheet` ↔ `drawer.css`,
      плюс нижний лист независимо переизобретён в `notification-panel` и
      `picklist__panel--sheet`.
- [ ] `filter-panel .filter-range` ↔ `inputs .input-range`; `notification-count/
      -dot` ↔ `badge`; `.popover` ↔ `.dropdown-menu` ↔ `filter-panel`.
- [ ] `spinner.css` держит собственный `.skeleton*` с шиммером, который мёртв —
      `skeleton.css` импортируется позже и перебивает базу; два набора имён на
      один компонент.
- [ ] `sidebar.css` ↔ `app-layout.css`: каркас, мобильная шторка и весь блок
      ручки ресайза продублированы; на витрине работают обе реализации.
- [ ] `tree.css` содержит две независимые реализации дерева (`.tree*` по
      `li.open` и `.tree-modern-*` по `.expanded` с `max-height: 1000px`).
- [ ] `stats.css` ↔ `.sidebar-stat*`; `.stat-progress-bar/-fill` дублирует
      `progress.css`.
- [ ] `tooltip.css` — четыре параллельные реализации одного компонента
      (`[data-tooltip]`, `.has-tooltip`, `.tooltip`, `.tooltip-popup`).
- [ ] `spec-sheet .spec-table` ↔ `table .table`: дублирование объявлено
      намеренным (самодостаточность при вендоринге), но правила выбора между
      ними для внешнего потребителя нет — описать в паспортах явно.
- [ ] Четыре keyframes пульса на одну задачу: `skeleton-pulse`, `tree-skeleton`,
      `pulse` (utilities), `skeleton-shimmer`.
- [ ] `toast`: витрина пишет `.toast-info/-success`, CSS определяет
      `.toast.info/.success` — демо-тосты без семантического канта (на странице
      формы разметка правильная).
- [ ] `tag-cloud.css` мимо контракта: кегли 10–15px, зазоры литералом,
      `animation: pulse 1.4s ease-in-out infinite` вместо motion-токенов.
- [ ] `table.css` тащит легаси `.veza-header` — печатная шапка внешнего
      документа, к таблице отношения не имеющая.
- [ ] Демо `steps`: номер шага задан и текстом в разметке, и через `counter()`
      — на витрине накладываются.
- [ ] Нет образца на витрине у 10 записей реестра: `app-layout`, `dropdown`
      (секция без `id`), `filter-panel`, `footer`, `nav`, `presence-strip`,
      `search-result-card`, `sidebar`, `site-header`, `site-footer`.

#### Долги закона (см. скилл css-architecture-craft)

- [ ] Состояния без JS-сеттера: `.picklist__panel--top` (комментарий обещает JS),
      `table.css .is-highlighted`.
- [ ] Легаси-нейминг состояний: `.open`/`.is-open` дублями, `.chip-active`,
      `.dropdown-item.active`, `.sidebar.resizing`, `.toast-enter/-exit`,
      `.file-dropzone.drag-over`, `.btn-loading` — привести к `is-*`.
- [ ] Токены-сироты: `--t-instant`, `--z-base`, `--lh-loose`, `--space-24`,
      `--icon-size-lg`, `--max-prose-w`, шкала `--breakpoint-*`.
- [ ] Цветовые литералы вне белого списка: `chip`, `progress`, `steps`, `logs`,
      `swatch-picker`, `autotrassir`, `buttons`; отдельно `notification-badge`
      — пять keyframes на дотокенной палитре, которой нет ни в одной теме.
- [ ] Кегль литералом (14 вхождений) и отступы мимо шкалы `--space-*` (~11).
- [ ] `buttons.css` задаёт тач-цели числом (44/48/36px) при существующем
      `--touch-target-min`.
- [ ] Легаси-токены движения `--t`, `--t-fast`, `--ease` вместо
      `--duration-*`/`--ease-out`: `footer`, `logs`, `pagination`,
      `notification-badge`, `progress`, `search-result-card`, `layout`,
      `buttons`, `file-upload`, частично `modal`.
- [ ] `spinner.css .spinner-pulse` анимируется из `scale(0)` — прямой запрет
      ui-motion-craft §3; бесконечные индикаторы используют `--ease-in-out`
      там, где нужен `linear`.
- [ ] `variables.css` держит полную копию блока `.dark` в
      `@media (prefers-color-scheme: dark)` — правится в двух местах, кандидат
      на рефактор.

## Сделано

- [x] Версии убраны из имён файлов (`variables-v2` → `variables`, `components-v3/`
      → `components/`, `dark-v3` → `dark`), версия — через build-arg `APP_VERSION`.
