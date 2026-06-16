/**
 * DerpX POS - CRM Store
 * Customer relationship management with full CRUD
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Customer } from '@/types';

// Demo customers for persistence
const demoCustomers: Customer[] = [
  { 
    id: '1', 
    name: 'Ahmed Ali', 
    phone: '+971501234567', 
    email: 'ahmed@email.com', 
    whatsappNumber: '+971501234567', 
    type: 'individual', 
    loyaltyPoints: 542, 
    totalSpent: 5420, 
    totalOrders: 24, 
    outstandingBalance: 0, 
    isActive: true, 
    createdAt: new Date('2026-01-15'), 
    updatedAt: new Date() 
  },
  { 
    id: '2', 
    name: 'Fatima Hassan', 
    phone: '+971559876543', 
    email: 'fatima@email.com', 
    whatsappNumber: '+971559876543', 
    type: 'individual', 
    loyaltyPoints: 328, 
    totalSpent: 3280, 
    totalOrders: 15, 
    outstandingBalance: 0, 
    isActive: true, 
    createdAt: new Date('2026-02-10'), 
    updatedAt: new Date() 
  },
  { 
    id: '3', 
    name: 'Mohammed Rashid', 
    phone: '+971524567890', 
    email: 'mohammed@email.com', 
    whatsappNumber: '+971524567890', 
    type: 'vip', 
    loyaltyPoints: 895, 
    totalSpent: 8950, 
    totalOrders: 42, 
    outstandingBalance: 0, 
    isActive: true, 
    createdAt: new Date('2026-01-20'), 
    updatedAt: new Date() 
  },
  { 
    id: '4', 
    name: 'Sarah Ahmed', 
    phone: '+971563210987', 
    email: 'sarah@email.com', 
    whatsappNumber: '+971563210987', 
    type: 'individual', 
    loyaltyPoints: 125, 
    totalSpent: 1250, 
    totalOrders: 8, 
    outstandingBalance: 0, 
    isActive: true, 
    createdAt: new Date('2026-03-05'), 
    updatedAt: new Date() 
  },
  { 
    id: '5', 
    name: 'Khalid Omar', 
    phone: '+971507890123', 
    email: 'khalid@email.com', 
    whatsappNumber: '+971507890123', 
    type: 'business', 
    loyaltyPoints: 1250, 
    totalSpent: 12500, 
    totalOrders: 56, 
    outstandingBalance: 0, 
    isActive: true, 
    createdAt: new Date('2026-02-01'), 
    updatedAt: new Date() 
  },
  { 
    id: '6', 
    name: 'Noor Al Suwaidi', 
    phone: '+971504567890', 
    email: 'noor@email.com', 
    whatsappNumber: '+971504567890', 
    trn: '123456789012345', 
    type: 'business', 
    loyaltyPoints: 2340, 
    totalSpent: 23400, 
    totalOrders: 89, 
    outstandingBalance: 0, 
    isActive: true, 
    createdAt: new Date('2026-01-10'), 
    updatedAt: new Date() 
  },
  { 
    id: '7', 
    name: 'Omar Abdullah', 
    phone: '+971558765432', 
    email: 'omar@email.com', 
    whatsappNumber: '+971558765432', 
    type: 'individual', 
    loyaltyPoints: 780, 
    totalSpent: 7800, 
    totalOrders: 31, 
    outstandingBalance: 0, 
    isActive: true, 
    createdAt: new Date('2026-03-15'), 
    updatedAt: new Date() 
  },
  { 
    id: '8', 
    name: 'Mariam Al Mansoori', 
    phone: '+971501122334', 
    email: 'mariam@email.com', 
    whatsappNumber: '+971501122334', 
    type: 'vip', 
    loyaltyPoints: 1560, 
    totalSpent: 15600, 
    totalOrders: 67, 
    outstandingBalance: 0, 
    isActive: true, 
    createdAt: new Date('2026-02-20'), 
    updatedAt: new Date() 
  },
];

interface CRMState {
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  importCustomers: (customers: Customer[]) => void;
  exportCustomers: () => Customer[];
}

export const useCRMStore = create<CRMState>()(
  persist(
    (set, get) => ({
      customers: demoCustomers,

      addCustomer: (customer) => {
        const newCustomer: Customer = {
          ...customer,
          id: `${Date.now()}`,
          loyaltyPoints: 0,
          totalSpent: 0,
          totalOrders: 0,
          outstandingBalance: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Customer;
        set((state) => ({ customers: [...state.customers, newCustomer] }));
      },

      updateCustomer: (id, data) => {
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === id ? { ...c, ...data, updatedAt: new Date() } : c
          ),
        }));
      },

      deleteCustomer: (id) => {
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
        }));
      },

      importCustomers: (customers) => {
        set({ customers });
      },

      exportCustomers: () => {
        return get().customers;
      },
    }),
    {
      name: 'derpx-crm',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
