// CSS Lab - точка входа
console.log('🎨 CSS Lab запущен!')

// ===== Chip Component =====
// Removable chips: анимация через класс .is-removing (chip.css), узел
// удаляется по transitionend с таймером-страховкой
document.querySelectorAll('.chip-remove').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip || chip.classList.contains('is-removing')) return;
    chip.classList.add('is-removing');
    chip.addEventListener('transitionend', () => chip.remove(), { once: true });
    setTimeout(() => chip.remove(), 300); // страховка при reduced-motion
  });
});

// Clickable chips (filter toggle)
document.querySelectorAll('.chip-clickable').forEach(chip => {
  chip.addEventListener('click', (e) => {
    const parent = e.target.parentElement;
    // Toggle active state
    if (!e.target.classList.contains('chip-active')) {
      parent.querySelectorAll('.chip-clickable').forEach(c => c.classList.remove('chip-active'));
      e.target.classList.add('chip-active');
    }
  });
});

// ===== Sidebar Resize =====
// Инициализация resize для сайдбаров
function initSidebarResize() {
  // Единственная реализация панели — .sidebar (components/sidebar.css)
  const sidebars = document.querySelectorAll('.sidebar--resizable');

  sidebars.forEach(sidebar => {
    const handle = sidebar.querySelector('.sidebar-resize-handle');
    if (!handle) return;

    const isLeft = sidebar.classList.contains('sidebar--left');
    // Нижняя граница совпадает с --sidebar-w-sm (min-width в CSS)
    const minWidth = 220;
    const maxWidth = 500;

    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isResizing = true;
      startX = e.clientX;
      startWidth = sidebar.offsetWidth;

      sidebar.classList.add('is-resizing');
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;

      const deltaX = e.clientX - startX;
      let newWidth;

      if (isLeft) {
        // Left sidebar: drag right = expand
        newWidth = startWidth + deltaX;
      } else {
        // Right sidebar: drag left = expand
        newWidth = startWidth - deltaX;
      }

      // Apply constraints
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      sidebar.style.width = newWidth + 'px';
      // Отступ центра следует за шириной панели (пер-сторонняя переменная)
      document.documentElement.style.setProperty(
        isLeft ? '--sidebar-w-left' : '--sidebar-w-right', newWidth + 'px');
    });

    document.addEventListener('mouseup', () => {
      if (!isResizing) return;

      isResizing = false;
      sidebar.classList.remove('is-resizing');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      // Save width to localStorage
      const sidebarId = sidebar.id || (isLeft ? 'left-sidebar' : 'right-sidebar');
      localStorage.setItem(`sidebar-width-${sidebarId}`, sidebar.style.width);
    });

    // Restore saved width
    const sidebarId = sidebar.id || (isLeft ? 'left-sidebar' : 'right-sidebar');
    const savedWidth = localStorage.getItem(`sidebar-width-${sidebarId}`);
    if (savedWidth) {
      const width = parseInt(savedWidth);
      if (width >= minWidth && width <= maxWidth) {
        sidebar.style.width = savedWidth;
        // Восстановленная ширина тоже двигает отступ центра
        document.documentElement.style.setProperty(
          isLeft ? '--sidebar-w-left' : '--sidebar-w-right', width + 'px');
      }
    }
  });
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSidebarResize);
} else {
  initSidebarResize();
}

// ===== Demo Toast =====
// Универсальный отклик демо-кнопок: любая кнопка без собственного обработчика
// показывает тост — «кнопка подразумевает нажатие → есть действие».
const demoToast = (function initDemoToast() {
  let container = null;
  function ensureContainer() {
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }
  // Уход тоста: exit-анимация + страховочный remove (reduced-motion)
  function dismissToast(toast) {
    if (!toast.isConnected || toast.classList.contains('toast-exit')) return;
    toast.classList.remove('toast-enter');
    toast.classList.add('toast-exit');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
    setTimeout(() => toast.remove(), 400);
  }
  return function demoToast(message, title) {
    const box = ensureContainer();
    const toast = document.createElement('div');
    toast.className = 'toast toast-compact toast-enter';
    toast.setAttribute('role', 'status');
    const content = document.createElement('div');
    content.className = 'toast-content';
    if (title) {
      const t = document.createElement('div');
      t.className = 'toast-title';
      t.textContent = title;
      content.appendChild(t);
    }
    const m = document.createElement('div');
    m.className = 'toast-message';
    m.textContent = message;
    content.appendChild(m);
    toast.appendChild(content);
    box.appendChild(toast);

    // Таймер жизни паузится на hover по стеку (принцип Sonner)
    let timer = setTimeout(() => dismissToast(toast), 2600);
    box.addEventListener('mouseenter', () => clearTimeout(timer));
    box.addEventListener('mouseleave', () => {
      clearTimeout(timer);
      timer = setTimeout(() => dismissToast(toast), 1200);
    });

    // Не копим стек больше трёх — старший уходит с exit-анимацией
    while (box.children.length > 3) dismissToast(box.firstChild);
  };
})();

// Фолбэк-действие: кнопки в демо-контенте без обработчика откликаются тостом.
// Слушатель на document в фазе bubbling — «настоящие» обработчики выигрывают
// и помечают событие defaultPrevented/stopPropagation, либо кнопка в списке исключений.
(function initDemoButtonFallback() {
  const SKIP = '.user-menu, .picklist, .swatch-picker, .drawer, .accordion, ' +
    '.quiz-options, .brand-switcher, .presence-strip, .rte-toolbar, .date-picker, ' +
    '.filter-pills, .chips, #demo-log-view-toggle, .form-rows__add, .row-card__remove, ' +
    '.chip-remove, .modal, .dropdown, .tree-item, .toast, #theme-toggle, #width-control, ' +
    '#burger-menu, #info-toggle, .sidebar-close, .tab, .toggle, [data-datepicker], ' +
    '[data-drawer-open], .quiz-header__nav, .combobox, .code-panel__string-row, ' +
    '.form-error-summary, [data-error-summary], [data-panel-switch], ' +
    '.table--form, .swatch-picker__actions, .picklist__actions';
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn || btn.closest(SKIP)) return;
    if (!btn.closest('.app-content')) return; // только демо-контент витрины
    demoToast('Кнопка «' + (btn.textContent.trim().slice(0, 40) || 'без названия') + '» нажата', 'Демо-действие');
  });
})();

// ===== Header Search =====
// Поиск в шапке фильтрует меню компонентов; Enter — переход к первому совпадению
(function initHeaderSearch() {
  const input = document.querySelector('.header .search-bar .input');
  const btn = document.querySelector('.header .search-bar .btn');
  if (!input) return;
  // Именно панель витрины, а не любые .sidebar--left (в демо-секциях они тоже есть)
  const items = () => [...document.querySelectorAll('#left-sidebar .sidebar-nav-item')];

  function applyFilter() {
    const q = input.value.trim().toLowerCase();
    let first = null;
    items().forEach(li => {
      const hit = !q || li.textContent.toLowerCase().includes(q);
      li.style.display = hit ? '' : 'none';
      if (hit && !first && q) first = li.querySelector('a');
    });
    return first;
  }
  function go() {
    const first = applyFilter();
    if (first) first.click();
    else if (input.value.trim()) demoToast('Компонент не найден: ' + input.value.trim(), 'Поиск');
  }
  input.addEventListener('input', applyFilter);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
  btn?.addEventListener('click', (e) => { e.stopPropagation(); go(); });
})();

