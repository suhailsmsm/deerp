import { create } from 'zustand';
import { posService } from '../services/api';

export const usePosStore = create((set, get) => ({
  cart: [],
  subtotal: 0,
  vat: 0,
  total: 0,
  discount: 0,
  paymentMethod: 'cash',
  isLoading: false,
  error: null,

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
      const taxData = await posService.calculateTax(subtotal);
      set({
        subtotal: taxData.subtotal,
        vat: taxData.vat,
        total: taxData.total - state.discount,
      });
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

  createTransaction: async () => {
    set({ isLoading: true, error: null });
    try {
      const state = get();
      const transaction = await posService.createTransaction({
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
      });

      get().clearCart();
      set({ isLoading: false });
      return transaction;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Transaction failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
