---
phase: 7
plan: 3
wave: 3
depends_on: ["01", "02"]
gap_closure: false
---

# Plan 7.3: Auth Interaction Flows, Localization & Verification

## Objective
Wire up the complete user authentication lifecycle in `js/main.js` and `js/auth.js` (opening/closing modals, tab transitions, form submissions, social OAuth redirects, session persistence), translate all auth strings across English, French, and Arabic with RTL support, and empirically verify the entire system.

## Context
Load these files for context:
- .gsd/phases/7/01-PLAN.md
- .gsd/phases/7/02-PLAN.md
- js/main.js
- js/auth.js
- i18n/en.json
- i18n/fr.json
- i18n/ar.json
- css/auth.css

## Tasks

<task type="auto">
  <name>Connect Interactive Auth Handlers & Event Controller</name>
  <files>
    js/auth.js
    js/main.js
  </files>
  <action>
    1. In `js/main.js`:
       - Initialize `AyoSimAuth.init()` on DOMContentLoaded.
       - Modal controls:
         - Open modal when clicking `#auth-sign-in-btn`.
         - Close modal when clicking `#auth-modal-close`, clicking the backdrop, or pressing the `Escape` key.
         - Trap tab focus inside the modal when open.
       - View & tab switching:
         - Toggle between "Sign In" tab and "Sign Up" tab, updating headings, submit button text, and showing/hiding name input.
         - Toggle "Forgot Password" view to request password recovery email, and "Back to Sign In" link.
       - Form submission:
         - Handle `#auth-form` submit: validate email/password format, trigger `AyoSimAuth.signInWithPassword` or `signUp`.
         - Display loading spinner / disabled state on submit button during requests.
         - Handle `#auth-reset-form` submit: call `AyoSimAuth.resetPassword(email)`.
       - Social OAuth triggers:
         - Handle `#auth-google-btn` -> `AyoSimAuth.signInWithOAuth('google')`.
         - Handle `#auth-github-btn` -> `AyoSimAuth.signInWithOAuth('github')`.
       - Profile menu & Sign Out:
         - Toggle user menu dropdown on clicking `#user-menu-btn`. Close on outside click.
         - Handle `#auth-sign-out-btn` -> `AyoSimAuth.signOut()`.
       - Reactive State Updates:
         - Listen to `ayosim:auth:change`: update header UI (show/hide Sign In vs User Profile, set avatar initials/image and email).
         - Listen to `ayosim:auth:error`: render user-friendly alert message inside the modal.
         - Listen to `ayosim:auth:message`: render informative confirmation notice (e.g. "Confirmation link sent to your email!").
    
    AVOID: Page reload on form submissions.
    USE: Prevent default form submission and handle asynchronously.
  </action>
  <verify>
    powershell -Command "Select-String -Path 'js/main.js' -Pattern 'AyoSimAuth'; Select-String -Path 'js/main.js' -Pattern 'auth-modal'"
  </verify>
  <done>
    All authentication user interactions (modal open/close, tab switching, form submit, OAuth, profile dropdown, sign-out) are fully wired.
  </done>
</task>

<task type="auto">
  <name>Add Trilingual Auth Localization & RTL Layout</name>
  <files>
    i18n/en.json
    i18n/fr.json
    i18n/ar.json
    css/auth.css
  </files>
  <action>
    1. Add comprehensive `auth` localization namespace to `i18n/en.json`, `i18n/fr.json`, and `i18n/ar.json`:
       - `signIn`, `signUp`, `signOut`, `email`, `password`, `fullName`, `forgotPassword`, `backToSignIn`
       - `orContinueWith`, `google`, `github`, `resetPassword`, `sendResetLink`
       - `invalidCredentials`, `emailAlreadyInUse`, `weakPassword`, `resetEmailSent`, `welcomeBack`, `accountCreated`
       - `demoNotice`, `profile`, `myAccount`
    2. In `css/auth.css`:
       - Add RTL support rules for `[dir="rtl"]`:
         - Align modal close button correctly to the left in RTL.
         - Mirror input padding, text alignment, and dropdown positioning.
         - Mirror social button icons and label order for natural Arabic flow.
    3. Ensure existing `i18n` update loop translates dynamic auth modal text and alerts.
    
    AVOID: Untranslated keys or layout misalignment in Arabic mode.
    USE: Native CSS logical properties (`margin-inline`, `padding-inline`) and `[dir="rtl"]` overrides.
  </action>
  <verify>
    powershell -Command "node -e 'const en = require(\"./i18n/en.json\"); const fr = require(\"./i18n/fr.json\"); const ar = require(\"./i18n/ar.json\"); if (!en.auth || !fr.auth || !ar.auth) { process.exit(1); } console.log(\"Auth i18n keys present in all 3 languages\");'"
  </verify>
  <done>
    `en.json`, `fr.json`, and `ar.json` have complete matching `auth` dictionaries, and `css/auth.css` handles RTL layout seamlessly.
  </done>
</task>

<task type="auto">
  <name>Empirical Validation & End-to-End Verification</name>
  <files>
    index.html
    js/auth.js
    js/supabase-config.js
    css/auth.css
  </files>
  <action>
    1. Verify all asset references and script tags in `index.html` (`supabase-js`, `supabase-config.js`, `auth.js`, `auth.css`) have cache-busting version strings (`?v=2.2`).
    2. Execute an automated headless validation check that verifies:
       - Modal DOM nodes and accessibility attributes (`role="dialog"`, `aria-modal="true"`).
       - Header auth container and user dropdown elements.
       - Supabase config structure and Demo Mode initialization.
       - Auth state event dispatch and reception.
       - Trilingual dictionary coverage across all 3 languages.
    3. Capture and record empirical output in execution logs.
  </action>
  <verify>
    powershell -Command "node -e 'const fs = require(\"fs\"); const html = fs.readFileSync(\"index.html\", \"utf8\"); [\"auth-modal\", \"header-auth\", \"auth-sign-in-btn\", \"supabase-config.js\", \"auth.js\", \"auth.css\"].forEach(id => { if (!html.includes(id)) { console.error(\"Missing: \" + id); process.exit(1); } }); console.log(\"All Phase 7 DOM elements and scripts verified in index.html\");'"
  </verify>
  <done>
    Empirical validation confirms 100% of DOM nodes, scripts, stylesheets, and localization keys are present and correctly integrated.
  </done>
</task>

## Must-Haves
After all tasks complete, verify:
- [ ] Users can open the auth modal, toggle between Sign In, Sign Up, and Forgot Password
- [ ] Form submission dispatches authentication requests with clean error and success feedback
- [ ] Header displays "Sign In" button when logged out and User Profile avatar/dropdown when logged in
- [ ] English, French, and Arabic translations render accurately with RTL layout support
- [ ] Demo fallback mode ensures the portal remains 100% interactive and functional even before live API credentials are supplied

## Success Criteria
- [ ] All tasks verified passing
- [ ] Must-haves confirmed
- [ ] Zero console errors or layout breaks across light/dark themes and mobile viewports
