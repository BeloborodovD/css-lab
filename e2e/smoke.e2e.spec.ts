// [TEST:e2e.smoke]
// Смоук всех страниц сайта-витрины: загрузка без ошибок консоли,
// переключение бренда, ключевой интерактив каждой страницы.
import { test, expect, type Locator, type Page } from '@playwright/test';

// Собираем ошибки консоли страницы (favicon 404 — известный шум статики)
function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !msg.text().includes('favicon')) {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => errors.push(String(err)));
  return errors;
}

const PAGES = [
  '/index.html',
  '/components.html',
  '/pages/catalog.html',
  '/pages/login.html',
  '/pages/datasheet.html',
  '/pages/dashboard.html',
  '/pages/form.html',
  '/print-forms.html',
  '/ral-colors.html',
];

for (const url of PAGES) {
  test(`страница ${url} загружается без ошибок консоли`, async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    expect(errors, `console errors на ${url}`).toEqual([]);
  });
}

test('бренд переключается на UE и меняет акцент (hub)', async ({ page }) => {
  await page.goto('/index.html');
  await page.click('.js-brand-switcher [data-brand-value="uralelectro"]');
  await expect(page.locator('body')).toHaveAttribute('data-brand', 'uralelectro');
  const accent = await page.evaluate(() =>
    getComputedStyle(document.body).getPropertyValue('--color-accent').trim(),
  );
  expect(accent).toBe('#136b5c');
});

test('витрина: combobox открывается и выбирает опцию', async ({ page }) => {
  await page.goto('/components.html');
  const combo = page.locator('#combobox .combobox').first();
  await combo.locator('.combobox-trigger').click();
  await expect(combo).toHaveClass(/is-open/);
  await combo.locator('.combobox-option', { hasText: 'Опция 3' }).click();
  await expect(combo.locator('.combobox-value')).toHaveText('Опция 3');
  await expect(combo).not.toHaveClass(/is-open/);
});

test('витрина: user-menu открывается и закрывается по Escape', async ({ page }) => {
  await page.goto('/components.html');
  const menu = page.locator('#demo-user-menu');
  await menu.locator('.user-menu__trigger').click();
  await expect(menu).toHaveClass(/is-open/);
  await page.keyboard.press('Escape');
  await expect(menu).not.toHaveClass(/is-open/);
});

test('каталог: фильтр по серии уменьшает выдачу, сброс возвращает', async ({ page }) => {
  await page.goto('/pages/catalog.html');
  await page.locator('.filter-group[data-filter="series"] .chip-choice[data-value="АДМ"]').click();
  await expect(page.locator('#catalog-stats')).toHaveText('6 из 12');
  await page.locator('#catalog-reset-all').click();
  await expect(page.locator('#catalog-stats')).toHaveText('12 из 12');
});

test('вход: заполненная форма показывает спиннер и уходит в каталог', async ({ page }) => {
  await page.goto('/pages/login.html');
  await page.fill('#login-email', 'demo@veza.ru');
  await page.fill('#login-password', 'demo-123');
  await page.click('#login-submit');
  await expect(page.locator('#login-submit')).toHaveClass(/is-loading/);
  await page.waitForURL('**/pages/catalog.html');
});

test('даташит: вкладки переключаются', async ({ page }) => {
  await page.goto('/pages/datasheet.html');
  const tabs = page.locator('[role="tab"]');
  await tabs.nth(1).click();
  await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
});

test('дашборд: drawer блокирует прокрутку и закрывается по Escape', async ({ page }) => {
  await page.goto('/pages/dashboard.html');
  await page.locator('button', { hasText: 'Детали' }).first().click();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.style.overflow))
    .toBe('hidden');
  await page.keyboard.press('Escape');
  await expect
    .poll(() => page.evaluate(() => document.documentElement.style.overflow))
    .toBe('');
});

test('форма: переход на шаг 2', async ({ page }) => {
  await page.goto('/pages/form.html');
  // Обязательные поля шага 1
  await page.fill('#fp-name', 'Тестов Тест Тестович');
  await page.fill('#fp-email', 'test@uralelectro.ru');
  await page.selectOption('#fp-dept', { index: 1 });
  await page.locator('#fp-next').click();
  await expect(page.locator('.fp-step[data-step="2"]')).toBeVisible();
  await expect(page.locator('#fp-steps-indicator .step').nth(1)).toHaveClass(/active/);
});

test('RAL: поиск фильтрует справочник', async ({ page }) => {
  await page.goto('/ral-colors.html');
  await page.fill('#ral-search', 'синий');
  await expect(page.locator('#ral-count')).toContainText('из 216');
  const count = await page.locator('.ral-card:visible').count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThan(216);
});

test('печатные формы: два листа с логотипом бренда', async ({ page }) => {
  await page.goto('/print-forms.html');
  await expect(page.locator('.pf-sheet')).toHaveCount(2);
  await expect(page.locator('.spec-sheet__footer').first()).toContainText('Лист 1 из 2');
});

test('типографика: у UE заголовок H1 — Wadik, H2 — NT Somic', async ({ page }) => {
  await page.goto('/components.html');
  await page.click('.js-brand-switcher [data-brand-value="uralelectro"]');
  await expect(page.locator('body')).toHaveAttribute('data-brand', 'uralelectro');
  await expect(page.locator('#typography .type-specimen')).toBeVisible();
  const fonts = await page.evaluate(() => {
    const h1 = document.querySelector('#typography .type-specimen__sample h1');
    const h2 = document.querySelector('#typography .type-specimen__sample h2');
    return {
      h1: h1 ? getComputedStyle(h1).fontFamily : '',
      h2: h2 ? getComputedStyle(h2).fontFamily : '',
    };
  });
  expect(fonts.h1).toContain('Wadik');
  expect(fonts.h2).not.toContain('Wadik');
  expect(fonts.h2).toContain('NT Somic');
});

// [TEST:e2e.library-first] — компоненты, добавленные шагом 03 пайплайна редизайна
test('витрина: сводка ошибок показывается и её ссылка уводит фокус на поле', async ({ page }) => {
  await page.goto('/components.html');
  const summary = page.locator('#demo-error-summary');
  await expect(summary).toBeHidden();

  await page.locator('#demo-error-summary-submit').click();
  await expect(summary).toBeVisible();
  await expect(summary).toHaveClass(/is-visible/);
  // Поля из сводки помечены невалидными — ошибка не только цветом
  await expect(page.locator('#demo-es-mail')).toHaveAttribute('aria-invalid', 'true');

  await summary.locator('.form-error-summary__link').first().click();
  await expect(page.locator('#demo-es-mail')).toBeFocused();
});

test('витрина: skip-link появляется по фокусу и уводит на main', async ({ page }) => {
  await page.goto('/components.html');
  const skip = page.locator('#page-skip-link');
  // До фокуса ссылка убрана за пределы экрана (не .sr-only — иначе не появится)
  await expect(skip).not.toBeInViewport();

  await page.keyboard.press('Tab');
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();

  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
});

const BRANDS = ['veza', 'uralelectro', 'hemah'];
const APP_BAR_VIEWPORTS = [480, 760, 1024, 1280, 1440, 1600, 1920];
// Обе шапки: полная и сжатая. Сжатая — отдельный набор отступов и размеров,
// регрессия в ней не видна замером полной полосы
const APP_BARS = ['demo-app-bar', 'demo-app-bar-condensed'];

type AppBarProbe = {
  bg: string;
  expectedBg: string;
  overflowY: number;
  overflowX: number;
  titleOverTop: number;
  titleOverBottom: number;
  titleOverRight: number;
} | null;

