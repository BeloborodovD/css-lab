// [CONFIG:site-chrome]
// Общее поведение шапки сайта-примеров: восстановление бренда и темы из
// localStorage, биндинг переключателей .js-brand-switcher и .site-header__theme.
// Модуль: css-lab/js. Подключается на всех страницах ПОСЛЕ разметки шапки.
// Анти-FOUC: страницы дополнительно ставят data-brand/.dark инлайн-сниппетом
// в <head> (см. шаблон в hub index.html).

(function initSiteChrome() {
  const BRAND_KEY = 'css-lab-brand';
  const THEME_KEY = 'css-lab-theme';

  // ===== Бренд =====
  const brandButtons = document.querySelectorAll('.js-brand-switcher [data-brand-value]');
  function applyBrand(value) {
    if (value) document.body.setAttribute('data-brand', value);
    else document.body.removeAttribute('data-brand');
    brandButtons.forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.dataset.brandValue === value));
    });
    try { localStorage.setItem(BRAND_KEY, value); } catch (e) { /* приватный режим */ }
  }
  brandButtons.forEach(btn => {
    btn.addEventListener('click', () => applyBrand(btn.dataset.brandValue));
  });
  if (brandButtons.length) {
    let saved = null;
    try { saved = localStorage.getItem(BRAND_KEY); } catch (e) { /* приватный режим */ }
    const valid = [...brandButtons].some(btn => btn.dataset.brandValue === saved);
    applyBrand(valid ? saved : (document.body.dataset.brand || 'veza'));
  }

  // ===== Тема =====
  const themeBtn = document.querySelector('.site-header__theme');
  function applyTheme(dark) {
    document.body.classList.toggle('dark', dark);
    try { localStorage.setItem(THEME_KEY, dark ? 'dark' : 'base'); } catch (e) { /* — */ }
  }
  let savedTheme = null;
  try { savedTheme = localStorage.getItem(THEME_KEY); } catch (e) { /* — */ }
  if (savedTheme === 'dark') applyTheme(true);
  themeBtn?.addEventListener('click', () => {
    applyTheme(!document.body.classList.contains('dark'));
  });
})();
// </CONFIG:site-chrome>
