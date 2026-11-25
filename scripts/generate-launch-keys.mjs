#!/usr/bin/env node
/**
 * Generates an ECDSA P-256 (ES256) keypair for AyoSim Portal launch tickets.
 * Usage: node scripts/generate-launch-keys.mjs
 *
 * - Add LAUNCH_PRIVATE_KEY to Vercel Environment Variables (Preview & Production).
 * - Embed LAUNCH_PUBLIC_KEY in each simulator's src/portalGate.ts.
 * - Never commit .env.launch-keys.json to Git.
 */

import fs from 'node:fs';
import path from 'node:path';
import { webcrypto } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const kp = await webcrypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  );

  const privateJwk = await webcrypto.subtle.exportKey('jwk', kp.privateKey);
  const publicJwk = await webcrypto.subtle.exportKey('jwk', kp.publicKey);

  const outFile = path.resolve(__dirname, '..', '.env.launch-keys.json');
  const data = {
    generatedAt: new Date().toISOString(),
    LAUNCH_PRIVATE_KEY: JSON.stringify(privateJwk),
    LAUNCH_PUBLIC_KEY: publicJwk
  };

  fs.writeFileSync(outFile, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log('Generated ECDSA P-256 keypair -> .env.launch-keys.json (gitignored)');
  console.log('PUBLIC_JWK=' + JSON.stringify(publicJwk));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
