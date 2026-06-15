/**
 * DerpX POS - Store Index
 * Central export for all Zustand stores
 */

export { useAuthStore } from './authStore';
export { usePosStore } from './posStore';
export { useSettingsStore } from './settingsStore';
export { useCRMStore } from './crmStore';
export { useInventoryStore } from './inventoryStore';

// Re-export types
export type { AuthState, User, Business } from '@/types';
export type { Cart, Product, Category, Order } from '@/types';
export type { Customer } from '@/types';
export type { AppSettings } from '@/types';
