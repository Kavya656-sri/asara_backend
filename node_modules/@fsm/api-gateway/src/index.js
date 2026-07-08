import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { serviceRoutes } from './config/services.js';
import { verifyToken } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
app.use(express.json());

app.get('/api', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway', timestamp: new Date().toISOString() });
});

app.get('/health', async (req, res) => {
  res.json({ status: 'healthy', service: 'api-gateway' });
});

// Register proxy routes for each microservice
for (const route of serviceRoutes) {
  const proxyOptions = {
    target: route.target,
    changeOrigin: true,
    pathRewrite: route.pathRewrite || {},
    on: {
      proxyReq: (proxyReq, req) => {
        if (req.user) {
          proxyReq.setHeader('X-User-Id', req.user.id);
          proxyReq.setHeader('X-Role-Id', req.user.role_id);
        }
      },
    },
  };

  const middlewares = [];
  if (route.requiresAuth) {
    middlewares.push(verifyToken);
  }
  middlewares.push(createProxyMiddleware(proxyOptions));

  app.use(route.path, ...middlewares);
}

// Monolith fallback during migration (remove after full migration)
if (process.env.MONOLITH_FALLBACK_URL) {
  app.use('/api', createProxyMiddleware({
    target: process.env.MONOLITH_FALLBACK_URL,
    changeOrigin: true,
  }));
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
