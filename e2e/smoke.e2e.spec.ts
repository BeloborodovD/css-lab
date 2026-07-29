// [TEST:e2e.smoke]
// Смоук всех страниц сайта-витрины: загрузка без ошибок консоли,
// переключение бренда, ключевой интерактив каждой страницы.
import { test, expect, type Page } from '@playwright/test';

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
  expect(accent).toBe('#374a51');
});

test('витрина: combobox открывается и выбирает опцию', async ({ page }) => {
  await page.goto('/components.html');
  const combo = page.locator('#combobox .combobox').first();
  await combo.locator('.combobox-trigger').click();
  await expect(combo).toHaveClass(/open/);
  await combo.locator('.combobox-option', { hasText: 'Опция 3' }).click();
  await expect(combo.locator('.combobox-value')).toHaveText('Опция 3');
  await expect(combo).not.toHaveClass(/open/);
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
// </TEST:e2e.smoke>
