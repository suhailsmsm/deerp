import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  description?: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  unit: string;
  trackInventory: boolean;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface InventoryState {
  items: InventoryItem[];
  addItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (id: string, data: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
  importItems: (items: InventoryItem[]) => void;
  exportItems: () => InventoryItem[];
}

const defaultItems: InventoryItem[] = [
  { id: '1', name: 'Cappuccino', sku: 'BEV-001', barcode: '1234567890123', category: 'Beverages', price: 18, cost: 8, stock: 45, minStock: 10, unit: 'pcs', trackInventory: true, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'Croissant', sku: 'SNK-001', barcode: '1234567890124', category: 'Snacks', price: 12, cost: 5, stock: 8, minStock: 10, unit: 'pcs', trackInventory: true, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '3', name: 'Espresso', sku: 'BEV-002', barcode: '1234567890125', category: 'Beverages', price: 15, cost: 6, stock: 52, minStock: 15, unit: 'pcs', trackInventory: true, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '4', name: 'Caesar Salad', sku: 'MAIN-001', barcode: '1234567890126', category: 'Main Course', price: 45, cost: 20, stock: 0, minStock: 5, unit: 'pcs', trackInventory: true, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '5', name: 'Tiramisu', sku: 'DSRT-001', barcode: '1234567890127', category: 'Desserts', price: 32, cost: 14, stock: 15, minStock: 5, unit: 'pcs', trackInventory: true, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '6', name: 'Latte', sku: 'BEV-003', barcode: '1234567890128', category: 'Beverages', price: 20, cost: 9, stock: 38, minStock: 10, unit: 'pcs', trackInventory: true, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
  { id: '7', name: 'Club Sandwich', sku: 'MAIN-002', barcode: '1234567890129', category: 'Main Course', price: 35, cost: 16, stock: 12, minStock: 5, unit: 'pcs', trackInventory: true, isAvailable: true, createdAt: new Date(), updatedAt: new Date() },
];

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      items: defaultItems,
      
      addItem: (itemData) => {
        const newItem: InventoryItem = { ...itemData, id: 'inv_' + Date.now(), createdAt: new Date(), updatedAt: new Date() };
        set((state) => ({ items: [...state.items, newItem] }));
      },
      
      updateItem: (id, data) => {
        set((state) => ({ items: state.items.map((i) => i.id === id ? { ...i, ...data, updatedAt: new Date() } : i) }));
      },
      
      deleteItem: (id) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
      },
      
      importItems: (items) => {
        set((state) => ({ items: [...state.items, ...items] }));
      },
      
      exportItems: () => get().items,
    }),
    { name: 'derpx-inventory', storage: createJSONStorage(() => AsyncStorage) }
  )
);