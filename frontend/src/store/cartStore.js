import { create } from 'zustand';

export const useCartStore = create((set) => ({
  cart: [],
  language: 'en', // 'en' or 'ar'
  selectedCustomer: null,
  discount: 0,
  vatRate: 0.05, // UAE Standard VAT
  vatInclusive: false,
  addToCart: (product) => set((state) => {
    const existing = state.cart.find((item) => item.id === product.id);
    if (existing) {
      return {
        cart: state.cart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        ),
      };
    }
    return { cart: [...state.cart, { ...product, qty: 1 }] };
  }),
  removeFromCart: (id) => set((state) => ({
    cart: state.cart.filter((item) => item.id !== id),
  })),
  setCart: (items) => set({ cart: items }),
  clearCart: () => set({ cart: [] }),
  updateQty: (id, delta) => set((state) => ({
    cart: state.cart.map((item) =>
      item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item
    ).filter(item => item.qty > 0)
  })),
  setLanguage: (lang) => set({ language: lang }),
  setCustomer: (customer) => set({ selectedCustomer: customer }),
  setDiscount: (amt) => set({ discount: amt }),
  setVatInclusive: (val) => set({ vatInclusive: val }),
  
  // Calculation selectors
  getTotals: (state) => {
    let subtotal = state.cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    
    if (state.vatInclusive) {
      // If inclusive, back-calculate subtotal: Total / 1.05
      const total = subtotal;
      subtotal = total / (1 + state.vatRate);
    }

    const afterDiscount = Math.max(0, subtotal - state.discount);
    const vat = afterDiscount * state.vatRate;
    return {
      subtotal,
      discount: state.discount,
      vat,
      total: afterDiscount + vat
    };
  }
}));
