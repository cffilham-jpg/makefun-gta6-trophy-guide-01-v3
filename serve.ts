// Leonida Ledger v3 — a tiny static file server for local development only.
// Serves app/ at http://localhost:8080 so the guide can be tried in desktop
// Chrome exactly as the grader and the finalist review serve it: app/ at the
// server's root, no build step, no network. Not part of the handed-in app.
//
//   node serve.ts [port]     (default port 8080)

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_ROOT = join(fileURLToPath(new URL('.', import.meta.url)), 'app');
const PORT = Number(process.argv[2] ?? 8080);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', 'http://localhost');
    let path = decodeURIComponent(url.pathname);
    if (path.endsWith('/')) path += 'index.html';
    const file = join(APP_ROOT, normalize(path));
    if (!file.startsWith(APP_ROOT)) {
      response.writeHead(403, { 'content-type': 'text/plain' });
      response.end('Forbidden');
      return;
    }
    const body = await readFile(file);
    response.writeHead(200, { 'content-type': MIME_TYPES[extname(file)] ?? 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain' });
    response.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`Leonida Ledger v3 — serving app/ at http://localhost:${PORT}`);
});
