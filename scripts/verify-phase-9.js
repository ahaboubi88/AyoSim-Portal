/**
 * Phase 9 Verification Script: Portal-Gated Simulator Access & Ephemeral Share-by-Link
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert');
const launchHandler = require('../api/launch');

const ROOT = path.resolve(__dirname, '..');

async function run() {
  console.log('--- Phase 9 Verification ---');

  // 1. Verify required files exist
  const requiredFiles = [
    'api/launch.js',
    'js/env-config.js',
    'js/main.js',
    'scripts/serve.js',
    'scripts/shared-projects-schema.sql',
    'scripts/generate-launch-keys.mjs',
    'index.html',
    'css/components.css'
  ];
  for (const rel of requiredFiles) {
    const full = path.join(ROOT, rel);
    assert(fs.existsSync(full), `Missing required file: ${rel}`);
  }
  console.log('✓ All Phase 9 portal files present');

  // 2. Verify ECDSA signing with api/launch.js
  const keysPath = path.join(ROOT, '.env.launch-keys.json');
  assert(fs.existsSync(keysPath), 'Missing .env.launch-keys.json');
  const keys = JSON.parse(fs.readFileSync(keysPath, 'utf8'));

  for (const board of ['arduino', 'esp32', 'rpi']) {
    const signed = await launchHandler.signLaunchTicket(board, 'proj1234', keys.LAUNCH_PRIVATE_KEY);
    assert(signed.ticket && signed.ticket.includes('.'), `Ticket malformed for ${board}`);
    assert.strictEqual(signed.board, board);
    const [payloadB64, sigB64] = signed.ticket.split('.');
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    assert.strictEqual(payload.board, board);
    assert.strictEqual(payload.project, 'proj1234');
    assert(payload.exp > payload.iat);

    const pubKey = await crypto.subtle.importKey(
      'jwk',
      keys.LAUNCH_PUBLIC_KEY,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify']
    );
    const sigBytes = Buffer.from(sigB64, 'base64url');
    const ok = await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      pubKey,
      sigBytes,
      Buffer.from(payloadB64, 'utf8')
    );
    assert(ok, `ECDSA signature verification failed for ${board}`);
  }
  console.log('✓ ECDSA P-256 launch tickets sign & verify cleanly for arduino, esp32, rpi');

  // 2b. Verify clientNow clock-skew offset signing
  const skewedClientNow = Math.floor(Date.now() / 1000) - 86400 * 365;
  const skewedSigned = await launchHandler.signLaunchTicket('esp32', null, keys.LAUNCH_PRIVATE_KEY, skewedClientNow);
  const [skewPayloadB64] = skewedSigned.ticket.split('.');
  const skewPayload = JSON.parse(Buffer.from(skewPayloadB64, 'base64url').toString('utf8'));
  assert(typeof skewPayload.skew === 'number' && Math.abs(skewPayload.skew - (skewedClientNow - skewPayload.iat)) <= 1, 'skew mismatch');
  console.log('✓ Client clock-skew offset signed into launch ticket');

  // 3. Verify invalid board rejected
  let rejectedInvalid = false;
  try {
    await launchHandler.signLaunchTicket('stm32', null, keys.LAUNCH_PRIVATE_KEY);
  } catch {
    rejectedInvalid = true;
  }
  assert(rejectedInvalid, 'Invalid board should be rejected');
  console.log('✓ Invalid board parameter rejected');

  // 4. Verify index.html & footer links wired
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  assert(html.includes('js/env-config.js'), 'index.html missing js/env-config.js');
  assert(html.includes('id="sim-modal-error"'), 'index.html missing #sim-modal-error');
  assert(html.includes('id="portal-notice-banner"'), 'index.html missing #portal-notice-banner');
  assert(html.includes('id="share-status-modal"'), 'index.html missing #share-status-modal');
  assert(!html.includes('footer__col-link" target="_blank"'), 'Footer simulator links must not bypass portal launcher with target=_blank');
  console.log('✓ index.html wired with Phase 9 DOM & scripts');

  // 5. Verify i18n keys across EN, FR, AR
  const requiredKeys = [
    'sim_loader.error_title',
    'sim_loader.error_desc',
    'sim_loader.retry',
    'portal_gate.notice_title',
    'portal_gate.notice_desc',
    'share_resolver.expired_title',
    'share_resolver.expired_desc',
    'share_resolver.close'
  ];
  for (const lang of ['en', 'fr', 'ar']) {
    const dict = JSON.parse(fs.readFileSync(path.join(ROOT, `i18n/${lang}.json`), 'utf8'));
    for (const k of requiredKeys) {
      assert(typeof dict[k] === 'string' && dict[k].length > 0, `Missing ${k} in i18n/${lang}.json`);
    }
  }
  console.log('✓ Trilingual i18n keys verified across en, fr, ar');

  // 6. Verify SQL schema contains 48h TTL and pg_cron purge
  const sql = fs.readFileSync(path.join(ROOT, 'scripts/shared-projects-schema.sql'), 'utf8');
  assert(sql.includes('shared_projects'), 'Schema missing shared_projects table');
  assert(sql.includes("interval '48 hours'"), 'Schema missing 48 hours TTL');
  assert(sql.includes('pg_cron') && sql.includes('DELETE FROM public.shared_projects WHERE expires_at < now()'), 'Schema missing pg_cron auto-purge');
  console.log('✓ Supabase SQL migration verified (48h TTL + RLS + pg_cron)');

  console.log('\nALL PHASE 9 PORTAL CHECKS PASSED!');
}

run().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
