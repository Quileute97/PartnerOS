import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Context } from 'hono';
import { SPA_ASSETS } from './spa-static';
import { authRouter } from './routes/auth';
import { organizationRouter } from './routes/organization';
import { trackRouter } from './routes/track';
import { crmRouter } from './routes/crm';
import { affiliateRouter } from './routes/affiliate';
import { financeRouter } from './routes/finance';
import { customizationRouter } from './routes/customization';
import { riskRouter } from './routes/risk';
import { integrationsRouter } from './routes/integrations';

const app = new Hono();

// Global middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'x-organization-id', 'x-partner-id', 'x-user-id', 'x-entity-id']
}));

// Health check (JSON) — separate from the SPA root
app.get('/health', (c) => {
  return c.json({
    name: 'PartnerOS Central API',
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// --- Static assets for the PartnerOS website SPA ---
const MIME: Record<string, string> = {
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function serveStatic(c: Context, path: string) {
  const content = SPA_ASSETS[path as keyof typeof SPA_ASSETS];
  if (content === undefined) {
    return new Response('Not found', { status: 404 });
  }
  const ext = path.substring(path.lastIndexOf('.')).toLowerCase();
  return c.body(content, 200, { 'Content-Type': MIME[ext] ?? 'application/octet-stream' });
}

app.get('/assets/:path*', (c) => {
  const p = c.req.param('path*');
  return serveStatic(c, `/assets/${p}`);
});

app.get('/vite.svg', (c) => {
  return serveStatic(c, '/vite.svg');
});

// --- Root: serve the PartnerOS website SPA (or API health if JSON requested) ---
app.get('/', (c) => {
  const accept = c.req.header('accept') || '';
  if (accept.includes('application/json') && !accept.includes('text/html')) {
    return c.json({
      name: 'PartnerOS Central API',
      status: 'healthy',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  }
  const html = SPA_ASSETS['/index.html'];
  if (html === undefined) {
    return c.text('Website build not found', 500);
  }
  return c.html(html);
});

// Mount modules
app.route('/api/v1/auth', authRouter);
app.route('/api/v1/organizations', organizationRouter);
app.route('/api/v1/track', trackRouter);
app.route('/api/v1/crm', crmRouter);
app.route('/api/v1/affiliate', affiliateRouter);
app.route('/api/v1/finance', financeRouter);
app.route('/api/v1/customization', customizationRouter);
app.route('/api/v1/risk', riskRouter);
app.route('/api/v1/integrations', integrationsRouter);

// SPA fallback: serve index.html for any other GET path (React Router / hash nav)
app.get('*', (c) => {
  const html = SPA_ASSETS['/index.html'];
  if (html === undefined) {
    return c.text('Website build not found', 500);
  }
  return c.html(html);
});

export default app;