// Замер акцентных шапок: заливка, переполнение бокса и вложенность заголовка.
// Все полосы меряются одним заходом в страницу — на 3 бренда × 2 темы × 7 ширин
// лишние round-trip'ы стоят дороже самих замеров
async function measureAppBars(page: Page, barIds: string[]): Promise<AppBarProbe[]> {
  // Брендовые шрифты (Wadik, NT Somic) подменяются асинхронно: до подмены
  // метрики заголовка другие, и замер под нагрузкой ловит промежуточный кадр
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  return page.evaluate((ids) => {
    const probe = document.createElement('span');
    probe.style.background = getComputedStyle(document.body)
      .getPropertyValue('--color-accent').trim();
    document.body.appendChild(probe);
    const expectedBg = getComputedStyle(probe).backgroundColor;
    probe.remove();

    return ids.map((id) => {
      const bar = document.getElementById(id);
      const title = bar ? bar.querySelector('.header__title') : null;
      if (!bar || !title) return null;
      const barBox = bar.getBoundingClientRect();
      const titleBox = title.getBoundingClientRect();
      return {
        bg: getComputedStyle(bar).backgroundColor,
        expectedBg,
        overflowY: bar.scrollHeight - bar.clientHeight,
        overflowX: bar.scrollWidth - bar.clientWidth,
        titleOverTop: barBox.top - titleBox.top,
        titleOverBottom: titleBox.bottom - barBox.bottom,
        titleOverRight: titleBox.right - barBox.right,
      };
    });
  }, barIds);
}

test('витрина: акцентная шапка держит бокс во всех брендах, темах и вьюпортах', async ({ page }) => {
  // 3 бренда × 2 темы × 7 ширин × 2 полосы: под полной параллельной нагрузкой
  // прогон подбирается к общему лимиту 30 с — даём запас, не срезая замеры
  test.setTimeout(90_000);
  await page.goto('/components.html');
  for (const brand of BRANDS) {
    await page.click(`.js-brand-switcher [data-brand-value="${brand}"]`);
    await expect(page.locator('body')).toHaveAttribute('data-brand', brand);

    for (const dark of [false, true]) {
      await page.evaluate((isDark) => {
        document.body.classList.toggle('dark', isDark);
      }, dark);
      const theme = dark ? 'dark' : 'light';

      for (const width of APP_BAR_VIEWPORTS) {
        await page.setViewportSize({ width, height: 900 });
        const measured = await measureAppBars(page, APP_BARS);
        for (const [i, barId] of APP_BARS.entries()) {
          const m = measured[i];
          const where = `#${barId}, бренд ${brand}, тема ${theme}, ${width}px`;
          expect(m, `замер шапки — ${where}`).not.toBeNull();
          if (!m) continue;
          // Заливка = акцент темы
          expect(m.bg, `заливка .header--accent — ${where}`).toBe(m.expectedBg);
          // Полоса не переполняется ни по высоте, ни по ширине
          expect(m.overflowY, `вертикальное переполнение шапки — ${where}`).toBe(0);
          expect(m.overflowX, `горизонтальное переполнение шапки — ${where}`).toBe(0);
          // Заголовок внутри бокса полосы, а не поверх соседнего текста
          expect(m.titleOverTop, `заголовок выше шапки — ${where}`).toBeLessThanOrEqual(0);
          expect(m.titleOverBottom, `заголовок ниже шапки — ${where}`).toBeLessThanOrEqual(0);
          expect(m.titleOverRight, `заголовок правее шапки — ${where}`).toBeLessThanOrEqual(0);
        }
      }
    }
  }
});

test('витрина: обёртка .header__titles есть в разметке акцентной шапки', async ({ page }) => {
  await page.goto('/components.html');
  const titles = page.locator('#demo-app-bar .header-left > .header__titles');
  await expect(titles).toHaveCount(1);
  await expect(titles.locator('.header__title')).toHaveCount(1);
  await expect(titles.locator('.header__sub')).toHaveCount(1);
});

test('витрина: многострочный тултип переносит текст, а не тянет его в строку', async ({ page }) => {
  await page.goto('/components.html');
  await page.locator('#demo-tip-multiline').hover();
  const tip = page.locator('.tooltip-popup.tooltip-multiline');
  await expect(tip).toBeVisible();

  const box = await tip.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      whiteSpace: cs.whiteSpace,
      maxWidth: cs.maxWidth,
      width: el.getBoundingClientRect().width,
      height: el.getBoundingClientRect().height,
    };
  });
  expect(box.whiteSpace).toBe('pre-line');
  expect(box.maxWidth).not.toBe('none');
  expect(box.height).toBeGreaterThan(40); // несколько строк, а не одна
});

test('витрина: палитра показывает пустой результат и счётчик найденного', async ({ page }) => {
  await page.goto('/components.html');
  const picker = page.locator('#demo-swatch-picker');
  await picker.locator('.swatch-picker__toggle').click();
  await expect(picker).toHaveClass(/is-open/);

  const search = picker.locator('.swatch-picker__search');
  await search.fill('5008');
  await expect(picker.locator('.swatch-picker__result-count')).toContainText('Найдено');
  await expect(picker.locator('.swatch-picker__no-match')).toBeHidden();

  await search.fill('такого цвета в палитре нет');
  await expect(picker.locator('.swatch-picker__no-match')).toBeVisible();
  // Фильтрация классом, а не inline-стилем
  expect(await picker.locator('.swatch:not(.is-filtered)').count()).toBe(0);
});

test('витрина: пиклист с группами кладёт в чип код без расшифровки', async ({ page }) => {
  await page.goto('/components.html');
  const picklist = page.locator('#demo-picklist-groups');
  await expect(picklist.locator('.picklist__group-label')).toHaveCount(3);
  await expect(picklist.locator('.picklist__chip').first()).toContainText('380 В');
  await expect(picklist.locator('.picklist__chip').first()).not.toContainText('треугольник');
});

test('витрина: счётчик символов ведёт счёт и отмечает достижение лимита', async ({ page }) => {
  await page.goto('/components.html');
  const area = page.locator('#demo-counter-area');
  const counter = page.locator('#demo-counter');
  await expect(counter).toHaveText('0 / 400');

  const text = 'Замещение импортного двигателя Siemens';
  await area.fill(text);
  await expect(counter).toHaveText(`${text.length} / 400`);
  await expect(counter).not.toHaveClass(/is-over-limit/);

  await area.fill('я'.repeat(400));
  await expect(counter).toHaveText('400 / 400');
  await expect(counter).toHaveClass(/is-over-limit/);
});

test('витрина: кнопка копирования кода маркировки подтверждает действие', async ({ page }) => {
  await page.goto('/components.html');
  const btn = page.locator('#demo-mark-copy');
  await btn.click();
  await expect(btn).toHaveClass(/is-copied/);
  await expect(btn).toHaveText('Скопировано');
});

test('витрина: .print-only появляется только в печатном режиме', async ({ page }) => {
  await page.goto('/components.html');
  const printOnly = page.locator('#demo-print-only');
  const screenOnly = page.locator('#demo-screen-only');
  await expect(printOnly).toBeHidden();
  await expect(screenOnly).toBeVisible();

  await page.emulateMedia({ media: 'print' });
  await expect(printOnly).toBeVisible();
  await expect(screenOnly).toBeHidden();
});

test('витрина: .btn-secondary не мёртвый класс — правило есть в бандле', async ({ page }) => {
  await page.goto('/components.html');
  const found = await page.evaluate(() => {
    function walk(rules: CSSRuleList): boolean {
      return [...rules].some((rule) => {
        if (rule instanceof CSSStyleRule) return rule.selectorText.includes('.btn-secondary');
        if (rule instanceof CSSImportRule && rule.styleSheet) return walk(rule.styleSheet.cssRules);
        if (rule instanceof CSSGroupingRule) return walk(rule.cssRules);
        return false;
      });
    }
    return [...document.styleSheets].some((sheet) => {
      try {
        return walk(sheet.cssRules);
      } catch {
        return false;
      }
    });
  });
  expect(found, 'правило .btn-secondary в styles/components/buttons.css').toBe(true);
});

