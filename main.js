const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "NexaPOS ERP",
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

  return await prisma.$transaction(async (tx) => {
    // 1. Create the transaction record
    const newTransaction = await tx.transaction.create({
      data: {
        ...txnData,
        items: JSON.stringify(items),
      }
    });

    // 2. Automatically decrement stock for each sold item
    for (const item of items) {
      await tx.product.update({
        where: { id: item.id },
        data: { stock: { decrement: item.qty } }
      });
    }

    return newTransaction;
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

ipcMain.handle('update-product', async (event, product) => {
  try {
    const { id, ...data } = product;
    return await prisma.product.update({
      where: { id: Number(id) },
      data: data,
    });
  } catch (error) {
    console.error("Prisma Update Error:", error);
    throw error; // Re-throw so the frontend catch block triggers
  }
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
    app.quit();
  }
});