// ===== Brand Switcher =====
// Переключение корпоративной темы (data-brand на body) + localStorage.
// Групп на странице может быть несколько (хедер + секция) — состояния синхронны.
(function initBrandSwitcher() {
  const options = document.querySelectorAll('.brand-switcher [data-brand-value]');
  if (!options.length) return;

  function applyBrand(value) {
    if (value) {
      document.body.setAttribute('data-brand', value);
    } else {
      document.body.removeAttribute('data-brand');
    }
    options.forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.dataset.brandValue === value));
    });
    localStorage.setItem('css-lab-brand', value);
  }

  options.forEach(btn => {
    btn.addEventListener('click', () => applyBrand(btn.dataset.brandValue));
  });

  // Восстановление только валидного значения; бренд по умолчанию — VEZA
  const saved = localStorage.getItem('css-lab-brand');
  const valid = [...options].some(btn => btn.dataset.brandValue === saved);
  applyBrand(saved && valid ? saved : 'veza');
})();

// ===== Nav =====
// Бургер навигационной полосы: раскрывает .nav-menu на узком экране.
// Переходное именование: ставим и легаси .open, и канон .is-open (RULES §2.4).
(function initNav() {
  document.querySelectorAll('.nav .nav-toggle').forEach(toggle => {
    const menu = document.getElementById(toggle.getAttribute('aria-controls') || '');
    if (!menu) return;

    toggle.addEventListener('click', () => {
      const open = !menu.classList.contains('is-open');
      menu.classList.toggle('is-open', open);
      menu.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
  });
})();

// ===== Presence Strip =====
// «Кто на портале»: открытие дропдауна по клику, закрытие вне/Escape
(function initPresenceStrip() {
  document.querySelectorAll('.presence-strip').forEach(strip => {
    const trigger = strip.querySelector('.presence-strip__trigger');
    if (!trigger) return;

    function setOpen(open) {
      strip.classList.toggle('is-open', open);
      trigger.setAttribute('aria-expanded', String(open));
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      setOpen(!strip.classList.contains('is-open'));
    });
    document.addEventListener('click', (e) => {
      if (strip.classList.contains('is-open') && !strip.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && strip.classList.contains('is-open')) {
        setOpen(false);
        trigger.focus();
      }
    });
  });
})();

// ===== User Menu =====
// Открытие по клику, закрытие по клику вне и Escape (порт из corporate-search).
// Клавиатура: фокус на первый пункт при открытии, стрелки циклично двигают
// фокус, Home/End — края, Tab закрывает меню и отдаёт фокус дальше по умолчанию.
(function initUserMenu() {
  document.querySelectorAll('.user-menu').forEach(menu => {
    const trigger = menu.querySelector('.user-menu__trigger');
    const dropdown = menu.querySelector('.user-menu__dropdown');
    if (!trigger || !dropdown) return;
    const items = () => [...dropdown.querySelectorAll('.user-menu__item')];

    function setOpen(open) {
      menu.classList.toggle('is-open', open);
      trigger.setAttribute('aria-expanded', String(open));
      if (open) {
        dropdown.removeAttribute('hidden');
        // Стрелочная навигация доступна сразу — фокус на первом пункте
        items()[0]?.focus();
      } else {
        dropdown.setAttribute('hidden', '');
      }
    }

    // Навигация по пунктам меню без анимации — клавиатурные действия мгновенны
    dropdown.addEventListener('keydown', (e) => {
      const list = items();
      if (!list.length) return;
      const idx = list.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        list[(idx + 1) % list.length].focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        list[(idx - 1 + list.length) % list.length].focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        list[0].focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        list[list.length - 1].focus();
      } else if (e.key === 'Tab') {
        setOpen(false); // закрываем; дефолтный Tab уводит фокус дальше сам
      }
    });

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      setOpen(!menu.classList.contains('is-open'));
    });
    document.addEventListener('click', (e) => {
      if (menu.classList.contains('is-open') && !menu.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        setOpen(false);
        trigger.focus(); // фокус возвращается на триггер
      }
    });
  });
})();

// ===== Drawer =====
// Открытие кнопкой, закрытие по оверлею, крестику и Escape.
// inert вместо aria-hidden: закрытая панель выпадает из Tab-порядка;
// фокус переносится в панель при открытии и возвращается триггеру при закрытии.
// Триггер связан со шторкой атрибутом data-drawer-open="<id шторки>";
// боковая панель и нижний лист — один компонент, поведение общее.
(function initDrawers() {
  document.querySelectorAll('[data-drawer-open]').forEach(openBtn => {
    const drawer = document.getElementById(openBtn.dataset.drawerOpen);
    if (!drawer) return;
    let lastFocused = null;

    drawer.inert = true;
    drawer.removeAttribute('aria-hidden');

    function setOpen(open) {
      if (open === drawer.classList.contains('is-open')) return;
      drawer.classList.toggle('is-open', open);
      drawer.inert = !open;
      // Scroll-lock: фон не прокручивается, пока открыта модальная шторка
      document.documentElement.style.overflow = open ? 'hidden' : '';
      openBtn.setAttribute('aria-expanded', String(open));
      if (open) {
        lastFocused = document.activeElement;
        drawer.querySelector('.drawer__close')?.focus();
      } else {
        (lastFocused || openBtn).focus?.();
      }
    }

    openBtn.addEventListener('click', () => setOpen(true));
    drawer.querySelectorAll('[data-drawer-close]').forEach(el => {
      el.addEventListener('click', () => setOpen(false));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) setOpen(false);
    });
  });
})();

// ===== Accordion =====
// Раскрытие секции по клику на заголовок
(function initAccordion() {
  document.querySelectorAll('.accordion__header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion__item');
      if (!item) return;
      const open = item.classList.toggle('is-open');
      header.setAttribute('aria-expanded', String(open));
    });
  });
})();

// ===== Panel Placement Switch: helper =====
// Витринные чипы «Вниз/Вверх/Шторка» лежат в разметке рядом с пикером, а не
// внутри него. Для обработчиков «клик снаружи» это ложное срабатывание: клик
// по чипу закрыл бы панель, размещение которой чип и переключает.
// Проверяем адресно — управляет ли группа панелью именно этого пикера,
// чужой переключатель по-прежнему закрывает панель как обычный клик снаружи.
function isPanelSwitchFor(target, pickerRoot) {
  const group = target.closest?.('[data-panel-switch]');
  if (!group) return false;
  const panel = document.getElementById(group.dataset.panelSwitch);
  return !!panel && pickerRoot.contains(panel);
}

