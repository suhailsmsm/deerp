import { create } from 'zustand';
import { crmService } from '../services/api';

export const useCrmStore = create((set) => ({
  customers: [],
  selectedCustomer: null,
  customerOrders: [],
  isLoading: false,
  error: null,

  fetchCustomers: async (search = '') => {
    set({ isLoading: true, error: null });
    try {
      const data = await crmService.getCustomers(search, 50, 0);
      set({ customers: data.data, isLoading: false });
      return data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch customers';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  getCustomer: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const customer = await crmService.getCustomer(id);
      set({ selectedCustomer: customer, isLoading: false });
      return customer;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch customer';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  createCustomer: async (customerData) => {
    set({ isLoading: true, error: null });
    try {
      const customer = await crmService.createCustomer(customerData);
      set((state) => ({
        customers: [customer, ...state.customers],
        isLoading: false,
      }));
      return customer;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create customer';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateCustomer: async (id, customerData) => {
    set({ isLoading: true, error: null });
    try {
      const customer = await crmService.updateCustomer(id, customerData);
      set((state) => ({
        customers: state.customers.map((c) => (c.id === id ? customer : c)),
        selectedCustomer: state.selectedCustomer?.id === id ? customer : state.selectedCustomer,
        isLoading: false,
      }));
      return customer;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update customer';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchCustomerOrders: async (customerId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await crmService.getCustomerOrders(customerId, 20, 0);
      set({ customerOrders: data.data, isLoading: false });
      return data.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch orders';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
