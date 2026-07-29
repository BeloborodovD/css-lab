---
name: responsive-design
description: >
  Responsive design patterns: mobile-first approach, breakpoints, print styles,
  touch interactions, viewport handling. Use when creating UI that must work
  across desktop, tablet, mobile, and print.
allowed-tools: Read, Grep, Glob, Write, Edit
---

# Responsive Design Skill

## 🚨 CRITICAL: Always Consider All Viewports

**При создании любого UI компонента СРАЗУ продумывай:**

1. **Desktop** (1280px+) - основной вид
2. **Tablet** (768px - 1279px) - адаптация layout
3. **Mobile** (< 768px) - переосмысление UX
4. **Print** (@media print) - чистый вывод без UI

## Breakpoints (Tailwind / Standard)

```css
/* Mobile First подход */
/* Base styles = mobile */

/* sm: 640px+ */
@media (min-width: 640px) { }

/* md: 768px+ (tablet) */
@media (min-width: 768px) { }

/* lg: 1024px+ (laptop) */
@media (min-width: 1024px) { }

/* xl: 1280px+ (desktop) */
@media (min-width: 1280px) { }

/* 2xl: 1536px+ (large desktop) */
@media (min-width: 1536px) { }

/* Print */
@media print { }
```

## Mobile-First Checklist

### Layout

```tsx
// ✅ Mobile-first: stack → row
<div className="flex flex-col md:flex-row gap-4">
  <aside className="w-full md:w-64 md:shrink-0">Sidebar</aside>
  <main className="flex-1">Content</main>
</div>

// ✅ Grid responsive
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>

// ✅ Hide/show по breakpoint
<nav className="hidden md:flex">Desktop nav</nav>
<button className="md:hidden">Mobile menu</button>
```

### Typography

```css
/* Fluid typography */
.heading {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  line-height: 1.2;
}

/* Readable line length */
.prose {
  max-width: 65ch;
}

/* Mobile: larger touch targets, readable text */
@media (max-width: 767px) {
  body {
    font-size: 16px; /* minimum for iOS */
  }

  .btn {
    min-height: 44px; /* Apple HIG touch target */
    padding: 12px 16px;
  }
}
```

### Images

```tsx
// ✅ Responsive images
<img
  src="/hero.jpg"
  srcSet="/hero-400.jpg 400w, /hero-800.jpg 800w, /hero-1200.jpg 1200w"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  alt="Hero image"
  loading="lazy"
  className="w-full h-auto object-cover"
/>

// ✅ Next.js Image
<Image
  src="/hero.jpg"
  alt="Hero"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover"
/>
```

### Tables

```tsx
// ✅ Responsive table - horizontal scroll on mobile
<div className="overflow-x-auto">
  <table className="min-w-full">...</table>
</div>

// ✅ Alternative: card layout on mobile
<div className="hidden md:block">
  <table>...</table>
</div>
<div className="md:hidden space-y-4">
  {data.map(row => (
    <div key={row.id} className="border rounded p-4">
      <div className="font-bold">{row.name}</div>
      <div className="text-sm text-gray-600">{row.value}</div>
    </div>
  ))}
</div>
```

## Touch Interactions

```css
/* Larger touch targets */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  padding: 12px;
}

/* Touch feedback */
@media (hover: none) {
  .btn:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

/* Disable hover effects on touch */
@media (hover: hover) {
  .btn:hover {
    background-color: var(--hover-bg);
  }
}

/* Safe area for notched devices */
.bottom-nav {
  padding-bottom: env(safe-area-inset-bottom);
}
```

## Print Styles

```css
@media print {
  /* Hide non-essential UI */
  nav,
  .sidebar,
  .no-print,
  button,
  .actions,
  footer {
    display: none !important;
  }

  /* Reset backgrounds for ink saving */
  * {
    background: white !important;
    color: black !important;
    box-shadow: none !important;
  }

  /* Show full URLs for links */
  a[href^="http"]::after {
    content: " (" attr(href) ")";
    font-size: 0.8em;
    color: #666;
  }

  /* Prevent page breaks inside elements */
  .card,
  table,
  figure {
    break-inside: avoid;
  }

  /* Page breaks */
  .page-break {
    break-after: page;
  }

  h1, h2, h3 {
    break-after: avoid;
  }

  /* Print margins */
  @page {
    margin: 2cm;
  }

  @page :first {
    margin-top: 3cm;
  }

  /* Expand collapsed sections */
  details {
    display: block !important;
  }

  details > summary {
    display: none;
  }
}
```

### Print-Specific Components

```tsx
// ✅ Print-only content
<div className="hidden print:block">
  <p>Документ сгенерирован: {new Date().toLocaleDateString()}</p>
</div>

// ✅ Hide from print
<button className="print:hidden">Download PDF</button>

// ✅ Full width on print
<div className="w-full md:w-1/2 print:w-full">
  Content
</div>
```

