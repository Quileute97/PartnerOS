import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authRouter } from './routes/auth';
import { organizationRouter } from './routes/organization';
import { trackRouter } from './routes/track';
import { crmRouter } from './routes/crm';
import { affiliateRouter } from './routes/affiliate';
import { financeRouter } from './routes/finance';

const app = new Hono();

// Global middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'x-organization-id', 'x-partner-id', 'x-user-id']
}));

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'PartnerOS Central API',
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount modules
app.route('/api/v1/auth', authRouter);
app.route('/api/v1/organizations', organizationRouter);
app.route('/api/v1/track', trackRouter);
app.route('/api/v1/crm', crmRouter);
app.route('/api/v1/affiliate', affiliateRouter);
app.route('/api/v1/finance', financeRouter);

export default app;