// ===== Picklist =====
// Открытие панели, синхронизация чипов с чекбоксами, поиск-фильтр опций
(function initPicklist() {
  document.querySelectorAll('.picklist').forEach(picklist => {
    const control = picklist.querySelector('.picklist__control');
    const panel = picklist.querySelector('.picklist__panel');
    if (!control || !panel) return;
    // aria-expanded живёт на кнопке-раскрывателе (клавиатурная точка входа)
    const toggle = picklist.querySelector('.picklist__toggle');

    function setOpen(open) {
      picklist.classList.toggle('is-open', open);
      (toggle || control).setAttribute('aria-expanded', String(open));
    }

    control.addEventListener('click', (e) => {
      // Клик по крестику чипа не открывает панель; клик по toggle
      // обрабатывается здесь же (кнопка внутри контрола, событие всплывает)
      if (e.target.closest('.picklist__chip-remove')) return;
      setOpen(!picklist.classList.contains('is-open'));
    });
    document.addEventListener('click', (e) => {
      // Витринный переключатель размещения лежит вне пикера, но управляет именно
      // его панелью — такой клик не считаем «кликом снаружи». Гасить всплытие
      // на самом чипе нельзя: на document висят и другие потребители клика
      if (isPanelSwitchFor(e.target, picklist)) return;
      if (picklist.classList.contains('is-open') && !picklist.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && picklist.classList.contains('is-open')) setOpen(false);
    });

    // Чипы в контроле ↔ выбранные опции панели. Поддерживаются два вида
    // опций: чекбоксы (.picklist__option input) и чипы-опции (.chip-choice)
    function selectedItems() {
      const boxes = [...panel.querySelectorAll('.picklist__option input:checked')]
        .map(input => ({
          // У двухстрочной опции в чип уходит только код (__option-label),
          // расшифровка (__option-desc) остаётся в списке
          label: (input.closest('.picklist__option').querySelector('.picklist__option-label')
            || input.closest('.picklist__option')).textContent.trim(),
          clear() {
            input.checked = false;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }));
      const chips = [...panel.querySelectorAll('.chip-choice.is-active')]
        .map(opt => ({
          label: opt.dataset.value || opt.textContent.trim(),
          clear() {
            opt.classList.remove('is-active');
            opt.setAttribute('aria-pressed', 'false');
            syncChips();
          }
        }));
      return boxes.concat(chips);
    }
    function syncChips() {
      control.querySelectorAll('.picklist__chip').forEach(chip => chip.remove());
      // Чипы вставляются перед кнопкой-раскрывателем (прямой потомок контрола)
      const caret = control.querySelector('.picklist__toggle');
      selectedItems().forEach(item => {
        const chip = document.createElement('span');
        chip.className = 'picklist__chip';
        chip.append(item.label + ' ');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'picklist__chip-remove';
        btn.setAttribute('aria-label', 'Убрать ' + item.label);
        btn.textContent = '×';
        btn.addEventListener('click', item.clear);
        chip.append(btn);
        control.insertBefore(chip, caret);
      });
    }
    panel.querySelectorAll('.picklist__option input').forEach(input => {
      input.addEventListener('change', syncChips);
    });
    panel.querySelectorAll('.chip-choice').forEach(opt => {
      opt.addEventListener('click', () => {
        const active = opt.classList.toggle('is-active');
        opt.setAttribute('aria-pressed', String(active));
        syncChips();
      });
    });
    // Начальные чипы из разметки заменяем на синхронизированные
    syncChips();

    // Массовые действия: типовой ряд высот оси набирался восемью кликами
    const countEl = panel.querySelector('[data-picklist-count]');
    const optionInputs = () => [...panel.querySelectorAll('.picklist__option input[type="checkbox"]')];

    function syncCount() {
      if (!countEl) return;
      const all = optionInputs();
      countEl.textContent = 'Выбрано ' + all.filter(i => i.checked).length + ' из ' + all.length;
    }
    function setAll(checked) {
      optionInputs().forEach(input => { input.checked = checked; });
      syncChips();
      syncCount();
    }

    panel.querySelectorAll('[data-picklist-select-all]').forEach(btn => {
      btn.addEventListener('click', () => setAll(true));
    });
    panel.querySelectorAll('[data-picklist-clear-all]').forEach(btn => {
      btn.addEventListener('click', () => setAll(false));
    });
    optionInputs().forEach(input => input.addEventListener('change', syncCount));
    syncCount();

    // Поиск-фильтр по опциям
    const search = panel.querySelector('[data-picklist-search]');
    if (search) {
      search.addEventListener('input', () => {
        const q = search.value.trim().toLowerCase();
        let visible = 0;
        panel.querySelectorAll('.picklist__option, .chip-choice').forEach(opt => {
          const match = opt.textContent.toLowerCase().includes(q);
          opt.classList.toggle('is-filtered', !match);
          if (match) visible++;
        });
        const noMatch = panel.querySelector('.picklist__no-match');
        if (noMatch) noMatch.hidden = visible > 0;
      });
      // Клик в поле поиска не закрывает панель
      search.addEventListener('click', (e) => e.stopPropagation());
    }
  });
})();

// ===== Swatch Picker =====
// Дропдаун палитры RAL: наполнение сетки ВСЕМИ цветами RAL Classic из общего
// файла assets/ral-data.js (RAL_DATA/RAL_NAMES/FAMILIES), выбор/снятие образца,
// чипы синхронизируются с выбранным, поиск фильтрует по коду и названию.
(function initSwatchPicker() {
  // Полный набор из общих данных, сгруппированный по семействам
  const SWATCH_DATA = (function buildFromShared() {
    if (typeof RAL_DATA === 'undefined') return [];
    const byFam = {};
    RAL_DATA.split(',').forEach(pair => {
      const [code, hex] = pair.split(':');
      const num = code.slice(3);
      (byFam[num[0]] = byFam[num[0]] || []).push([num, '#' + hex, RAL_NAMES[num] || '']);
    });
    return Object.keys(byFam).sort((a, b) => a.localeCompare(b)).map(fam => {
      byFam[fam].sort((a, b) => a[0].localeCompare(b[0]));
      return [(typeof FAMILIES !== 'undefined' && FAMILIES[fam]) || fam, byFam[fam]];
    });
  })();

  document.querySelectorAll('.swatch-picker').forEach(picker => {
    const control = picker.querySelector('.swatch-picker__control');
    const grid = picker.querySelector('.swatch-picker__grid');
    if (!control || !grid) return;
    const toggle = picker.querySelector('.swatch-picker__toggle');
    const preselect = (picker.dataset.swatchSelected || '').split(',').map(s => s.trim());

    // Наполнение сетки из данных (если помечено data-swatch-fill)
    if (picker.hasAttribute('data-swatch-fill') && !grid.children.length) {
      SWATCH_DATA.forEach(([family, colors]) => {
        const fh = document.createElement('div');
        fh.className = 'swatch-picker__family';
        fh.textContent = family;
        grid.appendChild(fh);
        colors.forEach(([code, hex, name]) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'swatch';
          b.style.background = hex;
          b.dataset.search = (code + ' ' + name).toLowerCase();
          b.setAttribute('aria-pressed', 'false');
          b.setAttribute('aria-label', 'RAL ' + code + ', ' + name.toLowerCase());
          const span = document.createElement('span');
          span.className = 'swatch__code';
          span.textContent = code;
          b.appendChild(span);
          if (preselect.includes(code)) {
            b.classList.add('is-selected');
            b.setAttribute('aria-pressed', 'true');
          }
          grid.appendChild(b);
        });
      });
    }

    // Статические образцы разметки берут цвет из data-swatch-hex: в витрине
    // нет инлайновых стилей, значение приходит данными
    grid.querySelectorAll('.swatch[data-swatch-hex]').forEach(swatch => {
      swatch.style.background = swatch.dataset.swatchHex;
    });

    // Дропдаун: открытие по клику на контрол/кнопку, закрытие вне и Escape
    function setOpen(open) {
      picker.classList.toggle('is-open', open);
      (toggle || control).setAttribute('aria-expanded', String(open));
    }
    control.addEventListener('click', (e) => {
      if (e.target.closest('.swatch-picker__chip-remove')) return;
      setOpen(!picker.classList.contains('is-open'));
    });
    document.addEventListener('click', (e) => {
      // См. picklist: клик по чипу переключателя размещения этой же панели —
      // не «клик снаружи»; точечная оговорка вместо stopPropagation на чипе
      if (isPanelSwitchFor(e.target, picker)) return;
      if (picker.classList.contains('is-open') && !picker.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && picker.classList.contains('is-open')) setOpen(false);
    });

    const placeholder = control.querySelector('.swatch-picker__placeholder');
    const selectedRow = picker.querySelector('[data-swatch-selected-row]');
    const countEl = picker.querySelector('[data-swatch-count]');

    // Строка выбранного внутри панели: увидеть выбор, не закрывая палитру
    function syncSelectedRow() {
      const selected = [...grid.querySelectorAll('.swatch.is-selected')];
      if (countEl) {
        countEl.textContent = selected.length ? 'Выбрано ' + selected.length : 'Ничего не выбрано';
      }
      if (!selectedRow) return;
      selectedRow.textContent = '';
      if (!selected.length) {
        selectedRow.append('Ничего не выбрано');
        return;
      }
      selected.forEach(swatch => {
        const code = swatch.querySelector('.swatch__code')?.textContent || '';
        const chip = document.createElement('span');
        chip.className = 'swatch-picker__chip';
        const dot = document.createElement('i');
        dot.className = 'swatch-picker__chip-color';
        dot.style.background = swatch.style.background;
        chip.append(dot, ' RAL ' + code);
        selectedRow.appendChild(chip);
      });
    }

    // Массовое действие палитры: снять весь выбор
    picker.querySelectorAll('[data-swatch-clear-all]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        grid.querySelectorAll('.swatch.is-selected').forEach(swatch => {
          swatch.classList.remove('is-selected');
          swatch.setAttribute('aria-pressed', 'false');
        });
        syncChips();
      });
    });

    // Чипы выбранных цветов перерисовываются из .is-selected образцов
    function syncChips() {
      control.querySelectorAll('.swatch-picker__chip').forEach(chip => chip.remove());
      grid.querySelectorAll('.swatch.is-selected').forEach(swatch => {
        const code = swatch.querySelector('.swatch__code')?.textContent || '';
        const chip = document.createElement('span');
        chip.className = 'swatch-picker__chip';
        const dot = document.createElement('i');
        dot.className = 'swatch-picker__chip-color';
        dot.style.background = swatch.style.background;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'swatch-picker__chip-remove';
        btn.setAttribute('aria-label', 'Убрать RAL ' + code);
        btn.textContent = '×';
        btn.addEventListener('click', () => {
          swatch.classList.remove('is-selected');
          swatch.setAttribute('aria-pressed', 'false');
          syncChips();
        });
        chip.append(dot, ' RAL ' + code + ' ', btn);
        control.appendChild(chip);
      });
      // Плейсхолдер живёт только в пустом контроле
      if (placeholder) placeholder.hidden = !!control.querySelector('.swatch-picker__chip');
      syncSelectedRow();
    }

    grid.querySelectorAll('.swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        const selected = swatch.classList.toggle('is-selected');
        swatch.setAttribute('aria-pressed', String(selected));
        syncChips();
      });
    });
    syncChips();

    // Поиск по коду и названию образца. Фильтрация — классом .is-filtered
    // (не inline style.display): состояние остаётся в CSS и читается тестами
    const search = picker.querySelector('.swatch-picker__search');
    const noMatch = picker.querySelector('.swatch-picker__no-match');
    const resultCount = picker.querySelector('.swatch-picker__result-count');
    if (search) {
      search.addEventListener('input', () => {
        const q = search.value.trim().toLowerCase();
        const swatches = grid.querySelectorAll('.swatch');
        let visible = 0;
        swatches.forEach(swatch => {
          const hay = swatch.dataset.search ||
            (swatch.querySelector('.swatch__code')?.textContent || '').toLowerCase();
          const match = !q || hay.includes(q);
          swatch.classList.toggle('is-filtered', !match);
          if (match) visible++;
        });
        // Заголовки семейств осмысленны только в полном списке
        grid.querySelectorAll('.swatch-picker__family').forEach(f => {
          f.classList.toggle('is-filtered', !!q);
        });
        if (noMatch) noMatch.hidden = visible > 0;
        if (resultCount) {
          resultCount.textContent = q ? 'Найдено ' + visible + ' из ' + swatches.length : '';
        }
      });
      // Клик в поле поиска не закрывает панель
      search.addEventListener('click', (e) => e.stopPropagation());
    }
  });
})();

