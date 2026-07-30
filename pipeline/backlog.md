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

- [ ] Утилиты `base/utilities.css` и адаптивные помощники `base/responsive.css`
      живут в слое `base` (слабее компонентов) — так было и при порядке
      `@import`, и при миграции на `@layer` приоритет сохранён намеренно.
      Семантически им место в отдельном слое `utilities` поверх компонентов
      (`.p-0` на карточке обязан побеждать), но это меняет приоритеты в
      разметке, где утилита стоит рядом с классом компонента. Отдельной
      задачей: перенести слой, прогнать e2e и глазами проверить страницы.
- [ ] `combobox.css` в блоке `prefers-reduced-motion` держит
      `transition: none !important` и `transition: … !important` — «выключатели»,
      которые свод запрещает (мягче, но не ноль). После перехода на `@layer`
      длительность им всё равно диктует `base/motion.css` (важное объявление
      более раннего слоя сильнее), так что правила наполовину мертвы: их надо
      переписать так же, как уже переписаны `alerts.css` и
      `notification-badge.css`. Та же проверка — `date-picker.css`.
- [ ] Упоминания внутренних проектов остались в комментариях ВНУТРИ файлов
      (не в шапках): `base/variables.css` — «motor-datasheet style»,
      «motor-selector card baseline», «corporate-search» у шкалы кегля,
      «старый AutoTrassir-dark»; `themes/dark.css` — сравнение с прежней
      версией. Шапки переписаны 30.07, внутренние пометки — отдельным
      проходом вместе с ревизией самих комментариев.
- [ ] Свести оставшиеся чипы к одному компоненту: `.picklist__chip`,
      `.swatch-picker__chip`, `.combobox-tag` — каждый со своим контрактом с JS
      и e2e-локаторами, поэтому 30.07 сведены только `.tag` → `.chip`.
      `.filter-pill` остаётся отдельным компонентом осознанно (пара
      «поле: значение», всегда удаляемая) — это записано в его паспорте.
- [ ] Тёмная тема для страниц `print-forms.html` и `ral-colors.html`.
- [ ] Базовый кегль текста не привязан к шкале: `body` в `base/reset.css`
      наследует браузерные 16px, тогда как `--fs-base` = 14px. Абзацы без
      класса живут мимо шкалы; правка ломающая (поедут все страницы) —
      нужно решение по составу шкалы, а не точечная замена.
- [ ] Ступени ширины `.container` (448/720/960/1200/1440) записаны числами:
      токенов ширины контейнера нет, а единственный существующий
      `--max-content-w` (1280px) описывает другую величину. Либо шкала
      `--container-*`, либо явная запись в белый список литералов §5.
- [ ] Fluid-типографика в `base/responsive.css` (`.text-fluid-*`, `h1.fluid`
      и соседи) задаёт кегль литералами внутри `clamp()` — параллельная шкала
      в rem рядом со шкалой `--fs-*` в px.
- [ ] `base/animations.css` заводит собственные словари движения
      (`--duration-instant…-slowest`, `--ease-standard/-decelerate/-accelerate/
      -bounce/-spring/-smooth`). С именами `motion.css` они не пересекаются,
      поэтому бандл не ломают, но это второй словарь кривых и длительностей
      в репозитории — при разборе легаси-зверинца решать вместе с файлом.
- [ ] В шкале `--space-*` нет ступени 2px, и она нужна в двух ролях:
      `padding: 2px var(--space-2)` у `kbd` (`themes/dark.css`) и
      `outline-offset: 2px` у фокус-кольца (`base/reset.css`,
      `themes/dark.css`, компоненты). Либо ступень `--space-0-5`, либо
      отдельный токен отступа контура — решать вместе с владельцем шкалы.
- [ ] Легаси-длительности без потребителей: `--transition-fast`,
      `--transition-slow`, `--t-slower` (последний потребитель
      `--transition-slow` ушёл вместе с `.bottom-sheet`). Вычищаются вместе
      со всем легаси-мостом `--t-*`/`--transition*`, не поодиночке.
- [ ] Подставить заведённый `--footer-h` (48px) вместо чисел, подобранных под
      высоту фиксированного подвала: `components/app-layout.css` —
      `.app-layout { padding-bottom: var(--space-16) }` и
      `.width-control { bottom: var(--space-20) }`; проверить заодно нижнюю
      кромку панелей в `components/sidebar.css`. Файлы вне зоны правки
      волны «база и темы».
- [ ] `.overlay-mobile` (`base/responsive.css`) — ещё одна подложка рядом с
      `.sidebar-overlay`, `.drawer__overlay` и `layout.css .overlay`;
      состояние легаси-формы `.active`. Вхождений в разметке нет.
- [ ] Классы в разметке витрины без реализации в CSS: `.palette-group-title`,
      `.brand-card__title` (`components.html`). После перевода заголовков на
      шкалу они получают кегль от тега — проверить, тот ли это вид.
