---
phase: 7
researched_at: 2026-11-22
discovery_level: 2
---

# Phase 7 Research: Client-Side Supabase Authentication

## Objective
Establish the architectural blueprint and integration strategy for adding Supabase Authentication to the AyoSim static web portal (vanilla HTML/CSS/JS hosted on Vercel), supporting Email/Password, Social OAuth (Google & GitHub), session persistence, and trilingual UI localization (EN/FR/AR).

## Discovery Level
**Level 2** — Standard Research (External BaaS Integration into Static Architecture)

---

## Key Decisions

### Decision 1: Client SDK Integration Method
- **Options Considered**:
  1. *npm package + build bundler (Vite / Webpack)*: High overhead, breaks AyoSim's pure static zero-build architecture.
  2. *CDN `<script>` tag (`https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`)*: Direct browser global `window.supabase`, zero build step, matches existing architecture.
  3. *ESM dynamic import (`import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'`)*: Modern, but requires `<script type="module">` refactoring for all existing scripts.
- **Decision**: CDN `<script>` tag loading `@supabase/supabase-js@2` via jsDelivr with fallback CDN support.
- **Rationale**: Preserves 100% of AyoSim's instant-load static architecture without requiring Node.js build pipelines.
- **Confidence**: High

### Decision 2: Credentials & Configuration Architecture
- **Question**: How should Supabase API credentials (`SUPABASE_URL` and `SUPABASE_ANON_KEY`) be handled in a static repository?
- **Decision**: Create a dedicated `js/supabase-config.js` script containing `window.AYOSIM_SUPABASE_CONFIG`.
  - Provide documented placeholders for live Supabase project credentials.
  - Include an automatic "Demo/Mock Auth Mode" when keys are not configured or set to placeholder strings.
  - In Demo Mode, users can test Sign In, Sign Up, and Sign Out locally with simulated latency and local storage persistence without throwing network crashes.
- **Confidence**: High

### Decision 3: Auth State Management & Decoupling
- **Question**: How should authentication state synchronize across the application and navigation header?
- **Decision**: Encapsulate all Supabase calls inside a singleton `AyoSimAuth` engine (`js/auth.js`) that dispatches native DOM events (`ayosim:auth:change`, `ayosim:auth:error`, `ayosim:auth:message`).
- **Rationale**: Keeps `main.js` and UI rendering cleanly decoupled from raw Supabase SDK specifics.
- **Confidence**: High

### Decision 4: OAuth Redirection Strategy
- **Question**: How to handle OAuth callbacks on a static Vercel single-page site?
- **Decision**: Configure OAuth redirect URL to `window.location.origin` (or current page).
  - Supabase client automatically parses URL hash parameters (`#access_token=...`) on initialization and fires `SIGNED_IN` event.
  - The UI removes the hash from the address bar via `history.replaceState` for a clean URL.
- **Confidence**: High

---

## Dependencies Identified
| Package | Version | Delivery | Purpose |
|---------|---------|----------|---------|
| `@supabase/supabase-js` | `^2.48.0` | CDN (`cdn.jsdelivr.net`) | Supabase client auth SDK |

---

## Patterns to Follow
1. **Glassmorphic Cybernetic Modal Design**: Match AyoSim Phase 5 loading modal styling with backdrop blur (`backdrop-filter: blur(16px)`), crisp dark borders (`rgba(255, 255, 255, 0.1)`), and primary blue accents.
2. **Accessible Dialog Controls**: `role="dialog"`, `aria-modal="true"`, focus trap, and Escape key listeners.
3. **Trilingual Data Attributes**: Use existing `data-i18n` conventions across all modal forms, labels, error spans, and profile buttons.
4. **Persistent Session Management**: Leverage Supabase's automatic token storage in `localStorage` and `onAuthStateChange` listeners.

---

## Anti-Patterns to Avoid
1. ❌ **Do not expose service-role secret keys**: Only use the public client `anon_key`.
2. ❌ **Do not hard-fail UI when keys are missing**: Fall back gracefully to Demo Mode with informative console notices.
3. ❌ **Do not break RTL layout**: Ensure input direction, close buttons, and dropdown alignments adapt properly when `dir="rtl"` is active on Arabic language mode.

---

## Recommendations for Planning
1. **Wave 1 (Foundation)**: Establish `js/supabase-config.js` and `js/auth.js` with session management and mock fallback.
2. **Wave 2 (UI & Theming)**: Implement modal markup in `index.html` and styling in `css/auth.css` matching dark/light themes.
3. **Wave 3 (Integration & i18n)**: Connect event listeners in `main.js`, update `en.json`, `fr.json`, `ar.json`, and run empirical tests.
