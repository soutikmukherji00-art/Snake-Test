import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { cwd } from 'node:process';

const PORT = Number(process.env.PORT || 5173);
const HOST = process.env.HOST || '127.0.0.1';
const ROOT = cwd();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

function safePath(urlPath) {
  const clean = normalize(urlPath.replace(/^\/+/, ''));
  const resolved = join(ROOT, clean);
  if (!resolved.startsWith(ROOT)) {
    return null;
  }
  return resolved;
}

function resolveFile(urlPath) {
  const raw = urlPath === '/' ? 'index.html' : urlPath;
  const filePath = safePath(raw);
  if (!filePath || !existsSync(filePath)) {
    return null;
  }

  const info = statSync(filePath);
  if (info.isDirectory()) {
    const indexFile = join(filePath, 'index.html');
    if (existsSync(indexFile)) {
      return indexFile;
    }
    return null;
  }

  return filePath;
}

createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const filePath = resolveFile(url.pathname);

  if (!filePath) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Not found');
    return;
  }

  const ext = extname(filePath).toLowerCase();
  res.statusCode = 200;
  res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
  createReadStream(filePath).pipe(res);
})
  .listen(PORT, HOST, () => {
    console.log(`Dev server running at http://${HOST}:${PORT}`);
  })
  .on('error', (error) => {
    console.error('Failed to start dev server:', error.message);
    process.exit(1);
  });