- [ ] Свод `.claude/skills/css-architecture-craft/RULES.md` разошёлся с кодом:
      §3.1 описывает каскад «приоритет держится порядком `@import`», а §3.2
      называет переход на `@layer` планируемым — миграция выполнена 30.07,
      раздел нужно переписать по факту (слой объявляется внутри файла, форма
      `@import … layer()` отвергнута, `base/fonts.css` — единственный файл вне
      слоёв, инверсия порядка для `!important`). Плюс прежние расхождения
      после разбора сирот: §1.1 перечисляет удалённый `--max-prose-w`, §1.4 —
      удалённые `--t-instant`/`--max-prose-w` и уже неверный `--icon-size-lg`
      (у него появился потребитель); не упомянуты `--fw-light` и `--footer-h`,
      а `--dark-*` — новое семейство примитивов тёмной палитры. Актуализация
      свода — работа владельца скилла, не слоя стилей.

### Найдено при написании паспортов и скилла (2026-07-30)

#### Дефекты разметки и мёртвый код

- [ ] Демо `avatar`, группа аватаров: `+N` размечен как `.avatar avatar-more`,
      а CSS знает `.avatar-count`; инлайновые `--avatar-bg` компонентом не
      читаются. (Найдено при починке статусов аватара.)
- [ ] `.file-dropzone-input` в разметке витрины — класса нет в CSS, поле
      цепляется селектором `.file-dropzone input[type="file"]`.
- [ ] Подвал витрины `components.html` — `<footer class="site-footer">`, но
      набит элементами чужого блока (`footer-left/-center/-right/-copyright/
      -version/-nav/-status`): в одной разметке два разных подвала.
- [ ] Демо `filter-panel` на витрине статичное: `.chip-choice` вне пиклиста
      никем не переключается, `.has-active` и счётчики проставлены руками.
      Либо общий обработчик чипов-опций, либо явная пометка в паспорте.
- [ ] `#open-command-palette` на витрине без обработчика — кнопка вызова
      палитры ничего не открывает.
- [ ] Модификатор `.breadcrumbs-slash` повторяет поведение по умолчанию.
- [ ] Демо `file-upload` не реагирует на перетаскивание: обработчиков
      dragenter/dragover/drop нет ни в `main.js`, ни на витрине, поэтому
      состояние `[data-drag-over="true"]` вживую не воспроизвести.
- [ ] `.notification-badge.is-open` — состояние без сеттера: панель уведомлений
      на витрине показана статично инлайновым `style`, обработчика открытия
      нет. Либо демо с триггером и сеттером, либо явная пометка в паспорте.

#### Дубликаты (кандидаты на консолидацию)

- [ ] Свой `@keyframes` пульса у `search-result-card` остался
      (`search-result-card-pulse`) — тайминг и кривая уже общие
      (`--duration-pulse`, `linear`), но само имя дублирует
      `skeleton-pulse`. Сводить — вместе с ревизией заглушек.
- [ ] Нижний лист, переизобретённый вне компонента `drawer`:
      `notification-panel` и `picklist__panel--sheet`. Первый — чужая зона,
      второй — панель самого пиклиста (нет оверлея и ловушки фокуса, шторкой
      быть не может); нужно решение UX, оставлять ли его листом.

#### Найдено при консолидации дубликатов, группа «каркас и панели» (2026-07-30)

- [ ] `.site-footer` описан трижды: `layout/site-footer.css` (служебная полоса
      страницы), `components/footer.css` (контентный подвал) и
      `components/app-layout.css` (фиксированный подвал каркаса, вместе с
      `.footer-left/-center/-right/-nav/-version/-status`). Разводить роли или
      сводить — отдельной работой.
- [ ] `components/app-layout.css` объявляет глобальные токены на `:root`
      (`--sidebar-width`, `--sidebar-w-left/-right`) — компонент не должен
      заводить глобальные имена (§1.2). Место им в `base/variables.css`.
- [ ] Нижняя кромка панелей и каркаса привязана к высоте фиксированного подвала
      числом (`--space-16` подобран под факт) — нужен токен `--footer-h` рядом
      с `--header-h`.
- [ ] `spinner.css .spinner-white` и мобильные литералы `40px`/`36px` в
      `layout.css` (`.header .btn-icon`) — остались вне шкалы токенов.
- [ ] `app-layout.css` держит правило `.site-footer .footer-status-dot` —
      после переезда точки состояния на общий `.badge-dot` оно мёртвое.
      Файл был вне зоны правки, удалить отдельно.

#### Долги закона (см. скилл css-architecture-craft)

- [ ] Легаси-токены движения `--t*`/`--ease` остались в шести компонентах,
      не входивших в зону слоя Б: `avatar`, `cards`, `command-palette`,
      `date-picker`, `empty-state`, `tabs`. Плюс база: `--transition*`
      в `base/utilities.css` и `base/responsive.css`.
