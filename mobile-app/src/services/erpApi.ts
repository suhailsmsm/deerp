/**
 * ERP API Service
 * Connects to main deerp ERP backend for products, categories, and orders
 */

import axios from 'axios';

// API base URL - configure via environment or use default
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add auth token interceptor
api.interceptors.request.use(
  (config) => {
    // Token will be added from auth store
    const token = null; // TODO: Get from secure storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // TODO: Handle token refresh or logout
      console.log('Unauthorized - token may be expired');
    }
    return Promise.reject(error);
  }
);

export const erpApi = {
  // Products
  getProducts: async (params?: { search?: string; category?: string }) => {
    const response = await api.get('/pos/products', { params });
    // Map ERP format to mobile app format
    return response.data.map((p: any) => ({
      id: p.id,
      name: p.name,
      sku: p.barcode || p.id,
      barcode: p.barcode,
      categoryId: p.category,
      basePrice: p.price,
      salePrice: p.price, // Can be different if on sale
      costPrice: p.cost,
      stock: p.stock,
      trackInventory: true,
      allowBackorder: false,
      isAvailable: p.stock > 0,
      images: p.image ? [p.image] : [],
      description: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  },

  getProductByBarcode: async (barcode: string) => {
    const response = await api.get(`/pos/products/${barcode}`);
    const p = response.data;
    return {
      id: p.id,
      name: p.name,
      sku: p.barcode || p.id,
      barcode: p.barcode,
      categoryId: p.category,
      basePrice: p.price,
      salePrice: p.price,
      costPrice: p.cost,
      stock: p.stock,
      trackInventory: true,
      allowBackorder: false,
      isAvailable: p.stock > 0,
      images: p.image ? [p.image] : [],
      description: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  },

  // Categories
  getCategories: async () => {
    const response = await api.get('/pos/categories');
    return response.data.map((c: any) => ({
      id: c.id || c.name.toLowerCase().replace(/\s+/g, '-'),
      name: c.name,
      sortOrder: c.sortOrder || 0,
      isActive: true,
    }));
  },

  // Orders
  createOrder: async (orderData: any) => {
    const response = await api.post('/pos/orders', orderData);
    return response.data;
  },

  getOrders: async (params?: { customerId?: string; status?: string }) => {
    const response = await api.get('/pos/orders', { params });
    return response.data;
  },

  // CRM
  getCustomers: async () => {
    const response = await api.get('/crm/customers');
    return response.data;
  },

  createCustomer: async (customerData: any) => {
    const response = await api.post('/crm/customers', customerData);
    return response.data;
  },

  updateCustomer: async (id: string, customerData: any) => {
    const response = await api.put(`/crm/customers/${id}`, customerData);
    return response.data;
  },

  deleteCustomer: async (id: string) => {
    const response = await api.delete(`/crm/customers/${id}`);
    return response.data;
  },

  // Settings
  getProfile: async () => {
    const response = await api.get('/settings/profile');
    return response.data;
  },

  // Calculate tax
  calculateTax: async (subtotal: number) => {
    const response = await api.post('/pos/calculate-tax', { subtotal });
    return response.data;
  },
};

export default api;