test('витрина: многоколоночная панель и массовые действия пиклиста', async ({ page }) => {
  await page.goto('/components.html');
  const picklist = page.locator('#demo-picklist-columns');
  const panel = page.locator('#demo-picklist-columns-panel');
  await picklist.locator('.picklist__toggle').click();
  await expect(picklist).toHaveClass(/is-open/);

  // Панель раскладывается в несколько колонок, а не в один столбец
  const columns = await panel.evaluate(
    (el) => getComputedStyle(el).gridTemplateColumns.split(' ').length,
  );
  expect(columns).toBeGreaterThan(1);

  const count = page.locator('[data-picklist-count]');
  await expect(count).toHaveText('Выбрано 2 из 24');
  await panel.locator('[data-picklist-select-all]').click();
  await expect(count).toHaveText('Выбрано 24 из 24');
  await expect(picklist.locator('.picklist__chip')).toHaveCount(24);
  await panel.locator('[data-picklist-clear-all]').click();
  await expect(count).toHaveText('Выбрано 0 из 24');
  await expect(picklist.locator('.picklist__chip')).toHaveCount(0);
});

// Полосы, на которых демо размещения обязано оставаться проходимым: узкий
// экран раскладывает переключатель и пикер одной колонкой, и панель, открытая
// вверх, рискует накрыть собственные чипы — из --top тогда не выйти
const PLACEMENT_VIEWPORTS = [480, 600, 767];

type Box = { x: number; y: number; width: number; height: number };

// Пересечение прямоугольников (координаты — от вьюпорта главного фрейма)
function rectsOverlap(a: Box, b: Box): boolean {
  return (
    a.x < b.x + b.width &&
    b.x < a.x + a.width &&
    a.y < b.y + b.height &&
    b.y < a.y + a.height
  );
}

test('витрина: опция с обёрткой __option-body и переключение размещения панели', async ({ page }) => {
  await page.goto('/components.html');
  const panel = page.locator('#demo-picklist-place-panel');
  await expect(panel.locator('.picklist__option-body')).toHaveCount(4);

  const group = page.locator('[data-panel-switch="demo-picklist-place-panel"]');
  // Панель закрыта до первого клика (main.js ставит is-open по нажатию чипа),
  // а скрытие идёт через visibility — потомки закрытой панели невидимы
  await group.locator('[data-panel-variant=""]').click();
  await expect(panel).toBeVisible();
  await expect(panel.locator('.picklist__option-body .picklist__option-desc').first()).toBeVisible();

  await group.locator('[data-panel-variant="is-flipped"]').click();
  await expect(panel).toHaveClass(/is-flipped/);
  // Открытие вверх: панель прижата низом к контролу. computed top у
  // позиционированного элемента браузер отдаёт использованным значением,
  // а не 'auto', поэтому размещение проверяем геометрией
  const placement = await panel.evaluate((el) => {
    const control = el.closest('.picklist')?.querySelector('.picklist__control');
    return {
      panelBottom: el.getBoundingClientRect().bottom,
      controlTop: control ? control.getBoundingClientRect().top : NaN,
    };
  });
  expect(placement.panelBottom).toBeLessThanOrEqual(placement.controlTop + 1);

  // Переключатель остаётся доступным при открытой вверх панели: он лежит
  // соседней колонкой, а не над контролом — прямоугольники не пересекаются
  const panelBox = await panel.boundingBox();
  const groupBox = await group.boundingBox();
  expect(panelBox).not.toBeNull();
  expect(groupBox).not.toBeNull();
  const overlap = rectsOverlap(panelBox!, groupBox!);
  expect(overlap, 'открытая вверх панель не перекрывает переключатель размещения').toBe(false);

  await group.locator('[data-panel-variant="picklist__panel--sheet"]').click();
  await expect(panel).toHaveClass(/picklist__panel--sheet/);
  await expect(panel).not.toHaveClass(/is-flipped/);
});

test('витрина: из размещения «вверх» можно выйти на узком экране', async ({ page }) => {
  await page.goto('/components.html');
  const panel = page.locator('#demo-picklist-place-panel');
  const group = page.locator('[data-panel-switch="demo-picklist-place-panel"]');

  for (const width of PLACEMENT_VIEWPORTS) {
    await page.setViewportSize({ width, height: 800 });
    await group.locator('[data-panel-variant="is-flipped"]').click();
    await expect(panel).toHaveClass(/is-flipped/);

    const panelBox = await panel.boundingBox();
    const groupBox = await group.boundingBox();
    expect(panelBox, `бокс панели — ${width}px`).not.toBeNull();
    expect(groupBox, `бокс переключателя — ${width}px`).not.toBeNull();
    expect(
      rectsOverlap(panelBox!, groupBox!),
      `открытая вверх панель не перекрывает переключатель размещения — ${width}px`,
    ).toBe(false);

    // Клик без force: Playwright сам проверяет hit-target, поэтому перекрытая
    // панелью группа чипов провалит шаг — ровно так демо и становится тупиком
    await group.locator('[data-panel-variant=""]').click();
    await expect(panel).not.toHaveClass(/is-flipped/);
  }
});

test('витрина: панель пикера становится листом снизу на узком экране', async ({ page }) => {
  await page.goto('/components.html');
  await page.setViewportSize({ width: 400, height: 800 });
  const panel = page.locator('#demo-picklist-place-panel');
  await page.locator('[data-panel-switch="demo-picklist-place-panel"] [data-panel-variant="picklist__panel--sheet"]').click();
  await expect(panel).toHaveClass(/picklist__panel--sheet/);
  const position = await panel.evaluate((el) => getComputedStyle(el).position);
  expect(position).toBe('fixed');

  const swatchPanel = page.locator('#demo-swatch-place-panel');
  await page.locator('[data-panel-switch="demo-swatch-place-panel"] [data-panel-variant="swatch-picker__panel--sheet"]').click();
  await expect(swatchPanel).toHaveClass(/swatch-picker__panel--sheet/);
  expect(await swatchPanel.evaluate((el) => getComputedStyle(el).position)).toBe('fixed');
});

test('витрина: частые цвета, строка выбранного и очистка палитры', async ({ page }) => {
  await page.goto('/components.html');
  const picker = page.locator('#demo-swatch-favorites');
  await expect(picker.locator('.swatch-picker__section-title')).toHaveText('Частые цвета Уралэлектро');
  await expect(picker.locator('[data-swatch-count]')).toHaveText('Выбрано 1');
  await expect(picker.locator('.swatch-picker__selected .swatch-picker__chip')).toHaveCount(1);

  await picker.locator('.swatch', { hasText: '7016' }).click();
  await expect(picker.locator('[data-swatch-count]')).toHaveText('Выбрано 2');
  await expect(picker.locator('.swatch-picker__selected .swatch-picker__chip')).toHaveCount(2);

  await picker.locator('[data-swatch-clear-all]').click();
  await expect(picker.locator('[data-swatch-count]')).toHaveText('Ничего не выбрано');
  await expect(picker.locator('.swatch-picker__chip')).toHaveCount(0);
  // Пустой контрол показывает плейсхолдер
  await expect(picker.locator('.swatch-picker__placeholder')).toBeVisible();
});

