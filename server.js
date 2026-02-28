const http = require('http');
const fs = require('fs/promises');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_FILE = path.join(__dirname, 'data', 'layout.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg'
};

async function readLayout() {
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

async function writeLayout(layout) {
  await fs.writeFile(DATA_FILE, JSON.stringify(layout, null, 2));
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': MIME_TYPES['.json'] });
  res.end(JSON.stringify(payload));
}

async function serveFile(res, filePath) {
  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, {
      'Content-Type': MIME_TYPES[ext] || 'application/octet-stream'
    });
    res.end(data);
  } catch {
    sendJson(res, 404, { error: 'Not found' });
  }
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });

    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        resolve(parsed);
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });

    req.on('error', reject);
  });
}

function validateLayout(layout) {
  if (!layout || typeof layout !== 'object') {
    return 'Layout must be an object.';
  }

  if (!Array.isArray(layout.elements)) {
    return 'Layout.elements must be an array.';
  }

  if (!layout.global || typeof layout.global !== 'object') {
    return 'Layout.global must be an object.';
  }

  return null;
}

function sanitizeStaticPath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const resolved = path.normalize(path.join(PUBLIC_DIR, decoded));
  if (!resolved.startsWith(PUBLIC_DIR)) {
    return null;
  }
  return resolved;
}

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  if (method === 'GET' && url === '/api/layout') {
    const layout = await readLayout();
    return sendJson(res, 200, layout);
  }

  if (method === 'POST' && url === '/api/layout') {
    try {
      const candidate = await parseBody(req);
      const error = validateLayout(candidate);
      if (error) {
        return sendJson(res, 400, { error });
      }

      await writeLayout(candidate);
      return sendJson(res, 200, { message: 'Layout saved.' });
    } catch (error) {
      return sendJson(res, 400, { error: error.message });
    }
  }

  if (method === 'GET' && (url === '/' || url.startsWith('/?'))) {
    return serveFile(res, path.join(PUBLIC_DIR, 'index.html'));
  }

  if (method === 'GET' && (url === '/admin' || url.startsWith('/admin?'))) {
    return serveFile(res, path.join(PUBLIC_DIR, 'admin.html'));
  }

  if (method === 'GET') {
    const cleanPath = sanitizeStaticPath(url);
    if (!cleanPath) {
      return sendJson(res, 400, { error: 'Invalid path.' });
    }

    return serveFile(res, cleanPath);
  }

  return sendJson(res, 405, { error: 'Method not allowed' });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

module.exports = { server, validateLayout };
