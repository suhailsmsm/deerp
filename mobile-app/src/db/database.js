import * as SQLite from 'expo-sqlite';

const DB_NAME = 'derpx_pos.db';
let db = null;

// Initialize database
export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    
    // Enable foreign keys
    await db.execAsync('PRAGMA foreign_keys = ON;');
    
    // Create tables
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        productId TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        nameAr TEXT,
        barcode TEXT,
        category TEXT,
        price REAL NOT NULL,
        cost REAL,
        stock INTEGER DEFAULT 0,
        minStock INTEGER DEFAULT 10,
        maxStock INTEGER DEFAULT 100,
        image TEXT,
        updatedAt TEXT NOT NULL
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transactionId TEXT UNIQUE NOT NULL,
        items TEXT NOT NULL,
        subtotal REAL NOT NULL,
        vat REAL DEFAULT 0,
        discount REAL DEFAULT 0,
        total REAL NOT NULL,
        method TEXT NOT NULL,
        customerId TEXT,
        customerName TEXT,
        branchId INTEGER,
        staffId INTEGER,
        synced INTEGER DEFAULT 0,
        syncAttempts INTEGER DEFAULT 0,
        lastSyncAttempt TEXT,
        serverResponse TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customerId TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        tier TEXT DEFAULT 'Bronze',
        points INTEGER DEFAULT 0,
        totalPurchases REAL DEFAULT 0,
        lastPurchase TEXT,
        synced INTEGER DEFAULT 0,
        updatedAt TEXT NOT NULL
      );
    `);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entityType TEXT NOT NULL,
        entityId TEXT NOT NULL,
        action TEXT NOT NULL,
        payload TEXT NOT NULL,
        priority INTEGER DEFAULT 1,
        attempts INTEGER DEFAULT 0,
        lastAttempt TEXT,
        createdAt TEXT NOT NULL
      );
    `);

    // Create indexes for performance
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_transactions_synced ON transactions(synced);
      CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(createdAt);
      CREATE INDEX IF NOT EXISTS idx_sync_queue_priority ON sync_queue(priority DESC);
      CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
    `);

    console.log('✅ Database initialized');
    return db;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Get database instance
export const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

// Transaction operations
export const saveTransaction = async (transaction) => {
  const db = getDB();
  const now = new Date().toISOString();
  
  await db.runAsync(
    `INSERT OR REPLACE INTO transactions (
      transactionId, items, subtotal, vat, discount, total, method,
      customerId, customerName, branchId, staffId, synced, syncAttempts,
      createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)`,
    [
      transaction.transactionId || transaction.id,
      JSON.stringify(transaction.items),
      transaction.subtotal,
      transaction.vat || 0,
      transaction.discount || 0,
      transaction.total,
      transaction.method,
      transaction.customerId,
      transaction.customerName,
      transaction.branchId,
      transaction.staffId,
      transaction.createdAt || now,
      now,
    ]
  );

  // Add to sync queue
  await addToSyncQueue('transaction', transaction.transactionId || transaction.id, 'CREATE', transaction);
  
  return transaction;
};

export const getLocalTransactions = async (limit = 50, offset = 0) => {
  const db = getDB();
  const result = await db.getAllAsync(
    'SELECT * FROM transactions ORDER BY createdAt DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );
  
  return result.map(row => ({
    ...row,
    items: JSON.parse(row.items),
  }));
};

export const getUnsyncedTransactions = async () => {
  const db = getDB();
  const result = await db.getAllAsync(
    'SELECT * FROM transactions WHERE synced = 0 ORDER BY createdAt ASC'
  );
  
  return result.map(row => ({
    ...row,
    items: JSON.parse(row.items),
  }));
};

export const markTransactionSynced = async (transactionId, serverResponse) => {
  const db = getDB();
  await db.runAsync(
    'UPDATE transactions SET synced = 1, syncAttempts = 0, serverResponse = ?, updatedAt = ? WHERE transactionId = ?',
    [JSON.stringify(serverResponse), new Date().toISOString(), transactionId]
  );
};

export const incrementSyncAttempts = async (transactionId) => {
  const db = getDB();
  await db.runAsync(
    'UPDATE transactions SET syncAttempts = syncAttempts + 1, lastSyncAttempt = ? WHERE transactionId = ?',
    [new Date().toISOString(), transactionId]
  );
};

// Product operations
export const saveProduct = async (product) => {
  const db = getDB();
  const now = new Date().toISOString();
  
  await db.runAsync(
    `INSERT OR REPLACE INTO products (
      productId, name, nameAr, barcode, category, price, cost, stock,
      minStock, maxStock, image, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      product.id || product.productId,
      product.name,
      product.nameAr,
      product.barcode,
      product.category,
      product.price,
      product.cost,
      product.stock || 0,
      product.minStock || 10,
      product.maxStock || 100,
      product.image,
      now,
    ]
  );

  return product;
};

export const getProducts = async (search = '', category = '') => {
  const db = getDB();
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (name LIKE ? OR barcode LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  query += ' ORDER BY name ASC';

  const result = await db.getAllAsync(query, params);
  return result;
};

export const updateProductStock = async (productId, quantity) => {
  const db = getDB();
  await db.runAsync(
    'UPDATE products SET stock = stock + ?, updatedAt = ? WHERE productId = ?',
    [-quantity, new Date().toISOString(), productId]
  );
};

// Sync queue operations
export const addToSyncQueue = async (entityType, entityId, action, payload) => {
  const db = getDB();
  const now = new Date().toISOString();
  
  await db.runAsync(
    `INSERT INTO sync_queue (entityType, entityId, action, payload, priority, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      entityType,
      entityId,
      action,
      JSON.stringify(payload),
      action === 'CREATE' ? 1 : 2, // Higher priority for new records
      now,
    ]
  );
};

export const getSyncQueueItems = async (limit = 100) => {
  const db = getDB();
  return await db.getAllAsync(
    'SELECT * FROM sync_queue ORDER BY priority ASC, createdAt ASC LIMIT ?',
    [limit]
  );
};

export const removeSyncQueueItem = async (id) => {
  const db = getDB();
  await db.runAsync('DELETE FROM sync_queue WHERE id = ?', [id]);
};

export const incrementQueueAttempts = async (id) => {
  const db = getDB();
  await db.runAsync(
    'UPDATE sync_queue SET attempts = attempts + 1, lastAttempt = ? WHERE id = ?',
    [new Date().toISOString(), id]
  );
};

export const getSyncStats = async () => {
  const db = getDB();
  
  const pending = await db.getFirstAsync(
    'SELECT COUNT(*) as count FROM sync_queue'
  );
  
  const unsynced = await db.getFirstAsync(
    'SELECT COUNT(*) as count FROM transactions WHERE synced = 0'
  );
  
  const failed = await db.getFirstAsync(
    'SELECT COUNT(*) as count FROM sync_queue WHERE attempts >= 3'
  );
  
  return {
    pending: pending?.count || 0,
    unsynced: unsynced?.count || 0,
    failed: failed?.count || 0,
  };
};

// Clear all data (for testing)
export const clearDatabase = async () => {
  const db = getDB();
  await db.execAsync('DELETE FROM sync_queue');
  await db.execAsync('DELETE FROM transactions');
  await db.execAsync('DELETE FROM products');
  await db.execAsync('DELETE FROM customers');
  console.log('🗑️ Database cleared');
};