test('витрина: код-панель размещается боковой колонкой и липнет при прокрутке', async ({ page }) => {
  await page.goto('/components.html');
  const aside = page.locator('#demo-code-panel-aside');
  const sticky = page.locator('#demo-code-panel-sticky');
  await expect(aside).toBeVisible();
  expect(await aside.evaluate((el) => getComputedStyle(el).position)).toBe('sticky');
  expect(await sticky.evaluate((el) => getComputedStyle(el).position)).toBe('sticky');
  // На мобильном липкая панель не съедает половину экрана
  await page.setViewportSize({ width: 480, height: 800 });
  expect(await sticky.evaluate((el) => getComputedStyle(el).position)).toBe('static');
});

test('витрина: редактируемая таблица правит значения в ячейках и удаляет строку', async ({ page }) => {
  await page.goto('/components.html');
  const table = page.locator('#demo-table-form');
  await expect(table.locator('tbody tr')).toHaveCount(3);

  const firstPower = table.locator('tbody tr').first().locator('.input').first();
  await firstPower.fill('11');
  await expect(firstPower).toHaveValue('11');
  // Кольцо фокуса рисует ячейка, а не поле — двойной рамки нет
  expect(await firstPower.evaluate((el) => getComputedStyle(el).borderStyle)).toBe('none');

  await table.locator('tbody tr').nth(1).locator('[data-table-row-remove]').click();
  await expect(table.locator('tbody tr')).toHaveCount(2);
  // Перенумерация после удаления
  await expect(table.locator('tbody tr').nth(1).locator('td').first()).toHaveText('2');
});

test('витрина: лист A4 несёт колонтитул разметкой, а не @page margin-boxes', async ({ page }) => {
  await page.goto('/components.html');
  const sheet = page.locator('#demo-print-sheet');
  const head = page.locator('#demo-running-head');
  const foot = page.locator('#demo-running-foot');
  await expect(head).toBeVisible();
  await expect(foot).toContainText('Лист 1 из 1');

  const boxes = await page.evaluate(() => {
    const sheetEl = document.getElementById('demo-print-sheet');
    const footEl = document.getElementById('demo-running-foot');
    if (!sheetEl || !footEl) return null;
    const s = sheetEl.getBoundingClientRect();
    const f = footEl.getBoundingClientRect();
    return { sheetBottom: s.bottom, footBottom: f.bottom, sheetHeight: s.height };
  });
  expect(boxes).not.toBeNull();
  if (boxes) {
    // Подвал прижат к нижней кромке ЛИСТА, а не контента
    expect(Math.abs(boxes.sheetBottom - boxes.footBottom)).toBeLessThan(80);
    expect(boxes.sheetHeight).toBeGreaterThan(1000); // A4: 297mm ≈ 1122px
  }

  await expect(sheet).toBeVisible();
  await page.emulateMedia({ media: 'print' });
  await expect(head).toBeVisible();
  await expect(foot).toBeVisible();
});

test('витрина: незаполненное значение даташита отличается от заполненного', async ({ page }) => {
  await page.goto('/components.html');
  const empty = page.locator('#demo-spec-empty');
  await expect(empty).toContainText('не требуется');
  const style = await empty.evaluate((el) => {
    const cs = getComputedStyle(el);
    return { fontStyle: cs.fontStyle, color: cs.color };
  });
  expect(style.fontStyle).toBe('italic');
  await expect(page.locator('#demo-spec-sheet-empty')).toBeVisible();
});

test('витрина: зависимая группа полей раскрывается по управляющему полю', async ({ page }) => {
  await page.goto('/components.html');
  const group = page.locator('#demo-dependent-group');
  await expect(group).toBeHidden();

  await page.selectOption('#demo-dep-duty', 'S3');
  await expect(group).toBeVisible();
  await expect(group).not.toHaveClass(/is-hidden/);
  await expect(page.locator('#demo-dep-pv')).toBeVisible();

  await page.selectOption('#demo-dep-duty', 'S1');
  await expect(group).toBeHidden();
});

test('витрина: .code-inline выглядит как инлайн-код', async ({ page }) => {
  await page.goto('/components.html');
  const styles = await page.evaluate(() => {
    const span = document.getElementById('demo-code-inline');
    const code = document.querySelector('#demo-code-inline-text code');
    if (!span || !code) return null;
    const a = getComputedStyle(span);
    const b = getComputedStyle(code);
    return {
      spanFont: a.fontFamily,
      codeFont: b.fontFamily,
      spanBg: a.backgroundColor,
      codeBg: b.backgroundColor,
    };
  });
  expect(styles).not.toBeNull();
  if (styles) {
    expect(styles.spanFont).toBe(styles.codeFont);
    expect(styles.spanBg).toBe(styles.codeBg);
    expect(styles.spanBg).not.toBe('rgba(0, 0, 0, 0)');
  }
});

test('витрина: пункты сайдбара ведут на реально существующие секции', async ({ page }) => {
  await page.goto('/components.html');
  const missing = await page.evaluate(() => {
    const links = [...document.querySelectorAll('#left-sidebar .sidebar-nav-link')];
    return links
      .map((link) => link.getAttribute('href') || '')
      .filter((href) => href.startsWith('#'))
      .filter((href) => !document.querySelector(`section${href}`));
  });
  expect(missing, 'пункты сайдбара без секции').toEqual([]);
});

test('витрина: чип размещения не глушит остальные обработчики клика вне', async ({ page }) => {
  await page.goto('/components.html');
  const combo = page.locator('#combobox .combobox').first();
  await combo.locator('.combobox-trigger').click();
  await expect(combo).toHaveClass(/is-open/);

  // Клик по чипу переключателя обязан всплыть до document: на нём висят
  // «закрытия по клику вне» комбобокса, меню, календаря и пресенса
  const group = page.locator('[data-panel-switch="demo-picklist-place-panel"]');
  await group.locator('[data-panel-variant="is-flipped"]').click();
  await expect(combo, 'комбобокс закрывается кликом по чипу размещения').not.toHaveClass(/is-open/);

  // При этом собственная панель пикера остаётся открытой — иначе выбранное
  // размещение не увидеть
  await expect(page.locator('#demo-picklist-place')).toHaveClass(/is-open/);
  await expect(page.locator('#demo-picklist-place-panel')).toHaveClass(/is-flipped/);
});

// Текст печатного листа: бумага белая всегда, а токены текста в тёмной теме
// светлые — совпадение даёт нечитаемый лист. Меряем композитный контраст
const PRINT_SHEET_TEXT = [
  '.spec-sheet__title',
  // Единственный потребитель --color-accent-paper: без подмены акцента на
  // бумажный лист получает подсвеченный под тёмный фон акцент темы
  // (#5fc16f у VEZA — 2,25:1 на белом). Остальные селекторы этого не ловят:
  // они красятся чернилами --color-text и переживают потерю акцента
  '.spec-section__title',
  '.spec-row__value:not(.spec-row__value--empty)',
  '.print-sheet__running-head',
  '.print-sheet__running-foot',
];

type ContrastProbe = { selector: string; found: boolean; ratio: number; fg: string; bg: string };

