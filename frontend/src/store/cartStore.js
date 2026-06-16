import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
  // Cart state
  cart: [],
  heldOrders: [],
  
  // Customer & localization
  language: 'en', // 'en' or 'ar'
  selectedCustomer: null,
  selectedTable: null,
  
  // Pricing
  discount: null, // { type: 'percentage' | 'fixed', value: number, code?: string }
  vatRate: 0.05, // UAE Standard VAT (5%)
  vatInclusive: false,
  selectedCurrency: { code: 'AED', symbol: 'د.إ', rate: 1 },
  
  // Payment
  paymentMethod: 'cash',
  splitPayments: [],
  
  // Order state
  orderMode: 'sale', // 'sale' | 'return' | 'exchange'
  couponCode: '',
  loyaltyPoints: 0,
  
  // Actions
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
  
  updateCartItem: (id, updates) => set((state) => ({
    cart: state.cart.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    ),
  })),
  
  setCart: (items) => set({ cart: items }),
  clearCart: () => set({ cart: [], discount: null, couponCode: '' }),
  
  updateQty: (id, delta) => set((state) => ({
    cart: state.cart.map((item) =>
      item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item
    ).filter(item => item.qty > 0)
  })),
  
  setQty: (id, qty) => set((state) => ({
    cart: state.cart.map((item) =>
      item.id === id ? { ...item, qty: Math.max(0, qty) } : item
    ).filter(item => item.qty > 0)
  })),
  
  // Localization
  setLanguage: (lang) => set({ language: lang }),
  
  // Customer & Table
  setCustomer: (customer) => set({ selectedCustomer: customer }),
  setTable: (table) => set({ selectedTable: table }),
  
  // Discount
  setDiscount: (discount) => set({ discount }),
  applyCoupon: (code) => set({ couponCode: code }),
  
  // VAT
  setVatInclusive: (val) => set({ vatInclusive: val }),
  setVatRate: (rate) => set({ vatRate: rate }),
  
  // Currency
  setCurrency: (currency) => set({ selectedCurrency: currency }),
  
  // Payment
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setSplitPayments: (splits) => set({ splitPayments: splits }),
  
  // Order mode
  setOrderMode: (mode) => set({ orderMode: mode }),
  
  // Loyalty
  setLoyaltyPoints: (points) => set({ loyaltyPoints: points }),
  applyLoyaltyPoints: (points) => set({ loyaltyPoints: points }),
  
  // Held Orders
  holdOrder: (order) => set((state) => ({
    heldOrders: [order, ...state.heldOrders],
    cart: [],
    selectedCustomer: null,
    discount: null,
  })),
  
  recallOrder: (order) => set(() => ({
    cart: order.items,
    selectedCustomer: order.customer ? { name: order.customer } : null,
    heldOrders: get().heldOrders.filter((o) => o.id !== order.id),
  })),
  
  deleteHeldOrder: (orderId) => set((state) => ({
    heldOrders: state.heldOrders.filter((o) => o.id !== orderId),
  })),
  
  // Calculation selectors
  getTotals: (state) => {
    let subtotal = state.cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    
    // Apply discount
    let discountAmount = 0;
    if (state.discount) {
      discountAmount = state.discount.type === 'percentage'
        ? (subtotal * state.discount.value / 100)
        : state.discount.value;
    }
    
    // Handle VAT
    let vatAmount = 0;
    let finalTotal = 0;
    
    if (state.vatInclusive) {
      // VAT inclusive: Total includes VAT
      finalTotal = subtotal - discountAmount;
      vatAmount = finalTotal - (finalTotal / (1 + state.vatRate));
      subtotal = finalTotal - vatAmount;
    } else {
      // VAT exclusive: Add VAT on top
      const afterDiscount = Math.max(0, subtotal - discountAmount);
      vatAmount = afterDiscount * state.vatRate;
      finalTotal = afterDiscount + vatAmount;
    }
    
    // Currency conversion
    const converted = {
      subtotal: subtotal * state.selectedCurrency.rate,
      discount: discountAmount * state.selectedCurrency.rate,
      vat: vatAmount * state.selectedCurrency.rate,
      total: finalTotal * state.selectedCurrency.rate,
    };
    
    return {
      ...converted,
      subtotalAED: subtotal,
      discountAED: discountAmount,
      vatAED: vatAmount,
      totalAED: finalTotal,
      currency: state.selectedCurrency,
      discountInfo: state.discount,
    };
  },
  
  // Convert amount to selected currency
  convertCurrency: (amount) => {
    const state = get();
    return amount * state.selectedCurrency.rate;
  },
}));