// ===== Quiz Nav =====
// Кнопки блоков в шапке теста: переключение активного блока
(function initQuizNav() {
  document.querySelectorAll('.quiz-header__nav').forEach(nav => {
    nav.querySelectorAll('.quiz-header__nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        nav.querySelectorAll('.quiz-header__nav-btn').forEach(b => {
          const active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', String(active));
        });
      });
    });
  });
})();

// ===== Chip Choice =====
// Чипы-опции (мультивыбор): каждый чип — независимый toggle
(function initChipChoice() {
  document.querySelectorAll('[data-chip-multi] .chip-choice').forEach(chip => {
    chip.addEventListener('click', () => {
      const active = chip.classList.toggle('is-active');
      chip.setAttribute('aria-pressed', String(active));
    });
  });
})();

// ===== Quiz =====
// Живой вопрос: проверка ответа с подсветкой верного
(function initQuiz() {
  const live = document.getElementById('demo-quiz-live');
  if (!live) return;
  const options = live.querySelectorAll('.quiz-option');
  options.forEach(option => {
    option.addEventListener('click', () => {
      if (option.disabled || option.classList.contains('is-disabled')) return;
      const correct = option.dataset.quizAnswer === 'correct';
      options.forEach(o => {
        o.disabled = true; // настоящий disabled — выпадает из Tab-порядка
        o.classList.add('is-disabled');
        if (o.dataset.quizAnswer === 'correct') o.classList.add('is-correct');
      });
      if (!correct) option.classList.add('is-wrong');
      live.classList.add(correct ? 'is-correct' : 'is-wrong');
      const id = live.querySelector('.quiz-question__id');
      if (id) {
        const badge = document.createElement('span');
        badge.className = 'quiz-result ' + (correct ? 'quiz-result--ok' : 'quiz-result--fail');
        badge.textContent = correct ? 'Верно' : 'Неверно';
        id.append(' ', badge);
      }
    });
  });
})();

