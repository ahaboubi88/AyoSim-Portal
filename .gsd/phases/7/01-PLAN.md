---
phase: 7
plan: 1
wave: 1
depends_on: []
gap_closure: false
---

# Plan 7.1: Supabase Client & Auth State Engine

## Objective
Integrate the Supabase JavaScript SDK into AyoSim's static environment and create the core authentication state engine (`js/auth.js` and `js/supabase-config.js`) supporting session persistence, OAuth handlers, email/password workflows, and safe demo mode fallback.

## Context
Load these files for context:
- .gsd/SPEC.md
- .gsd/ROADMAP.md
- .gsd/phases/7/RESEARCH.md
- index.html
- js/main.js

## Tasks

<task type="auto">
  <name>Integrate Supabase SDK & Configuration Module</name>
  <files>
    index.html
    js/supabase-config.js
  </files>
  <action>
    1. Create `js/supabase-config.js`:
       - Define `window.AYOSIM_SUPABASE_CONFIG` with `url` and `anonKey` properties.
       - Provide clear configuration guidance comments for connecting a live Supabase project.
       - Add helper `isConfigured()` returning true only when valid non-placeholder URL and key are provided.
    2. Update `index.html`:
       - Add the Supabase JS SDK CDN script tag `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>` before custom scripts.
       - Link `js/supabase-config.js?v=2.2` before `main.js`.
    
    AVOID: Hardcoding secret keys or breaking if live keys are absent.
    USE: Safe fallback configuration that enables seamless local preview and testing.
  </action>
  <verify>
    powershell -Command "Select-String -Path 'index.html' -Pattern 'supabase-js'; Test-Path 'js/supabase-config.js'"
  </verify>
  <done>
    Supabase SDK script tag is present in `index.html` and `js/supabase-config.js` exists and exports `window.AYOSIM_SUPABASE_CONFIG`.
  </done>
</task>

<task type="auto">
  <name>Implement Core AyoSimAuth Engine</name>
  <files>
    js/auth.js
    index.html
  </files>
  <action>
    1. Create `js/auth.js` implementing the singleton `AyoSimAuth`:
       - `init()`: Initialize Supabase client if configured, or activate Demo Auth Mode if unconfigured.
       - Subscribe to `onAuthStateChange` to track `SIGNED_IN`, `SIGNED_OUT`, `TOKEN_REFRESHED`, `USER_UPDATED`.
       - Expose `signUp({ email, password, fullName })` with error handling.
       - Expose `signInWithPassword({ email, password })`.
       - Expose `signInWithOAuth(provider)` targeting 'google' and 'github'.
       - Expose `signOut()`.
       - Expose `resetPassword(email)`.
       - Expose `getCurrentUser()` and `getSession()`.
       - Dispatch custom DOM events (`ayosim:auth:change`, `ayosim:auth:error`, `ayosim:auth:message`) on `window` for reactive UI updates.
    2. In Demo Auth Mode (when unconfigured):
       - Store simulated user sessions in `localStorage` under `ayosim_demo_user`.
       - Allow full testing of sign-in, sign-up, and sign-out in local/preview environments with clear notification banner.
    3. Include `js/auth.js?v=2.2` in `index.html`.
    
    AVOID: Tight coupling with DOM inside auth.js.
    USE: Event-driven architecture with custom DOM events.
  </action>
  <verify>
    powershell -Command "Test-Path 'js/auth.js'; Select-String -Path 'index.html' -Pattern 'js/auth.js'"
  </verify>
  <done>
    `js/auth.js` exists, exports `window.AyoSimAuth`, is included in `index.html`, and implements all core auth methods.
  </done>
</task>

## Must-Haves
After all tasks complete, verify:
- [ ] Supabase client SDK is imported without throwing syntax or load errors
- [ ] `window.AyoSimAuth` is initialized and exposes all required authentication methods
- [ ] Demo fallback mode enables local simulation when credentials are unset

## Success Criteria
- [ ] All tasks verified passing
- [ ] Must-haves confirmed
- [ ] Clean script inclusion order in `index.html`
