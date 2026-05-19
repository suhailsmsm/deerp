'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { ShoppingCart, CreditCard, Receipt, Search, Plus, Minus, Trash2, Users, Package, MessageSquare, Building2, Edit3, RotateCcw, Sun, Moon } from 'lucide-react';
import { useCartStore } from './cartStore';
import { useSessionStore } from './sessionStore';
import { useModuleStore } from './moduleStore';
import StaffLogin from './StaffLogin';
import { generateReceiptHtml } from './ReceiptPreview';
import TableMap from './TableMap';
import Sidebar from './Sidebar';
import SettingsAdmin from './SettingsAdmin';
import InventoryExpiry from './InventoryExpiry';
import ShiftReport from './Reports';
import AdvancedInventory from './AdvancedInventory';
import CRM from './CRM';
import Procurement from './Procurement';

// Lazy load large module components for better initial bundle size
const Accounting = React.lazy(() => import('./Accounting'));
const HRPayroll = React.lazy(() => import('./HRPayroll'));
const Projects = React.lazy(() => import('./Projects'));
const AIInsights = React.lazy(() => import('./AIInsights'));
const SalesReports = React.lazy(() => import('./SalesReports'));

// Loading fallback component
const ModuleLoadingFallback = () => (
  <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-900 rounded-lg">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading module...</p>
    </div>
  </div>
);

const demoCustomers = [
  { id: 1, name: 'Mohammed Al Rashid' },
  { id: 2, name: 'Fatima Al Zaabi' },
  { id: 3, name: 'Khalid Ibrahim' },
  { id: 4, name: 'Sara Mohammed' },
  { id: 5, name: 'Omar Al Hamdan' },
];

const demoProducts = [
  { id: 1001, name: 'Demo Coffee Beans 1kg', barcode: 'DEM-1001', category: 'Beverages', price: 45.0, image: null },
  { id: 1002, name: 'Demo Milk 2L', barcode: 'DEM-1002', category: 'Dairy', price: 12.5, image: null },
  { id: 1003, name: 'Demo Chocolate Bar', barcode: 'DEM-1003', category: 'Snacks', price: 3.75, image: null },
  { id: 1004, name: 'Demo Detergent 1L', barcode: 'DEM-1004', category: 'Cleaning', price: 15.0, image: null },
  { id: 1005, name: 'Demo Bottled Water 500ml', barcode: 'DEM-1005', category: 'Beverages', price: 1.75, image: null },
];

