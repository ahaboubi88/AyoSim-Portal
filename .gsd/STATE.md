# STATE.md — Project State

> **Last Updated**: 2026-11-22 (Context Hygiene Pause Dump)
> **Current Phase**: Phase 8: Unified Simulator Ecosystem (Making All Simulators Feel Like One App Safely) ⬜
> **Status**: Paused (Ready to Resume)

## Active Context & Architectural Alignment

- **Portal-Only Simulator Gating**: Direct address-bar entry to raw simulator URLs (`ayosim-*.vercel.app`) must be blocked and bounced to the portal. Solved via stateless token handshake (`HMAC` / timestamp query parameter) validated by a simulator `guard.js` script on boot and stored in `sessionStorage`.
- **Project Sharing Architecture**: User-shared simulation links will be branded portal URLs (`https://ayosim.vercel.app/project/:board?id=XYZ`). The portal verifies project status, displays the provisioning modal / preview, and forwards with a valid launch token.
- **Supabase Free Plan Protection**:
  - Launch tokens consume **0 bytes** (stateless crypto signature).
  - Shared project data is plain text/JSON (~5–10 KB uncompressed, ~2 KB compressed).
  - 48-hour expiration TTL enforced via `expires_at` column and RLS.
  - Automated physical database garbage collection scheduled via PostgreSQL `pg_cron` extension running hourly cleanup queries (`DELETE FROM shared_projects WHERE expires_at < now()`).
- **Architecture Decision Record**: Documented in `ADR-005` in `DECISIONS.md`.

## Progress

| Phase | Status | Completion |
|-------|--------|------------|
| Phase 1: Foundation & Layout | ✅ Complete | 100% |
| Phase 2: Content Sections & Interactivity | ✅ Complete | 100% |
| Phase 3: Internationalization & Theming | ✅ Complete | 100% |
| Phase 4: Polish & Deploy | ✅ Complete | 100% |
| Simulator Cards Simplification & Hero Size Tuning | ✅ Complete | 100% |
| Phase 5: Simulator Provisioning Loading Sequence | ✅ Complete | 100% |
| Ultra-HD Facebook / Social Thumbnail | ✅ Complete | 100% |
| Mobile Modal Back-Navigation Resolution | ✅ Complete | 100% |
| Phase 6: SEO & Generative Engine Optimization (GEO) | ✅ Complete | 100% |
| Phase 7: User Authentication & Account System (Supabase) | ✅ Complete | 100% |
| Phase 8: Unified Simulator Ecosystem | 📋 Planned | 0% |

## Phase 8 Execution Plans (3 Plans across 3 Waves)

| Plan | Wave | Focus | Files | Status |
|------|------|-------|-------|--------|
| [Plan 8.1](phases/8/01-PLAN.md) | Wave 1 | Sub-Path Rewrites & Isolation Headers | `vercel.json`, `index.html`, `js/main.js` | ⬜ Planned |
| [Plan 8.2](phases/8/02-PLAN.md) | Wave 2 | Global Nav Spec & Board Switcher | `docs/GLOBAL_NAV_SPEC.md`, `css/styles.css`, `index.html` | ⬜ Planned |
| [Plan 8.3](phases/8/03-PLAN.md) | Wave 3 | Cross-App Supabase Auth & Cloud Projects | `scripts/schema.sql`, `docs/DATABASE_SCHEMA.md`, `js/projects.js` | ⬜ Planned |


## Phase 7 Execution Plans (3 Plans across 3 Waves)

| Plan | Wave | Focus | Files | Status |
|------|------|-------|-------|--------|
| [Plan 7.1](phases/7/01-PLAN.md) | Wave 1 | Supabase SDK & Core Auth Engine | `index.html`, `js/supabase-config.js`, `js/auth.js` | ✅ Complete |
| [Plan 7.2](phases/7/02-PLAN.md) | Wave 2 | Auth Modal & Header Profile UI | `index.html`, `css/auth.css` | ✅ Complete |
| [Plan 7.3](phases/7/03-PLAN.md) | Wave 3 | Interaction Flows, i18n & E2E Verification | `js/main.js`, `i18n/*.json`, `css/auth.css` | ✅ Complete |

## Recent Deliverables