// Композитный контраст по WCAG 2: цвет текста берётся вместе с собственной
// альфой и накопленной opacity предков, фон — сложением всех подложек до корня
async function measureCompositedContrast(
  page: Page,
  rootId: string,
  selectors: string[],
): Promise<ContrastProbe[]> {
  return page.evaluate(
    ({ rootId, selectors }) => {
      type RGBA = [number, number, number, number];

      function parse(value: string): RGBA {
        const s = (value || '').trim();
        if (!s || s === 'transparent') return [0, 0, 0, 0];
        const rgb = s.match(/^rgba?\(([^)]+)\)$/);
        if (rgb) {
          const p = rgb[1].split(/[\s,/]+/).filter(Boolean).map(Number);
          return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
        }
        // Результат color-mix() Chrome отдаёт как color(srgb r g b / a)
        const srgb = s.match(/^color\(srgb ([^)]+)\)$/);
        if (srgb) {
          const p = srgb[1].split(/[\s/]+/).filter(Boolean).map(Number);
          return [p[0] * 255, p[1] * 255, p[2] * 255, p.length > 3 ? p[3] : 1];
        }
        return [0, 0, 0, 0];
      }

      // source-over: полупрозрачный слой поверх уже непрозрачной подложки
      function over(top: RGBA, bottom: RGBA): RGBA {
        const a = top[3];
        return [
          top[0] * a + bottom[0] * (1 - a),
          top[1] * a + bottom[1] * (1 - a),
          top[2] * a + bottom[2] * (1 - a),
          1,
        ];
      }

      function luminance(c: RGBA): number {
        const channel = (v: number) => {
          const x = v / 255;
          return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
        };
        return 0.2126 * channel(c[0]) + 0.7152 * channel(c[1]) + 0.0722 * channel(c[2]);
      }

      function fmt(c: RGBA): string {
        return `rgb(${c.slice(0, 3).map((v) => Math.round(v)).join(', ')})`;
      }

      const root = document.getElementById(rootId);
      return selectors.map((selector) => {
        const el = root ? (root.querySelector(selector) as HTMLElement | null) : null;
        if (!el) return { selector, found: false, ratio: 0, fg: '', bg: '' };

        // Цепочка предков и накопленная opacity для каждого её звена
        const chain: HTMLElement[] = [];
        for (let n: HTMLElement | null = el; n; n = n.parentElement) chain.push(n);
        const cumulative: number[] = [];
        let acc = 1;
        for (let i = chain.length - 1; i >= 0; i -= 1) {
          const own = Number(getComputedStyle(chain[i]).opacity);
          acc *= Number.isFinite(own) ? own : 1;
          cumulative[i] = acc;
        }

        // Подложка: от корня вниз к элементу, поверх белого холста страницы
        let bg: RGBA = [255, 255, 255, 1];
        for (let i = chain.length - 1; i >= 0; i -= 1) {
          const layer = parse(getComputedStyle(chain[i]).backgroundColor);
          bg = over([layer[0], layer[1], layer[2], layer[3] * cumulative[i]], bg);
        }

        const own = parse(getComputedStyle(el).color);
        const fg = over([own[0], own[1], own[2], own[3] * cumulative[0]], bg);
        const l1 = luminance(fg);
        const l2 = luminance(bg);
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        return { selector, found: true, ratio, fg: fmt(fg), bg: fmt(bg) };
      });
    },
    { rootId, selectors },
  );
}