- [ ] Легаси-нейминг состояний за пределами разобранного списка:
      `.dropdown.open` и `.popover.open` (`dropdown.css`),
      `.date-picker.open` + `.selected/.today/.other-month/.range-*/.in-range`
      (`date-picker.css`), `.search-input.has-value`, `.search-dropdown.open`,
      `.search-dropdown-item.highlighted` (`search.css`),
      `.view-mode-btn.active` (`logs.css`), `.step.completed/.active/.pending`
      (`steps.css`), `.tab.active` / `.tab-panel.active` (`tabs.css`),
      `.table-responsive.scroll-left/-right` (`table.css`),
      `.combobox.has-value` в паспорте `search`. Все ставит JS.
- [ ] Витринный переключатель размещения панели (`initPanelPlacementSwitch`
      в `main.js`) навешивает `picklist__panel--sheet` и
      `swatch-picker__panel--sheet` через `classList` — то есть JS трогает
      `--`-модификатор (§2.3.2). Состояние `is-flipped` из этой связки уже
      выведено; для листа нужен другой механизм демо (например, атрибут).
- [ ] `base/animations.css` держит собственный `.btn-loading`/`.btn-loading.loading`
      — после переименования состояния кнопки в `.is-loading` правило осталось
      без потребителей. Файл — легаси-зверинец витрины, чужая зона.
- [ ] Цветовые литералы вне белого списка, не входившие в зону слоя Б:
      `toggle.css` (`rgba(255,255,255,0.7)`, `#fff` у подписей тумблера),
      `table.css` (тени прокрутки `rgba(16,24,40,0.06)` и `rgba(0,0,0,0.4)`,
      печатный блок `#333`/`#000`/`#f5f5f5` — печатный оформить как «бумажную
      палитру» §5.8 либо через токены).
- [ ] `buttons.css` в белом списке §5.6 записан как унаследованное исключение
      (`rgba(255,255,255,0.3)` + `#fff` у кольца индикатора на заливке) —
      в строке долгов он числился ошибочно. Либо оставить исключение, либо
      завести пару токенов «индикатор на произвольной заливке» для него,
      `spinner-white` и превью `file-upload` разом.
- [ ] Отступы мимо шкалы, оставшиеся вне зоны: `inputs.css` (`40px` — это
      `--space-10`, `20px` — `--space-5`, `44px` — `--touch-target-min`,
      плюс внешкальные `6px`/`10px`/`14px`/`18px`), `tabs.css` (`14px`).
      Повсеместный `2px` (≈25 вхождений) отдельной строкой уже записан выше —
      ступени 2px в шкале нет.
- [ ] Брейкпоинты вне шкалы `--breakpoint-*`: `layout.css` (`max-width: 374px`),
      `app-layout.css` (`min-width: 769px` вместо 768), `nav.css`
      (`max-width: 768px` — пересекается с `min-width: 768px`).
- [ ] `empty-state.css`: бесконечная `empty-state-float 3s var(--ease-in-out)`.
      Это не индикатор загрузки, а декоративное покачивание, поэтому под
      правило «constant motion → linear» формально не попадает — нужен
      вердикт: либо признать колебанием и оставить, либо снять как декор.
- [ ] `progress.css`: `.progress-bar` анимирует `width`, а
      `.progress-indeterminate-dual` — `left`/`width` в keyframes. Это
      layout-свойства (RULES §5), нужен перевод на `transform: scaleX()`
      с пересчётом раскладки полосы.
- [ ] `notification-badge.css` объявляет `--notification-panel-width` и
      `--notification-item-padding` на `:root` — компонент не имеет права
      заводить глобальные имена (§1.2), как и `app-layout.css` выше.

## Сделано

### Каскад, входная документация, шапки файлов (2026-07-30)

- [x] Каскад переведён на слои `@layer`. Порядок объявлен одной строкой в
      начале `styles/core.css`: `tokens, base, legacy, layout, components,
      themes, pages, overrides`. Слой назначается ОБЁРТКОЙ ВНУТРИ каждого
      файла (`@layer components { … }`), а не формой `@import … layer(name)`:
      во-первых, эта форма ломается сборщиками (в Next 14 css-loader
      превращает её в невалидный `@media layer(...)`, и стили молча
      пропадают), во-вторых, при вендоринге копируются отдельные файлы, а не
      бандл, — принадлежность к слою обязана ехать вместе с файлом. Обёрнуты
      все 82 файла `styles/**/*.css`, кроме `base/fonts.css`: там только
      `@font-face`, который в каскаде селекторов не участвует, и обоснование
      записано в шапке файла. Прежние споры приоритетов сохранены: темы бьют
      компоненты (`themes` после `components`), страничные слои бьют
      компоненты и темы (`pages`), предпочтения контраста бьют всё
      (`overrides`), композиция `form-error-summary` по-прежнему решается
      порядком `@import` внутри слоя `components`. Изменены намеренно два
      приоритета: витринный `base/animations.css` уехал в слой `legacy` и
      больше не перебивает компоненты, а `contrast-preferences.css` теперь
      сильнее страничных слоёв (раньше страница подключалась вторым `<link>`
      и случайно выигрывала).
