import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API is running', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

export default router;