// ===== Form Rows =====
// Повторяемые строки формы: добавление клонированием первой строки, удаление
(function initFormRows() {
  document.querySelectorAll('.form-rows__add[data-rows-target]').forEach(addBtn => {
    const rows = document.getElementById(addBtn.dataset.rowsTarget);
    if (!rows) return;
    const label = rows.dataset.rowLabel || 'Строка';

    function bindRemove(btn) {
      btn.addEventListener('click', () => {
        const card = btn.closest('.row-card');
        if (!card || card.classList.contains('is-removing')) return;
        // Уход с проявлением (row-card.css) + страховка для reduced-motion
        card.classList.add('is-removing');
        card.addEventListener('transitionend', () => { card.remove(); renumber(); }, { once: true });
        setTimeout(() => { card.remove(); renumber(); }, 300);
      });
    }
    function renumber() {
      rows.querySelectorAll('.row-card').forEach((card, i) => {
        const n = card.querySelector('.row-card__n');
        if (n) n.textContent = label + ' ' + (i + 1);
      });
    }

    rows.querySelectorAll('.row-card__remove, .btn-row-del').forEach(bindRemove);

    addBtn.addEventListener('click', () => {
      const template = rows.querySelector('.row-card');
      let card;
      if (template) {
        card = template.cloneNode(true);
        // Чистим значения и снимаем id, чтобы не плодить дубликаты
        card.querySelectorAll('input, textarea').forEach(inp => { inp.value = ''; inp.removeAttribute('id'); });
        card.querySelectorAll('label[for]').forEach(l => l.removeAttribute('for'));
      } else {
        card = document.createElement('div');
        card.className = 'row-card';
        card.innerHTML = '<div class="row-card__head"><span class="row-card__n"></span>' +
          '<button type="button" class="row-card__remove">Удалить</button></div>';
      }
      card.querySelectorAll('.row-card__remove, .btn-row-del').forEach(bindRemove);
      card.classList.add('is-entering'); // вход новой строки (row-card.css)
      card.addEventListener('animationend', () => card.classList.remove('is-entering'), { once: true });
      rows.appendChild(card);
      renumber();
      card.querySelector('input')?.focus();
    });
  });
})();

// ===== RTE Toolbar =====
// Мини-редактор примечаний: форматирование выделения в contenteditable.
// mousedown + preventDefault — чтобы не терять выделение при клике по кнопке.
(function initRte() {
  document.querySelectorAll('.rte-toolbar[data-rte-for]').forEach(toolbar => {
    const area = document.getElementById(toolbar.dataset.rteFor);
    if (!area) return;

    const stateCmds = ['bold', 'italic', 'underline', 'strikeThrough'];
    function syncStates() {
      toolbar.querySelectorAll('[data-rte-cmd]').forEach(btn => {
        const cmd = btn.dataset.rteCmd;
        if (stateCmds.includes(cmd)) {
          btn.setAttribute('aria-pressed', String(document.queryCommandState(cmd)));
        }
      });
    }

    toolbar.querySelectorAll('[data-rte-cmd]').forEach(btn => {
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault(); // сохраняем выделение в rte-area
        area.focus();
        document.execCommand(btn.dataset.rteCmd, false, null);
        syncStates();
      });
    });
    area.addEventListener('keyup', syncStates);
    area.addEventListener('mouseup', syncStates);
  });
})();

// ===== Combobox =====
// Дропдаун-селект витрины: одиночный выбор, поиск-фильтр, мультивыбор с тегами,
// группировка. Открытие по триггеру, закрытие вне/Escape (guard: только когда
// открыт). Клавиатура: ArrowDown/ArrowUp двигают подсветку по видимым опциям,
// Enter выбирает, Escape закрывает и возвращает фокус триггеру.
// Анимация раскрытия целиком в CSS (combobox.css) — JS только меняет классы.
(function initCombobox() {
  document.querySelectorAll('.combobox').forEach(box => {
    const trigger = box.querySelector('.combobox-trigger');
    if (!trigger) return;
    const dropdown = box.querySelector('.combobox-dropdown');
    const valueEl = box.querySelector('.combobox-value');
    const searchInput = box.querySelector('.combobox-search-input');
    const clearBtn = box.querySelector('.combobox-clear');
    const tagsBox = box.querySelector('.combobox-tags');
    const multi = box.classList.contains('combobox-multi');
    // Плейсхолдер: исходный текст «Выберите…» из разметки, иначе — общий
    const placeholder = valueEl && /^Выберите/.test(valueEl.textContent.trim())
      ? valueEl.textContent.trim() : 'Выберите…';

    const isOpen = () => box.classList.contains('is-open') || box.classList.contains('open');
    const visibleOptions = () =>
      [...box.querySelectorAll('.combobox-option')].filter(o => o.style.display !== 'none');

    // Текст опции без служебных значков (галочка/иконка/чекбокс)
    function optionLabel(opt) {
      const clone = opt.cloneNode(true);
      clone.querySelectorAll('.combobox-option-check, .combobox-option-icon, .combobox-option-checkbox')
        .forEach(n => n.remove());
      return clone.textContent.trim();
    }

    // Подсветка: семантический класс по спеке + .highlighted для стилей CSS
    function clearHighlight() {
      box.querySelectorAll('.combobox-option-highlighted').forEach(o =>
        o.classList.remove('combobox-option-highlighted', 'highlighted'));
    }
    function highlight(opt) {
      clearHighlight();
      if (!opt) return;
      opt.classList.add('combobox-option-highlighted', 'highlighted');
      opt.scrollIntoView({ block: 'nearest' });
    }
    function moveHighlight(step) {
      const opts = visibleOptions();
      if (!opts.length) return;
      const cur = opts.findIndex(o => o.classList.contains('combobox-option-highlighted'));
      highlight(opts[(cur + step + opts.length) % opts.length]);
    }

    function setOpen(open) {
      if (open === isOpen()) return;
      box.classList.toggle('open', open);
      box.classList.toggle('is-open', open);
      trigger.setAttribute('aria-expanded', String(open));
      if (open) {
        // Поиск сразу в фокусе — печать без лишнего клика. Двойной rAF:
        // до первого отрисованного кадра visibility дропдауна ещё hidden
        // (транзишен не стартовал), и браузер отклоняет focus()
        requestAnimationFrame(() => requestAnimationFrame(() => {
          if (isOpen()) searchInput?.focus();
        }));
      } else {
        clearHighlight();
        if (searchInput) {
          searchInput.value = '';
          applyFilter('');
        }
      }
    }

    function markSelected(opt, on) {
      // Оба варианта класса: combobox-option-selected (разметка) + selected (CSS)
      opt.classList.toggle('combobox-option-selected', on);
      opt.classList.toggle('selected', on);
    }

    // Мультивыбор: тег с кнопкой удаления, вставляется перед счётчиком «+N»
    function addTag(label) {
      if (!tagsBox) return;
      const tag = document.createElement('span');
      tag.className = 'combobox-tag';
      tag.append(label + ' ');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'combobox-tag-remove';
      btn.setAttribute('aria-label', 'Убрать ' + label);
      btn.textContent = '×';
      tag.append(btn);
      tagsBox.insertBefore(tag, tagsBox.querySelector('.combobox-tag-more'));
    }
    function removeTag(label) {
      [...(tagsBox?.querySelectorAll('.combobox-tag') || [])].forEach(tag => {
        if (tag.textContent.replace('×', '').trim() === label) tag.remove();
      });
    }

    function select(opt) {
      const label = optionLabel(opt);
      if (multi) {
        // Тоггл выбора; дропдаун остаётся открытым — выбирают несколько подряд
        const on = !(opt.classList.contains('combobox-option-selected')
          || opt.classList.contains('selected'));
        markSelected(opt, on);
        if (on) addTag(label); else removeTag(label);
        return;
      }
      box.querySelectorAll('.combobox-option').forEach(o => markSelected(o, false));
      markSelected(opt, true);
      if (valueEl) {
        valueEl.textContent = label;
        valueEl.classList.remove('combobox-placeholder');
      }
      box.classList.add('has-value');
      setOpen(false);
      trigger.focus?.();
    }

    // Живой фильтр опций по подстроке; пустые группы прячутся целиком
    function applyFilter(q) {
      const query = q.trim().toLowerCase();
      box.querySelectorAll('.combobox-option').forEach(opt => {
        opt.style.display = !query || optionLabel(opt).toLowerCase().includes(query) ? '' : 'none';
      });
      box.querySelectorAll('.combobox-group').forEach(group => {
        const any = [...group.querySelectorAll('.combobox-option')]
          .some(o => o.style.display !== 'none');
        group.style.display = any ? '' : 'none';
      });
      clearHighlight();
    }
    searchInput?.addEventListener('input', () => applyFilter(searchInput.value));
    // Клик в поле поиска не закрывает дропдаун
    searchInput?.addEventListener('click', (e) => e.stopPropagation());

    // Открытие/закрытие по триггеру; крестики внутри триггера не переключают
    trigger.addEventListener('click', (e) => {
      if (e.target.closest('.combobox-clear, .combobox-tag-remove')) return;
      setOpen(!isOpen());
    });

    // Выбор опции кликом (делегирование — работает и для групп)
    dropdown?.addEventListener('click', (e) => {
      const opt = e.target.closest('.combobox-option');
      if (opt && !opt.classList.contains('disabled')) select(opt);
    });

    // Крестик очистки значения — сброс к плейсхолдеру
    clearBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      box.querySelectorAll('.combobox-option').forEach(o => markSelected(o, false));
      if (valueEl) {
        valueEl.textContent = placeholder;
        valueEl.classList.add('combobox-placeholder');
      }
      box.classList.remove('has-value');
    });

    // Удаление тегов мультивыбора (включая изначальные из разметки)
    box.addEventListener('click', (e) => {
      const btn = e.target.closest('.combobox-tag-remove');
      if (!btn) return;
      e.stopPropagation();
      const tag = btn.closest('.combobox-tag');
      const label = tag.textContent.replace('×', '').trim();
      box.querySelectorAll('.combobox-option').forEach(o => {
        if (optionLabel(o) === label) markSelected(o, false);
      });
      tag.remove();
    });

    // Клавиатура: стрелки — подсветка, Enter — выбор подсвеченного
    box.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!isOpen()) setOpen(true);
        moveHighlight(e.key === 'ArrowDown' ? 1 : -1);
      } else if (e.key === 'Enter' && isOpen()) {
        const hi = box.querySelector('.combobox-option-highlighted');
        if (hi) {
          e.preventDefault(); // иначе кнопка-триггер своим кликом закроет дропдаун
          select(hi);
        }
      }
    });

    // Закрытие по клику вне и Escape — guard: только когда открыт
    document.addEventListener('click', (e) => {
      if (isOpen() && !box.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) {
        setOpen(false);
        trigger.focus?.();
      }
    });
  });
})();