- [x] `README.md` в корне — входная точка для внешнего потребителя: что это,
      как посмотреть витрину, что копировать при вендоринге и в каком
      порядке, как устроены слои каскада и что из них следует для чужого
      проекта, бренды через `data-brand`, тёмная тема, доступность, правила
      для React-потребителей, три ключевых соглашения кода. Без ссылок на
      внутренние проекты.
- [x] Шапки CSS-файлов очищены от упоминаний проектов-доноров: 29 файлов
      переписаны на описание случая применения (`autotrassir`, `accordion`,
      `brand-mark`, `code-panel`, `drawer`, `filter-panel`, `filter-pills`,
      `form-error-summary`, `form-section`, `picklist`, `presence-strip`,
      `quiz`, `row-card`, `rte`, `save-status`, `search-result-card`,
      `skeleton`, `spec-sheet`, `swatch-picker`, `user-menu`, `badge`,
      плюс `base/variables.css`, `base/reset.css`, `base/utilities.css`,
      `themes/dark.css`, `layout/print-sheet.css`, `pages/hub.css`,
      `pages/catalog.css` и заголовок группы импортов в `core.css`).
      Имена файлов и классов не трогали — это публичный контракт.

### Долги закона, слой Б — компоненты (2026-07-30)

- [x] Цветовые литералы погашены токенами. `chip`: `#fff` у залитых
      семантических чипов → `--color-text-on-accent`, подложка крестика →
      `--color-accent-soft-hover` (и `--color-on-accent-strong` на залитом
      чипе), из-за чего отдельное dark-правило крестика стало не нужно и
      удалено. `progress`: блик и полоски → `--color-on-accent-strong` /
      `--color-on-accent-soft`, подпись на полосе → `--color-text-on-accent`
      с тенью `--color-on-accent-dim`. `steps`: `#fff` у шага-ошибки →
      `--color-text-on-accent`. `swatch-picker`: галочка выбора → пара
      неинвертируемых `--color-scrim-light` / `--color-on-scrim` (подложка —
      произвольный цвет RAL, темы у неё нет). `autotrassir`: затемнение под
      подписью кадра → `--color-overlay`. В `logs.css` цветовых литералов не
      оказалось вовсе — строка беклога была неточной; `buttons.css` покрыт
      унаследованным исключением §5.6 (см. открытую строку выше).
- [x] Кегли и отступы переведены на шкалы: `file-upload` (24/18/32/18/14px →
      `--fs-3xl/-xl/-4xl/-xl/-base`; 32px точной ступени не имеет, взята
      ближайшая `--fs-4xl` 30px), `combobox` (16px «iOS no-zoom» → `--fs-lg`,
      обе точки), `progress` (10px → ближайшая ступень `--fs-xs` 12px),
      `notification-badge` (`14px` → `--space-3` как ближайшая ступень,
      `20px` → `--space-5`, `24px` → `--space-6`).
- [x] Тач-цели на токенах: `buttons.css` (44 → `--touch-target-min`,
      36 → `--icon-size`, 48 → `--icon-size-lg`), `footer.css` и
      `notification-badge.css` (44 → `--touch-target-min`), `combobox.css`
      (44 → `--touch-target-min`). Крестик чипа `.chip-remove` вырос с 18px
      до 24px — требование SC 2.5.8, как у `.picklist__chip-remove`,
      `.filter-pill__remove` и `.alert-close`.
- [x] Легаси-токены движения `--t*`/`--ease` заменены на `--duration-*` и
      `--ease-out` в: `alerts`, `autotrassir`, `breadcrumbs`, `buttons`,
      `chip`, `combobox`, `file-upload`, `footer`, `layout`, `logs`, `modal`,
      `notification-badge`, `pagination`, `progress`, `search`,
      `search-result-card`, `stats`, `steps`, `table`, `tag-cloud`.
      Соответствие: `--t-fast` (0.12s) → `--duration-press` (160ms),
      `--t` (0.18s) → `--duration-dropdown` (200ms), `--t-slow` (0.28s) →
      `--duration-modal` (300ms); `--t-slower` (0.4s) в `autotrassir`
      выходил за бюджет UI-анимации и сведён к `--duration-modal`.
- [x] `spinner.css .spinner-pulse` больше не появляется из нулевого масштаба
      (прямой запрет ui-motion-craft §3): цикл идёт от 0.95 наружу к 1.6.
      Бесконечные индикаторы переведены с `--ease-in-out` на `linear`:
      `spinner-smooth`, `spinner-dots-bounce`, `spinner-bars-stretch`,
      `spinner-pulse`, `progress-shimmer`, `progress-indeterminate` (+ пара
      dual), `file-progress-indeterminate`, `search-result-card-pulse`,
      `card-shimmer`.
