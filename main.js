// CSS Lab - точка входа
console.log('🎨 CSS Lab запущен!')

// ===== Chip Component =====
// Removable chips
document.querySelectorAll('.chip-remove').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (chip) {
      chip.style.transform = 'scale(0.8)';
      chip.style.opacity = '0';
      setTimeout(() => chip.remove(), 150);
    }
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
