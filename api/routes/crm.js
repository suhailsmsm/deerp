const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get all customers
router.get('/customers', async (req, res, next) => {
  try {
    const { search, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { name: 'asc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.customer.count({ where });

    res.json({
      data: customers,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    next(error);
  }
});

// Get customer by ID
router.get('/customers/:id', async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    next(error);
  }
});

// Create customer
router.post('/customers', async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    // Check if customer with same phone already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { phone },
    });

    if (existingCustomer) {
      return res.status(409).json({ error: 'Customer with this phone already exists' });
    }

    const customer = await prisma.customer.create({
      data: { name, phone },
    });

    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
});

// Update customer
router.put('/customers/:id', async (req, res, next) => {
  try {
    const { name, phone, loyalty } = req.body;

    const customer = await prisma.customer.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(typeof loyalty === 'number' && { loyalty }),
      },
    });

    res.json(customer);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Customer not found' });
    }
    next(error);
  }
});

// Create order (using Transaction model for now)
router.post('/orders', async (req, res, next) => {
  try {
    const { customerId, items, subtotal, vat, total, discount = 0, method } = req.body;

    if (!customerId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Customer and items are required' });
    }

    if (!subtotal || !total || !method) {
      return res.status(400).json({ error: 'Subtotal, total, and payment method are required' });
    }

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Create transaction as order
    const order = await prisma.transaction.create({
      data: {
        subtotal,
        vat: vat || 0,
        total,
        discount,
        method,
        items: JSON.stringify({ customerId, ...items }),
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
      id: order.id,
      customerId,
      ...order,
      items: JSON.parse(order.items),
    });
  } catch (error) {
    next(error);
  }
});

// Get customer orders (transactions with customer data)
router.get('/customers/:id/orders', async (req, res, next) => {
  try {
    const customerId = parseInt(req.params.id);
    const { limit = 20, offset = 0 } = req.query;

    // Get transactions that reference this customer
    const transactions = await prisma.transaction.findMany({
      where: {},
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    // Filter transactions that contain customer ID in items JSON
    const customerOrders = transactions.filter((tx) => {
      try {
        const items = JSON.parse(tx.items);
        return items.customerId === customerId;
      } catch {
        return false;
      }
    });

    const total = customerOrders.length;

    res.json({
      data: customerOrders.map((tx) => ({
        id: tx.id,
        subtotal: tx.subtotal,
        vat: tx.vat,
        total: tx.total,
        method: tx.method,
        createdAt: tx.createdAt,
      })),
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