- [x] Состояния приведены к `is-*` в обе стороны (CSS + `main.js` + разметка
      витрины + страницы + e2e-локаторы): `.btn-loading` → `.btn.is-loading`
      (с оговоркой `:not(:has(.spinner))`, чтобы не спорить со своим
      индикатором страниц входа и формы), `.chip-active` →
      `.chip-clickable.is-active` (у прежнего имени не было ни одного правила
      в CSS — теперь состояние показывается), `.dropdown-item.active` →
      `.is-active`, `.toast-enter/-exit` → `.toast.is-entering/.is-exiting`,
      `.notification-badge.open` → `.is-open`, `.sidebar-nav-link.active` и
      `.sidebar-tag.active` → `.is-active`,
      `.app-content`/`.width-control`/`.search-bar` — `is-sidebar-*-open`.
- [x] Комбобокс мигрирован целиком: двойники `.open`, `.selected`/
      `.combobox-option-selected`, `.highlighted`/`.combobox-option-highlighted`
      удалены, остались `.is-open`, `.is-selected`, `.is-highlighted`;
      `.has-value` → `.is-filled`. Двойник `.nav-menu.open` тоже снят.
      Двойных алиасов в библиотеке не осталось.
- [x] `.picklist__panel--top` и `.swatch-picker__panel--top` переименованы в
      состояние `.is-flipped` (§2.3.2: класс, который трогает `classList`,
      не может начинаться с `--`; §2.6 свода описывал ровно этот случай).
      Сеттер уже был — витринный переключатель размещения; `data-panel-variant`
      и e2e переведены. На узком экране лист сильнее: добавлена пара правил
      `--sheet.is-flipped`, чтобы размещение не раздваивалось.
- [x] `table.css .is-highlighted` удалено: ни сеттера, ни вхождений в разметке,
      а выделенная строка в библиотеке уже есть (`.is-selected`).
- [x] `layout.css .overlay` удалена вместе с состоянием `.active` — третья
      подложка библиотеки без единого вхождения в разметке; остаются
      `.sidebar-overlay` и `.drawer__overlay`.
- [x] Потолок ручного ресайза панели сведён к одному источнику: границы
      объявлены в `.sidebar--resizable` (CSS), `main.js` читает их через
      `getComputedStyle` на каждый жест. Прежние `minWidth = 220` /
      `maxWidth = 500` из скрипта убраны — потолок 500px расходился с `50vw`.
- [x] `tooltip.css`: размер стрелки вынесен в локальное свойство блока
      `--tooltip-arrow` (тот же приём слоя 4, что и `--tooltip-bg/-fg`);
      варианты `sm`/`lg` переопределяют только его.
- [x] Брейкпоинты `max-width: 640px` в `search-result-card.css` и
      `tag-cloud.css` приведены к шкале — `767px` (соседний `min-width: 768`
      минус 1px, §5.4).
- [x] `.badge-subtle` реализован (акцентный tint вместо заливки): класс был в
      разметке `index.html` и `pages/catalog.html` без правила в библиотеке.
      `.notification-wrapper` в разметке уже не встречается — строка закрыта
      без правки.
- [x] `.dark .badge` разведён по вариантам: базовое правило осталось за
      акцентным бейджем, семантические (`success/warning/error/info`) в тёмной
      теме красятся near-black `--color-bg` — на светлой семантической заливке
      индиго-950 читался как чужой оттенок.
- [x] `.file-dropzone.drag-over` удалён: носитель состояния —
      `[data-drag-over="true"]`, а класс-двойник никем не ставился (§2.3.3).
- [x] Попутно вскрылось и закрыто: `.dark .chip` (0,2,0, объявлено позже)
      перебивало `.chip-selected` (0,1,0) и возвращало выбранному чипу
      accent-soft вместе с тёмной подписью — заливка повторена в dark-правиле
      выбора. Обнаружено при оживлении `.chip-clickable.is-active`.
- [x] Реестр паспортов `docs/components.yaml` синхронизирован с новыми именами
      состояний, модификаторов и списками токенов у всех затронутых записей.

### Долги закона, слой А — база и темы (2026-07-30)

- [x] Токены-сироты разобраны поимённо. Удалены: `--t-instant` (нулевая
      ступень легаси-набора `--t-*` — «мгновенно» это отсутствие перехода,
      а не длительность) и `--max-prose-w` (мера строки 72ch без единого
      потребителя; ту же роль локально играет `.page-shell__sub`).
      Оставлены с записанным обоснованием прямо у объявления: `--space-24`
      и `--lh-loose` (крайние ступени шкал — дыра в шкале хуже неиспользуемой
      ступени, 96px к тому же есть в карте `naming-lint.py`), `--z-base`
      (нулевая ступень шкалы слоёв). `--icon-size-lg` сиротой быть перестал
      сам — его читает `.width-control` в `app-layout.css`. Шкала
      `--breakpoint-*` признана декларацией и оставлена: на неё как на
      первоисточник ссылается белый список литералов §5.4, а `var()` в
      медиазапросах не работает по спецификации — удаление превратило бы
      правило «значения только из этой шкалы» в устную договорённость.
