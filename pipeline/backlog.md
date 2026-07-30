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
- [ ] Свести оставшиеся чипы к одному компоненту: `.picklist__chip`,
      `.swatch-picker__chip`, `.combobox-tag` — каждый со своим контрактом с JS
      и e2e-локаторами, поэтому 30.07 сведены только `.tag` → `.chip`.
      `.filter-pill` остаётся отдельным компонентом осознанно (пара
      «поле: значение», всегда удаляемая) — это записано в его паспорте.
- [ ] Миграция combobox на нейминг `is-*` (сейчас двойные алиасы `.open`/`.is-open`).
- [ ] Тёмная тема для страниц `print-forms.html` и `ral-colors.html`.
- [ ] Заголовкам h1–h6 не назначена токен-шкала `--fs-*` — размеры браузерные
      (2em…0.67em), в паспортах и типографике это видно как пробел.

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
- [ ] `breadcrumbs.css` на легаси-токенах движения (`--t-fast`, `--ease`);
      модификатор `.breadcrumbs-slash` повторяет поведение по умолчанию.

#### Дубликаты (кандидаты на консолидацию)

- [ ] Остатки пульса вне компонента `skeleton`: `@keyframes pulse` в
      `base/utilities.css`; своя копия `@keyframes skeleton-pulse` вместе с
      `.skeleton` в `autotrassir.css` (имя keyframes глобальное — две копии под
      одним именем перебивают друг друга по порядку импорта); третий пульс
      `skeleton-pulse-dark` и своя `.dark .skeleton` в `themes/dark.css`;
      плюс `.skeleton-*`/`.skeleton-card`/`.skeleton-shimmer` в
      `base/animations.css`, который витрина подключает после `core.css` и
      который бьёт компонент. Все четыре файла — вне зоны правки группы Б.
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
- [ ] `layout.css .overlay` — третья подложка библиотеки рядом с
      `.sidebar-overlay` и `.drawer__overlay`; вхождений в разметке ноль.
- [ ] `components/app-layout.css` объявляет глобальные токены на `:root`
      (`--sidebar-width`, `--sidebar-w-left/-right`) — компонент не должен
      заводить глобальные имена (§1.2). Место им в `base/variables.css`.
- [ ] Нижняя кромка панелей и каркаса привязана к высоте фиксированного подвала
      числом (`--space-16` подобран под факт) — нужен токен `--footer-h` рядом
      с `--header-h`.
- [ ] Потолок ручного ресайза панели живёт в двух местах: `max-width: 50vw`
      в CSS и `maxWidth = 500` в `main.js`.
- [ ] `spinner.css .spinner-white` и мобильные литералы `40px` в `layout.css`
      (`.header .btn-icon`) — остались вне шкалы токенов.
- [ ] `app-layout.css` держит правило `.site-footer .footer-status-dot` —
      после переезда точки состояния на общий `.badge-dot` оно мёртвое.
      Файл был вне зоны правки, удалить отдельно.
- [ ] Классы в разметке без реализации в CSS: `.badge-subtle`
      (`index.html`, `pages/catalog.html`), `.notification-wrapper`
      (был на витрине, разметка переведена на `.notification-badge`).
- [ ] `.dark .badge` перекрашивает текст в акцентный у всех бейджей, включая
      семантические: на красной или зелёной заливке это не цвет текста
      «на акценте». Нужен разбор по вариантам.
- [ ] `alerts.css` на легаси-токенах движения (`--t`, `--t-slow`, `--ease`) —
      в общий список файлов-должников он не попал.
- [ ] `tooltip.css`: размер стрелки задан литералами (5px база, 4px `sm`,
      6px `lg`) — белым списком литералов §5 это не покрыто, нужен либо токен,
      либо запись в исключения.
- [ ] `tag-cloud.css` использует брейкпоинт `max-width: 640px` — значения нет
      в шкале `--breakpoint-*` (479/767/1023/1279).
- [ ] `.chip-remove` — цель 18px при требовании SC 2.5.8 ≥24px
      (у `.filter-pill__remove` и `.alert-close` уже 24px).

#### Долги закона (см. скилл css-architecture-craft)

- [ ] Состояния без JS-сеттера: `.picklist__panel--top` (комментарий обещает JS),
      `table.css .is-highlighted`.
- [ ] Легаси-нейминг состояний: `.open`/`.is-open` дублями, `.chip-active`,
      `.dropdown-item.active`, `.toast-enter/-exit`,
      `.file-dropzone.drag-over`, `.btn-loading` — привести к `is-*`.
      Отдельно: `.sidebar-nav-link.active` и `.sidebar-tag.active` остались
      легаси-формой (JS витрины ставит `active`), классы-фолбэки
      `.app-content.sidebar-left-open/-right-open/-both-open` и
      `.search-bar.sidebar-none-open/-one-open/-both-open` — тоже состояния
      без префикса.
- [ ] Токены-сироты: `--t-instant`, `--z-base`, `--lh-loose`, `--space-24`,
      `--icon-size-lg`, `--max-prose-w`, шкала `--breakpoint-*`.
- [ ] Цветовые литералы вне белого списка: `chip`, `progress`, `steps`,
      `swatch-picker`, `autotrassir`, `buttons`.
- [ ] Кегль литералом (14 вхождений) и отступы мимо шкалы `--space-*` (~11).
- [ ] `buttons.css` задаёт тач-цели числом (44/48/36px) при существующем
      `--touch-target-min`.
- [ ] Легаси-токены движения `--t`, `--t-fast`, `--ease` вместо
      `--duration-*`/`--ease-out`: `footer`, `logs`, `pagination`,
      `notification-badge`, `progress`, `search-result-card`, `layout`
      (остался только в `.overlay`), `buttons`, `file-upload`, `tag-cloud`,
      частично `modal`; сверх прежнего списка — `search`, `steps`, `table`,
      `stats` (в группе Б они не правились: попутные улучшения запрещены).
- [ ] `spinner.css .spinner-pulse` анимируется из `scale(0)` — прямой запрет
      ui-motion-craft §3; бесконечные индикаторы используют `--ease-in-out`
      там, где нужен `linear`.
- [ ] `variables.css` держит полную копию блока `.dark` в
      `@media (prefers-color-scheme: dark)` — правится в двух местах, кандидат
      на рефактор.

## Сделано

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