// ===== Date Picker =====
// Календарь: dropdown из поля, режимы single/range, inline-вариант.
// Разметка-контейнер: .date-picker[data-datepicker][data-mode][data-inline?]
(function initDatePickers() {
  const MONTHS = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const fmt = (d) => d.toLocaleDateString('ru-RU');
  const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  document.querySelectorAll('[data-datepicker]').forEach(picker => {
    const mode = picker.dataset.mode || 'single';
    const inline = picker.hasAttribute('data-inline');
    const dropdown = picker.querySelector('.date-picker-dropdown');
    const inputBtn = picker.querySelector('.date-picker-input');
    const inputText = picker.querySelector('.date-picker-input-text');
    if (!dropdown) return;

    const today = new Date();
    let view = new Date(today.getFullYear(), today.getMonth(), 1);
    let selected = null;         // single
    let rangeStart = null, rangeEnd = null; // range

    function setOpen(open) {
      picker.classList.toggle('open', open);
      inputBtn?.setAttribute('aria-expanded', String(open));
    }

    function updateInput() {
      if (!inputText) return;
      let text = '';
      if (mode === 'single' && selected) text = fmt(selected);
      if (mode === 'range' && rangeStart) {
        text = fmt(rangeStart) + (rangeEnd ? ' – ' + fmt(rangeEnd) : ' – …');
      }
      inputText.textContent = text || (mode === 'range' ? 'Выберите период' : 'Выберите дату');
      inputText.classList.toggle('date-picker-input-placeholder', !text);
    }

    function pick(d) {
      if (mode === 'single') {
        selected = d;
        updateInput();
        render();
        if (!inline) setOpen(false);
        return;
      }
      // range: старт → конец; клик раньше старта начинает диапазон заново
      if (!rangeStart || rangeEnd) {
        rangeStart = d; rangeEnd = null;
      } else if (d < rangeStart) {
        rangeStart = d;
      } else {
        rangeEnd = d;
      }
      updateInput();
      render();
      if (!inline && rangeEnd) setOpen(false);
    }

    function render() {
      const y = view.getFullYear(), m = view.getMonth();
      dropdown.textContent = '';

      // Шапка: ‹ Месяц Год ›
      const header = document.createElement('div');
      header.className = 'date-picker-header';
      const title = document.createElement('span');
      title.className = 'date-picker-title';
      title.textContent = MONTHS[m] + ' ' + y;
      const nav = document.createElement('div');
      nav.className = 'date-picker-nav';
      [['‹', -1, 'Предыдущий месяц'], ['›', 1, 'Следующий месяц']].forEach(([ch, step, label]) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'date-picker-nav-btn';
        b.textContent = ch;
        b.setAttribute('aria-label', label);
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          view = new Date(y, m + step, 1);
          render();
          // render() пересоздаёт DOM — возвращаем фокус на ту же кнопку,
          // иначе листать месяцы с клавиатуры невозможно
          dropdown.querySelector('.date-picker-nav-btn:' + (step < 0 ? 'first-child' : 'last-child'))?.focus();
        });
        nav.appendChild(b);
      });
      header.append(title, nav);

      // Дни недели
      const wd = document.createElement('div');
      wd.className = 'date-picker-weekdays';
      WEEKDAYS.forEach(w => {
        const s = document.createElement('span');
        s.className = 'date-picker-weekday';
        s.textContent = w;
        wd.appendChild(s);
      });

      // Сетка дней: недели с понедельника, хвосты соседних месяцев
      const days = document.createElement('div');
      days.className = 'date-picker-days';
      const firstDow = (new Date(y, m, 1).getDay() + 6) % 7; // 0 = Пн
      const start = new Date(y, m, 1 - firstDow);
      for (let i = 0; i < 42; i++) {
        const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'date-picker-day';
        b.textContent = String(d.getDate());
        b.setAttribute('aria-label', fmt(d));
        if (d.getMonth() !== m) b.classList.add('other-month');
        if (sameDay(d, today)) b.classList.add('today');
        if (mode === 'single' && sameDay(d, selected)) b.classList.add('selected');
        if (mode === 'range') {
          if (sameDay(d, rangeStart)) b.classList.add(rangeEnd ? 'range-start' : 'selected');
          if (sameDay(d, rangeEnd)) b.classList.add('range-end');
          if (rangeStart && rangeEnd && d > rangeStart && d < rangeEnd) b.classList.add('in-range');
        }
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          pick(d);
        });
        days.appendChild(b);
      }

      // Подвал: Сегодня / Очистить
      const footer = document.createElement('div');
      footer.className = 'date-picker-footer';
      const btnToday = document.createElement('button');
      btnToday.type = 'button';
      btnToday.className = 'date-picker-today-btn';
      btnToday.textContent = 'Сегодня';
      btnToday.addEventListener('click', (e) => {
        e.stopPropagation();
        view = new Date(today.getFullYear(), today.getMonth(), 1);
        pick(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
      });
      const btnClear = document.createElement('button');
      btnClear.type = 'button';
      btnClear.className = 'date-picker-clear-btn';
      btnClear.textContent = 'Очистить';
      btnClear.addEventListener('click', (e) => {
        e.stopPropagation();
        selected = null; rangeStart = null; rangeEnd = null;
        updateInput();
        render();
      });
      footer.append(btnToday, btnClear);

      dropdown.append(header, wd, days, footer);
    }

    if (inputBtn && !inline) {
      inputBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        setOpen(!picker.classList.contains('open'));
      });
      document.addEventListener('click', (e) => {
        if (picker.classList.contains('open') && !picker.contains(e.target)) setOpen(false);
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && picker.classList.contains('open')) {
          setOpen(false);
          inputBtn.focus();
        }
      });
    }

    // Свайп-вниз закрывает мобильную шторку календаря (Apple, fluid interfaces):
    // шторка ведётся за пальцем 1:1, вверх — упругая резинка, решение о закрытии
    // принимается по скорости отпускания, а не только по дистанции.
    if (!inline) {
      const mqMobile = window.matchMedia('(max-width: 767px)');
      const GRAB_ZONE = 56; // px от верха шторки: ручка + шапка календаря
      let drag = null;

      dropdown.addEventListener('pointerdown', (e) => {
        // Мультитач-защита: второй палец не перехватывает начатый жест
        if (drag || !mqMobile.matches || !picker.classList.contains('open')) return;
        const rect = dropdown.getBoundingClientRect();
        if (e.clientY - rect.top > GRAB_ZONE) return; // хват только за верхнюю зону
        drag = {
          id: e.pointerId,
          startY: e.clientY,
          height: rect.height,
          prevY: e.clientY,
          prevT: performance.now(),
          velocity: 0,
          offset: 0
        };
        // capture: жест продолжается, даже если палец ушёл за границы шторки
        dropdown.setPointerCapture(e.pointerId);
        dropdown.style.transition = 'none'; // палец ведёт шторку 1:1, без transition
      });

      dropdown.addEventListener('pointermove', (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        const now = performance.now();
        const dt = now - drag.prevT;
        // Мгновенная скорость по последнему сэмплу — понадобится на отпускании
        if (dt > 0) drag.velocity = (e.clientY - drag.prevY) / dt;
        drag.prevY = e.clientY;
        drag.prevT = now;
        const dy = e.clientY - drag.startY;
        // Вниз — 1:1 за пальцем; вверх — резинка (движение вдвое слабее)
        drag.offset = dy >= 0 ? dy : dy / 2;
        dropdown.style.transform = 'translateY(' + drag.offset + 'px)';
      });

      function endDrag(e) {
        if (!drag || e.pointerId !== drag.id) return;
        const { offset, velocity, height } = drag;
        drag = null;
        // Закрытие: быстрый флик вниз ИЛИ протянуто дальше 40% высоты —
        // но флик ВВЕРХ в момент отпускания отменяет закрытие (жест уважается)
        if (velocity > 0.11 || (offset > height * 0.4 && velocity >= 0)) {
          // Инлайн-стили снимаем — CSS-транзишен шторки (ease-drawer) сам
          // доигрывает выход с текущей позиции; путь входа и выхода совпадает
          dropdown.style.transition = '';
          dropdown.style.transform = '';
          setOpen(false);
          inputBtn?.focus();
          return;
        }
        /* PURPOSE: preventing a jarring change — недотянутая шторка мягко
           возвращается на место, а не телепортируется */
        dropdown.style.transition = 'transform var(--duration-exit) var(--ease-out)';
        dropdown.style.transform = '';
        const cleanup = () => { dropdown.style.transition = ''; };
        dropdown.addEventListener('transitionend', cleanup, { once: true });
        setTimeout(cleanup, 200); // страховка: при reduced-motion transitionend не придёт
      }
      dropdown.addEventListener('pointerup', endDrag);
      dropdown.addEventListener('pointercancel', endDrag);
    }

    render();
    updateInput();
  });
})();