- [x] Заголовкам h1–h6 назначена шкала `--fs-*` (`base/reset.css`):
      24/20/18/16/15/14px по соответствию, записанному в самих комментариях
      токенов, плюс интерлиньяж (`--lh-tight` у h1–h3, `--lh-snug` у h4–h6) и
      ужатый трекинг у h1–h2. Вес оставлен браузерным — его задают брендовые
      темы. Компонентные заголовки не поехали: у всех есть класс с
      собственным кеглем, класс сильнее тега (проверено грепом по
      `styles/components/**`, `styles/pages/**` и разметке).
- [x] Тёмная тема сведена к одному источнику значений: блок
      `[BLOCK:dark-palette-source]` в `variables.css` объявляет палитру
      примитивами `--dark-*`, а `.dark, [data-theme="dark"]` и зеркало
      `@media (prefers-color-scheme: dark)` только присваивают их
      семантическим именам. Производные (`--shadow-focus*`, легаси
      `--bg/--panel/--accent*`) остались в блоке `.dark` — носитель класса
      может быть ниже `:root`; из медиа-зеркала они убраны намеренно: там
      носитель тот же `:root`, и `var()` уже читает тёмные значения.
      Механика бренда (`[BLOCK:brand-scope-derived]`, коммит 9a1712f) не
      затронута.
- [x] Скелетон-зверинец вычищен из базы и тем: из `base/animations.css`
      удалены `.skeleton-wave/-shimmer/-text/-avatar/-card` и кадры
      `skeleton-wave`/`skeleton-shimmer-wave` (файл подключается витриной
      после `core.css` и бил компонент), из `base/utilities.css` — кадры
      `pulse`/`spin` вместе с `.animate-pulse`/`.animate-spin`, из
      `themes/dark.css` — `@keyframes skeleton-pulse-dark` и анимация на
      `.dark .skeleton` (в теме остался только цвет заглушки). Канон —
      `components/skeleton.css`: `skeleton-pulse`, `--duration-pulse`,
      `linear`.
- [x] Литералы в базе и темах погашены: отступы и зазоры адаптивных утилит,
      контейнера и стеков — на `--space-*`; кегли утилит `.text-*` — на
      `--fs-*`; веса — на `--fw-*`; `z-index` — на `--z-*`; интерлиньяж
      `body`, скругления полос прокрутки, толщина границ — на токены;
      легаси-пара `--transition` у мобильной подложки — на
      `--duration-dropdown`/`--ease-out`. Оставлены с записанным
      обоснованием: 16px корня rem, размеры системных полос прокрутки
      (6/8/10px), ширины `.container`, `white`/`black` в печатном сбросе.
- [x] Заведена ступень `--fw-light` (300): тема VEZA задавала вес основного
      текста числом мимо шкалы.
- [x] Заведён `--footer-h` (48px) рядом с `--header-h` — высота фиксированного
      подвала каркаса. Потребители подставляются отдельной строкой беклога:
      сами компоненты в эту волну не правились.

### Производные токены в скоупе бренда (2026-07-30)

- [x] Токен, собранный из `var()` на `:root`, разрешает свои `var()` на
      элементе объявления — на `<html>`, а бренд живёт на `<body>`
      (`data-brand`). Из-за этого `--shadow-focus`, `--shadow-focus-error` и
      легаси-алиасы `--accent/-700/-100` оставались дефолтными (indigo
      `#3730a3`) на всех брендовых страницах: кольцо фокуса, `::selection`,
      `outline` из `reset.css` и утилита `.text-accent` светили не тем цветом.
      Лечение — блок `[BLOCK:brand-scope-derived]` в конце
      `styles/base/variables.css`: те же производные объявляются селектором
      `[data-brand]`, то есть в том же скоупе, где бренд задаёт
      `--color-accent`; одно правило кроет три бренда и обе темы. Зеркало в
      `styles/base/contrast-preferences.css` (блок `prefers-contrast: more`)
      обязательно: без него правило уровня body перебило бы усиленное кольцо
      5px своими 4px и предпочтение пользователя молча терялось.
      Покрыто e2e: кольцо сверяется с эталоном акцента в 3 брендах × 2 темах
      и отдельно при `prefers-contrast: more`.

### Дубликаты, группа «каркас и панели» (2026-07-30)

- [x] Имя `.sidebar` получило единственного владельца — `components/sidebar.css`.
      Дубль каркаса из `layout.css` (`.sidebar`, `.sidebar-left/-right`,
      `.collapsed`, `.main.with-sidebar-*`) удалён, каркас `.app-sidebar` из
      `app-layout.css` тоже: панель теперь одна и включает фиксированную
      колонку, мобильную шторку, подложку и ручку ресайза. Разметка витрины,
      `main.js` и e2e переведены на `.sidebar--left/--right/--resizable` и
      состояния `is-open` / `is-resizing` / `is-visible`.
- [x] `.search-bar` тоже сведён к одному владельцу — `inputs.css` (поле +
      кнопка). Полоса поиска в шапке осталась композицией `.header .search-bar`
      в `layout.css`, поэтому от порядка импортов больше ничего не зависит.
- [x] `app-layout.css` оставлен только раскладкой: `.app-layout`, `.app-content`,
      сдвиг центра, переключатель ширины. Селекторы `:has()` уточнены до прямого
      потомка — вложенный каркас (подмакетник витрины) больше не двигает внешнюю
      колонку. Мёртвый `.demo-app-layout/-sidebar/-content` удалён.
