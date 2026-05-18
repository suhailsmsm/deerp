const modules = [
  { id: 'fnb', name: 'F&B Restaurant Module', enabled: true, category: 'Operations' },
  { id: 'inventory', name: 'Inventory Management', enabled: true, category: 'Operations' },
  { id: 'crm', name: 'CRM', enabled: true, category: 'Marketing' },
  { id: 'accounting', name: 'Accounting', enabled: true, category: 'Finance' },
];

const branches = [
  { id: 1, name: 'Abu Dhabi HQ', location: 'Abu Dhabi', trn: '100387652400003' },
];

const staff = [
  { id: 1, name: 'Ahmed K.', role: 'Admin', pin: '1234' },
];

const products = [
  { id: 1, barcode: '6281000001', name: 'Basmati Rice 5kg', nameAr: 'أرز بسمتي ٥ كجم', category: 'Grocery', cost: 18, price: 28.5, stock: 142, unit: 'bag', isFnb: false },
  { id: 2, barcode: '6281000002', name: 'Nido Milk 900g', nameAr: 'حليب نيدو ٩٠٠ جم', category: 'Dairy', cost: 22, price: 34, stock: 56, unit: 'tin', isFnb: false },
  { id: 3, barcode: '6281000003', name: 'Lays Classic 160g', nameAr: 'ليز كلاسيك', category: 'Snacks', cost: 4.5, price: 8, stock: 4, unit: 'pcs', isFnb: false },
  { id: 4, barcode: '6281000004', name: 'Pepsi 1.5L', nameAr: 'بيبسي ١.٥ لتر', category: 'Beverages', cost: 2.8, price: 5, stock: 0, unit: 'btl', isFnb: false },
  { id: 5, barcode: '6281000005', name: 'Tide 3kg', nameAr: 'تايد ٣ كجم', category: 'Cleaning', cost: 28, price: 44.5, stock: 23, unit: 'box', isFnb: false },
  { id: 6, barcode: '6281000006', name: 'Sunflower Oil 3L', nameAr: 'زيت دوار الشمس', category: 'Grocery', cost: 19, price: 29, stock: 88, unit: 'btl', isFnb: false },
  { id: 7, barcode: '6281000007', name: 'iPhone Case 15', nameAr: 'غطاء آيفون ١٥', category: 'Electronics', cost: 8, price: 24.99, stock: 15, unit: 'pcs', isFnb: false },
  { id: 8, barcode: '6281000008', name: 'Notebook A4 100pg', nameAr: 'دفتر A4', category: 'Stationery', cost: 3, price: 6.5, stock: 200, unit: 'pcs', isFnb: false },
];

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
  transactions: [],
};

export function installBrowserElectronFallback() {
  if (window.electron) return;

  window.electron = {
    saveTransaction: async (data) => {
      const transaction = {
        ...data,
        id: fallbackState.transactions.length + 1,
        items: JSON.stringify(data.items),
        createdAt: new Date().toISOString(),
      };
      fallbackState.transactions.push(transaction);
      return transaction;
    },
    getProducts: async () => products,
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
