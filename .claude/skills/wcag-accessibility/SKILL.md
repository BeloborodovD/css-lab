---
name: wcag-accessibility
description: >
  Web accessibility standards: WCAG 2.2, ARIA patterns, keyboard navigation,
  screen reader support, color contrast. Use when implementing accessible components,
  auditing accessibility, or fixing a11y issues.
allowed-tools: Read, Grep, Glob
---

# WCAG Accessibility Guidelines

## WCAG 2.2 Принципы (POUR)

### Perceivable (Воспринимаемый)
- Текстовые альтернативы для изображений
- Субтитры для видео/аудио
- Контраст цветов
- Масштабируемый текст

### Operable (Управляемый)
- Клавиатурная доступность
- Достаточное время
- Без мерцания
- Навигация

### Understandable (Понятный)
- Читаемый язык
- Предсказуемое поведение
- Помощь при вводе

### Robust (Надёжный)
- Валидный HTML
- Совместимость с AT

## Уровни соответствия

| Уровень | Описание | Требования |
|---------|----------|------------|
| **A** | Минимальный | Базовая доступность |
| **AA** | Стандартный | Юридические требования |
| **AAA** | Расширенный | Максимальная доступность |

**AA — рекомендуемый уровень** для большинства проектов.

## Контраст цветов

### Требования
| Элемент | AA | AAA |
|---------|----|----|
| Обычный текст | 4.5:1 | 7:1 |
| Крупный текст (18pt+) | 3:1 | 4.5:1 |
| UI компоненты | 3:1 | 3:1 |

### Проверка
```javascript
// Формула относительной яркости
function luminance(r, g, b) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrastRatio(l1, l2) {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
```

## ARIA Атрибуты

### Первое правило ARIA
> Не используй ARIA, если есть нативный HTML элемент.

```html
<!-- Плохо -->
<div role="button" tabindex="0">Нажми</div>

<!-- Хорошо -->
<button>Нажми</button>
```

### Роли (role)
```html
<!-- Landmarks -->
<nav role="navigation">...</nav>
<main role="main">...</main>
<aside role="complementary">...</aside>
<footer role="contentinfo">...</footer>

<!-- Widgets -->
<div role="dialog">...</div>
<div role="alert">...</div>
<div role="tablist">...</div>
<div role="menu">...</div>
```

### Состояния (aria-*)
```html
<!-- Expanded/Collapsed -->
<button aria-expanded="false" aria-controls="menu">Меню</button>
<ul id="menu" hidden>...</ul>

<!-- Selected -->
<div role="tab" aria-selected="true">Tab 1</div>

<!-- Disabled -->
<button aria-disabled="true">Недоступно</button>

<!-- Current -->
<a href="/" aria-current="page">Главная</a>
```

### Связи
```html
<!-- Label -->
<label id="name-label">Имя</label>
<input aria-labelledby="name-label" />

<!-- Description -->
<input aria-describedby="name-hint name-error" />
<span id="name-hint">Введите полное имя</span>
<span id="name-error">Обязательное поле</span>

<!-- Controls -->
<button aria-controls="panel-1">Открыть панель</button>
<div id="panel-1">...</div>
```

### Live Regions
```html
<!-- Вежливое (не прерывает) -->
<div aria-live="polite">Данные обновлены</div>

<!-- Ассертивное (прерывает) -->
<div aria-live="assertive" role="alert">Ошибка!</div>

<!-- Atomic (читает всё содержимое) -->
<div aria-live="polite" aria-atomic="true">
  Товаров в корзине: <span>5</span>
</div>
```

## Клавиатурная навигация

### Focus Management
```css
/* Видимый фокус */
:focus {
  outline: 2px solid #005fcc;
  outline-offset: 2px;
}

/* Убираем только для мыши */
:focus:not(:focus-visible) {
  outline: none;
}

/* Оставляем для клавиатуры */
:focus-visible {
  outline: 2px solid #005fcc;
}
```

### Tab Order
```html
<!-- Естественный порядок -->
<button>Первый</button>
<button>Второй</button>
<button>Третий</button>

<!-- Изменение порядка (избегать!) -->
<button tabindex="2">Второй</button>
<button tabindex="1">Первый</button>
<button tabindex="3">Третий</button>

<!-- Убрать из tab order -->
<button tabindex="-1">Не в tab order</button>
```

