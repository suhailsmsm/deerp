/**
 * DerpX POS - POS Store
 * Manages cart, products, and point of sale operations
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Cart, CartItem, Product, Category, Order, PaymentMethod, OrderType } from '@/types';
import { UAE } from '@/constants';

// Demo orders for persistence
const demoOrders: Order[] = [
  {
    id: 'order_1',
    orderNumber: 'ORD-20260526-001',
    items: [{
      id: 'item_1',
      productId: '1',
      name: 'Receipt Rolls 6Pcs',
      sku: 'PR-001',
      price: 25,
      quantity: 2,
      discount: 0,
      vatRate: 0.05,
      vatAmount: 2.5,
      total: 52.5,
      status: 'pending',
    }],
    customerId: '1',
    orderType: 'takeaway',
    status: 'completed',
    paymentStatus: 'paid',
    subtotal: 50,
    discount: 0,
    vatAmount: 2.5,
    total: 52.5,
    payments: [],
    cashierId: 'cashier_1',
    createdAt: new Date('2026-05-26T10:30:00'),
    updatedAt: new Date('2026-05-26T10:30:00'),
    completedAt: new Date('2026-05-26T10:30:00'),
  },
  {
    id: 'order_2',
    orderNumber: 'ORD-20260526-002',
    items: [{
      id: 'item_2',
      productId: '8',
      name: 'POS Machine',
      sku: 'HW-001',
      price: 2500,
      quantity: 1,
      discount: 100,
      vatRate: 0.05,
      vatAmount: 120,
      total: 2520,
      status: 'pending',
    }],
    customerId: '2',
    orderType: 'takeaway',
    status: 'completed',
    paymentStatus: 'paid',
    subtotal: 2400,
    discount: 100,
    vatAmount: 120,
    total: 2520,
    payments: [],
    cashierId: 'cashier_1',
    createdAt: new Date('2026-05-26T11:15:00'),
    updatedAt: new Date('2026-05-26T11:15:00'),
    completedAt: new Date('2026-05-26T11:15:00'),
  },
  {
    id: 'order_3',
    orderNumber: 'ORD-20260526-003',
    items: [{
      id: 'item_3',
      productId: '6',
      name: 'Software Renewal',
      sku: 'SW-001',
      price: 500,
      quantity: 3,
      discount: 0,
      vatRate: 0.05,
      vatAmount: 75,
      total: 1575,
      status: 'pending',
    }],
    customerId: '3',
    orderType: 'takeaway',
    status: 'completed',
    paymentStatus: 'paid',
    subtotal: 1500,
    discount: 0,
    vatAmount: 75,
    total: 1575,
    payments: [],
    cashierId: 'cashier_1',
    createdAt: new Date('2026-05-26T14:00:00'),
    updatedAt: new Date('2026-05-26T14:00:00'),
    completedAt: new Date('2026-05-26T14:00:00'),
  },
];

interface POSState {
  // Cart
  cart: Cart | null;

  // Products & Categories
  products: Product[];
  categories: Category[];
  selectedCategory?: string;

  // Search & Filter
  searchQuery: string;
  filteredProducts: Product[];

  // Wishlist
  wishlist: Set<string>;

  // Orders
  orders: Order[];

  // Loading States
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  whatsappNotificationUrl?: string; // WhatsApp URL for order notification

  // Actions
  initializeCart: (cashierId: string, branchId?: string) => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setDiscount: (discount: number, type: 'percentage' | 'fixed') => void;
  setCustomer: (customerId: string) => void;
  setTable: (tableId: string) => void;
  setOrderType: (orderType: OrderType) => void;
  addNote: (note: string) => void;

  // Product Management
  loadProducts: () => Promise<void>;
  loadCategories: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (categoryId?: string) => void;
  setProducts: (products: Product[]) => void;
  setCategories: (categories: Category[]) => void;

  // Wishlist Actions
  toggleWishlist: (productId: string) => void;
  clearWishlist: () => void;

  // Order Actions
  getOrders: () => Order[];
  getOrdersByCustomer: (customerId: string) => Order[];
  clearOrders: () => void;

  // Order Processing
  processOrder: () => Promise<Order>;
  holdCart: () => void;
  resumeCart: (cart: Cart) => void;
  
  // Computed - these are recalculated on every state change via subscribe
  subtotal: number;
  discountAmount: number;
  vatAmount: number;
  total: number;
  itemCount: number;
}

const createEmptyCart = (cashierId: string, branchId?: string): Cart => ({
  id: 'cart_' + Date.now(),
  items: [],
  orderType: 'takeaway',
  discountType: 'fixed',
  cashierId,
  branchId,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const calculateCartTotals = (cart: Cart | null) => {
  if (!cart || cart.items.length === 0) {
    return { subtotal: 0, discountAmount: 0, vatAmount: 0, total: 0, itemCount: 0 };
  }

  const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  let discountAmount = 0;
  if (cart.discount) {
    discountAmount = cart.discountType === 'percentage'
      ? (cart.discount / 100) * subtotal
      : cart.discount;
  }

  const taxableAmount = subtotal - discountAmount;
  const vatAmount = taxableAmount * UAE.vatRate;
  const total = taxableAmount + vatAmount;
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return { subtotal, discountAmount, vatAmount, total, itemCount };
};

// Helper to recalculate totals from cart and merge into state update
const withTotals = (partial: Partial<POSState>) => {
  const cart = (partial as any).cart !== undefined ? (partial as any).cart : undefined;
  if (cart !== undefined) {
    return { ...partial, ...calculateCartTotals(cart) };
  }
  return partial;
};

export const usePosStore = create<POSState>()(
  persist(
    (set, get) => ({
      // Initial State
      cart: null,
      subtotal: 0,
      discountAmount: 0,
      vatAmount: 0,
      total: 0,
      itemCount: 0,
      products: [],
      categories: [],
      selectedCategory: undefined,
      searchQuery: '',
      filteredProducts: [],
      wishlist: new Set<string>(),
      orders: demoOrders,
      isLoading: false,
      isProcessing: false,
      error: null,

      // Cart Actions
      initializeCart: (cashierId: string, branchId?: string) => {
        const newCart = createEmptyCart(cashierId, branchId);
        set(withTotals({ cart: newCart }));
      },

      addToCart: (product: Product, quantity: number = 1) => {
        const { cart } = get();
        if (!cart) return;

        const existingItem = cart.items.find((item) => item.productId === product.id);

        let newItems: CartItem[];
        if (existingItem) {
          newItems = cart.items.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          const newItem: CartItem = {
            id: 'item_' + Date.now(),
            productId: product.id,
            name: product.name,
            sku: product.sku,
            barcode: product.barcode,
            price: product.salePrice || product.basePrice,
            quantity,
            image: product.images?.[0],
          };
          newItems = [...cart.items, newItem];
        }

        set(withTotals({
          cart: {
            ...cart,
            items: newItems,
            updatedAt: new Date(),
          },
        }));
      },

      removeFromCart: (itemId: string) => {
        const { cart } = get();
        if (!cart) return;

        set(withTotals({
          cart: {
            ...cart,
            items: cart.items.filter((item) => item.id !== itemId),
            updatedAt: new Date(),
          },
        }));
      },

      updateQuantity: (itemId: string, quantity: number) => {
        const { cart } = get();
        if (!cart) return;

        if (quantity <= 0) {
          get().removeFromCart(itemId);
          return;
        }

        set(withTotals({
          cart: {
            ...cart,
            items: cart.items.map((item) =>
              item.id === itemId ? { ...item, quantity } : item
            ),
            updatedAt: new Date(),
          },
        }));
      },

      clearCart: () => {
        const { cart, initializeCart } = get();
        if (!cart) return;
        
        initializeCart(cart.cashierId, cart.branchId);
      },

      setDiscount: (discount: number, type: 'percentage' | 'fixed') => {
        const { cart } = get();
        if (!cart) return;

        const newCart = { ...cart, discount, discountType: type, updatedAt: new Date() };
        set(withTotals({ cart: newCart }));
      },

      setCustomer: (customerId: string) => {
        const { cart } = get();
        if (!cart) return;

        set(withTotals({
          cart: { ...cart, customerId, updatedAt: new Date() },
        }));
      },

      setTable: (tableId: string) => {
        const { cart } = get();
        if (!cart) return;

        set(withTotals({
          cart: { ...cart, tableId, updatedAt: new Date() },
        }));
      },

      setOrderType: (orderType: OrderType) => {
        const { cart } = get();
        if (!cart) return;

        set(withTotals({
          cart: { ...cart, orderType, updatedAt: new Date() },
        }));
      },

      addNote: (note: string) => {
        const { cart } = get();
        if (!cart) return;

        set(withTotals({
          cart: { ...cart, notes: note, updatedAt: new Date() },
        }));
      },

      // Wishlist Actions
      toggleWishlist: (productId: string) => {
        const { wishlist } = get();
        const newWishlist = new Set(wishlist);
        if (newWishlist.has(productId)) {
          newWishlist.delete(productId);
        } else {
          newWishlist.add(productId);
        }
        set({ wishlist: newWishlist });
      },

      clearWishlist: () => {
        set({ wishlist: new Set<string>() });
      },

      // Order Actions
      getOrders: () => {
        return get().orders;
      },
      getOrdersByCustomer: (customerId: string) => {
        return get().orders.filter((order) => order.customerId === customerId);
      },
      clearOrders: () => {
        set({ orders: [] });
      },

      // Product Management
      loadProducts: async () => {
        set({ isLoading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));

          const mockProducts: Product[] = [
            // Paper Rolls
            { id: '1', name: 'Receipt Rolls 6Pcs', sku: 'PR-001', barcode: '1234567890123', basePrice: 25, stock: 100, trackInventory: true, allowBackorder: true, isAvailable: true, categoryId: 'paper-rolls', images: [], createdAt: new Date(), updatedAt: new Date() },
            { id: '2', name: 'Barcode Rolls 6Pcs', sku: 'PR-002', barcode: '1234567890124', basePrice: 30, stock: 80, trackInventory: true, allowBackorder: true, isAvailable: true, categoryId: 'paper-rolls', images: [], createdAt: new Date(), updatedAt: new Date() },
            { id: '3', name: 'Bank Rolls 6 Pcs', sku: 'PR-003', barcode: '1234567890125', basePrice: 28, stock: 90, trackInventory: true, allowBackorder: true, isAvailable: true, categoryId: 'paper-rolls', images: [], createdAt: new Date(), updatedAt: new Date() },
            // Paper Boxes
            { id: '4', name: 'Thermal Paper Box', sku: 'PB-001', barcode: '1234567890126', basePrice: 120, stock: 50, trackInventory: true, allowBackorder: true, isAvailable: true, categoryId: 'paper-boxes', images: [], createdAt: new Date(), updatedAt: new Date() },
            { id: '5', name: 'Scale Paper Box', sku: 'PB-002', barcode: '1234567890127', basePrice: 150, stock: 40, trackInventory: true, allowBackorder: true, isAvailable: true, categoryId: 'paper-boxes', images: [], createdAt: new Date(), updatedAt: new Date() },
            // Software
            { id: '6', name: 'Software Renewal', sku: 'SW-001', barcode: '1234567890128', basePrice: 500, stock: 999, trackInventory: false, allowBackorder: true, isAvailable: true, categoryId: 'software', images: [], createdAt: new Date(), updatedAt: new Date() },
            { id: '7', name: 'New Software', sku: 'SW-002', barcode: '1234567890129', basePrice: 1500, stock: 999, trackInventory: false, allowBackorder: true, isAvailable: true, categoryId: 'software', images: [], createdAt: new Date(), updatedAt: new Date() },
            // Hardware
            { id: '8', name: 'POS Machine', sku: 'HW-001', barcode: '1234567890130', basePrice: 2500, stock: 20, trackInventory: true, allowBackorder: true, isAvailable: true, categoryId: 'hardware', images: [], createdAt: new Date(), updatedAt: new Date() },
            { id: '9', name: 'Receipt Printer', sku: 'HW-002', barcode: '1234567890131', basePrice: 800, stock: 30, trackInventory: true, allowBackorder: true, isAvailable: true, categoryId: 'hardware', images: [], createdAt: new Date(), updatedAt: new Date() },
            { id: '10', name: 'Cash Drawer', sku: 'HW-003', barcode: '1234567890132', basePrice: 450, stock: 25, trackInventory: true, allowBackorder: true, isAvailable: true, categoryId: 'hardware', images: [], createdAt: new Date(), updatedAt: new Date() },
            // Services
            { id: '11', name: 'POS Repair Service', sku: 'SR-001', barcode: '1234567890133', basePrice: 200, stock: 999, trackInventory: false, allowBackorder: true, isAvailable: true, categoryId: 'services', images: [], createdAt: new Date(), updatedAt: new Date() },
            { id: '12', name: 'Refer Client', sku: 'SR-002', barcode: '1234567890134', basePrice: 100, stock: 999, trackInventory: false, allowBackorder: true, isAvailable: true, categoryId: 'services', images: [], createdAt: new Date(), updatedAt: new Date() },
          ];

          set({ products: mockProducts, filteredProducts: mockProducts, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to load products', isLoading: false });
        }
      },

      loadCategories: async () => {
        set({ isLoading: true });
        try {
          await new Promise((resolve) => setTimeout(resolve, 500));

          const mockCategories: Category[] = [
            { id: 'all', name: 'All Items', sortOrder: 0, isActive: true },
            { id: 'paper-rolls', name: 'Paper Rolls', sortOrder: 1, isActive: true },
            { id: 'paper-boxes', name: 'Paper Boxes', sortOrder: 2, isActive: true },
            { id: 'software', name: 'Software', sortOrder: 3, isActive: true },
            { id: 'hardware', name: 'Hardware', sortOrder: 4, isActive: true },
            { id: 'services', name: 'Services', sortOrder: 5, isActive: true },
          ];

          set({ categories: mockCategories, isLoading: false });
        } catch (error) {
          set({ error: 'Failed to load categories', isLoading: false });
        }
      },

      setProducts: (products: Product[]) => {
        const { searchQuery, selectedCategory } = get();
        
        // Apply current filters
        let filtered = products;
        if (selectedCategory && selectedCategory !== 'all') {
          filtered = filtered.filter(p => p.categoryId === selectedCategory);
        }
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.name.toLowerCase().includes(searchLower) ||
              p.sku.toLowerCase().includes(searchLower) ||
              p.barcode?.toLowerCase().includes(searchLower)
          );
        }

        set({ products, filteredProducts: filtered });
      },

      setCategories: (categories: Category[]) => {
        set({ categories });
      },

      setSearchQuery: (query: string) => {
        const { products, selectedCategory } = get();
        
        let filtered = products;

        if (query) {
          const searchLower = query.toLowerCase();
          filtered = filtered.filter(
            (product) =>
              product.name.toLowerCase().includes(searchLower) ||
              product.sku.toLowerCase().includes(searchLower) ||
              product.barcode?.toLowerCase().includes(searchLower)
          );
        }

        if (selectedCategory && selectedCategory !== 'all') {
          filtered = filtered.filter((product) => product.categoryId === selectedCategory);
        }

        set({ searchQuery: query, filteredProducts: filtered });
      },

      setSelectedCategory: (categoryId?: string) => {
        const { products, searchQuery } = get();
        
        let filtered = products;

        if (categoryId && categoryId !== 'all') {
          filtered = filtered.filter((product) => product.categoryId === categoryId);
        }

        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (product) =>
              product.name.toLowerCase().includes(searchLower) ||
              product.sku.toLowerCase().includes(searchLower)
          );
        }

        set({ selectedCategory: categoryId, filteredProducts: filtered });
      },

      // Order Processing
      processOrder: async () => {
        const { cart } = get();
        if (!cart || cart.items.length === 0) {
          throw new Error('Cart is empty');
        }

        set({ isProcessing: true });

        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const { subtotal, discountAmount, vatAmount, total } = calculateCartTotals(cart);

          const order: Order = {
            id: 'order_' + Date.now(),
            orderNumber: 'ORD-' + Date.now(),
            items: cart.items.map((item) => ({
              id: item.id,
              productId: item.productId,
              name: item.name,
              sku: item.sku,
              price: item.price,
              quantity: item.quantity,
              discount: 0,
              vatRate: UAE.vatRate,
              vatAmount: (item.price * item.quantity) * UAE.vatRate,
              total: (item.price * item.quantity) * (1 + UAE.vatRate),
              status: 'pending',
            })),
            orderType: cart.orderType,
            status: 'completed',
            paymentStatus: 'paid',
            subtotal,
            discount: discountAmount,
            vatAmount,
            total,
            payments: [],
            cashierId: cart.cashierId,
            branchId: cart.branchId,
            customerId: cart.customerId,
            tableId: cart.tableId,
            notes: cart.notes,
            createdAt: new Date(),
            updatedAt: new Date(),
            completedAt: new Date(),
          };

          // Save order to store
          set((state) => ({ orders: [order, ...state.orders] }));

          // Clear cart after successful order
          get().clearCart();
          set({ isProcessing: false });

          // Send WhatsApp notification to merchant
          const { useSettingsStore } = require('./settingsStore');
          const { merchantPhone } = useSettingsStore.getState();
          if (merchantPhone) {
            const orderItems = order.items.map(item => `${item.quantity}x ${item.name}`).join('\n');
            const message = `🛒 *New Order Received*\n\nOrder #: ${order.orderNumber}\n\n*Items:*\n${orderItems}\n\n*Subtotal:* AED ${subtotal.toFixed(2)}\n*VAT (5%):* AED ${vatAmount.toFixed(2)}\n*Total:* AED ${total.toFixed(2)}\n\nThank you!`;
            const whatsappUrl = `https://wa.me/${merchantPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;

            // Store WhatsApp URL for UI to open
            set({ whatsappNotificationUrl: whatsappUrl });
          }

          return order;
        } catch (error) {
          set({ error: 'Failed to process order', isProcessing: false });
          throw error;
        }
      },

      holdCart: () => {
        const { cart } = get();
        if (!cart) return;

        console.log('Holding cart:', cart.id);
        set(withTotals({ cart: null }));
      },

      resumeCart: (cart: Cart) => {
        set(withTotals({ cart }));
      },
    }),
    {
      name: 'derpx-pos',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        cart: state.cart,
        orders: state.orders,
      }),
      // Recalculate totals after rehydrating from storage
      onRehydrateStorage: () => (state) => {
        if (state && state.cart) {
          const totals = calculateCartTotals(state.cart);
          Object.assign(state, totals);
        }
      },
    }
  )
);