const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { generateToken, generateRefreshToken, authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.post('/login', async (req, res, next) => {
  try {
    const { email, password, tenantId } = req.body;

    if (!email || !password || !tenantId) {
      return res.status(400).json({ error: 'Email, password, and tenantId are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    });

    if (!user || user.tenantId !== tenantId) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const accessToken = generateToken(user.id, user.tenantId);
    const refreshToken = generateRefreshToken(user.id, user.tenantId);

    // Store mobile token if provided (for mobile app identification)
    if (req.body.deviceId) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          mobileToken: refreshToken,
          lastMobileSync: new Date(),
        },
      });
    }

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenantName: user.tenant.name,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const decoded = require('jsonwebtoken').verify(
      refreshToken,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const newAccessToken = generateToken(user.id, user.tenantId);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

router.post('/logout', authMiddleware, async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { mobileToken: null },
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
