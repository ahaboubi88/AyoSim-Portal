# Phase 1: Foundation & Layout — Execution Plan

> **Status**: 🔄 In Progress
> **Objective**: Project scaffolding, HTML structure, CSS design system, responsive layout

## File Structure

```
d:\opencode\Ayosim\
├── index.html              # Main portal page
├── css/
│   ├── variables.css       # CSS custom properties (colors, fonts, spacing)
│   ├── reset.css           # CSS reset / normalize
│   ├── layout.css          # Header, footer, section layouts
│   ├── components.css      # Cards, buttons, nav
│   └── responsive.css      # Media queries, mobile-first breakpoints
├── js/
│   └── main.js             # (placeholder for Phase 2+)
├── assets/
│   ├── logo.png            # AYOT logo
│   └── icons/              # Board icons (placeholder)
├── i18n/                   # (Phase 3)
└── .gsd/                   # Project management
```

## Tasks

### Task 1.1: CSS Design System (`variables.css` + `reset.css`)
- [ ] CSS custom properties from AYOT branding
  - `--color-primary: #4A5EAB` (AYOT blue)
  - `--color-primary-light`, `--color-primary-dark` variants
  - Light theme defaults + dark theme overrides via `[data-theme="dark"]`
  - Font stack: Inter, system sans-serif fallback
  - Spacing scale (4px base)
  - Border radius, shadows, transitions
- [ ] Modern CSS reset (box-sizing, margin reset, smooth scroll)

### Task 1.2: HTML Structure (`index.html`)
- [ ] Semantic HTML5 structure:
  - `<header>` — Logo, nav links, language selector placeholder, theme toggle placeholder
  - `<main>` with `<section>` for each content area:
    - `#hero` — Headline, tagline, CTA buttons
    - `#simulators` — 3-card grid (placeholder structure)
    - `#tutorials` — Section shell
    - `#articles` — Section shell
    - `#projects` — Section shell
  - `<footer>` — AYOT branding, links
- [ ] Link all CSS files
- [ ] Add `data-i18n` attributes for future translation hooks
- [ ] Meta viewport tag for responsive

### Task 1.3: Layout CSS (`layout.css` + `components.css`)
- [ ] Header: Sticky, flex layout, logo left, nav right
- [ ] Hero: Centered text, gradient or solid blue background
- [ ] Sections: Consistent max-width container, vertical spacing
- [ ] Cards: Flexbox/grid, 3-column on desktop
- [ ] Buttons: Primary (blue) and outline variants
- [ ] Footer: Multi-column flex layout

### Task 1.4: Responsive CSS (`responsive.css`)
- [ ] Breakpoints: 480px (mobile), 768px (tablet), 1024px (desktop), 1280px (wide)
- [ ] Mobile: Single column, stacked nav, full-width cards
- [ ] Tablet: 2-column card grid
- [ ] Desktop: 3-column cards, horizontal nav

### Task 1.5: Logo Asset
- [ ] Copy AYOT logo to assets/
- [ ] Add to header

## Verification

- [ ] Page renders in browser with all sections visible
- [ ] Responsive at all breakpoints (320px → 1920px)
- [ ] CSS variables applied consistently
- [ ] No horizontal scroll at any viewport size
- [ ] Semantic HTML passes outline check