test('витрина: печатный лист читаем в тёмной теме во всех брендах', async ({ page }) => {
  await page.goto('/components.html');
  await page.evaluate(() => document.body.classList.add('dark'));

  for (const brand of BRANDS) {
    await page.click(`.js-brand-switcher [data-brand-value="${brand}"]`);
    await expect(page.locator('body')).toHaveAttribute('data-brand', brand);
    await expect(page.locator('body')).toHaveClass(/dark/);

    const probes = await measureCompositedContrast(page, 'demo-print-sheet', PRINT_SHEET_TEXT);
    for (const probe of probes) {
      expect(probe.found, `${probe.selector} есть в #demo-print-sheet`).toBe(true);
      expect(
        probe.ratio,
        `контраст ${probe.selector} — бренд ${brand}, тёмная тема: ${probe.fg} на ${probe.bg}`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  }
});
// </TEST:e2e.library-first>

// [TEST:e2e.print-forms-dark]
// Страница печатных форм собрана на своём классе .pf-sheet (pages/print-forms.css),
// а не на .print-sheet — бумажную палитру слоя layout она не получает.
// Тёмная тема здесь приходит от ОС: переключателя темы пользователь не трогает,
// класса .dark на body нет, токены темы приходят из @media (prefers-color-scheme: dark).
// Лист при этом остаётся белым — значит текст обязан оставаться чернильным.
const PF_SHEET_TEXT = [
  '.spec-sheet__title',
  '.spec-section__title',
  '.spec-row__value:not(.spec-row__value--empty)',
  '.spec-sheet__footer',
];

// measureCompositedContrast ищет корень замера по id, а в разметке печатных
// форм id нет — вешаем временный на лист и снимаем сразу после замера
const PF_SHEET_PROBE_ID = 'e2e-pf-sheet-probe';

// Подложка под текстом листа обязана остаться бумагой. Без этой проверки
// контраст проходит вхолостую: до правки лист рисовал белую «бумагу», а
// внутренний .spec-sheet клал поверх неё тёмный --color-surface темы —
// светлый текст на тёмном блоке даёт те же 15:1, только это уже не бумага
function isPaperBackground(bg: string): boolean {
  const channels = (bg.match(/\d+/g) || []).map(Number);
  return channels.length >= 3 && channels.slice(0, 3).every((v) => v >= 200);
}

test.describe('печатные формы под тёмной темой ОС', () => {
  test.use({ colorScheme: 'dark' });

  test('печатные формы: лист читаем при тёмной теме ОС во всех брендах', async ({ page }) => {
    await page.goto('/print-forms.html');
    // Именно тема ОС, без действий пользователя: класса .dark на body нет
    await expect(page.locator('body')).not.toHaveClass(/dark/);

    const sheets = page.locator('.pf-sheet');
    const sheetCount = await sheets.count();
    expect(sheetCount, 'листы .pf-sheet на странице').toBeGreaterThan(0);

    for (const brand of BRANDS) {
      await page.locator(`.pf-toolbar .js-brand-switcher [data-brand-value="${brand}"]`).click();
      await expect(page.locator('body')).toHaveAttribute('data-brand', brand);

      for (let i = 0; i < sheetCount; i += 1) {
        const sheet = sheets.nth(i);
        await sheet.evaluate((el, id) => { el.id = id; }, PF_SHEET_PROBE_ID);
        const probes = await measureCompositedContrast(page, PF_SHEET_PROBE_ID, PF_SHEET_TEXT);
        await sheet.evaluate((el) => el.removeAttribute('id'));

        for (const probe of probes) {
          const where = `бренд ${brand}, лист ${i + 1}, тёмная тема ОС`;
          expect(probe.found, `${probe.selector} есть в .pf-sheet — ${where}`).toBe(true);
          expect(
            isPaperBackground(probe.bg),
            `подложка под ${probe.selector} осталась бумагой — ${where}: ${probe.bg}`,
          ).toBe(true);
          expect(
            probe.ratio,
            `контраст ${probe.selector} — ${where}: ${probe.fg} на ${probe.bg}`,
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  });
});
// </TEST:e2e.print-forms-dark>

// [TEST:e2e.focus-ring-brand]
// Кольцо фокуса — производный токен: --shadow-focus собран из var(--color-accent).
// var() разрешается на элементе объявления, а бренд живёт на body, поэтому
// объявленное в :root кольцо оставалось indigo на всех брендовых страницах,
// пока шапка и H1 были брендовыми. Глазами это видно, тестами не мерилось —
// отсюда и тест: снимаем РЕАЛЬНЫЙ box-shadow сфокусированного .input.
const DEFAULT_ACCENT_RGB = 'rgb(55, 48, 163)';  // indigo :root — маркер «бренд не доехал»

// Эталонные акценты брендов (variables/темы). Проверяем и совпадение с живым
// токеном, и попадание в эталон: иначе тест пройдёт на паре сломанных значений
const BRAND_ACCENT_RGB: Record<string, { light: string; dark: string }> = {
  veza:        { light: 'rgb(42, 127, 55)',  dark: 'rgb(95, 193, 111)' },
  uralelectro: { light: 'rgb(19, 107, 92)',  dark: 'rgb(91, 179, 157)' },
  hemah:       { light: 'rgb(45, 98, 116)',  dark: 'rgb(111, 179, 199)' },
};

// Замер кольца: слои computed box-shadow идут в порядке объявления —
// первый (2px) — разрыв цветом поверхности, последний (4px) — само кольцо.
// Токены снимаем зондом-соседом поля, а не с :root: сравнение с тем, что
// реально досталось элементу в его ветке каскада
const FOCUS_RING_INPUT = '#inputs input.input';

async function measureFocusRing(page: Page) {
  const field = page.locator(FOCUS_RING_INPUT).first();
  await field.focus();
  await expect(field).toBeFocused();
  // Кольцо проявляется переходом box-shadow (--duration-press), и смена
  // темы/бренда запускает его заново. Читать значение сразу нельзя — попадаешь
  // в промежуточный кадр (4px вместо 5px, альфа 0.99): три прогона давали три
  // разных сообщения об одной и той же гонке. Ждать по таймеру наугад тоже
  // нельзя. Порядок: дать переходу стартовать (кадр), дождаться завершения всех
  // запущенных на поле переходов (getAnimations().finished — уже не пустой), и
  // только потом убедиться, что значение осело — несколько одинаковых кадров
  // подряд. Потолок в кадрах — страховка от зависания, не подмена ожидания.
  await page.evaluate(
    (selector) =>
      new Promise<void>((resolve) => {
        const el = document.querySelector(selector);
        if (!el) {
          resolve();
          return;
        }
        const STABLE_FRAMES = 3;
        const MAX_FRAMES = 240;
        let last: string | null = null;
        let stable = 0;
        let frames = 0;

        const settle = () => {
          const now = getComputedStyle(el).boxShadow;
          stable = now === last ? stable + 1 : 0;
          last = now;
          frames += 1;
          if (stable >= STABLE_FRAMES || frames >= MAX_FRAMES) {
            resolve();
            return;
          }
          requestAnimationFrame(settle);
        };

        // Переход создаётся на ближайшем пересчёте стилей — сначала кадр,
        // потом ожидание его завершения, потом проверка на оседание
        requestAnimationFrame(() => {
          const running = el
            .getAnimations()
            .map((animation) => animation.finished.catch(() => undefined));
          Promise.all(running).then(() => requestAnimationFrame(settle));
        });
      }),
    FOCUS_RING_INPUT,
  );

  return page.evaluate((selector) => {
    const input = document.querySelector(selector) as HTMLInputElement | null;
    if (!input) return null;

    const shadow = getComputedStyle(input).boxShadow;
    const layers = shadow.match(/rgba?\([^)]+\)/g) || [];

    const probe = document.createElement('span');
    probe.style.color = 'var(--color-accent)';
    input.parentElement!.appendChild(probe);
    const accent = getComputedStyle(probe).color;
    probe.style.color = 'var(--color-surface)';
    const surface = getComputedStyle(probe).color;
    probe.remove();

    return { shadow, gap: layers[0], ring: layers[layers.length - 1], accent, surface };
  }, FOCUS_RING_INPUT);
}

test('витрина: кольцо фокуса — акцент бренда во всех брендах и обеих темах', async ({ page }) => {
  await page.goto('/components.html');

  for (const brand of BRANDS) {
    await page.click(`.js-brand-switcher [data-brand-value="${brand}"]`);
    await expect(page.locator('body')).toHaveAttribute('data-brand', brand);

    for (const theme of ['light', 'dark'] as const) {
      await page.evaluate((t) => document.body.classList.toggle('dark', t === 'dark'), theme);

      const ring = await measureFocusRing(page);
      const where = `бренд ${brand}, тема ${theme}`;
      expect(ring, `#inputs input.input найден — ${where}`).not.toBeNull();

      // Кольцо — два слоя: разрыв поверхностью и сам ринг
      expect(ring!.gap, `внутренний разрыв кольца — поверхность темы, ${where}: ${ring!.shadow}`)
        .toBe(ring!.surface);
      expect(ring!.ring, `кольцо совпадает с живым --color-accent, ${where}: ${ring!.shadow}`)
        .toBe(ring!.accent);
      expect(ring!.ring, `кольцо равно эталону бренда, ${where}`)
        .toBe(BRAND_ACCENT_RGB[brand][theme]);
      expect(ring!.ring, `кольцо не осталось дефолтным indigo, ${where}`)
        .not.toBe(DEFAULT_ACCENT_RGB);
    }
  }
});

test.describe('усиленный контраст', () => {
  // prefers-contrast: more утолщает кольцо до 5px (contrast-preferences.css,
  // импорт последним). Бренд-скоуп обязан отдать усиленное кольцо, а не
  // перебить его своими 4px — предпочтение пользователя бьёт тему.
  // NB: test.use({ contrast: 'more' }) здесь не срабатывает — до страницы
  // предпочтение не доезжает (проверено: matchMedia отдаёт false), поэтому
  // эмуляция ставится явно на странице
  test('витрина: при prefers-contrast кольцо остаётся брендовым и утолщённым', async ({ page }) => {
    await page.emulateMedia({ contrast: 'more' });
    await page.goto('/components.html');
    expect(await page.evaluate(() => matchMedia('(prefers-contrast: more)').matches),
      'предпочтение усиленного контраста применено').toBe(true);

    for (const brand of BRANDS) {
      await page.click(`.js-brand-switcher [data-brand-value="${brand}"]`);
      await expect(page.locator('body')).toHaveAttribute('data-brand', brand);

      for (const theme of ['light', 'dark'] as const) {
        await page.evaluate((t) => document.body.classList.toggle('dark', t === 'dark'), theme);

        const ring = await measureFocusRing(page);
        const where = `бренд ${brand}, тема ${theme}, prefers-contrast: more`;
        expect(ring!.ring, `кольцо брендовое — ${where}`).toBe(BRAND_ACCENT_RGB[brand][theme]);
        expect(ring!.shadow, `кольцо утолщено до 5px — ${where}: ${ring!.shadow}`).toContain('5px');
      }
    }
  });
});
// </TEST:e2e.focus-ring-brand>

// [TEST:e2e.library-first-03]
// Компоненты, пришедшие в библиотеку шагом 03 пайплайна редизайна: doc-prose,
// cite-ref, chat-thread, chat-message, chat-composer, chart, app-launcher,
// coach-mark, page-nav — плюс два gap-варианта с видимым следствием
// (.accordion--plain и .input-password-toggle).

// Замер вычисленного стиля БЕЗ гонки с переходом. Порядок тот же, что в
// measureFocusRing: сначала кадр (переход создаётся на ближайшем пересчёте
// стилей), затем ожидание уже запущенных анимаций, затем несколько одинаковых
// кадров подряд. Потолок в кадрах — страховка от зависания, а не подмена
// ожидания; waitForTimeout наугад здесь запрещён.
async function settledStyle(locator: Locator, property: string): Promise<string> {
  return locator.evaluate(
    (el, prop) =>
      new Promise<string>((resolve) => {
        const STABLE_FRAMES = 3;
        const MAX_FRAMES = 240;
        let last: string | null = null;
        let stable = 0;
        let frames = 0;

        const settle = () => {
          const now = getComputedStyle(el).getPropertyValue(prop);
          stable = now === last ? stable + 1 : 0;
          last = now;
          frames += 1;
          if (stable >= STABLE_FRAMES || frames >= MAX_FRAMES) {
            resolve(now);
            return;
          }
          requestAnimationFrame(settle);
        };

        requestAnimationFrame(() => {
          const running = el.getAnimations().map((animation) => animation.finished.catch(() => undefined));
          Promise.all(running).then(() => requestAnimationFrame(settle));
        });
      }),
    property,
  );
}

// SVG-узлам className отдаёт SVGAnimatedString, поэтому класс читаем через
// classList, а не матчером toHaveClass
function hasClass(locator: Locator, name: string): Promise<boolean> {
  return locator.evaluate((el, cls) => el.classList.contains(cls), name);
}

test('витрина: doc-prose копирует блок кода и подтверждает действие', async ({ page }) => {
  await page.goto('/components.html');
  const btn = page.locator('#demo-doc-copy');
  // Кнопка видима всегда, а не по :hover — на сенсорном экране её иначе не достать
  await expect(btn).toBeVisible();
  await expect(btn).toHaveText('Копировать');

  await btn.click();
  await expect(btn).toHaveClass(/is-copied/);
  await expect(btn).toHaveText('Скопировано');

  // Широкая таблица достижима с клавиатуры: без tabindex горизонтальный скролл
  // недоступен (SC 2.1.1)
  const wrap = page.locator('#demo-doc-prose .doc-prose__table-wrap');
  await expect(wrap).toHaveAttribute('tabindex', '0');
});

test('палитра: шкала источников показана пятью ступенями по порядку', async ({ page }) => {
  await page.goto('/components.html');
  const names = await page.evaluate(() =>
    [...document.querySelectorAll('#palette .palette-name')]
      .map((el) => el.textContent || '')
      .filter((t) => t.startsWith('--color-source-') && !t.endsWith('-soft')),
  );
  // Порядок ступеней «светлее → темнее» — часть смысла шкалы, а не вёрстки
  expect(names).toEqual([
    '--color-source-forum',
    '--color-source-wiki',
    '--color-source-cert',
    '--color-source-ntb',
    '--color-source-catalog',
  ]);

  // Бейджи новых источников живут в компоненте, а не только в палитре
  const badges = page.locator('#search-result-card .search-result-card__source-badge');
  await expect(badges.filter({ hasText: 'Сертификаты' }).first()).toBeVisible();
  await expect(badges.filter({ hasText: 'НТБ' }).first()).toBeVisible();
});

test('палитра: первая ступень шкалы графика идёт за брендом, остальные три — нет', async ({ page }) => {
  await page.goto('/components.html');

  // Свотч читается по имени токена под ним: подписи — часть контракта секции
  const readScale = () =>
    page.evaluate(() => {
      const out: Record<string, string> = {};
      for (const swatch of document.querySelectorAll('#palette .palette-swatch')) {
        const name = swatch.querySelector('.palette-name')?.textContent || '';
        const chip = swatch.querySelector('.palette-chip');
        if (name.startsWith('--color-chart-') && chip) {
          out[name] = getComputedStyle(chip).backgroundColor;
        }
      }
      const probe = document.createElement('span');
      document.body.appendChild(probe);
      probe.style.color = 'var(--color-accent)';
      out.accent = getComputedStyle(probe).color;
      probe.remove();
      return out;
    });

  await page.click('.js-brand-switcher [data-brand-value="veza"]');
  await expect(page.locator('body')).toHaveAttribute('data-brand', 'veza');
  const veza = await readScale();
  expect(Object.keys(veza)).toHaveLength(5); // четыре ступени + зонд акцента

  await page.click('.js-brand-switcher [data-brand-value="hemah"]');
  await expect(page.locator('body')).toHaveAttribute('data-brand', 'hemah');
  const hemah = await readScale();

  // Первая ступень — алиас акцента: в каждом бренде совпадает с ним и меняется
  expect(veza['--color-chart-1']).toBe(veza.accent);
  expect(hemah['--color-chart-1']).toBe(hemah.accent);
  expect(hemah['--color-chart-1']).not.toBe(veza['--color-chart-1']);

  // Остальные три — постоянные: смена бренда их не трогает
  for (const token of ['--color-chart-2', '--color-chart-3', '--color-chart-4']) {
    expect(hemah[token], `${token} не зависит от бренда`).toBe(veza[token]);
  }
});

test('витрина: doc-prose оформляет документ, а не только размечает его', async ({ page }) => {
  // РЕГРЕССИЯ. Шапка doc-prose.css перечисляла теги через слэш, и сочетание
  // «звёздочка + слэш» закрывало блочный комментарий досрочно: парсер съедал
  // остаток шапки вместе со всем @layer components, в CSSOM у файла было ноль
  // правил. Перечисление переписано через запятую, в шапке файла оставлено
  // предупреждение. Тест сторожит именно это: он проверяет не разметку, а факт
  // применения стилей — если файл снова умрёт целиком, оба замера упадут.
  await page.goto('/components.html');
  const probe = await page.evaluate(() => {
    const code = document.querySelector('#demo-doc-prose .doc-prose__code');
    const list = document.querySelector('#demo-doc-prose ul');
    return {
      // Кнопка копирования стоит в углу блока, а не в потоке текста
      codePosition: code ? getComputedStyle(code).position : '',
      // Отступ списка приходит из компонента, а не остаётся сброшенным
      listPadding: list ? parseFloat(getComputedStyle(list).paddingInlineStart) : 0,
    };
  });
  expect(probe.codePosition).toBe('relative');
  expect(probe.listPadding).toBeGreaterThan(0);
});

test('витрина: сноска ведёт к источнику, подсвечивает карточку и держит цель 24×24', async ({ page }) => {
  await page.goto('/components.html');
  const marker = page.locator('#demo-cite-1');
  const card = page.locator('#demo-cite-source-1');

  // Площадь нажатия поднята прозрачным ::before, а не кеглем маркера (SC 2.5.8)
  const hit = await marker.evaluate((el) => {
    const cs = getComputedStyle(el, '::before');
    return { width: parseFloat(cs.width), height: parseFloat(cs.height) };
  });
  expect(hit.width).toBeGreaterThanOrEqual(24);
  expect(hit.height).toBeGreaterThanOrEqual(24);

  // .is-flashed живёт ровно один переход и снимается сама — ловим сам факт
  // появления наблюдателем, а не гонкой опроса
  await card.evaluate((el) => {
    (window as unknown as { __flashed: boolean }).__flashed = false;
    new MutationObserver(() => {
      if (el.classList.contains('is-flashed')) {
        (window as unknown as { __flashed: boolean }).__flashed = true;
      }
    }).observe(el, { attributes: true, attributeFilter: ['class'] });
  });

  await marker.click();
  await expect(marker).toHaveClass(/is-active/);
  await expect(marker).toHaveAttribute('aria-expanded', 'true');
  await expect(card).toBeFocused();
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __flashed: boolean }).__flashed))
    .toBe(true);

  // Активен ровно один маркер: подсвечен один источник
  await page.locator('#demo-cite-2').click();
  await expect(marker).not.toHaveClass(/is-active/);
  await expect(marker).toHaveAttribute('aria-expanded', 'false');
});

test('витрина: лента диалога держит якорь конца и не прокручивается плавно', async ({ page }) => {
  await page.goto('/components.html');
  const thread = page.locator('#demo-chat-thread');
  await expect(thread).toHaveAttribute('role', 'log');
  await expect(thread.locator('.chat-thread__turn')).toHaveCount(3);

  // Прокрутка на каждый токен потока — гейт частоты провален, smooth запрещён
  expect(await thread.evaluate((el) => getComputedStyle(el).scrollBehavior)).toBe('auto');

  // У якоря есть запас снизу: последняя строка не уходит под липкий композер
  const margin = await page
    .locator('#demo-chat-anchor')
    .evaluate((el) => parseFloat(getComputedStyle(el).scrollMarginBottom));
  expect(margin).toBeGreaterThan(0);
});

test('витрина: каретка стриминга появляется на потоке и уходит по остановке', async ({ page }) => {
  await page.goto('/components.html');
  const message = page.locator('#demo-chat-answer');
  const cursor = message.locator('.chat-message__cursor');
  await expect(cursor).toBeHidden();

  const phase = message.locator('[data-chat-phase]');
  await expect(phase).toBeEmpty();

  await page.locator('#demo-chat-stream-start').click();
  await expect(message).toHaveClass(/is-streaming/);
  await expect(cursor).toBeVisible();
  // Факт генерации несёт live-область, а не декоративная планка
  await expect(message.locator('[data-chat-status]')).toHaveText('Идёт генерация ответа');

  await page.locator('#demo-chat-stream-stop').click();
  await expect(message).toHaveClass(/is-stopped/);
  await expect(message).not.toHaveClass(/is-streaming/);
  await expect(cursor).toBeHidden();
  // Обрыв дублируется словом: штриховая черта не единственный носитель
  await expect(phase).toHaveText('Остановлено');
});

test('витрина: композер подменяет «Отправить» на «Стоп» и обратно', async ({ page }) => {
  await page.goto('/components.html');
  const composer = page.locator('#demo-chat-composer');
  const send = composer.locator('[data-composer-action="send"]');
  const stop = composer.locator('[data-composer-action="stop"]');

  await expect(send).toBeVisible();
  await expect(stop).toBeHidden();

  await send.click();
  await expect(composer).toHaveClass(/is-busy/);
  await expect(stop).toBeVisible();
  await expect(send).toBeHidden();
  // Поле остаётся доступным: следующий вопрос набирается, пока идёт текущий
  await expect(composer.locator('.chat-composer__field')).toBeEditable();

  await stop.click();
  await expect(composer).not.toHaveClass(/is-busy/);
  await expect(send).toBeVisible();
  await expect(stop).toBeHidden();

  // Липкий вариант остаётся у нижнего края своей ленты
  const sticky = page.locator('#demo-chat-composer-sticky');
  expect(await sticky.evaluate((el) => getComputedStyle(el).position)).toBe('sticky');
});

test('витрина: серия графика глушится из легенды и возвращается', async ({ page }) => {
  await page.goto('/components.html');
  const chart = page.locator('#demo-chart');
  const legend = chart.locator('.chart__legend-item[data-chart-series="s2"]');
  const line = chart.locator('.chart__line--s2');

  // Включённость серии несёт нативный aria-pressed, класс его не дублирует
  await expect(legend).toHaveAttribute('aria-pressed', 'true');
  const full = await settledStyle(line, 'opacity');
  expect(Number(full)).toBe(1);

  await legend.click();
  await expect(legend).toHaveAttribute('aria-pressed', 'false');
  expect(await hasClass(line, 'is-muted')).toBe(true);
  const muted = await settledStyle(line, 'opacity');
  expect(Number(muted)).toBeLessThan(1);

  await legend.click();
  await expect(legend).toHaveAttribute('aria-pressed', 'true');
  expect(await hasClass(line, 'is-muted')).toBe(false);

  // Данные обязаны остаться доступными без графика
  await expect(chart.locator('.chart__table tbody tr')).toHaveCount(6);
  await expect(chart.locator('.chart__hit').first()).toHaveAttribute('aria-label', /Январь/);
});

test('витрина: лаунчер открывается от триггера и закрывается по Escape', async ({ page }) => {
  await page.goto('/components.html');
  const launcher = page.locator('#demo-app-launcher');
  const trigger = page.locator('#demo-app-launcher-trigger');
  const popover = page.locator('#demo-app-launcher-popover');

  await expect(popover).toBeHidden();
  await trigger.click();
  await expect(launcher).toHaveClass(/is-open/);
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(popover).toBeVisible();

  // Панель раскрывается ОТ кнопки: канал происхождения ставит JS
  const origin = await launcher.evaluate((el) =>
    (el as HTMLElement).style.getPropertyValue('--transform-origin'),
  );
  expect(origin).not.toBe('');

  await page.keyboard.press('Escape');
  await expect(launcher).not.toHaveClass(/is-open/);
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).toBeFocused();
  await expect(popover).toBeHidden();
});

