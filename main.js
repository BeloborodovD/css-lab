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
