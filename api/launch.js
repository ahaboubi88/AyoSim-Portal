/**
 * Vercel Serverless Function: POST /api/launch
 * Mints a short-lived (90s) ECDSA P-256 signed launch ticket for AyoSim simulators.
 * Stateless, zero-DB-storage, zero external dependencies.
 */

const { webcrypto } = require('node:crypto');

const ALLOWED_BOARDS = new Set(['arduino', 'esp32', 'rpi']);
const PROJECT_ID_RE = /^[a-zA-Z0-9_-]{4,64}$/;
const TICKET_TTL_SECONDS = 90;

const cachedKeys = new Map();

function toBase64Url(input) {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : Buffer.from(input);
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function importSigningKey(jwkInput) {
  const jwkStr = typeof jwkInput === 'string' ? jwkInput : JSON.stringify(jwkInput);
  if (cachedKeys.has(jwkStr)) return cachedKeys.get(jwkStr);

  const jwk = JSON.parse(jwkStr);
  const key = await webcrypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );
  cachedKeys.set(jwkStr, key);
  return key;
}

async function signLaunchTicket(board, projectId, privateKeyJwk) {
  if (!ALLOWED_BOARDS.has(board)) {
    throw new Error('Invalid simulator board');
  }
  const cleanProject =
    typeof projectId === 'string' && PROJECT_ID_RE.test(projectId.trim())
      ? projectId.trim()
      : null;

  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + TICKET_TTL_SECONDS;
  const nonceBytes = new Uint8Array(8);
  webcrypto.getRandomValues(nonceBytes);
  const jti = toBase64Url(nonceBytes);

  const payload = {
    board,
    project: cleanProject,
    iat,
    exp,
    jti
  };

  const payloadB64 = toBase64Url(JSON.stringify(payload));
  const key = await importSigningKey(privateKeyJwk);
  const signature = await webcrypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    new TextEncoder().encode(payloadB64)
  );

  return {
    ticket: `${payloadB64}.${toBase64Url(new Uint8Array(signature))}`,
    exp,
    board
  };
}

function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return Promise.resolve(req.body);
  }
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 4096) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  const privateKeyEnv = process.env.LAUNCH_PRIVATE_KEY;
  if (!privateKeyEnv) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'LAUNCH_PRIVATE_KEY is not configured' }));
  }

  try {
    const body = await readJsonBody(req);
    const board = typeof body.board === 'string' ? body.board.trim().toLowerCase() : '';
    const project = typeof body.project === 'string' ? body.project.trim() : null;

    if (!ALLOWED_BOARDS.has(board)) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'Invalid board parameter' }));
    }

    const result = await signLaunchTicket(board, project, privateKeyEnv);
    res.statusCode = 200;
    return res.end(JSON.stringify(result));
  } catch (err) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: err && err.message ? err.message : 'Ticket signing failed' }));
  }
}

handler.signLaunchTicket = signLaunchTicket;
module.exports = handler;