- [x] Шторка в библиотеке одна: `drawer.css` получил вариант `--sheet` (нижний
      лист) и полоску-захват `__grabber`; `.modal-drawer`, `.modal-drawer-left/
      -right`, `.modal-bottom-sheet` и их keyframes вырезаны из `modal.css`.
      Модалка осталась центрированным окном.
- [x] `.filter-range` удалён — диапазон «от — до» один, `.input-range`
      (`inputs.css`); разметка витрины и `pages/catalog.html` переведены.
      Роли `.dropdown-menu` / `.popover` / `.filter-panel` разведены явно —
      шапкой `dropdown.css` и полем `roles` в паспорте.
- [x] Мёртвый набор `.skeleton*` с шиммером вырезан из `spinner.css`; скелетон
      в библиотеке один (`skeleton.css`), keyframes пульса — один
      (`skeleton-pulse` + `--duration-pulse`).
- [x] `tree.css` сведён к одной реализации: параллельный набор `.tree-modern-*`
      удалён, строка узла работает и на `<div>`, и на `<button>`, счётчик —
      `.tree-count`. Антипаттерн `max-height: 1000px` убран: раскрытие ветви
      не анимируется (гейт частоты ui-motion-craft §0), движется только шеврон;
      состояние ветви — `is-open`. Собственный `@keyframes tree-skeleton` и
      `.tree-loading-item` заменены заглушками `.skeleton`.
- [x] Метрика одна: `.sidebar-stat*` удалён, вместо него вариант
      `.stat-card-tile` в `stats.css`; `.stat-progress-bar/-fill` заменены
      переиспользованием `progress` внутри `.stat-progress`.
- [x] Легаси `.veza-header*` (печатная шапка внешнего даташита) вырезан из
      `table.css` вместе с демо на витрине — на печатных формах он не
      использовался (grep по `*.html`/`*.js`/`*.css`: единственным потребителем
      была та самая демо-секция).
- [x] `spec-sheet .spec-table` ↔ `table .table`: НЕ консолидировано намеренно;
      в оба паспорта вписано явное правило выбора для внешнего потребителя.
- [x] Витрина получила демо-секции `#app-layout` (каркас раздвигает контент;
      узкий экран — панель поверх с подложкой) и `#sidebar` (анатомия панели)
      на подмакетнике `.demo-frame`, плюс пункты сайдбара; в реестре паспортов
      у обеих записей `showcase` больше не `null`.
- [x] Дубль `@keyframes skeleton-pulse` и своё правило `.skeleton` вырезаны из
      `autotrassir.css` (там же ушли литерал `1.4s` и `--ease-in-out` на
      бесконечном индикаторе): в `core.css` осталось одно объявление имени —
      в `components/skeleton.css`, с `--duration-pulse` и `linear`. В файле
      остались только размеры заглушек внутри `.photo-card-skeleton`.
- [x] `notification-badge.css`: «выключатель» `transition: opacity 0.01ms,
      visibility 0.01ms` в `prefers-reduced-motion` заменён на «мягче, но не
      ноль» — сдвиг и масштаб панели снимаются, кроссфейд по `--duration-exit`
      / `--duration-dropdown` остаётся (тот же приём, что уже снят с
      `alerts.css`).
- [x] Замок прокрутки у шторки в `main.js` ставится и на `<html>`, и на
      `<body>`: на витрине полосу прокрутки держит `body`, и одного
      `documentElement` не хватало (на `pages/dashboard.html` поведение
      было правильным и покрыто тестом).
- [x] Гонка в e2e-замере кольца фокуса (`measureFocusRing`): значение
      `box-shadow` снималось во время перехода `--duration-press`, отчего один
      и тот же дефект давал три разных сообщения в трёх прогонах. Замер теперь
      ждёт оседания — кадр на старт перехода, `getAnimations().finished`, затем
      три подряд одинаковых кадра (потолок в кадрах — только страховка от
      зависания). Стили при этом не менялись: библиотека отдаёт эталонные
      значения во всех шести комбинациях бренд × тема.

- [x] Версии убраны из имён файлов (`variables-v2` → `variables`, `components-v3/`
      → `components/`, `dark-v3` → `dark`), версия — через build-arg `APP_VERSION`.

### Дубликаты, группа «мелкие сигналы» (2026-07-30)

- [x] `.tag*` (badge.css) ↔ `.chip*`: победил чип. Роли разведены явно —
      бейдж это статус или счётчик, назначаемый системой, чип это объект,
      который выбирают, переключают или снимают. `.tag/-removable/-remove/-group`
      удалены, разметка витрины переведена на `.chip*`, граница записана в оба
      паспорта.
