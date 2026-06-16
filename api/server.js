const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const posRoutes = require('./routes/pos');
const crmRoutes = require('./routes/crm');
const settingsRoutes = require('./routes/settings');
const socialRoutes = require('./routes/social');
const integrationRoutes = require('./routes/integration');
const { authMiddleware } = require('./middleware/auth');

const app = express();
const API_PORT = process.env.API_PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5174', 'http://localhost:8081', 'http://localhost:8090', 'http://localhost:8091'],
  credentials: true,
}));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/integration', integrationRoutes);

// Protected routes
app.use('/api/pos', authMiddleware, posRoutes);
app.use('/api/crm', authMiddleware, crmRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const startServer = (port = API_PORT) => {
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`✅ API Server running on http://localhost:${port}`);
      resolve(server);
    });
  });
};

module.exports = { app, startServer, API_PORT, JWT_SECRET };