const quickCategories = ['All', 'Grocery', 'Beverages', 'Dairy', 'Snacks', 'Cleaning'];
const paymentOptions = ['cash', 'card', 'bank transfer', 'tabby', 'tamara'];
const currencyOptions = [
  { code: 'AED', symbol: 'د.إ' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
];
const demoTables = [
  { id: 1, name: 'Table 1', status: 'Open' },
  { id: 2, name: 'Table 2', status: 'Served' },
  { id: 3, name: 'Table 3', status: 'Reserved' },
  { id: 4, name: 'Table 4', status: 'Cleaning' },
  { id: 5, name: 'Bar Seat', status: 'Open' },
];

const getProductDisplayName = (product: any) => {
  return product?.name || product?.nameAr || product?.title || product?.itemName || product?.barcode || `Item ${product?.id || ''}`.trim();
};

const normalizeProductsForPos = (items: any[]) => {
  return items.map((product) => ({
    ...product,
    name: getProductDisplayName(product),
    barcode: product.barcode || product.sku || '',
  }));
};

export default function POSPage() {
  const { cart, addToCart, setCart, clearCart, updateQty, removeFromCart, setCustomer, selectedCustomer, discount, setDiscount } = useCartStore();
  const { currentStaff, isAuthenticated, currentBranch, setBranch } = useSessionStore();
  const { modules, initModules } = useModuleStore();
  const [activePage, setActivePage] = useState('pos');
  const [branches, setBranches] = useState<any[]>([]);
  const [branchLoading, setBranchLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [selectedCurrency, setSelectedCurrency] = useState(currencyOptions[0]);
  const [offlineMode, setOfflineMode] = useState(false);
  const [vatInclusive, setVatInclusive] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [giftVoucher, setGiftVoucher] = useState('');
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [heldOrders, setHeldOrders] = useState<any[]>([]);
  const [selectedHeldOrder, setSelectedHeldOrder] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState<any>(demoTables[0]);
  const [isReceiptPreviewOpen, setIsReceiptPreviewOpen] = useState(false);
  const [receiptHtml, setReceiptHtml] = useState('');
  const [editableProduct, setEditableProduct] = useState<any>(null);
  const [orderMode, setOrderMode] = useState('sale');
  const [darkMode, setDarkMode] = useState(false);
  const languageLabel = useCartStore((state) => state.language === 'en' ? 'العربية' : 'English');

  const saveProductsToStorage = (prods: any[]) => {
    try {
      localStorage.setItem('derp_products', JSON.stringify(normalizeProductsForPos(prods)));
    } catch (e) {
      console.error('Failed to save products to localStorage:', e);
    }
  };

  const loadProductsFromStorage = () => {
    try {
      const stored = localStorage.getItem('derp_products') || localStorage.getItem('nexapos_products');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Failed to load products from localStorage:', e);
      return null;
    }
  };

  const loadInventoryFromStorageForSync = () => {
    try {
      const stored = localStorage.getItem('derp_inventory') || localStorage.getItem('nexapos_inventory');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  };

  const toggleLanguage = () => {
    const nextLang = useCartStore.getState().language === 'en' ? 'ar' : 'en';
    useCartStore.getState().setLanguage(nextLang);
    document.body.dir = nextLang === 'ar' ? 'rtl' : 'ltr';
  };

  const toggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    localStorage.setItem('derp_dark_mode', nextMode ? 'true' : 'false');
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('derp_dark_mode');
    if (savedTheme !== null) {
      setDarkMode(savedTheme === 'true');
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    initModules();

    const loadData = async () => {
      if (window.electron) {
        const [branchList, productList, customerList] = await Promise.all([
          window.electron.getBranches(),
          window.electron.getProducts(),
          window.electron.getCustomers(),
        ]);
        const normalizedProducts = normalizeProductsForPos(productList || []);
        setBranches(branchList || []);
        setProducts(normalizedProducts);
        saveProductsToStorage(normalizedProducts);
        setCustomers(customerList || demoCustomers);

        if (!currentBranch && branchList && branchList.length > 0) {
          setBranch(branchList[0]);
        }
      } else {
        setBranches([]);
        const stored = loadProductsFromStorage() || [];
        const base = (stored && stored.length) ? stored : demoProducts;
        setProducts(normalizeProductsForPos(base)); // Load demo or local storage products
        setCustomers(demoCustomers);
      }
      setBranchLoading(false);
    };

    loadData();
  }, []);

  const totals = useCartStore((state) => state.getTotals(state));

  if (!isAuthenticated) {
    return <StaffLogin />;
  }

  const handleCharge = async () => {
    if (cart.length === 0) return;

    const transaction = {
      type: orderMode,
      items: cart,
      subtotal: totals.subtotal,
      discount: totals.discount,
      vat: totals.vat,
      total: totals.total,
      method: paymentMethod,
      currency: selectedCurrency.code,
      coupon: couponCode,
      giftVoucher,
      loyaltyPoints,
      table: selectedTable?.name,
      isOffline: offlineMode,
      vatInclusive,
      staffId: currentStaff.id,
      branchId: currentBranch?.id,
      createdAt: new Date().toISOString(),
    };

    const savedTxn = await window.electron.saveTransaction(transaction);
    if (savedTxn) {
      const html = await generateReceiptHtml(savedTxn, currentBranch, currentStaff);
      await window.electron.printReceipt(html);
      clearCart();
      setOrderMode('sale');
      alert(orderMode === 'return' ? 'Sales Return Completed & Receipt Printed' : 'Transaction Completed & Receipt Printed');
    }
  };

  const holdCurrentOrder = () => {
    if (cart.length === 0) return;
    const hold = {
      id: Date.now(),
      label: `Hold ${heldOrders.length + 1}`,
      items: cart,
      customer: selectedCustomer?.name || 'Walk-in',
      table: selectedTable?.name,
      total: totals.total,
      createdAt: new Date().toLocaleTimeString(),
    };
    setHeldOrders([hold, ...heldOrders]);
    clearCart();
    setSelectedHeldOrder(hold);
  };

  const resumeOrder = (order: any) => {
    if (!order) return;
    setSelectedHeldOrder(order);
    setCart(order.items);
    setHeldOrders(heldOrders.filter((held) => held.id !== order.id));
  };

  const editHeldOrder = (order: any) => {
    resumeOrder(order);
  };

  const previewReceipt = async () => {
    if (!cart.length) return;

    const transaction = {
      id: 'preview',
      customer: selectedCustomer?.name || 'Walk-in Customer',
      items: JSON.stringify(cart),
      subtotal: totals.subtotal,
      discount: totals.discount,
      vat: totals.vat,
      total: totals.total,
      paymentMethod,
      createdAt: new Date().toISOString(),
      branchId: currentBranch?.id,
    };

    const html = await generateReceiptHtml(transaction, currentBranch, currentStaff);
    setReceiptHtml(html);
    setIsReceiptPreviewOpen(true);
  };

  const openEditProduct = (product: any) => {
    setEditableProduct({ ...product });
  };

  const saveProductEdits = async () => {
    if (!editableProduct) return;

    try {
      if (window.electron) {
        await window.electron.updateProduct(editableProduct);
      }

      const updated = normalizeProductsForPos(products.map((item) => (item.id === editableProduct.id ? editableProduct : item)));
      setProducts(updated);
      saveProductsToStorage(updated);
      setEditableProduct(null);
    } catch (error) {
      console.error('Failed to save product changes:', error);
      alert(`Could not save product changes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleImageUpload = (file: File | null) => {
    if (!file || !editableProduct) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setEditableProduct({ ...editableProduct, image: reader.result as string });
      }
    };
    reader.readAsDataURL(file);
  };

  const filteredProducts = products.filter((product) => {
    const displayName = getProductDisplayName(product).toLowerCase();
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = searchTerm === '' || displayName.includes(searchTerm.toLowerCase()) || product.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar activePage={activePage} onPageChange={setActivePage} />
      <main className="flex-1 flex flex-col overflow-hidden min-h-0 p-4 lg:p-6">
        <div className="app-glass-shell mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="rounded-xl border border-white/70 bg-white/75 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-white"
            >
              {languageLabel}
            </button>
            <button
              type="button"
              onClick={toggleDarkMode}
              className="rounded-xl border border-white/70 bg-white/75 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-white"
            >
              {darkMode ? <Sun size={14} /> : <Moon size={14} />}
              <span className="ml-1">{darkMode ? 'Light' : 'Dark'}</span>
            </button>
            <span className="text-xs text-slate-500 font-medium">UAE Time: {new Date().toLocaleTimeString('en-AE')}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{currentBranch?.name || 'Main Branch'}</span>
            <span className="h-4 w-px bg-slate-200" />
            <span>{currentStaff.name}</span>
          </div>
        </div>


        <div className="flex-1 min-h-0 overflow-auto rounded-3xl">
          {activePage === 'dashboard' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">Dashboard Summary</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">Today's Sales</p>
                  <p className="text-3xl font-bold mt-2 text-blue-600">AED 8,420.00</p>
                </div>
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">Active Tables</p>
                <p className="text-3xl font-bold mt-2">12 / 24</p>
              </div>
              <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">New Customers</p>
                <p className="text-3xl font-bold mt-2">5</p>
              </div>
            </div>
            <div className="h-64 bg-white rounded-2xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
              Sales Performance Analytics Chart
            </div>
          </div>
        )}

        {activePage === 'crm' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Customer Management (CRM)</h1>
            <div className="p-10 bg-white rounded-2xl border border-dashed border-slate-300 text-center text-slate-400">
              Customer List and Loyalty Management module is currently in Demo Mode.
            </div>
          </div>
        )}

        {activePage === 'payments' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">Payments</h1>
                <p className="text-slate-500">View recent payment activity and process transactions.</p>
              </div>
              <button className="px-4 py-2 rounded-xl bg-blue-600 text-white">New Payment</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 bg-white rounded-2xl border border-slate-200">
                <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">Total Today</p>
                <p className="text-3xl font-bold mt-2">AED 9,720.00</p>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-slate-200">
                <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">Pending Payments</p>
                <p className="text-3xl font-bold mt-2">4</p>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-slate-200">
                <p className="text-sm text-slate-500 uppercase font-bold tracking-wider">Refund Requests</p>
                <p className="text-3xl font-bold mt-2">1</p>
              </div>
            </div>
          </div>
        )}

        {activePage === 'ai-insights' && (
          <Suspense fallback={<ModuleLoadingFallback />}>
            <AIInsights products={products} customers={customers} cart={cart} />
          </Suspense>
        )}

        {activePage === 'communications' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Comms & Delivery</h1>
            <p className="text-slate-500">WhatsApp messages, order delivery updates, and customer alerts.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-white rounded-2xl border border-slate-200">
                <h2 className="font-semibold text-slate-800">Send digital receipt to +971501112233</h2>
                <p className="mt-3 text-sm text-slate-500">Status: <span className="font-bold text-slate-700">Sent</span></p>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-slate-200">
                <h2 className="font-semibold text-slate-800">Order pickup notification to customer</h2>
                <p className="mt-3 text-sm text-slate-500">Status: <span className="font-bold text-slate-700">Delivered</span></p>
              </div>
            </div>
          </div>
        )}

        {activePage === 'purchasing' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Purchasing</h1>
            <p className="text-slate-500">Review supplier orders and expected delivery dates.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 bg-white rounded-2xl border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">PO #2101</h2>
                <p className="text-sm text-slate-500 mt-1">Supplier: Gulf Food Supplies</p>
                <p className="mt-3 text-xl font-bold">AED 1,420.00</p>
                <p className="mt-2 text-sm text-slate-600">Status: Awaiting Delivery</p>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">PO #2102</h2>
                <p className="text-sm text-slate-500 mt-1">Supplier: Desert Dairy</p>
                <p className="mt-3 text-xl font-bold">AED 670.50</p>
                <p className="mt-2 text-sm text-slate-600">Status: Received</p>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">PO #2103</h2>
                <p className="text-sm text-slate-500 mt-1">Supplier: Fresh Produce Co.</p>
                <p className="mt-3 text-xl font-bold">AED 980.20</p>
                <p className="mt-2 text-sm text-slate-600">Status: Pending Approval</p>
              </div>
            </div>
          </div>
        )}

        {activePage === 'reports' && (
          <Suspense fallback={<ModuleLoadingFallback />}>
            <SalesReports products={products} />
          </Suspense>
        )}

        {activePage === 'staff' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Staff & Shifts</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 bg-white rounded-2xl border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Ahmed K.</h2>
                <p className="text-sm text-slate-500">Manager</p>
                <div className="mt-4 text-sm font-bold text-slate-700">On Shift</div>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Lina M.</h2>
                <p className="text-sm text-slate-500">Cashier</p>
                <div className="mt-4 text-sm font-bold text-slate-700">Off Duty</div>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900">Yousef S.</h2>
                <p className="text-sm text-slate-500">Chef</p>
                <div className="mt-4 text-sm font-bold text-slate-700">On Break</div>
              </div>
            </div>
          </div>
        )}

        {activePage === 'fnb' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Restaurant Floor Plan</h1>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <TableMap onSelectTable={(t: any) => console.log('Table Selected:', t)} />
            </div>
          </div>
        )}

        {activePage === 'branches' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Multi-Branch Management</h1>
            {modules.multiBranch ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {branchLoading ? (
                  <div className="p-6 bg-white rounded-2xl border border-slate-200 text-slate-500">Loading branches...</div>
                ) : branches.length ? (
                  branches.map((branch: any) => (
                    <button
                      key={branch.id}
                      onClick={() => setBranch(branch)}
                      className={`text-left p-6 rounded-2xl border transition-all hover:border-blue-300 hover:shadow-sm ${currentBranch?.id === branch.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white'}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h2 className="text-lg font-semibold text-slate-900">{branch.name}</h2>
                          <p className="text-sm text-slate-500">{branch.location || 'Location not set'}</p>
                        </div>
                        {currentBranch?.id === branch.id && (
                          <span className="text-xs uppercase text-blue-600 font-bold">Selected</span>
                        )}
                      </div>
                      <div className="mt-4 text-sm text-slate-500">TRN: {branch.trn || 'N/A'}</div>
                    </button>
                  ))
                ) : (
                  <div className="p-6 bg-white rounded-2xl border border-slate-200 text-slate-500">
                    No branches found. Add at least one branch from the backend or the database seed.
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 bg-white rounded-2xl border border-slate-200 text-slate-500">
                Multi-Branch Sync is disabled. Enable it in Settings to manage branches.
              </div>
            )}
          </div>
        )}

        {activePage === 'advanced-inventory' && (
          <AdvancedInventory
            onInventoryUpdate={(inventoryData) => {
              const updatedExisting = products.map((p) => {
                const invItem = inventoryData.find((i) => i.sku === p.barcode);
                return invItem ? { ...p, name: invItem.name || p.name, image: invItem.image, stock: invItem.stock } : p;
              });
              const existingBarcodes = new Set(updatedExisting.map((product) => product.barcode));
              const newProducts = inventoryData
                .filter((item) => item.sku && !existingBarcodes.has(item.sku))
                .map((item) => ({
                  id: item.id,
                  barcode: item.sku,
                  name: item.name,
                  category: item.category,
                  price: Number(item.price || 0),
                  cost: Number(item.cost || 0),
                  stock: Number(item.stock || 0),
                  unit: item.unit || 'pcs',
                  image: item.image || null,
                }));
              const updated = normalizeProductsForPos([...updatedExisting, ...newProducts]);
              setProducts(updated);
              saveProductsToStorage(updated);
            }}
          />
        )}


        {activePage === 'accounting' && (
          <Suspense fallback={<ModuleLoadingFallback />}>
            <Accounting />
          </Suspense>
        )}

        {activePage === 'hr-payroll' && (
          <Suspense fallback={<ModuleLoadingFallback />}>
            <HRPayroll />
          </Suspense>
        )}

        {activePage === 'crm' && <CRM />}

        {activePage === 'procurement' && <Procurement />}

        {activePage === 'projects' && (
          <Suspense fallback={<ModuleLoadingFallback />}>
            <Projects />
          </Suspense>
        )}

        {activePage === 'settings-admin' && <SettingsAdmin />}

        {activePage === 'pos' && (
          <div className="flex flex-col gap-4 h-full overflow-hidden">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Point of Sale</p>
                <h1 className="mt-2 whitespace-nowrap text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">dERP - {currentBranch?.name || 'Main Branch'}</h1>
                <p className="mt-1 text-sm text-slate-500">{currentStaff.name} · {currentBranch?.location || 'Main Branch'}</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search SKU, product or barcode"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => clearCart()}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Clear Cart
                </button>
                <button
                  onClick={() => setOfflineMode((value) => !value)}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${offlineMode ? 'bg-emerald-600 text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                  {offlineMode ? 'Offline Mode On' : 'Go Offline'}
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0 overflow-hidden">
              <aside className="hidden xl:flex xl:w-56 flex-col gap-4 min-h-0 overflow-y-auto xl:max-h-[calc(100vh-7rem)] sticky top-24">
                <div className="rounded-[1.5rem] bg-slate-950/5 ring-1 ring-slate-200/70 p-5 shadow-sm backdrop-blur-xl">
                  <h2 className="text-lg font-semibold mb-4 text-slate-950">Categories</h2>
                  <div className="space-y-3">
                    {quickCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full text-left rounded-2xl px-4 py-3 text-sm font-medium transition ${selectedCategory === category ? 'bg-slate-900 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.5rem] bg-slate-950/5 ring-1 ring-slate-200/70 p-5 shadow-sm backdrop-blur-xl">
                  <h3 className="text-sm font-semibold text-slate-950 mb-4">Quick Actions</h3>
                  <button
                    onClick={previewReceipt}
                    className="mb-3 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900"
                  >
                    Preview Receipt
                  </button>
                  <button
                    onClick={() => clearCart()}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Empty Cart
                  </button>
                </div>
              </aside>

              <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-hidden">
                <div className="bg-white rounded-[1.5rem] ring-1 ring-slate-200/70 p-3 overflow-auto flex-1 min-h-0 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredProducts.slice(0, 12).map((product) => (
                      <div
                        key={product.id}
                        className="rounded-xl border border-slate-200/80 bg-slate-50 p-2 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        <button type="button" onClick={() => addToCart({ ...product, name: getProductDisplayName(product) })} className="w-full text-left">
                          <div className="flex items-start gap-3 min-w-0">
                            <img
                              src={product.image}
                              alt={getProductDisplayName(product)}
                              loading="lazy"
                              onError={(event) => {
                                event.currentTarget.onerror = null;
                                event.currentTarget.src = 'https://placehold.co/96x96/ddd/555?text=Item';
                              }}
                              className="h-14 w-14 rounded-xl object-cover shadow-sm bg-slate-100"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-sm text-slate-950 line-clamp-1">{getProductDisplayName(product)}</p>
                              <p className="mt-2 text-sm font-semibold text-slate-950">AED {product.price.toFixed(2)}</p>
                              <p className="mt-1 text-xs text-slate-500 truncate">SKU {product.barcode}</p>
                            </div>
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="flex-none w-full md:w-[380px] min-w-[320px] md:sticky md:top-24 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-100px)] pr-2 pb-10">
                <div className="bg-white rounded-[1.5rem] ring-1 ring-slate-200/70 overflow-hidden flex flex-col shadow-sm min-h-[260px]">
                  <div className="px-4 py-4 border-b border-slate-200/80">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-950">Cart Items</h2>
                        <p className="text-sm text-slate-500">Review the order before checkout.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => clearCart()}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 hover:bg-white"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-0 bg-slate-100 px-4 py-3 text-slate-500 text-[11px] uppercase tracking-[0.18em]">
                    <span className="md:col-span-2">Item</span>
                    <span>Qty</span>
                    <span>Price</span>
                    <span className="text-right">Total</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {cart.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">No items in cart yet. Tap a product to add it.</div>
                    ) : (
                      cart.map((item: any) => (
                        <div key={item.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center px-4 py-3 border-b border-slate-200/80 text-sm text-slate-700">
                          <div className="md:col-span-2">
                            <div className="font-semibold text-slate-950">{item.name}</div>
                            <div className="text-xs text-slate-500">{item.barcode || item.id}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateQty(item.id, -1)} className="rounded-full border border-slate-200 p-1 text-slate-500 hover:bg-slate-100"><Minus size={14} /></button>
                            <span className="w-6 text-center">{item.qty}</span>
                            <button onClick={() => updateQty(item.id, 1)} className="rounded-full border border-slate-200 p-1 text-slate-500 hover:bg-slate-100"><Plus size={14} /></button>
                          </div>
                          <div className="text-slate-900">AED {item.price.toFixed(2)}</div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-950">AED {(item.price * item.qty).toFixed(2)}</span>
                            <button onClick={() => removeFromCart(item.id)} className="rounded-lg p-1 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-[1.5rem] ring-1 ring-slate-200/70 p-4 flex flex-col gap-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold">{orderMode === 'return' ? 'Sales Return' : 'Checkout'}</h2>
                      <p className="text-sm text-slate-500">{orderMode === 'return' ? 'Refund items and restore stock.' : 'Complete the order and print receipt.'}</p>
                    </div>
                    <div className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold uppercase text-slate-600 tracking-[0.18em]">{paymentMethod.toUpperCase()}</div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-1">
                      <button
                        type="button"
                        onClick={() => setOrderMode('sale')}
                        className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${orderMode === 'sale' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-white'}`}
                      >
                        <ShoppingCart size={16} />
                        Sale
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrderMode('return')}
                        className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${orderMode === 'return' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-white'}`}
                      >
                        <RotateCcw size={16} />
                        Return
                      </button>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700">Customer</label>
                      <select
                        value={selectedCustomer?.id || ''}
                        onChange={(e) => {
                          const matched = customers.find((cust) => cust.id === Number(e.target.value));
                          setCustomer(matched || null);
                        }}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none"
                      >
                        <option value="">Walk-in Customer</option>
                        {customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>{customer.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700">Coupon</label>
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700">Gift Voucher</label>
                      <input
                        type="text"
                        value={giftVoucher}
                        onChange={(e) => setGiftVoucher(e.target.value)}
                        placeholder="Voucher code"
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm font-medium text-slate-700">Loyalty points</label>
                        <input
                          type="number"
                          min={0}
                          value={loyaltyPoints}
                          onChange={(e) => setLoyaltyPoints(Number(e.target.value) || 0)}
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Currency</label>
                        <select
                          value={selectedCurrency.code}
                          onChange={(e) => setSelectedCurrency(currencyOptions.find((c) => c.code === e.target.value) || currencyOptions[0])}
                          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none"
                        >
                          {currencyOptions.map((currency) => (
                            <option key={currency.code} value={currency.code}>{currency.code}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700">Table / KOT</label>
                      <select
                        value={selectedTable?.id}
                        onChange={(e) => setSelectedTable(demoTables.find((table) => table.id === Number(e.target.value)) || demoTables[0])}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none"
                      >
                        {demoTables.map((table) => (
                          <option key={table.id} value={table.id}>{table.name} — {table.status}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {paymentOptions.map((method) => (
                        <button
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`rounded-2xl border px-3 py-3 text-xs font-semibold uppercase transition ${paymentMethod === method ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setVatInclusive((value) => !value)}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                      >
                        {vatInclusive ? 'VAT Inclusive' : 'VAT Exclusive'}
                      </button>
                      <button
                        type="button"
                        onClick={holdCurrentOrder}
                        className="rounded-2xl border border-amber-500 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                      >
                        Hold Order
                      </button>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                      <div className="flex justify-between py-2"><span>Subtotal</span><span>{selectedCurrency.symbol} {totals.subtotal.toFixed(2)}</span></div>
                      <div className="flex justify-between py-2"><span>Discount</span><span>{selectedCurrency.symbol} {totals.discount.toFixed(2)}</span></div>
                      <div className="flex justify-between py-2"><span>VAT (5%)</span><span>{selectedCurrency.symbol} {totals.vat.toFixed(2)}</span></div>
                      <div className="flex justify-between pt-3 text-lg font-semibold text-slate-900 border-t border-slate-200"><span>Total</span><span>{selectedCurrency.symbol} {totals.total.toFixed(2)}</span></div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <button
                        onClick={handleCharge}
                        className={`rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition ${orderMode === 'return' ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-950 hover:bg-slate-900'}`}
                      >
                        <span className="inline-flex items-center gap-2">
                          {orderMode === 'return' ? <RotateCcw size={18} /> : <CreditCard size={18} />}
                          {orderMode === 'return' ? 'Refund' : 'Charge'} {selectedCurrency.symbol} {totals.total.toFixed(2)}
                        </span>
                      </button>
                      <button
                        onClick={previewReceipt}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                      >
                        Preview Receipt
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[1.5rem] ring-1 ring-slate-200/70 p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-950">Held Orders</h3>
                      <p className="text-xs text-slate-500">Resume or switch orders</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] uppercase text-slate-600">{heldOrders.length}</span>
                  </div>
                  {heldOrders.length === 0 ? (
                    <p className="text-sm text-slate-500">No held orders yet. Use Hold Order to keep a cart ready.</p>
                  ) : (
                    <div className="space-y-2">
                      {heldOrders.slice(0, 3).map((order: any) => (
                        <div key={order.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-800">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="font-semibold">{order.label}</div>
                              <div className="text-xs text-slate-500">{order.customer} · {order.table}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => editHeldOrder(order)}
                              className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                            >
                              <Edit3 size={14} />
                              Edit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center gap-3 text-slate-700">
                    <div className="rounded-2xl bg-slate-100 p-2">
                      <MessageSquare size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Send digital receipt</p>
                      <p className="text-xs text-slate-500">WhatsApp, email or QR code after payment.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center gap-3 text-slate-700">
                    <div className="rounded-2xl bg-slate-100 p-2">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Branch</p>
                      <p className="text-xs text-slate-500">{currentBranch?.name || 'Main Branch'}</p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}

        {editableProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h2 className="text-xl font-semibold">Edit Item</h2>
                  <p className="text-sm text-slate-500">Update the product details or upload an image.</p>
                </div>
                <button onClick={() => setEditableProduct(null)} className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">Close</button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <img
                    src={editableProduct.image || 'https://placehold.co/96x96/ddd/555?text=Item'}
                    alt={editableProduct.name}
                    className="h-28 w-28 rounded-3xl object-cover shadow-sm bg-slate-100"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = 'https://placehold.co/96x96/ddd/555?text=Item';
                    }}
                  />
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Name</label>
                      <input
                        type="text"
                        value={editableProduct.name}
                        onChange={(e) => setEditableProduct({ ...editableProduct, name: e.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Image URL</label>
                      <input
                        type="text"
                        value={editableProduct.image || ''}
                        onChange={(e) => setEditableProduct({ ...editableProduct, image: e.target.value })}
                        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">Upload image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files?.[0] || null)}
                        className="mt-2 w-full text-sm text-slate-700"
                      />
                      <p className="mt-2 text-xs text-slate-500">Choose a local image file to upload and save it with the product.</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editableProduct.price}
                      onChange={(e) => setEditableProduct({ ...editableProduct, price: Number(e.target.value) || 0 })}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">SKU / Barcode</label>
                    <input
                      type="text"
                      value={editableProduct.barcode}
                      onChange={(e) => setEditableProduct({ ...editableProduct, barcode: e.target.value })}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Category</label>
                    <input
                      type="text"
                      value={editableProduct.category}
                      onChange={(e) => setEditableProduct({ ...editableProduct, category: e.target.value })}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Stock</label>
                    <input
                      type="number"
                      value={editableProduct.stock}
                      onChange={(e) => setEditableProduct({ ...editableProduct, stock: Number(e.target.value) || 0 })}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row sm:justify-end">
                <button onClick={() => setEditableProduct(null)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100">Cancel</button>
                <button onClick={saveProductEdits} className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-900">Save changes</button>
              </div>
            </div>
          </div>
        )}

        {isReceiptPreviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h2 className="text-xl font-semibold">Receipt Preview</h2>
                  <p className="text-sm text-slate-500">Check the printed receipt layout before finalizing.</p>
                </div>
                <button onClick={() => setIsReceiptPreviewOpen(false)} className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">Close</button>
              </div>
              <div className="max-h-[75vh] overflow-auto bg-slate-100 p-4">
                <iframe
                  title="Receipt Preview"
                  srcDoc={receiptHtml}
                  className="h-[55vh] w-full rounded-2xl border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      </main>
    </div>
  );
}
