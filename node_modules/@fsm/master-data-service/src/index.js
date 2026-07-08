import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createStubRouter } from './routes/stubRouter.js';
import contactRoutes from './routes/contact.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app = express();
const PORT = process.env.PORT || 3002;
const SERVICE = 'master-data-service';

app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: SERVICE, port: PORT });
});

const routes = [
  '/api/branches',
  '/api/companies',
  '/api/customers',
  '/api/products',
  '/api/packages',
  '/api/sources',
  '/api/customer-statuses',
];

for (const route of routes) {
  app.use(route, createStubRouter(SERVICE, route));
}

app.use('/api/contacts', contactRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`${SERVICE} running on port ${PORT}`);
});
