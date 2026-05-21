import { create } from 'zustand';
import { posService } from '../services/api';

// Platform detection
const isWeb = typeof window !== 'undefined' && !window.navigator?.product?.includes('ReactNative');

export const usePosStore = create((set, get) => ({
  cart: [],
  subtotal: 0,
  vat: 0,
  total: 0,
  discount: 0,
  paymentMethod: 'cash',
  isLoading: false,
  error: null,
  syncStatus: { online: true, pending: 0, unsynced: 0 },

  // Initialize store
  init: async () => {
    if (isWeb) {
      console.log('🌐 Web platform initialized');
    } else {
      console.log('📱 Native platform initialized');
      // Native: initialize database
      try {
        const { initDatabase, initSyncSystem } = await import('../db');
        await initDatabase();
        await initSyncSystem();
        console.log('✅ Database initialized');
      } catch (error) {
        console.error('❌ Database init failed:', error);
      }
    }
    get().updateSyncStatus();
  },

  addItem: (product, quantity = 1) => {
    set((state) => {
      const existingItem = state.cart.find((item) => item.id === product.id);

      let newCart;
      if (existingItem) {
        newCart = state.cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newCart = [...state.cart, { ...product, quantity }];
      }

      return { cart: newCart };
    });

    get().recalculateTotal();
  },

  updateItemQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
    } else {
      set((state) => ({
        cart: state.cart.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        ),
      }));
      get().recalculateTotal();
    }
  },

  removeItem: (productId) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== productId),
    }));
    get().recalculateTotal();
  },

  clearCart: () => {
    set({
      cart: [],
      subtotal: 0,
      vat: 0,
      total: 0,
      discount: 0,
    });
  },

  recalculateTotal: async () => {
    const state = get();
    const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    try {
      try {
        const taxData = await posService.calculateTax(subtotal);
        set({
          subtotal: taxData.subtotal,
          vat: taxData.vat,
          total: taxData.total - state.discount,
        });
      } catch (error) {
        // Local calculation fallback
        const vat = subtotal * 0.05; // 5% UAE VAT
        const total = subtotal + vat - state.discount;
        set({ subtotal, vat, total });
      }
    } catch (error) {
      console.error('Failed to calculate tax:', error);
    }
  },

  setDiscount: (discount) => {
    const state = get();
    set({
      discount,
      total: state.total - discount,
    });
  },

  setPaymentMethod: (method) => {
    set({ paymentMethod: method });
  },

  // Create transaction with offline support
  createTransaction: async () => {
    set({ isLoading: true, error: null });
    try {
      const state = get();
      const now = new Date().toISOString();
      
      const transaction = {
        transactionId: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        items: state.cart.map((item) => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: state.subtotal,
        vat: state.vat,
        total: state.total,
        discount: state.discount,
        method: state.paymentMethod,
        createdAt: now,
        updatedAt: now,
      };

      if (isWeb) {
        // Web: save to localStorage
        console.log('🌐 Saving to localStorage');
        const existingTransactions = JSON.parse(
          localStorage.getItem('pos_transactions') || '[]'
        );
        localStorage.setItem(
          'pos_transactions',
          JSON.stringify([transaction, ...existingTransactions])
        );
      } else {
        // Native: save to SQLite
        console.log('💾 Saving to SQLite');
        const { saveTransaction, updateProductStock } = await import('../db/index');
        await saveTransaction(transaction);
        for (const item of transaction.items) {
          await updateProductStock(item.productId, item.quantity);
        }
      }

      get().clearCart();
      set({ isLoading: false });
      get().updateSyncStatus();
      
      return transaction;
    } catch (error) {
      const errorMessage = error.message || 'Transaction failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  // Get local transactions
  getLocalTransactions: async (limit = 50, offset = 0) => {
    try {
      if (isWeb) {
        const transactions = JSON.parse(
          localStorage.getItem('pos_transactions') || '[]'
        );
        return transactions.slice(offset, offset + limit);
      } else {
        const { getLocalTransactions } = await import('../db');
        return await getLocalTransactions(limit, offset);
      }
    } catch (error) {
      console.error('Failed to get local transactions:', error);
      return [];
    }
  },

  // Update sync status
  updateSyncStatus: async () => {
    try {
      if (isWeb) {
        const transactions = JSON.parse(
          localStorage.getItem('pos_transactions') || '[]'
        );
        set({ 
          syncStatus: {
            online: navigator.onLine,
            pending: 0,
            unsynced: transactions.filter(t => !t.synced).length,
            failed: 0,
          }
        });
      } else {
        const { getSyncStatus } = await import('../db');
        const status = await getSyncStatus();
        set({ syncStatus: status });
      }
    } catch (error) {
      console.error('Failed to update sync status:', error);
    }
  },

  // Manual sync trigger
  triggerSync: async () => {
    set({ isLoading: true });
    try {
      if (isWeb) {
        console.log('🌐 Web mode: sync not available');
        return { transactions: { synced: 0, failed: 0 }, queue: { processed: 0, failed: 0 }, stats: {} };
      } else {
        const { triggerManualSync } = await import('../db');
        const result = await triggerManualSync();
        get().updateSyncStatus();
        return result;
      }
    } catch (error) {
      console.error('Manual sync failed:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
