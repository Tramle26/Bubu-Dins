#!/usr/bin/env node
/**
 * Serve the scene with a working Nessie proxy — no bundler, no framework.
 *
 *   node src/storyworld/serve.mjs            → http://localhost:5174
 *   NESSIE_API_KEY=... node src/storyworld/serve.mjs
 *
 * Why a proxy at all: so the key never reaches the browser. Requests to
 * /nessie/* are forwarded from Node with the key attached here, which is the
 * same thing /api/bubu/nessie-portfolio does in the Bubu app. This one runs
 * standalone so the scene can be worked on by itself.
 *
 * The key comes from NESSIE_API_KEY in your environment or a private .env —
 * never from a file the browser can load.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 5174);
// capitaloneuse.md names this host, and it serves https — so the mixed-content
// problem the earlier http host had does not arise. The proxy still exists to
// keep the key off the browser, which is the reason that actually matters.
const UPSTREAM = 'https://prod-api.nessieisreal.com';

let KEY = process.env.NESSIE_API_KEY || '';
if (!KEY) {
  // A private .env is the only other place worth looking. Deliberately not
  // bank-scene.config.js: that file is served to the browser.
  try {
    const env = fs.readFileSync(path.join(HERE, '..', '..', '.env'), 'utf8');
    KEY = (env.match(/^\s*NESSIE_API_KEY\s*=\s*(.+)\s*$/m) || [])[1]?.trim() || '';
  } catch { /* no .env — the scene runs on its practice bank */ }
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // ---- proxy ----------------------------------------------------------
  if (url.pathname.startsWith('/nessie')) {
    const target = new URL(url.pathname.replace(/^\/nessie/, '') || '/', UPSTREAM);
    for (const [k, v] of url.searchParams) target.searchParams.set(k, v);
    if (KEY) target.searchParams.set('key', KEY);

    if (!target.searchParams.get('key')) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: 'No Nessie key. Set NESSIE_API_KEY in your environment or .env.' }));
    }

    const chunks = [];
    for await (const c of req) chunks.push(c);

    try {
      const upstream = await fetch(target, {
        method: req.method,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks),
        redirect: 'follow',
      });
      const body = await upstream.text();
      const redacted = target.toString().replace(KEY, '…' + KEY.slice(-4));
      console.log(`  ${upstream.status}  ${req.method} ${redacted}`);
      res.writeHead(upstream.status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      return res.end(body);
    } catch (e) {
      console.log(`  ERR  ${req.method} ${url.pathname} — ${e.message}`);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ message: `Could not reach Nessie: ${e.message}` }));
    }
  }

  // ---- static ---------------------------------------------------------
  let file = url.pathname === '/' ? '/bank-scene.html' : url.pathname;
  const full = path.join(HERE, path.normalize(file).replace(/^(\.\.[/\\])+/, ''));
  if (!full.startsWith(HERE) || !fs.existsSync(full) || fs.statSync(full).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('Not found');
  }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(full)] || 'application/octet-stream' });
  fs.createReadStream(full).pipe(res);
});

server.listen(PORT, () => {
  console.log(`\n  Bubu at the Bank   http://localhost:${PORT}`);
  console.log(
    KEY
      ? `  Nessie             live, key …${KEY.slice(-4)} (added by the proxy, never sent to the browser)\n`
      : `  Nessie             no key — the scene will run on its practice bank\n`
  );
});
