const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

const requireIntegrationApiKey = (req, res, next) => {
  const raw = req.headers.authorization || '';
  const token = raw.startsWith('Bearer ') ? raw.slice(7) : '';
  const expected = process.env.SOCIAL_SYNC_API_KEY;

  if (!expected) {
    return res.status(500).json({ error: 'SOCIAL_SYNC_API_KEY is not configured on server' });
  }

  if (!token || token !== expected) {
    return res.status(401).json({ error: 'Unauthorized: invalid integration API key' });
  }

  next();
};

// Hosted endpoint for ERP sync clients
router.get('/social-apps', requireIntegrationApiKey, async (req, res, next) => {
  try {
    const apps = await prisma.socialProviderApp.findMany({
      where: { isActive: true },
      orderBy: { platform: 'asc' },
    });

    res.json({
      apps: apps.map((a) => ({
        platform: a.platform,
        clientId: a.clientId,
        clientSecret: a.clientSecret,
        redirectUri: a.redirectUri,
        isActive: a.isActive,
      })),
      count: apps.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
