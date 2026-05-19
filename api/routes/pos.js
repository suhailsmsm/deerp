const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get products for mobile POS
router.get('/products', async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { nameAr: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search } },
      ];
    }

    if (category) {
      where.category = category;
    }

    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        barcode: true,
        name: true,
        nameAr: true,
        category: true,
        price: true,
        cost: true,
        stock: true,
        image: true,
        isFnb: true,
      },
      take: 100,
    });

    res.json(products);
  } catch (error) {
    next(error);
  }
});

// Get single product by barcode
router.get('/products/:barcode', async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { barcode: req.params.barcode },
      select: {
        id: true,
        barcode: true,
        name: true,
        nameAr: true,
        category: true,
        price: true,
        cost: true,
        stock: true,
        image: true,
        isFnb: true,
        modifiers: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
});

// Calculate tax (UAE VAT 5%)
router.post('/calculate-tax', async (req, res, next) => {
  try {
    const { subtotal } = req.body;

    if (typeof subtotal !== 'number' || subtotal < 0) {
      return res.status(400).json({ error: 'Valid subtotal is required' });
    }

    const vatRate = 0.05; // UAE standard VAT rate
    const vat = Math.round(subtotal * vatRate * 100) / 100;
    const total = subtotal + vat;

    res.json({
      subtotal,
      vat,
      total,
      vatRate: vatRate * 100,
    });
  } catch (error) {
    next(error);
  }
});

// Create transaction
router.post('/transactions', async (req, res, next) => {
  try {
    const { items, subtotal, vat, total, discount = 0, method, branchId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Items are required' });
    }

    if (!subtotal || !total || !method) {
      return res.status(400).json({ error: 'Subtotal, total, and payment method are required' });
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        subtotal,
        vat: vat || 0,
        total,
        discount,
        method,
        items: JSON.stringify(items),
        branchId: branchId ? parseInt(branchId) : null,
        staffId: null, // Mobile doesn't have staff assignment
        synced: false,
      },
    });

    // Update product stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    res.status(201).json({
      id: transaction.id,
      ...transaction,
      items: JSON.parse(transaction.items),
    });
  } catch (error) {
    next(error);
  }
});

// Get transactions
router.get('/transactions', async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, method } = req.query;

    const where = {};
    if (method) {
      where.method = method;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      select: {
        id: true,
        subtotal: true,
        vat: true,
        total: true,
        discount: true,
        method: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.transaction.count({ where });

    res.json({
      data: transactions,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    next(error);
  }
});

// Get receipt by ID
router.get('/receipts/:id', async (req, res, next) => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    res.json({
      id: transaction.id,
      subtotal: transaction.subtotal,
      vat: transaction.vat,
      total: transaction.total,
      discount: transaction.discount,
      method: transaction.method,
      items: JSON.parse(transaction.items),
      createdAt: transaction.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