test('витрина: тур листается по шагам и возвращает фокус по Escape', async ({ page }) => {
  await page.goto('/components.html');
  const coach = page.locator('#demo-coach-mark');
  const start = page.locator('#demo-coach-start');
  const title = coach.locator('.coach-mark__title');
  const dots = coach.locator('.coach-mark__dots span');

  await start.click();
  await expect(coach).toHaveClass(/is-open/);
  await expect(title).toHaveText('Режимы ответа');
  await expect(dots).toHaveCount(3);
  await expect(dots.nth(0)).toHaveAttribute('aria-current', 'step');
  // Номер шага дублируется текстом — точка не единственный носитель
  await expect(coach.locator('.coach-mark__dots')).toContainText('шаг 1 из 3');

  // Геометрию спотлайта ставит JS замером цели, а не CSS
  const spot = await coach.evaluate((el) =>
    parseFloat(getComputedStyle(el).getPropertyValue('--coach-mark-spot-w')),
  );
  expect(spot).toBeGreaterThan(0);

  await coach.locator('[data-coach-next]').click();
  await expect(title).toHaveText('Фильтры источников');
  await expect(dots.nth(1)).toHaveAttribute('aria-current', 'step');
  await expect(coach.locator('.coach-mark__dots')).toContainText('шаг 2 из 3');

  await page.keyboard.press('Escape');
  await expect(coach).not.toHaveClass(/is-open/);
  await expect(start).toBeFocused();
});

