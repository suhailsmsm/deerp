import { create } from 'zustand';
import { posService } from '../services/api';
import * as db from '../db/database';
import * as sync from '../db/syncService';

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

  // Initialize database on store creation
  init: async () => {
    try {
      await db.initDatabase();
      await sync.initSyncSystem();
      get().updateSyncStatus();
      console.log('✅ POS Store initialized with offline-first mode');
    } catch (error) {
      console.error('❌ Failed to initialize POS Store:', error);
      set({ error: 'Failed to initialize database' });
    }
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
      // Try API first, fallback to local calculation
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

  // OPTIMISTIC WRITE: Save to local DB first, then sync to server
  createTransaction: async () => {
    set({ isLoading: true, error: null });
    try {
      const state = get();
      const now = new Date().toISOString();
      
      // Create transaction object
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

      // STEP 1: Save to local database immediately (optimistic write)
      await db.saveTransaction(transaction);
      console.log('💾 Transaction saved locally:', transaction.transactionId);

      // STEP 2: Update local stock immediately
      for (const item of transaction.items) {
        await db.updateProductStock(item.productId, item.quantity);
      }

      // STEP 3: Try to sync to server in background
      const isConnected = await sync.checkConnectivity();
      
      if (isConnected) {
        // Fire-and-forget sync (don't wait for response)
        sync.syncPendingTransactions().catch(err => {
          console.error('Background sync failed:', err);
        });
      } else {
        console.log('📡 Offline: Transaction queued for sync');
      }

      // Clear cart and update UI immediately
      get().clearCart();
      set({ isLoading: false });
      
      // Update sync status
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
      return await db.getLocalTransactions(limit, offset);
    } catch (error) {
      console.error('Failed to get local transactions:', error);
      return [];
    }
  },

  // Update sync status
  updateSyncStatus: async () => {
    try {
      const status = await sync.getSyncStatus();
      set({ syncStatus: status });
    } catch (error) {
      console.error('Failed to update sync status:', error);
    }
  },

  // Manual sync trigger
  triggerSync: async () => {
    set({ isLoading: true });
    try {
      const result = await sync.triggerManualSync();
      get().updateSyncStatus();
      return result;
    } catch (error) {
      console.error('Manual sync failed:', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