- [x] `.alert-box*` (logs.css) ↔ `.alert*` (alerts.css): победила `alerts.css`
      как отдельный компонент с паспортом и вариантами. `.alert` научился
      строчной раскладке «иконка + текст + крестик» (включается сама через
      `:has(> .alert-icon)` или `.alert-dismissible`), появился `.alert-content`,
      `.alert-icon` стал самой иконкой, `.alert-close` получил цель 24px.
      Демо перенесено из секции журналов в секцию Alerts; `pages/login.html`
      и `styles/pages/login.css` переведены. Заодно удалён капкан
      `.alert.warning`, красивший плашку в цвет ошибки, и снят «выключатель»
      `transition: opacity 0.01ms` в reduced-motion.
- [x] Три реализации точки статуса сведены в примитив `.badge-dot` (badge.css)
      с семантическими модификаторами и двумя размерами. `.status-dot`
      (autotrassir) и `.footer-status-dot` удалены; `.avatar-status` сохранил
      свой контракт (дочерний узел, кольцо, обрезка на картинке) и оставил себе
      только позицию у кромки круга, размерную шкалу и цвета присутствия.
- [x] `notification-count`/`notification-dot` ↔ `badge`: удалены оба, индикатор
      теперь `.badge`/`.badge-dot` с накладкой `.badge-float` внутри
      `.notification-badge`. Пять keyframes на дотокенной палитре
      (`rgba(220,38,38,…)` и соседи) заменены одной анимацией
      `.notification-badge-pulse`, наследующей цвет самого бейджа.
- [x] `toast`: разметка витрины приведена к контракту CSS — `.toast-info/…`
      заменены на `.toast` + `.info/.success/.warning/.error`, как на
      `pages/form.html`. Демо-тосты снова получили семантический кант.
- [x] `tag-cloud.css` приведён к контракту: кегли 12/13/14/15px → соседние
      ступени `--fs-xs/-sm/-base/-md`, счётчик и метка источника — на `--fs-xs`,
      зазоры и отступы — на шкалу `--space-*`, `animation: pulse 1.4s
      ease-in-out infinite` → общий `skeleton-pulse` с `--duration-pulse` и
      `linear`; добавлен блок `prefers-reduced-motion`.
- [x] `tooltip.css`: из четырёх параллельных реализаций осталось две — по числу
      способов позиционирования. Удалены обёрточная (`.has-tooltip` +
      `.tooltip-content`, ноль вхождений в разметке) и маркерная (`.tooltip`,
      дублировала `position/cursor` самого `[data-tooltip]`); атрибут
      `data-tooltip-position` заменён классом стороны, общий для обоих
      носителей. Поверхность, стрелка, размеры, варианты, тёмная тема и
      reduced-motion объявлены по одному разу на оба носителя; цвет вынесен в
      `--tooltip-bg`/`--tooltip-fg`, поэтому матрица «сторона × вариант» в
      правилах стрелок исчезла (файл ужался примерно на четверть).

### Дефекты разметки и мёртвый код (2026-07-30)

- [x] Двойной разделитель хлебных крошек устранён: блок `.breadcrumb*` вырезан из
      `nav.css` (он рисовал «/» через `.breadcrumb-item::after` без ограничения
      родителем), единственный источник глифа — `.breadcrumbs .breadcrumb-separator::before`
      в `breadcrumbs.css`; разметка витрины, каталога и даташита ставит пустой
      `.breadcrumb-separator` с `aria-hidden`.
- [x] Расхождения имён классов сведены к CSS-контракту: `command-palette`
      (`-dialog/-search/-hint/-shortcut` → `command-palette/-header/-close-hint/
      -item-shortcut` + `-item-content`), `empty-state` (`-icon/-message/-compact`
      → `-illustration/-description/-sm` + `-action`, включая `pages/catalog.html`
      и `ral-colors.html`), `avatar` (статус — дочерний `.avatar-status` с
      `--online/--offline/--busy/--away`, обрезка по кругу перенесена на картинку),
      `divider` (`data-text` → вложенный `.divider-text`), `file-upload`
      (карточка сетки — `.file-preview-card-remove/-info`, миниатюра списка —
      `.file-preview` с раскрывающимся `.file-preview-overlay`).
- [x] «Мёртвый» `.nav`/`.page-nav`, `components/footer.css .footer` и
      `search-result-card` не удалены, а оживлены: у всех трёх есть паспорт в
      реестре, поэтому по правилу они получили демо-секции на витрине.
- [x] Секция Dropdown получила `id="dropdown"` и пункт сайдбара; секция
      «Log Viewer (AutoTrassir)» — свой `id="autotrassir"`, паспорт больше не
      ссылается на чужой якорь `#logs`.
- [x] Добавлены демо-секции: `filter-panel`, `presence-strip`,
      `search-result-card`, `nav` (+ `page-nav`), `footer`, `site-header`,
      `site-footer`; `row-card`, `rte` и `save-status` вынесены из чужой секции
      `#form-section` в собственные с пунктами сайдбара. Реестр паспортов
      обновлён (`showcase` больше не `null` ни у одной из этих записей).
- [x] Демо `steps`: цифра из разметки убрана, номер шага даёт только
      `counter()` в `.step-number::before`.