test('витрина: оглавление документа липкое, активный раздел помечен не только цветом', async ({ page }) => {
  await page.goto('/components.html');
  const nav = page.locator('#page-nav .page-nav');
  expect(await nav.evaluate((el) => getComputedStyle(el).position)).toBe('fixed');
  await expect(nav.locator('.page-nav-link.active')).toHaveAttribute('aria-current', 'location');

  const weight = await nav.evaluate((el) => {
    const active = el.querySelector('.page-nav-link.active');
    const plain = el.querySelector('.page-nav-link:not(.active)');
    return {
      active: active ? getComputedStyle(active).fontWeight : '',
      plain: plain ? getComputedStyle(plain).fontWeight : '',
    };
  });
  expect(weight.active).not.toBe(weight.plain);
});

test('витрина: аккордеон --plain раскрывается без анимации высоты', async ({ page }) => {
  await page.goto('/components.html');
  const item = page.locator('#demo-accordion-plain .accordion__item');
  const header = page.locator('#demo-accordion-plain-header');
  const panel = page.locator('#demo-accordion-plain-panel');

  await expect(panel).toBeHidden();
  await header.click();
  await expect(item).toHaveClass(/is-open/);
  await expect(header).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).toBeVisible();
  await expect(panel.locator('table.table tbody tr')).toHaveCount(3);

  // Высота не анимируется сознательно: связь причины и следствия несёт шеврон
  expect(await panel.evaluate((el) => getComputedStyle(el).transitionProperty)).toBe('none');
});

test('витрина: переключатель пароля меняет тип поля и иконку по aria-pressed', async ({ page }) => {
  await page.goto('/components.html');
  const field = page.locator('#demo-password');
  const toggle = page.locator('#demo-password-toggle');

  await expect(field).toHaveAttribute('type', 'password');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(toggle.locator('[data-icon="conceal"]')).toBeHidden();

  await toggle.click();
  await expect(field).toHaveAttribute('type', 'text');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(toggle.locator('[data-icon="conceal"]')).toBeVisible();
  await expect(toggle.locator('[data-icon="reveal"]')).toBeHidden();
  // Доступное имя за состоянием не меняется — состояние несёт aria-pressed
  await expect(toggle).toHaveAttribute('aria-label', 'Показать пароль');

  await toggle.click();
  await expect(field).toHaveAttribute('type', 'password');
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
});
// </TEST:e2e.library-first-03>
// </TEST:e2e.smoke>
