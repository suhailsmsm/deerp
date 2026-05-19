const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get user profile
router.get('/profile', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { tenant: { select: { id: true, name: true, plan: true } } },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
        tenant: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (email && email !== req.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({ error: 'Email already in use' });
      }
    }

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        ...(email && { email }),
      },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
      },
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Get mobile app settings
router.get('/mobile', async (req, res, next) => {
  try {
    const settings = {
      language: 'en', // en, ar
      theme: 'light', // light, dark
      currency: 'AED',
      vatRate: 5,
      receiptFormat: 'standard', // standard, detailed
      printReceipt: true,
      emailReceipt: false,
      soundEnabled: true,
      vibrateEnabled: true,
      defaultPaymentMethod: 'cash',
      autoSaveInterval: 30000, // milliseconds
    };

    res.json(settings);
  } catch (error) {
    next(error);
  }
});

// Update mobile app settings
router.put('/mobile', async (req, res, next) => {
  try {
    const { language, theme, currency, vatRate, receiptFormat, printReceipt, emailReceipt, soundEnabled, vibrateEnabled, defaultPaymentMethod } = req.body;

    const settings = {
      language: language || 'en',
      theme: theme || 'light',
      currency: currency || 'AED',
      vatRate: vatRate !== undefined ? vatRate : 5,
      receiptFormat: receiptFormat || 'standard',
      printReceipt: printReceipt !== undefined ? printReceipt : true,
      emailReceipt: emailReceipt !== undefined ? emailReceipt : false,
      soundEnabled: soundEnabled !== undefined ? soundEnabled : true,
      vibrateEnabled: vibrateEnabled !== undefined ? vibrateEnabled : true,
      defaultPaymentMethod: defaultPaymentMethod || 'cash',
    };

    // In a real app, store settings in database
    // For now, return validated settings
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
