import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createStubRouter } from './routes/stubRouter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const app = express();
const PORT = process.env.PORT || 3001;
const SERVICE = 'auth-service';

app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: SERVICE, port: PORT });
});

const routes = [
  '/api/auth',
  '/api/app',
  '/api/users',
  '/api/roles',
  '/api/profile',
  '/api/managers',
  '/api/branchuser',
  '/api/device-approval',
  '/api/home-approval',
  '/api/deviceupdate',
  '/api/app-version',
];

for (const route of routes) {
  app.use(route, createStubRouter(SERVICE, route));
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`${SERVICE} running on port ${PORT}`);
});
