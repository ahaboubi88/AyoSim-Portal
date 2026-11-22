---
phase: 7
plan: 2
wave: 2
depends_on: ["01"]
gap_closure: false
---

# Plan 7.2: Auth Modal & Header UI Components

## Objective
Design and implement the complete visual interface for authentication: the interactive auth modal dialog (with Sign In, Sign Up, Forgot Password views, and Social OAuth buttons) and the responsive navigation header controls (Sign In button vs. Authenticated User Profile dropdown).

## Context
Load these files for context:
- .gsd/phases/7/01-PLAN.md
- index.html
- css/variables.css
- css/components.css
- css/layout.css

## Tasks

<task type="auto">
  <name>Build Auth Modal Markup & Header User Profile Controls</name>
  <files>
    index.html
  </files>
  <action>
    1. In `index.html` `<div class="header__actions">`:
       - Add `<div class="header__auth" id="header-auth">`:
         - Unauthenticated state: `<button class="btn btn--outline btn--sm auth-btn-trigger" id="auth-sign-in-btn" data-i18n="auth.signIn">Sign In</button>`
         - Authenticated state: `<div class="user-menu" id="user-menu" style="display:none;">` containing user avatar button (`user-menu__btn`), user initial/avatar image, and dropdown menu (`user-menu__dropdown`) with user email, profile info, and Sign Out button (`#auth-sign-out-btn`).
    2. In `index.html` before closing `</body>`:
       - Add `<div class="auth-modal" id="auth-modal" role="dialog" aria-modal="true" aria-hidden="true">` with:
         - Backdrop overlay (`auth-modal__backdrop`)
         - Modal container (`auth-modal__dialog`) with accessible title (`#auth-modal-title`) and close button (`auth-modal__close`)
         - Tab navigation: Sign In (`auth-tab--signin`) vs Sign Up (`auth-tab--signup`)
         - Status / alert message container (`auth-modal__alert` for errors and success notices)
         - Email/Password form fields (`#auth-form`): Full Name (in sign-up tab), Email, Password
         - "Forgot password?" toggle link
         - Password reset form view (`#auth-reset-form`, toggleable)
         - Submit action button (`#auth-submit-btn`) with loading state
         - Divider: `<div class="auth-modal__divider"><span data-i18n="auth.orContinueWith">or continue with</span></div>`
         - Social buttons: Google OAuth (`#auth-google-btn`) with SVG icon, GitHub OAuth (`#auth-github-btn`) with SVG icon
         - Configuration/Demo notice banner (`#auth-demo-notice` to inform user when in preview mode)
    
    AVOID: Hardcoded un-localized text strings.
    USE: Semantic `data-i18n` attributes on all buttons, titles, placeholders, and links.
  </action>
  <verify>
    powershell -Command "Select-String -Path 'index.html' -Pattern 'id=\"auth-modal\"'; Select-String -Path 'index.html' -Pattern 'id=\"header-auth\"'"
  </verify>
  <done>
    `index.html` contains the complete `auth-modal` dialog markup and `header-auth` container with complete accessibility attributes.
  </done>
</task>

<task type="auto">
  <name>Style Auth Modal, Header Menu & Theming</name>
  <files>
    css/auth.css
    index.html
  </files>
  <action>
    1. Create `css/auth.css`:
       - Design system integration: Use CSS variables from `variables.css` (`--color-primary`, `--bg-card`, `--text-primary`, `--border-color`, `--shadow-lg`, etc.).
       - Backdrop overlay with blur effect (`backdrop-filter: blur(12px)` + dimmed dark overlay).
       - Modal styling: Centered dialog, smooth fade-and-scale entrance animation (`@keyframes authModalIn`), responsive padding.
       - Tab navigation: Active indicator bar, hover states, clear contrast.
       - Form controls: Clean inputs with focus glow (`outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(74, 94, 171, 0.2)`).
       - Social OAuth buttons: Distinct Google (white/light card style) and GitHub (dark obsidian style) buttons with crisp SVG alignment.
       - Header profile avatar & dropdown: Rounded squircle avatar with gradient border, dropdown card with elevation shadow, active hover states, and smooth slide-down animation.
       - Dark and Light theme adaptability: Seamlessly render with `[data-theme="dark"]` and `[data-theme="light"]`.
       - Mobile responsiveness: Full-width responsive layout for viewports < 480px.
    2. Link `css/auth.css?v=2.2` in `index.html` `<head>`.
    
    AVOID: Fixed pixel widths that break on small mobile viewports.
    USE: Flexible box layout with `clamp()` and CSS variables.
  </action>
  <verify>
    powershell -Command "Test-Path 'css/auth.css'; Select-String -Path 'index.html' -Pattern 'css/auth.css'"
  </verify>
  <done>
    `css/auth.css` is created, linked in `index.html`, and provides complete styling for modal, tabs, form controls, social buttons, and header user dropdown.
  </done>
</task>

## Must-Haves
After all tasks complete, verify:
- [ ] Modal markup is accessible with `role="dialog"` and `aria-modal="true"`
- [ ] CSS provides sleek modern aesthetics matching AyoSim brand in both dark and light modes
- [ ] Header has both unauthenticated trigger and authenticated profile menu containers

## Success Criteria
- [ ] All tasks verified passing
- [ ] Must-haves confirmed
- [ ] No visual clipping or layout breaks across responsive breakpoints
