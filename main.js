const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const { startServer } = require('./api/server');

const prisma = new PrismaClient();

// Start API server on app ready
let apiServer;
app.on('ready', async () => {
  try {
    apiServer = await startServer();
  } catch (error) {
    console.error('Failed to start API server:', error);
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "DERPX",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // In development, use Vite's dev server. In production, load the built index.html.
  const isDev = !app.isPackaged;
  win.loadURL(isDev ? 'http://localhost:5174' : `file://${path.join(__dirname, 'dist/index.html')}`);
}

// Database Handlers
ipcMain.handle('save-transaction', async (event, data) => {
  const { items, ...txnData } = data;
  const isReturn = txnData.type === 'return';
  const signedTotal = isReturn ? -Math.abs(Number(txnData.total || 0)) : Number(txnData.total || 0);
  const signedSubtotal = isReturn ? -Math.abs(Number(txnData.subtotal || 0)) : Number(txnData.subtotal || 0);
  const signedVat = isReturn ? -Math.abs(Number(txnData.vat || 0)) : Number(txnData.vat || 0);
  const signedDiscount = Number(txnData.discount || 0);

  return await prisma.$transaction(async (tx) => {
    // 1. Create the transaction record
    const newTransaction = await tx.transaction.create({
      data: {
        total: signedTotal,
        subtotal: signedSubtotal,
        vat: signedVat,
        discount: signedDiscount,
        method: txnData.method || 'cash',
        items: JSON.stringify({
          type: isReturn ? 'return' : 'sale',
          customer: txnData.customer || null,
          currency: txnData.currency || 'AED',
          coupon: txnData.coupon || null,
          giftVoucher: txnData.giftVoucher || null,
          table: txnData.table || null,
          items,
        }),
        branchId: txnData.branchId || null,
        staffId: txnData.staffId || null,
      }
    });

    // 2. Automatically update stock for each sold/returned item
    for (const item of items) {
      await tx.product.update({
        where: { id: item.id },
        data: { stock: isReturn ? { increment: item.qty } : { decrement: item.qty } }
      });
    }

    return newTransaction;
  });
});

ipcMain.handle('get-transactions', async () => {
  return await prisma.transaction.findMany({
    orderBy: { createdAt: 'desc' },
    take: 500,
  });
});

// Module Management
ipcMain.handle('get-modules', async () => await prisma.module.findMany());
ipcMain.handle('toggle-module', async (event, { id, enabled }) => {
  return await prisma.module.upsert({
    where: { id },
    update: { enabled },
    create: { id, name: id, enabled }
  });
});

// Shift Management (X/Z Reports)
ipcMain.handle('start-shift', async (event, data) => {
  return await prisma.shift.create({
    data: {
      staffId: data.staffId,
      branchId: data.branchId,
      openingFloat: data.openingFloat,
    }
  });
});

ipcMain.handle('get-shift-report', async (event, shiftId) => {
  const transactions = await prisma.transaction.findMany({
    where: { shiftId: shiftId }
  });
  
  return {
    count: transactions.length,
    totalSales: transactions.reduce((sum, t) => sum + t.total, 0),
    totalVat: transactions.reduce((sum, t) => sum + t.vat, 0),
    byMethod: {
      cash: transactions.filter(t => t.method === 'cash').reduce((sum, t) => sum + t.total, 0),
      card: transactions.filter(t => t.method === 'card').reduce((sum, t) => sum + t.total, 0),
    }
  };
});

// File System Exports (Production Ready)
ipcMain.handle('export-sif-file', async (event, { content, filename }) => {
  const exportPath = path.join(app.getPath('downloads'), filename);
  fs.writeFileSync(exportPath, content);
  return exportPath;
});

// Petty Cash & Expenses
ipcMain.handle('record-petty-cash', async (event, data) => {
  return await prisma.pettyCash.create({ data });
});

// Commission Logic
ipcMain.handle('calculate-commissions', async (event, staffId) => {
  return await prisma.commission.findMany({ where: { staffId } });
});

// F&B Table Handlers
ipcMain.handle('get-tables', async () => await prisma.table.findMany());
ipcMain.handle('update-table-status', async (event, { id, status }) => {
  return await prisma.table.update({ where: { id }, data: { status } });
});

// Inventory & CRM Handlers
ipcMain.handle('get-expiring-products', async () => {
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  return await prisma.product.findMany({
    where: {
      expiryDate: {
        lte: thirtyDaysFromNow,
        not: null
      }
    },
    orderBy: { expiryDate: 'asc' }
  });
});
ipcMain.handle('get-products', async () => await prisma.product.findMany());
ipcMain.handle('get-customers', async () => await prisma.customer.findMany());
ipcMain.handle('update-customer-loyalty', async (event, { id, points }) => {
  return await prisma.customer.update({
    where: { id },
    data: { loyalty: { increment: points } }
  });
});

const toOptionalNumber = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
};

const toOptionalDate = (value) => {
  if (!value) return null;
  const dateValue = new Date(value);
  return Number.isNaN(dateValue.getTime()) ? undefined : dateValue;
};

const buildProductUpdateData = (product) => {
  const data = {};

  if (product.name !== undefined && String(product.name).trim()) data.name = String(product.name).trim();
  if (product.nameAr !== undefined) data.nameAr = product.nameAr || null;
  if (product.barcode !== undefined || product.sku !== undefined) data.barcode = product.barcode || product.sku;
  if (product.category !== undefined) data.category = product.category;
  if (product.image !== undefined) data.image = product.image || null;
  if (product.unit !== undefined) data.unit = product.unit;
  if (product.modifiers !== undefined) data.modifiers = product.modifiers || null;
  if (product.batch !== undefined) data.batch = product.batch || null;
  if (product.warehouse !== undefined) data.warehouse = product.warehouse || null;

  const cost = toOptionalNumber(product.cost);
  if (cost !== undefined) data.cost = cost;

  const price = toOptionalNumber(product.price);
  if (price !== undefined) data.price = price;

  const stock = toOptionalNumber(product.stock);
  if (stock !== undefined) data.stock = Math.trunc(stock);

  const minStock = toOptionalNumber(product.minStock);
  if (minStock !== undefined) data.minStock = Math.trunc(minStock);

  const maxStock = toOptionalNumber(product.maxStock);
  if (maxStock !== undefined) data.maxStock = Math.trunc(maxStock);

  if (product.isFnb !== undefined) data.isFnb = Boolean(product.isFnb);

  if (product.expiryDate !== undefined || product.expiry !== undefined) {
    const expiryDate = toOptionalDate(product.expiryDate ?? product.expiry);
    if (expiryDate !== undefined) data.expiryDate = expiryDate;
  }

  return data;
};

ipcMain.handle('update-product', async (event, product) => {
  try {
    const { id } = product;
    if (!id) {
      throw new Error('Product ID is required to update a product.');
    }

    const data = buildProductUpdateData(product);
    return await prisma.product.update({
      where: { id: Number(id) },
      data: data,
    });
  } catch (error) {
    console.error("Prisma Update Error:", error);
    throw error; // Re-throw so the frontend catch block triggers
  }
});

ipcMain.handle('bulk-upsert-products', async (event, products) => {
  const rows = Array.isArray(products) ? products : [];

  return await prisma.$transaction(rows.map((product) => {
    const barcode = product.barcode || product.sku;
    if (!barcode || !product.name) {
      throw new Error('Each bulk item must include name and sku/barcode.');
    }

    return prisma.product.upsert({
      where: { barcode },
      update: buildProductUpdateData({ ...product, barcode }),
      create: {
        companyId: Number(product.companyId || 1),
        barcode,
        name: String(product.name).trim(),
        nameAr: product.nameAr || null,
        category: product.category || 'Uncategorized',
        image: product.image || null,
        cost: Number(product.cost || 0),
        price: Number(product.price || 0),
        stock: Math.trunc(Number(product.stock || 0)),
        unit: product.unit || 'pcs',
        minStock: Math.trunc(Number(product.minStock || 0)),
        maxStock: Math.trunc(Number(product.maxStock || 0)),
        batch: product.batch || null,
        warehouse: product.warehouse || null,
        expiryDate: product.expiryDate || product.expiry ? new Date(product.expiryDate || product.expiry) : null,
      },
    });
  }));
});

// E-Invoicing QR Generation (ZATCA/FTA TLV Style)
ipcMain.handle('generate-invoice-qr', async (event, data) => {
  const { seller, trn, timestamp, total, vat } = data;
  
  // Helper to create TLV (Tag-Length-Value) buffers
  const getTLV = (tag, value) => {
    const bTag = Buffer.from([tag]);
    const bValue = Buffer.from(String(value));
    const bLen = Buffer.from([bValue.length]);
    return Buffer.concat([bTag, bLen, bValue]);
  };

  const tlvBuffer = Buffer.concat([
    getTLV(1, seller),
    getTLV(2, trn),
    getTLV(3, timestamp),
    getTLV(4, total),
    getTLV(5, vat)
  ]);

  const base64Tlv = tlvBuffer.toString('base64');
  // In a real app, you'd use the 'qrcode' library to turn this into a DataURL
  return base64Tlv; 
});

// Staff & Branch Handlers
ipcMain.handle('get-branches', async () => await prisma.branch.findMany());
ipcMain.handle('verify-staff-pin', async (event, pin) => {
  return await prisma.staff.findFirst({ where: { pin } });
});

// Hardware & Sync Handlers (Placeholders for your implementation)
ipcMain.handle('send-whatsapp', async (event, { phone, message }) => {
  console.log(`Sending WhatsApp to ${phone}: ${message}`);
  // Integrate with Twilio, Meta API, or a local bridge here
  return { success: true };
});

ipcMain.handle('print-receipt', async (event, html) => {
  console.log("Printing receipt...");
  // Implementation for ESC/POS would go here
  return { success: true };
});

ipcMain.handle('trigger-drawer', async () => {
  console.log("Opening cash drawer...");
  return { success: true };
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    prisma.$disconnect();
    if (apiServer) {
      apiServer.close();
    }
    app.quit();
  }
});
