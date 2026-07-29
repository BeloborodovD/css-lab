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
  // Support both .sidebar.resizable and .app-sidebar.resizable
  const sidebars = document.querySelectorAll('.sidebar.resizable, .app-sidebar.resizable');

  sidebars.forEach(sidebar => {
    const handle = sidebar.querySelector('.sidebar-resize-handle');
    if (!handle) return;

    const isLeft = sidebar.classList.contains('left');
    const minWidth = 200;
    const maxWidth = 500;

    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isResizing = true;
      startX = e.clientX;
      startWidth = sidebar.offsetWidth;

      sidebar.classList.add('resizing');
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
      sidebar.classList.remove('resizing');
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
// Открытие по клику, закрытие по клику вне и Escape (порт из corporate-search)
(function initUserMenu() {
  document.querySelectorAll('.user-menu').forEach(menu => {
    const trigger = menu.querySelector('.user-menu__trigger');
    const dropdown = menu.querySelector('.user-menu__dropdown');
    if (!trigger || !dropdown) return;

    function setOpen(open) {
      menu.classList.toggle('is-open', open);
      trigger.setAttribute('aria-expanded', String(open));
      if (open) {
        dropdown.removeAttribute('hidden');
      } else {
        dropdown.setAttribute('hidden', '');
      }
    }

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
(function initDrawer() {
  const drawer = document.getElementById('demo-drawer');
  const openBtn = document.getElementById('demo-drawer-open');
  if (!drawer || !openBtn) return;
  let lastFocused = null;

  drawer.inert = true;
  drawer.removeAttribute('aria-hidden');

  function setOpen(open) {
    if (open === drawer.classList.contains('is-open')) return;
    drawer.classList.toggle('is-open', open);
    drawer.inert = !open;
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
      if (picklist.classList.contains('is-open') && !picklist.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && picklist.classList.contains('is-open')) setOpen(false);
    });

    // Чипы ↔ чекбоксы: чипы перерисовываются из отмеченных опций
    function syncChips() {
      control.querySelectorAll('.picklist__chip').forEach(chip => chip.remove());
      // Чипы вставляются перед кнопкой-раскрывателем (прямой потомок контрола)
      const caret = control.querySelector('.picklist__toggle');
      panel.querySelectorAll('.picklist__option input:checked').forEach(input => {
        const label = input.closest('.picklist__option').textContent.trim();
        const chip = document.createElement('span');
        chip.className = 'picklist__chip';
        chip.append(label + ' ');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'picklist__chip-remove';
        btn.setAttribute('aria-label', 'Убрать ' + label);
        btn.textContent = '×';
        btn.addEventListener('click', () => {
          input.checked = false;
          // Событие change — чтобы внешние подписчики узнали о снятии
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
        chip.append(btn);
        control.insertBefore(chip, caret);
      });
    }
    panel.querySelectorAll('.picklist__option input').forEach(input => {
      input.addEventListener('change', syncChips);
    });
    // Начальные чипы из разметки заменяем на синхронизированные
    syncChips();

    // Поиск-фильтр по опциям
    const search = panel.querySelector('[data-picklist-search]');
    if (search) {
      search.addEventListener('input', () => {
        const q = search.value.trim().toLowerCase();
        let visible = 0;
        panel.querySelectorAll('.picklist__option').forEach(opt => {
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
// Дропдаун палитры RAL: наполнение сетки из данных, выбор/снятие образца,
// чипы синхронизируются с выбранным, поиск фильтрует по коду и названию.
(function initSwatchPicker() {
  // Демо-набор RAL по семействам (подмножество RAL Classic — хватает для скролла)
  const SWATCH_DATA = [
    ['Жёлтые (1000)', [['1003', '#F9A900', 'Сигнальный жёлтый'], ['1013', '#E3D9C7', 'Жемчужно-белый'], ['1018', '#FACA31', 'Цинково-жёлтый'], ['1021', '#F6B600', 'Рапсово-жёлтый'], ['1028', '#FF9C00', 'Дынно-жёлтый']]],
    ['Оранжевые (2000)', [['2004', '#E25304', 'Чистый оранжевый'], ['2009', '#DE5308', 'Транспортный оранжевый'], ['2011', '#E26E0F', 'Насыщенный оранжевый']]],
    ['Красные (3000)', [['3000', '#A72920', 'Огненно-красный'], ['3003', '#861A22', 'Рубиново-красный'], ['3005', '#59191F', 'Винно-красный'], ['3020', '#BB1F11', 'Транспортный красный']]],
    ['Синие (5000)', [['5000', '#304F6E', 'Фиолетово-синий'], ['5002', '#00387A', 'Ультрамарин'], ['5005', '#005387', 'Сигнальный синий'], ['5008', '#2B3A44', 'Серо-синий'], ['5010', '#004F7C', 'Горечавково-синий'], ['5012', '#0089B6', 'Голубой'], ['5015', '#007CAF', 'Небесно-синий'], ['5021', '#007577', 'Водно-синий']]],
    ['Зелёные (6000)', [['6002', '#325928', 'Лиственно-зелёный'], ['6005', '#114232', 'Зелёный мох'], ['6018', '#60993B', 'Жёлто-зелёный'], ['6026', '#005F4E', 'Опаловый зелёный'], ['6029', '#006F3D', 'Мятно-зелёный'], ['6033', '#45877F', 'Мятно-бирюзовый'], ['6037', '#008B29', 'Чистый зелёный']]],
    ['Серые (7000)', [['7004', '#9A9B9B', 'Сигнальный серый'], ['7016', '#383E42', 'Антрацитово-серый'], ['7024', '#45494E', 'Графитовый серый'], ['7035', '#C5C7C4', 'Светло-серый'], ['7040', '#989EA1', 'Оконно-серый'], ['7047', '#C8C8C7', 'Телегрей 4']]],
    ['Коричневые (8000)', [['8004', '#8D4931', 'Медно-коричневый'], ['8017', '#442F29', 'Шоколадно-коричневый'], ['8028', '#513A2A', 'Терракотовый']]],
    ['Белые и чёрные (9000)', [['9003', '#ECECE7', 'Сигнальный белый'], ['9005', '#0E0E10', 'Чёрный янтарный'], ['9006', '#A1A1A0', 'Бело-алюминиевый'], ['9010', '#F1EDE1', 'Чисто-белый'], ['9016', '#F1F1EA', 'Транспортный белый']]]
  ];

  // Светлота для контраста плашки-кода не нужна (скрим), но нужна для галочки
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
      if (picker.classList.contains('is-open') && !picker.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && picker.classList.contains('is-open')) setOpen(false);
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
    }

    grid.querySelectorAll('.swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        const selected = swatch.classList.toggle('is-selected');
        swatch.setAttribute('aria-pressed', String(selected));
        syncChips();
      });
    });
    syncChips();

    // Поиск по коду и названию образца
    const search = picker.querySelector('.swatch-picker__search');
    if (search) {
      search.addEventListener('input', () => {
        const q = search.value.trim().toLowerCase();
        grid.querySelectorAll('.swatch').forEach(swatch => {
          const hay = swatch.dataset.search ||
            (swatch.querySelector('.swatch__code')?.textContent || '').toLowerCase();
          swatch.style.display = !q || hay.includes(q) ? '' : 'none';
        });
        grid.querySelectorAll('.swatch-picker__family').forEach(f => {
          f.style.display = q ? 'none' : '';
        });
      });
      // Клик в поле поиска не закрывает панель
      search.addEventListener('click', (e) => e.stopPropagation());
    }
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
        btn.closest('.row-card')?.remove();
        renumber();
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
