const http = require('http');
const fs = require('fs');
const path = require('path');
const launchHandler = require('../api/launch');

const PORT = process.env.PORT || 3000;
const ROOT = path.resolve(__dirname, '..');

// Localhost-only development signing key (never trusted on *.ayosim.app).
const LOCAL_DEV_PRIVATE_JWK = {
  key_ops: ['sign'],
  ext: true,
  kty: 'EC',
  x: 'mJL9H4gn1EECtp1Zf5NyDy8AiaB2eG6ZLjQZcie2nvY',
  y: '_lg7ZrlKbLryHKT2ohVH-CTcO22XPum6lIDFsSeZqW4',
  crv: 'P-256',
  d: 'By7tsaFLKiq6faB4vf90eru2BA5FTe1LPTTct-fP4Kc'
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer(async (req, res) => {
  const reqPath = decodeURI((req.url || '/').split('?')[0]);

  // Local Serverless emulation for POST /api/launch
  if (reqPath === '/api/launch') {
    if (!process.env.LAUNCH_PRIVATE_KEY) {
      process.env.LAUNCH_PRIVATE_KEY = JSON.stringify(LOCAL_DEV_PRIVATE_JWK);
    }
    return launchHandler(req, res);
  }

  const normalizedPath = reqPath === '/' ? '/index.html' : reqPath;
  const filePath = path.join(ROOT, normalizedPath);

  // Security: prevent path traversal outside root
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('403 Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404 Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(` AyoSim Local Server Running!`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(` API: POST http://localhost:${PORT}/api/launch (active)`);
  console.log(` Press Ctrl+C to stop.`);
  console.log(`========================================\n`);
});
