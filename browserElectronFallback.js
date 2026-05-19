const modules = [
  { id: 'fnb', name: 'F&B Restaurant Module', enabled: true, category: 'Operations' },
  { id: 'inventory', name: 'Inventory Management', enabled: true, category: 'Operations' },
  { id: 'crm', name: 'CRM', enabled: true, category: 'Marketing' },
  { id: 'accounting', name: 'Accounting', enabled: true, category: 'Finance' },
  { id: 'ai', name: 'AI Features', enabled: true, category: 'Intelligence' },
];

const branches = [
  { id: 1, name: 'Abu Dhabi HQ', location: 'Abu Dhabi', trn: '100387652400003' },
];

const staff = [
  { id: 1, name: 'Ahmed K.', role: 'Admin', pin: '1234' },
];

const defaultProducts = [
  { id: 1, barcode: '6281000001', name: 'Basmati Rice 5kg', nameAr: 'أرز بسمتي ٥ كجم', category: 'Grocery', cost: 18, price: 28.5, stock: 142, unit: 'bag', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80', isFnb: false },
  { id: 2, barcode: '6281000002', name: 'Nido Milk 900g', nameAr: 'حليب نيدو ٩٠٠ جم', category: 'Dairy', cost: 22, price: 34, stock: 56, unit: 'tin', image: 'https://images.unsplash.com/photo-1550583724-125581fe2f8a?auto=format&fit=crop&w=400&q=80', isFnb: false },
  { id: 3, barcode: '6281000003', name: 'Lays Classic 160g', nameAr: 'ليز كلاسيك', category: 'Snacks', cost: 4.5, price: 8, stock: 4, unit: 'pcs', image: 'https://images.unsplash.com/photo-1566478489140-98b2f90c7490?auto=format&fit=crop&w=400&q=80', isFnb: false },
  { id: 4, barcode: '6281000004', name: 'Pepsi 1.5L', nameAr: 'بيبسي ١.٥ لتر', category: 'Beverages', cost: 2.8, price: 5, stock: 0, unit: 'btl', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80', isFnb: false },
  { id: 5, barcode: '6281000005', name: 'Tide 3kg', nameAr: 'تايد ٣ كجم', category: 'Cleaning', cost: 28, price: 44.5, stock: 23, unit: 'box', image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=400&q=80', isFnb: false },
  { id: 6, barcode: '6281000006', name: 'Sunflower Oil 3L', nameAr: 'زيت دوار الشمس', category: 'Grocery', cost: 19, price: 29, stock: 88, unit: 'btl', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80', isFnb: false },
  { id: 7, barcode: '6281000007', name: 'iPhone Case 15', nameAr: 'غطاء آيفون ١٥', category: 'Electronics', cost: 8, price: 24.99, stock: 15, unit: 'pcs', image: 'https://images.unsplash.com/photo-1603313011101-31c7166aef41?auto=format&fit=crop&w=400&q=80', isFnb: false },
  { id: 8, barcode: '6281000008', name: 'Notebook A4 100pg', nameAr: 'دفتر A4', category: 'Stationery', cost: 3, price: 6.5, stock: 200, unit: 'pcs', image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=400&q=80', isFnb: false },
];

let products = [...defaultProducts];

const PRODUCT_STORE_KEY = 'derp_products';
const LEGACY_PRODUCT_STORE_KEY = 'nexapos_products';
const TRANSACTION_STORE_KEY = 'derp_transactions';
const PRODUCT_DB_NAME = 'derp_browser_db';
const PRODUCT_DB_VERSION = 1;
const PRODUCT_STORE_NAME = 'products';

const findDefaultProduct = (product) => {
  return defaultProducts.find((item) => item.id === Number(product.id) || item.barcode === product.barcode);
};

const normalizeProduct = (product) => {
  const defaultProduct = findDefaultProduct(product) || {};

  return {
    ...defaultProduct,
    ...product,
    id: Number(product.id || defaultProduct.id),
    name: product.name || defaultProduct.name || product.nameAr || product.barcode || `Item ${product.id || ''}`.trim(),
    nameAr: product.nameAr || defaultProduct.nameAr || null,
    barcode: product.barcode || product.sku || defaultProduct.barcode || '',
    category: product.category || defaultProduct.category || 'Uncategorized',
    image: product.image || defaultProduct.image || null,
    price: Number(product.price ?? defaultProduct.price ?? 0),
    stock: Number(product.stock ?? defaultProduct.stock ?? 0),
  };
};

const normalizeProducts = (nextProducts) => {
  const mergedProducts = nextProducts.map(normalizeProduct);
  const mergedIds = new Set(mergedProducts.map((product) => product.id));
  const missingDefaults = defaultProducts.filter((product) => !mergedIds.has(product.id));

  return [...mergedProducts, ...missingDefaults];
};

const readProductsFromLocalStorage = () => {
  try {
    const stored = localStorage.getItem(PRODUCT_STORE_KEY) || localStorage.getItem(LEGACY_PRODUCT_STORE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load products from localStorage:', error);
    return null;
  }
};

const saveProductsToLocalStorage = (nextProducts) => {
  try {
    localStorage.setItem(PRODUCT_STORE_KEY, JSON.stringify(nextProducts));
  } catch (error) {
    console.warn('Failed to save products to localStorage. Images may be too large for localStorage quota.', error);
  }
};

const openProductDb = () => new Promise((resolve, reject) => {
  if (!window.indexedDB) {
    resolve(null);
    return;
  }

  const request = window.indexedDB.open(PRODUCT_DB_NAME, PRODUCT_DB_VERSION);

  request.onupgradeneeded = () => {
    const db = request.result;
    if (!db.objectStoreNames.contains(PRODUCT_STORE_NAME)) {
      db.createObjectStore(PRODUCT_STORE_NAME, { keyPath: 'id' });
    }
  };

  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

const readProductsFromIndexedDb = async () => {
  const db = await openProductDb();
  if (!db) return null;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(PRODUCT_STORE_NAME, 'readonly');
    const store = transaction.objectStore(PRODUCT_STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result.length ? request.result : null);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
};

const saveProductsToIndexedDb = async (nextProducts) => {
  const db = await openProductDb();
  if (!db) {
    saveProductsToLocalStorage(nextProducts);
    return;
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(PRODUCT_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(PRODUCT_STORE_NAME);

    store.clear();
    nextProducts.forEach((product) => store.put(product));

    transaction.oncomplete = () => {
      db.close();
      saveProductsToLocalStorage(nextProducts);
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
};

const loadPersistedProducts = async () => {
  try {
    const indexedDbProducts = await readProductsFromIndexedDb();
    const storedProducts = indexedDbProducts || readProductsFromLocalStorage();
    products = storedProducts && storedProducts.length ? normalizeProducts(storedProducts) : [...defaultProducts];
  } catch (error) {
    console.warn('Failed to load products from IndexedDB. Falling back to localStorage/default products.', error);
    const storedProducts = readProductsFromLocalStorage();
    products = storedProducts && storedProducts.length ? normalizeProducts(storedProducts) : [...defaultProducts];
  }

  await persistProducts(products);

  return products;
};

const persistProducts = async (nextProducts) => {
  products = normalizeProducts(nextProducts);
  try {
    await saveProductsToIndexedDb(products);
  } catch (error) {
    console.warn('Failed to save products to IndexedDB. Falling back to localStorage.', error);
    saveProductsToLocalStorage(products);
  }
};

const customers = [
  { id: 1, name: 'Mohammed Al Rashid', phone: '+971-50-111-2233', purchases: 34, total: 4280, loyalty: 214 },
  { id: 2, name: 'Fatima Al Zaabi', phone: '+971-52-334-5566', purchases: 18, total: 2140, loyalty: 107 },
  { id: 3, name: 'Khalid Ibrahim', phone: '+971-55-778-9900', purchases: 61, total: 9820, loyalty: 491 },
  { id: 4, name: 'Sara Mohammed', phone: '+971-50-445-6677', purchases: 9, total: 780, loyalty: 39 },
  { id: 5, name: 'Omar Al Hamdan', phone: '+971-56-223-4488', purchases: 27, total: 3310, loyalty: 165 },
  { id: 6, name: 'Aisha Rashid', phone: '+971-54-887-1122', purchases: 42, total: 6150, loyalty: 307 },
];

const tables = [
  { id: 1, number: '1', status: 'available', capacity: 2 },
  { id: 2, number: '2', status: 'occupied', capacity: 4 },
  { id: 3, number: '3', status: 'reserved', capacity: 6 },
  { id: 4, number: '4', status: 'available', capacity: 4 },
];

const fallbackState = {
  modules: [...modules],
  transactions: JSON.parse(localStorage.getItem(TRANSACTION_STORE_KEY) || '[]'),
};

export function installBrowserElectronFallback() {
  const fallbackApi = {
    __usesPersistentProducts: true,
    getProducts: async () => loadPersistedProducts(),
    updateProduct: async (product) => {
      const persistedProducts = await loadPersistedProducts();
      const productIndex = persistedProducts.findIndex((item) => item.id === Number(product.id));
      if (productIndex === -1) {
        throw new Error('Product not found in browser fallback inventory.');
      }

      persistedProducts[productIndex] = {
        ...persistedProducts[productIndex],
        ...product,
        id: Number(product.id),
        name: product.name || persistedProducts[productIndex].name,
        barcode: product.barcode || product.sku || persistedProducts[productIndex].barcode,
        image: product.image || null,
        expiryDate: product.expiryDate || product.expiry || persistedProducts[productIndex].expiryDate || null,
      };

      await persistProducts(persistedProducts);
      return persistedProducts[productIndex];
    },
    bulkUpsertProducts: async (bulkProducts) => {
      const persistedProducts = await loadPersistedProducts();
      const nextProducts = [...persistedProducts];

      bulkProducts.forEach((product) => {
        const barcode = product.barcode || product.sku;
        const existingIndex = nextProducts.findIndex((item) => item.id === Number(product.id) || item.barcode === barcode);
        const normalizedProduct = normalizeProduct({
          ...product,
          id: product.id || (existingIndex >= 0 ? nextProducts[existingIndex].id : Date.now() + existingIndex + nextProducts.length),
          barcode,
        });

        if (existingIndex >= 0) {
          nextProducts[existingIndex] = { ...nextProducts[existingIndex], ...normalizedProduct };
        } else {
          nextProducts.push(normalizedProduct);
        }
      });

      await persistProducts(nextProducts);
      return nextProducts;
    },
  };

  if (window.electron) {
    window.electron = {
      ...window.electron,
      ...fallbackApi,
    };
    return;
  }

  window.electron = {
    ...fallbackApi,
    saveTransaction: async (data) => {
      const isReturn = data.type === 'return';
      const transaction = {
        ...data,
        id: fallbackState.transactions.length + 1,
        total: isReturn ? -Math.abs(Number(data.total || 0)) : Number(data.total || 0),
        subtotal: isReturn ? -Math.abs(Number(data.subtotal || 0)) : Number(data.subtotal || 0),
        vat: isReturn ? -Math.abs(Number(data.vat || 0)) : Number(data.vat || 0),
        method: data.method || 'cash',
        items: JSON.stringify({ type: isReturn ? 'return' : 'sale', items: data.items || [] }),
        createdAt: new Date().toISOString(),
      };
      fallbackState.transactions.push(transaction);
      localStorage.setItem(TRANSACTION_STORE_KEY, JSON.stringify(fallbackState.transactions));
      return transaction;
    },
    getTransactions: async () => [...fallbackState.transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    getCustomers: async () => customers,
    updateLoyalty: async () => ({ success: true }),
    getBranches: async () => branches,
    verifyStaff: async (pin) => staff.find((member) => member.pin === pin) || null,
    updateStock: async () => ({ success: true }),
    startShift: async (data) => ({ ...data, id: 1, status: 'open', startTime: new Date().toISOString() }),
    getShiftReport: async () => ({
      count: fallbackState.transactions.length,
      totalSales: fallbackState.transactions.reduce((sum, item) => sum + item.total, 0),
      totalVat: fallbackState.transactions.reduce((sum, item) => sum + item.vat, 0),
      byMethod: { cash: 0, card: 0 },
    }),
    getTables: async () => tables,
    updateTable: async ({ id, status }) => {
      const table = tables.find((item) => item.id === id);
      if (table) table.status = status;
      return table;
    },
    getModules: async () => fallbackState.modules,
    generateQr: async (data) => btoa(JSON.stringify(data)),
    getExpiringProducts: async () => [],
    toggleModule: async ({ id, enabled }) => {
      const module = fallbackState.modules.find((item) => item.id === id);
      if (module) module.enabled = enabled;
      return module;
    },
    printReceipt: async () => ({ success: true }),
    sendWhatsApp: async () => ({ success: true }),
    openDrawer: async () => ({ success: true }),
    syncStatus: () => undefined,
  };
}