// ===== Log View Toggle =====
// Тумблер «Вид: Текст/JSON» в лог-вьювере — переключает представление записей
(function initLogViewToggle() {
  const toggle = document.getElementById('demo-log-view-toggle');
  const textView = document.getElementById('demo-log-entries');
  const jsonView = document.getElementById('demo-log-json');
  if (!toggle || !textView || !jsonView) return;
  toggle.querySelectorAll('.view-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const isJson = btn.dataset.logView === 'json';
      toggle.querySelectorAll('.view-mode-btn').forEach(b => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      textView.hidden = isJson;
      jsonView.hidden = !isJson;
    });
  });
})();

// ===== Filter Pills =====
// Удаление пилюли и сброс всех; фокус после удаления не «умирает»
(function initFilterPills() {
  const bar = document.getElementById('demo-filter-pills');
  if (!bar) return;
  const clearBtn = bar.querySelector('.filter-pills__clear');
  bar.querySelectorAll('.filter-pill__remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const pill = btn.closest('.filter-pill');
      const next = pill?.nextElementSibling?.querySelector?.('.filter-pill__remove') || clearBtn;
      pill?.remove();
      next?.focus();
    });
  });
  clearBtn?.addEventListener('click', () => {
    bar.querySelectorAll('.filter-pill').forEach(pill => pill.remove());
  });
})();