- [x] **Phase 7 User Authentication & Account System (Supabase)**: Implemented complete client-side authentication system for AyoSim using Supabase JS SDK (`@supabase/supabase-js@2`). Created `js/supabase-config.js` with live credential placeholders and zero-config Demo Mode fallback. Implemented reactive `AyoSimAuth` singleton in `js/auth.js` supporting email/password sign-up, sign-in, password reset, and Google/GitHub OAuth. Built accessible auth modal (`#auth-modal`) with tabbed sign-in/sign-up switching, forgot password view, and branded OAuth buttons. Added navigation header state with "Sign In" button and authenticated user profile dropdown menu (`#user-menu`). Provided full trilingual localization in English, French, and Arabic with native RTL styling in `css/auth.css`. Empirically verified with automated test suite (`scripts/verify-phase-7.js`).
- [x] **Phase 6 Search Engine Optimization (SEO) & Generative Engine Optimization (GEO)**: Implemented complete technical SEO and AI Search suite. Added `/llms.txt` and `/llms-full.txt` for machine knowledge ingestion by ChatGPT, Perplexity, Claude, and Gemini. Configured `robots.txt` explicitly allowing AI and search engine crawlers (GPTBot, PerplexityBot, ClaudeBot, Google-Extended, etc.). Enhanced `sitemap.xml` with multilingual `xhtml:link` hreflang annotations and sub-simulator URLs. Integrated full Schema.org JSON-LD graph (`WebSite`, `Organization`, `WebApplication`, and `FAQPage` covering AyoSim vs Wokwi, AyoSim vs Tinkercad, ESP32 BLE, and Raspberry Pi Linux simulation). Added `hreflang` alternate links (EN, FR, AR, x-default) and verification placeholders in `index.html`.
- [x] **Mobile Modal Back-Navigation Resolution**: Fixed the issue where returning to the portal page via mobile browser Back button left the loading modal active. Removed conditional `event.persisted` check on `pageshow` (which evaluates to `false` during cross-origin mobile back navigation despite preserved DOM cache), added `pagehide` cleanup so history/bfcache snapshots are saved with the modal closed, added `visibilitychange` & `popstate` handlers, cleared initial state on launcher initialization, and removed conflicting `target="_blank"` attributes from simulator card links. Bumped `main.js?v=2.1`.
- [x] **Ultra-HD Facebook & Open Graph Thumbnail (2400x1260 @ 2x)**: Re-rendered and deployed a pristine 2400x1260 (2x Retina) Open Graph card in lossless PNG (`assets/og-image.png`, 1.68 MB) and 95% quality JPEG (`assets/og-image.jpg`, 486 KB). Removed scrollbars, perfected vertical padding and card layout, and updated Open Graph meta tags with version query string `?v=2.1` and explicit `2400x1260` dimensions for crisp rendering on high-DPI smartphone/desktop screens.
- [x] **Phase 5 Simulator Loading Interface**: Implemented an interstitial cybernetic provisioning modal when a user clicks on any simulator card (Arduino, ESP32, Raspberry Pi) with background page blur (`backdrop-filter: blur(16px)`).
- [x] **Animated Hardware Synthesis Graphics**: Designed multi-ring rotating HUD animations and pulsating microchip icon with dynamic glowing accents.
- [x] **Board-Specific Technical Terminal Logs**: Added realistic kernel build logs tailored to each architecture (ATmega328P core/PWM/UART, Xtensa LX6/FreeRTOS/Wi-Fi/BLE, Cortex-A72/Linux v6.1/40-pin GPIO).
- [x] **Calibrated 2-Second Sequence**: Staged progress increments and terminal lines across 2000ms followed by seamless automatic navigation to the target simulator.
- [x] **Abort & Accessibility Support**: Implemented `✕` close button and `Escape` key handling to cancel provisioning anytime; ARIA modal dialog markup.
- [x] **Trilingual Localization (EN, FR, AR)**: Full translations for status badges, subtitles, escape hints, and board initialization logs with native RTL adaptation for Arabic.
- [x] **Reverted Thumbnails**: Tutorial, article, and project cards reverted to clean, text-based presentation without thumbnail slots.
- [x] **Enlarged Hero**: Hero section made bigger with expanded vertical padding (`var(--space-12) var(--space-16)`), larger heading font clamp (`2.4rem` to `3.8rem`), and spacious typography.
- [x] **Minimalist Simulator Links**: Removed all descriptions and bullet points from simulator links; each item now consists solely of the real board thumbnail photo and simulator title, with the entire card serving as the direct launch link.
- [x] **4K Realistic Board Pictures with Technical Backgrounds**: Generated and deployed ultra-realistic 4K hardware photos with technical backgrounds (oscilloscopes, electronics workbenches, circuits, schematics) for Arduino Uno, ESP32, and Raspberry Pi; styled with smooth hover zoom and full-bleed card container.
- [x] **Dynamic Aspect-Ratio Matching**: Configured exact `1376 / 768` aspect-ratio container and universal image sizing so images automatically and perfectly fit the placeholder width with responsive height matching.
- [x] **Cache Busting & Instant Revalidation**: Added `?v=1.3` version query strings to all styles/scripts in `index.html` and configured `max-age=0, must-revalidate` in `vercel.json` to prevent stale browser caching.
- [x] **AYOSIM Circuit Logos**: Designed 4 minimalist electronic circuit pattern variants etched on the letters **SIM** (crisp white, cyan glow, connected microchip bus, hairline silkscreen).
- [x] **Transparent Background AYOSIM Circuit Logo**: Deployed the user's transparent AYOSIM circuit logo, cropped with neat 10px breathing room to 954×248, version-tagged as `?v=1.5` for instant cache busting, and pushed live to Vercel production.
- [x] **Circuit "AO" Monogram Favicon & PWA Suite**: Extracted and antialiased the rounded squircle "AO" circuit badge with transparent outer corners, generated multi-resolution favicons (`favicon.ico`, `assets/favicon.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`), updated `manifest.json`, and deployed live.
- [x] **Commercial Messaging Alignment**: Replaced "100% Free & Open Source" with "100% In-Browser" across EN, FR, AR to align with future paid monetization model; updated hero badge to "Interactive hardware simulation platform".
- [x] **New Gradient AYOSIM Logo**: Deployed the user's vibrant multi-color gradient wordmark (royal blue -> sky blue -> cyan -> lavender), cropped with 10px breathing room to 994×246, version-tagged as `?v=1.8`, and deployed live to production.
- [x] **Facebook & Open Graph Social Thumbnail**: Created 1200×630 high-definition social preview thumbnail showcasing the dark-mode landing hero and simulator cards (with new gradient logo and zero browser full-screen overlays), configured `og:image` and `twitter:image` tags in `index.html`, and deployed live.