## Component Patterns

### Responsive Modal/Drawer

```tsx
// Desktop: centered modal, Mobile: bottom sheet
function ResponsiveModal({ isOpen, onClose, children }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        // Mobile: full-width bottom sheet
        "fixed inset-x-0 bottom-0 rounded-t-lg",
        "max-h-[85vh] overflow-auto",
        // Desktop: centered modal
        "md:inset-auto md:top-1/2 md:left-1/2",
        "md:-translate-x-1/2 md:-translate-y-1/2",
        "md:rounded-lg md:max-w-lg md:max-h-[80vh]"
      )}>
        {children}
      </DialogContent>
    </Dialog>
  );
}
```

### Responsive Navigation

```tsx
function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-6">
        <Link href="/catalog">Каталог</Link>
        <Link href="/about">О нас</Link>
        <Link href="/contacts">Контакты</Link>
      </nav>

      {/* Mobile hamburger */}
      <button
        className="md:hidden p-2"
        onClick={() => setMobileOpen(true)}
        aria-label="Открыть меню"
      >
        <MenuIcon />
      </button>

      {/* Mobile drawer */}
      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <nav className="flex flex-col gap-4 p-6">
          <Link href="/catalog" className="py-3 text-lg">Каталог</Link>
          <Link href="/about" className="py-3 text-lg">О нас</Link>
          <Link href="/contacts" className="py-3 text-lg">Контакты</Link>
        </nav>
      </Drawer>
    </>
  );
}
```

### Responsive Data Display

```tsx
// Filters: sidebar on desktop, bottom sheet on mobile
function FiltersLayout({ filters, content }) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 shrink-0">
        <FiltersPanel filters={filters} />
      </aside>

      {/* Mobile filter button */}
      <div className="md:hidden sticky top-0 bg-white z-10 p-4 border-b">
        <button
          onClick={() => setFiltersOpen(true)}
          className="w-full btn btn-outline"
        >
          Фильтры ({activeCount})
        </button>
      </div>

      {/* Mobile filters drawer */}
      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        className="md:hidden"
      >
        <FiltersPanel filters={filters} />
      </Drawer>

      {/* Content */}
      <main className="flex-1">{content}</main>
    </div>
  );
}
```

## Testing Checklist

### Before Completion

```
□ Desktop (1920x1080) - full layout works
□ Laptop (1366x768) - no horizontal scroll
□ Tablet landscape (1024x768) - readable
□ Tablet portrait (768x1024) - layout adapts
□ Mobile (375x667) - usable, no overflow
□ Mobile small (320x568) - still functional
□ Print preview - clean, no UI elements
□ Touch targets >= 44px
□ Text readable without zoom (>= 16px base)
□ Forms usable on mobile keyboard
□ Images don't overflow
□ Tables scrollable or adapted
```

### Testing Tools

```bash
# Chrome DevTools
F12 → Toggle device toolbar (Ctrl+Shift+M)

# Responsive testing
npx responsively-app

# Print preview
Ctrl+P → Preview

# Lighthouse mobile audit
npx lighthouse --view --preset=desktop URL
npx lighthouse --view --preset=mobile URL
```

## Quick Reference

```
┌─────────────────────────────────────────────────────────────┐
│              RESPONSIVE DESIGN CHECKLIST                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  LAYOUT:                                                    │
│  □ Mobile-first CSS (base = mobile)                         │
│  □ Flex/Grid с responsive modifiers                         │
│  □ Sidebar → stacked on mobile                              │
│  □ Multi-column → single column                             │
│                                                             │
│  TOUCH:                                                     │
│  □ Touch targets >= 44px                                    │
│  □ No hover-only interactions                               │
│  □ Swipe gestures where appropriate                         │
│  □ Safe area padding (notch devices)                        │
│                                                             │
│  TYPOGRAPHY:                                                │
│  □ Base font >= 16px (iOS zoom prevention)                  │
│  □ Fluid typography (clamp)                                 │
│  □ Max line width 65-75ch                                   │
│                                                             │
│  IMAGES:                                                    │
│  □ srcset + sizes for responsive                            │
│  □ lazy loading                                             │
│  □ aspect-ratio preserved                                   │
│                                                             │
│  PRINT:                                                     │
│  □ Hide nav, buttons, actions                               │
│  □ Black text on white                                      │
│  □ Show URLs for links                                      │
│  □ Page break controls                                      │
│  □ Expand collapsed sections                                │
│                                                             │
│  BREAKPOINTS (Tailwind):                                    │
│  sm: 640px | md: 768px | lg: 1024px | xl: 1280px            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Delegation

- Для сложных анимаций → делегируй `dev-web-animation`
- Для accessibility → делегируй `dev-accessibility`
- Для CSS архитектуры → делегируй `dev-css`