// ===== Form Error Summary =====
// Сводка ошибок вместо alert(): показ по попытке отправки (фокус уходит на
// контейнер с role=alert), ссылка сводки ведёт к своему полю и ставит на него
// фокус. Появление и уход рисует CSS по классу .is-visible — JS только состояние.
(function initFormErrorSummary() {
  function fieldOf(link) {
    const href = link.getAttribute('href') || '';
    return href.startsWith('#') ? document.getElementById(href.slice(1)) : null;
  }

  document.querySelectorAll('.form-error-summary').forEach(summary => {
    summary.addEventListener('click', (e) => {
      const link = e.target.closest('.form-error-summary__link');
      if (!link) return;
      const field = fieldOf(link);
      if (!field) return;
      e.preventDefault();
      // scrollIntoView мгновенный при reduced-motion (ME-06)
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      field.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
      field.focus({ preventScroll: true });
    });
  });

  document.querySelectorAll('[data-error-summary]').forEach(btn => {
    const summary = document.getElementById(btn.dataset.errorSummary);
    if (!summary) return;
    btn.addEventListener('click', () => {
      summary.hidden = false;
      summary.classList.add('is-visible');
      // Перечисленные в сводке поля помечаются невалидными — рамка и текст
      // ошибки перестают быть единственным носителем (SC 1.4.1 / 3.3.1)
      summary.querySelectorAll('.form-error-summary__link').forEach(link => {
        fieldOf(link)?.setAttribute('aria-invalid', 'true');
      });
      summary.focus();
    });
  });
})();

// ===== Char Counter =====
// Счётчик символов под textarea/rte-area: [data-counter] указывает на id
// элемента-счётчика; пороги 90% и лимит переключают состояния
(function initCharCounter() {
  document.querySelectorAll('[data-counter]').forEach(field => {
    const out = document.getElementById(field.dataset.counter);
    if (!out) return;
    const max = Number(field.getAttribute('maxlength')) || 0;

    function render() {
      const len = (field.value ?? field.textContent ?? '').length;
      out.textContent = max ? len + ' / ' + max : String(len);
      out.classList.toggle('is-near-limit', max > 0 && len >= max * 0.9 && len < max);
      out.classList.toggle('is-over-limit', max > 0 && len >= max);
    }

    field.addEventListener('input', render);
    render();
  });
})();

// ===== Copy Button =====
// Копирование содержимого элемента ([data-copy-for] → id источника).
// Подтверждение — класс .is-copied на ~1,2 с; буфер может быть недоступен
// (небезопасный контекст, отказ в разрешении) — состояние всё равно показываем
(function initCopyButtons() {
  document.querySelectorAll('[data-copy-for]').forEach(btn => {
    const source = document.getElementById(btn.dataset.copyFor);
    if (!source) return;
    const idleLabel = btn.textContent.trim();
    let timer = null;

    btn.addEventListener('click', () => {
      const text = source.textContent.trim();
      Promise.resolve(navigator.clipboard?.writeText(text)).catch(() => {});
      btn.classList.add('is-copied');
      btn.textContent = 'Скопировано';
      clearTimeout(timer);
      timer = setTimeout(() => {
        btn.classList.remove('is-copied');
        btn.textContent = idleLabel;
      }, 1200);
    });
  });
})();

// ===== Multiline Tooltip Popup =====
// JS-позиционируемый тултип для многострочных инженерных расшифровок
// ([data-tip-multiline]). Текст дублирован в .sr-only + aria-describedby,
// поэтому сам попап скрыт от AT. Анимация входа — целиком в tooltip.css.
(function initMultilineTips() {
  const GAP = 8; // зазор между триггером и попапом, px

  document.querySelectorAll('[data-tip-multiline]').forEach(trigger => {
    let tip = null;

    function hide() {
      tip?.remove();
      tip = null;
    }

    function show() {
      if (tip) return;
      tip = document.createElement('div');
      // tooltip-bottom = попап под триггером, origin у верхней кромки
      tip.className = 'tooltip-popup tooltip-multiline tooltip-bottom';
      tip.setAttribute('aria-hidden', 'true');
      tip.textContent = trigger.dataset.tipMultiline;
      document.body.appendChild(tip);
      const rect = trigger.getBoundingClientRect();
      tip.style.left = (window.scrollX + rect.left) + 'px';
      tip.style.top = (window.scrollY + rect.bottom + GAP) + 'px';
    }

    trigger.addEventListener('mouseenter', show);
    trigger.addEventListener('mouseleave', hide);
    trigger.addEventListener('focus', show);
    trigger.addEventListener('blur', hide);
    trigger.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
  });
})();

// ===== Panel Placement Switch =====
// Витринный переключатель размещения панели пикера: в бою классы --top/--sheet
// ставит JS, замерив свободное место до кромки вьюпорта, поэтому иначе эти
// состояния на витрине не воспроизвести. Группа кнопок несёт полное имя класса
// в data-panel-variant, пустое значение = размещение по умолчанию (вниз).
(function initPanelPlacementSwitch() {
  document.querySelectorAll('[data-panel-switch]').forEach(group => {
    const panel = document.getElementById(group.dataset.panelSwitch);
    if (!panel) return;
    const buttons = [...group.querySelectorAll('[data-panel-variant]')];
    const picker = panel.closest('.picklist, .swatch-picker');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        // Всплытие НЕ гасим: на document висят и другие потребители клика
        // (комбобокс, меню, календарь) — они должны закрыться по клику по чипу.
        // Оговорку «это не клик снаружи» делают сами пикеры (isPanelSwitchFor)
        buttons.forEach(other => {
          if (other.dataset.panelVariant) panel.classList.remove(other.dataset.panelVariant);
          const active = other === btn;
          other.classList.toggle('is-active', active);
          other.setAttribute('aria-pressed', String(active));
        });
        if (btn.dataset.panelVariant) panel.classList.add(btn.dataset.panelVariant);
        // Панель показываем сразу — иначе выбранное размещение не увидеть
        picker?.classList.add('is-open');
        picker?.querySelector('.picklist__toggle, .swatch-picker__toggle')
          ?.setAttribute('aria-expanded', 'true');
      });
    });
  });
})();

// ===== Dependent Field Group =====
// Прогрессивное раскрытие: управляющее поле показывает зависимую группу.
// hidden снимается до проявления, is-hidden держит opacity — высота не
// анимируется (layout-свойство), уход ждёт конца перехода
(function initDependentGroups() {
  document.querySelectorAll('[data-dependent-target]').forEach(control => {
    const group = document.getElementById(control.dataset.dependentTarget);
    if (!group) return;
    const values = (control.dataset.dependentValues || '').split(',').map(v => v.trim());
    let hideTimer = null;

    function apply() {
      const show = values.includes(control.value);
      clearTimeout(hideTimer);
      if (show) {
        group.hidden = false;
        // Кадр на применение display перед снятием is-hidden — иначе перехода нет
        requestAnimationFrame(() => group.classList.remove('is-hidden'));
      } else {
        group.classList.add('is-hidden');
        hideTimer = setTimeout(() => { group.hidden = true; }, 200);
      }
    }

    control.addEventListener('change', apply);
    apply();
  });
})();

// ===== Editable Table Rows =====
// Удаление строки редактируемой таблицы + перенумерация первой колонки
(function initTableFormRows() {
  document.querySelectorAll('table.table--form').forEach(table => {
    function renumber() {
      table.querySelectorAll('tbody tr').forEach((row, i) => {
        const cell = row.querySelector('td');
        if (cell) cell.textContent = String(i + 1);
      });
    }
    table.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-table-row-remove]');
      if (!btn) return;
      btn.closest('tr')?.remove();
      renumber();
    });
  });
})();
