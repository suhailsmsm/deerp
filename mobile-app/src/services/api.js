import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          await SecureStore.setItemAsync('accessToken', response.data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email, password, tenantId, deviceId) => {
    const response = await api.post('/auth/login', {
      email,
      password,
      tenantId,
      deviceId,
    });
    return response.data;
  },

  refresh: async (refreshToken) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
  },
};

export const posService = {
  getProducts: async (search = '', category = '') => {
    const response = await api.get('/pos/products', {
      params: { search, category },
    });
    return response.data;
  },

  getProductByBarcode: async (barcode) => {
    const response = await api.get(`/pos/products/${barcode}`);
    return response.data;
  },

  calculateTax: async (subtotal) => {
    const response = await api.post('/pos/calculate-tax', { subtotal });
    return response.data;
  },

  createTransaction: async (transaction) => {
    const response = await api.post('/pos/transactions', transaction);
    return response.data;
  },

  getTransactions: async (limit = 50, offset = 0, method = '') => {
    const response = await api.get('/pos/transactions', {
      params: { limit, offset, method },
    });
    return response.data;
  },

  getReceipt: async (id) => {
    const response = await api.get(`/pos/receipts/${id}`);
    return response.data;
  },
};

export const crmService = {
  getCustomers: async (search = '', limit = 50, offset = 0) => {
    const response = await api.get('/crm/customers', {
      params: { search, limit, offset },
    });
    return response.data;
  },

  getCustomer: async (id) => {
    const response = await api.get(`/crm/customers/${id}`);
    return response.data;
  },

  createCustomer: async (customer) => {
    const response = await api.post('/crm/customers', customer);
    return response.data;
  },

  updateCustomer: async (id, customer) => {
    const response = await api.put(`/crm/customers/${id}`, customer);
    return response.data;
  },

  createOrder: async (order) => {
    const response = await api.post('/crm/orders', order);
    return response.data;
  },

  getCustomerOrders: async (customerId, limit = 20, offset = 0) => {
    const response = await api.get(`/crm/customers/${customerId}/orders`, {
      params: { limit, offset },
    });
    return response.data;
  },
};

export const settingsService = {
  getProfile: async () => {
    const response = await api.get('/settings/profile');
    return response.data;
  },

  updateProfile: async (profile) => {
    const response = await api.put('/settings/profile', profile);
    return response.data;
  },

  getMobileSettings: async () => {
    const response = await api.get('/settings/mobile');
    return response.data;
  },

  updateMobileSettings: async (settings) => {
    const response = await api.put('/settings/mobile', settings);
    return response.data;
  },
};

export default api;