### Skip Links
```html
<a href="#main-content" class="skip-link">
  Перейти к основному содержимому
</a>

<main id="main-content">...</main>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  padding: 8px;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}
```

### Modal Focus Trap
```typescript
function trapFocus(element: HTMLElement) {
  const focusable = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusable[0] as HTMLElement;
  const last = focusable[focusable.length - 1] as HTMLElement;

  element.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  });

  first.focus();
}
```

## Компоненты (ARIA Patterns)

### Кнопка
```html
<button type="button">
  Действие
</button>

<!-- Кнопка-переключатель -->
<button type="button" aria-pressed="false">
  Включить уведомления
</button>
```

### Аккордеон
```html
<div class="accordion">
  <h3>
    <button
      aria-expanded="false"
      aria-controls="panel-1"
      id="header-1"
    >
      Заголовок 1
    </button>
  </h3>
  <div
    id="panel-1"
    role="region"
    aria-labelledby="header-1"
    hidden
  >
    Содержимое панели
  </div>
</div>
```

### Табы
```html
<div role="tablist" aria-label="Табы">
  <button
    role="tab"
    aria-selected="true"
    aria-controls="panel-1"
    id="tab-1"
  >
    Tab 1
  </button>
  <button
    role="tab"
    aria-selected="false"
    aria-controls="panel-2"
    id="tab-2"
    tabindex="-1"
  >
    Tab 2
  </button>
</div>

<div
  role="tabpanel"
  id="panel-1"
  aria-labelledby="tab-1"
>
  Содержимое 1
</div>
<div
  role="tabpanel"
  id="panel-2"
  aria-labelledby="tab-2"
  hidden
>
  Содержимое 2
</div>
```

### Модальное окно
```html
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">Подтверждение</h2>
  <p id="dialog-description">Вы уверены?</p>
  <button>Да</button>
  <button>Нет</button>
</div>
```

## Формы

### Labels
```html
<!-- Явная связь -->
<label for="email">Email</label>
<input type="email" id="email" name="email" />

<!-- Неявная связь -->
<label>
  Email
  <input type="email" name="email" />
</label>

<!-- Aria-label (когда нет видимого label) -->
<input type="search" aria-label="Поиск по сайту" />
```

### Ошибки
```html
<label for="email">Email</label>
<input
  type="email"
  id="email"
  aria-invalid="true"
  aria-describedby="email-error"
/>
<span id="email-error" role="alert">
  Введите корректный email
</span>
```

### Required
```html
<label for="name">
  Имя <span aria-hidden="true">*</span>
</label>
<input
  type="text"
  id="name"
  aria-required="true"
  required
/>
```

## Изображения

### Декоративные
```html
<img src="decoration.png" alt="" role="presentation" />
```

### Информативные
```html
<img src="graph.png" alt="График роста продаж за 2024 год: январь - 100, декабрь - 250" />
```

### Сложные (с длинным описанием)
```html
<figure>
  <img src="chart.png" alt="Диаграмма распределения" aria-describedby="chart-desc" />
  <figcaption id="chart-desc">
    Подробное описание диаграммы...
  </figcaption>
</figure>
```

## Тестирование

### Автоматические инструменты
```bash
# axe-core
npm install @axe-core/react

# pa11y
npx pa11y http://localhost:3000

# Lighthouse
# Chrome DevTools → Lighthouse → Accessibility
```

### Ручное тестирование
1. **Tab** — навигация по интерактивным элементам
2. **Enter/Space** — активация элементов
3. **Escape** — закрытие модалок/меню
4. **Arrow keys** — навигация в виджетах
5. Screen reader (NVDA, VoiceOver)

### Чек-лист
- [ ] Все изображения имеют alt
- [ ] Контраст текста ≥4.5:1
- [ ] Focus visible на всех элементах
- [ ] Формы имеют labels
- [ ] Ошибки связаны с полями
- [ ] Skip link присутствует
- [ ] Модалки ловят фокус
- [ ] Нет автоплея со звуком

## prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Для сложных задач
Если требуется:
- Полный аудит доступности
- Исправление сложных компонентов
- Интеграция с screen readers

→ Делегируй агенту `dev-accessibility`