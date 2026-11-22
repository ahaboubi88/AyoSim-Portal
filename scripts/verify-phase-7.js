const fs = require('fs');
const assert = require('assert');

console.log('--- 1. Verifying HTML Structure ---');
const html = fs.readFileSync('index.html', 'utf8');
const requiredIds = [
  'header-auth', 'auth-sign-in-btn', 'user-menu', 'user-menu-btn', 'user-menu-avatar', 'user-menu-name', 'user-menu-email', 'auth-sign-out-btn',
  'auth-modal', 'auth-modal-backdrop', 'auth-modal-close', 'auth-tab-signin', 'auth-tab-signup', 'auth-alert', 'auth-demo-badge',
  'auth-form', 'auth-field-name', 'auth-input-name', 'auth-input-email', 'auth-input-password', 'auth-submit-btn', 'auth-forgot-password-link',
  'auth-reset-form', 'auth-reset-email', 'auth-reset-submit-btn', 'auth-back-to-login', 'auth-google-btn', 'auth-github-btn'
];
for (const id of requiredIds) {
  assert(html.includes('id="' + id + '"'), 'Missing element ID in index.html: ' + id);
}
console.log('✓ All 28 required DOM IDs found in index.html');

console.log('--- 2. Verifying Assets & Includes ---');
assert(html.includes('css/auth.css'), 'Missing css/auth.css link in index.html');
assert(html.includes('supabase-js@2'), 'Missing supabase-js CDN in index.html');
assert(html.includes('js/supabase-config.js'), 'Missing js/supabase-config.js script in index.html');
assert(html.includes('js/auth.js'), 'Missing js/auth.js script in index.html');
assert(html.includes('js/main.js'), 'Missing js/main.js script in index.html');
console.log('✓ All 5 scripts & stylesheets correctly linked');

console.log('--- 3. Verifying i18n Localization ---');
const en = JSON.parse(fs.readFileSync('i18n/en.json', 'utf8'));
const fr = JSON.parse(fs.readFileSync('i18n/fr.json', 'utf8'));
const ar = JSON.parse(fs.readFileSync('i18n/ar.json', 'utf8'));
const authKeys = [
  'auth.signIn', 'auth.signUp', 'auth.signOut', 'auth.email', 'auth.password',
  'auth.fullName', 'auth.forgotPassword', 'auth.backToSignIn', 'auth.sendResetLink',
  'auth.resetInstruction', 'auth.orContinueWith', 'auth.google', 'auth.github',
  'auth.demoBadge', 'auth.freePlan', 'auth.termsHint'
];
for (const k of authKeys) {
  assert(en[k], 'Missing EN key: ' + k);
  assert(fr[k], 'Missing FR key: ' + k);
  assert(ar[k], 'Missing AR key: ' + k);
}
console.log('✓ All 16 auth keys fully translated in EN, FR, and AR');

console.log('--- 4. Testing Core Auth Engine in Simulation ---');
const vm = require('vm');
const events = [];
const storage = {};

const fakeWindow = {
  dispatchEvent: (evt) => events.push(evt),
  localStorage: {
    getItem: (k) => storage[k] || null,
    setItem: (k, v) => { storage[k] = String(v); },
    removeItem: (k) => { delete storage[k]; }
  },
  CustomEvent: function(type, opts) {
    this.type = type;
    this.detail = opts ? opts.detail : {};
  },
  console: console
};
fakeWindow.window = fakeWindow;

const ctx = vm.createContext(fakeWindow);
vm.runInContext(fs.readFileSync('js/supabase-config.js', 'utf8'), ctx);
assert(ctx.window.AYOSIM_SUPABASE_CONFIG, 'AYOSIM_SUPABASE_CONFIG not found');
assert.strictEqual(ctx.window.AYOSIM_SUPABASE_CONFIG.isConfigured(), false, 'Default config should report isConfigured = false');

vm.runInContext(fs.readFileSync('js/auth.js', 'utf8'), ctx);
assert(ctx.window.AyoSimAuth, 'AyoSimAuth not found on window');

async function testAuthEngine() {
  await ctx.window.AyoSimAuth.init();
  assert.strictEqual(ctx.window.AyoSimAuth.isDemoMode(), true, 'Expected Demo Mode');
  assert.strictEqual(ctx.window.AyoSimAuth.getCurrentUser(), null, 'Expected no user initially');

  // Test Sign Up
  await ctx.window.AyoSimAuth.signUp('test@ayosim.dev', 'secret123', 'Test Pilot');
  assert(ctx.window.AyoSimAuth.getCurrentUser(), 'User should exist after signUp');
  assert.strictEqual(ctx.window.AyoSimAuth.getCurrentUser().email, 'test@ayosim.dev');
  assert.strictEqual(ctx.window.AyoSimAuth.getCurrentUser().user_metadata.full_name, 'Test Pilot');

  // Test Sign Out
  await ctx.window.AyoSimAuth.signOut();
  assert.strictEqual(ctx.window.AyoSimAuth.getCurrentUser(), null, 'User should be null after signOut');

  // Test Google OAuth simulation
  await ctx.window.AyoSimAuth.signInWithOAuth('google');
  assert(ctx.window.AyoSimAuth.getCurrentUser(), 'User should exist after Google OAuth');
  assert.strictEqual(ctx.window.AyoSimAuth.getCurrentUser().email, 'explorer@gmail.com');

  // Test Sign Out again
  await ctx.window.AyoSimAuth.signOut();
  assert.strictEqual(ctx.window.AyoSimAuth.getCurrentUser(), null);

  // Test Sign In with Password
  await ctx.window.AyoSimAuth.signInWithPassword('ada@lovelace.com', 'analyticalEngine');
  assert(ctx.window.AyoSimAuth.getCurrentUser(), 'User should exist after password sign in');
  assert.strictEqual(ctx.window.AyoSimAuth.getCurrentUser().email, 'ada@lovelace.com');

  console.log('✓ AyoSimAuth simulation passed: init, signUp, signIn, OAuth, and signOut verified!');
}

testAuthEngine().then(() => {
  console.log('=== ALL PHASE 7 EMPIRICAL TESTS PASSED ===');
}).catch(err => {
  console.error(err);
  process.exit(1);
});
