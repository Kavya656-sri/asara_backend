import { Router } from 'express';

export const createStubRouter = (service, basePath) => {
  const router = Router();

  router.all('*', (req, res) => {
    res.status(501).json({
      success: false,
      service,
      message: 'Route not migrated yet',
      path: `${basePath}${req.path === '/' ? '' : req.path}`,
      method: req.method,
    });
  });

  return router;
};
