/**
 * DerpX POS - Constants
 * UAE-focused Mobile Enterprise POS System
 */

// App Configuration
export const APP_CONFIG = {
  name: 'DerpX POS',
  version: '1.0.0',
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'ar'],
  isRTL: false,
};

// UAE Specific Constants
export const UAE = {
  countryCode: 'AE',
  currency: 'AED',
  currencySymbol: 'د.إ',
  vatRate: 0.05, // 5% VAT
  vatName: 'VAT',
  trnLabel: 'TRN',
  phoneNumberFormat: '+971 XX XXX XXXX',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: 'HH:mm',
  weekendDays: [5, 6], // Friday, Saturday
};

// Business Types
export const BUSINESS_TYPES = [
  { id: 'retail', label: 'Retail Shop', icon: 'store' },
  { id: 'supermarket', label: 'Supermarket', icon: 'shopping-cart' },
  { id: 'restaurant', label: 'Restaurant', icon: 'utensils' },
  { id: 'cafe', label: 'Café', icon: 'coffee' },
  { id: 'warehouse', label: 'Warehouse', icon: 'warehouse' },
  { id: 'service', label: 'Service Business', icon: 'briefcase' },
];

// UAE Payment Methods - Comprehensive
export const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', icon: 'cash-outline', color: '#22c55e' },
  { id: 'card', label: 'Credit/Debit Card', icon: 'card-outline', color: '#2563EB' },
  { id: 'visa', label: 'Visa', icon: 'card-outline', color: '#1a1f71' },
  { id: 'mastercard', label: 'Mastercard', icon: 'card-outline', color: '#eb001b' },
  { id: 'contactless', label: 'Contactless/NFC', icon: 'phone-portrait-outline', color: '#004EC8' },
  { id: 'apple_pay', label: 'Apple Pay', icon: 'logo-apple', color: '#000000' },
  { id: 'google_pay', label: 'Google Pay', icon: 'logo-google', color: '#4285F4' },
  { id: 'network_intl', label: 'Network Intl.', icon: 'globe-outline', color: '#7C3AED' },
  { id: 'telr', label: 'Telr', icon: 'globe-outline', color: '#0EA5E9' },
  { id: 'paytabs', label: 'PayTabs', icon: 'globe-outline', color: '#F59E0B' },
  { id: 'magnati', label: 'Magnati', icon: 'globe-outline', color: '#EC4899' },
  { id: 'split', label: 'Split Payment', icon: 'layers-outline', color: '#f59e0b' },
  { id: 'bank_transfer', label: 'Bank Transfer', icon: 'business-outline', color: '#8b5cf6' },
  { id: 'credit', label: 'Customer Credit', icon: 'people-outline', color: '#ec4899' },
];

// Payment Gateways (UAE-specific)
export const UAE_PAYMENT_GATEWAYS = [
  { id: 'network_intl', name: 'Network International', description: 'Leading UAE payment gateway' },
  { id: 'telr', name: 'Telr', description: 'UAE & MENA payment gateway' },
  { id: 'paytabs', name: 'PayTabs', description: 'MENA payment solutions' },
  { id: 'magnati', name: 'Magnati', description: 'UAE payments by First Abu Dhabi Bank' },
];

// Order Statuses
export const ORDER_STATUSES = {
  pending: { label: 'Pending', color: '#f59e0b' },
  confirmed: { label: 'Confirmed', color: '#3b82f6' },
  processing: { label: 'Processing', color: '#8b5cf6' },
  ready: { label: 'Ready', color: '#22c55e' },
  completed: { label: 'Completed', color: '#10b981' },
  cancelled: { label: 'Cancelled', color: '#ef4444' },
  refunded: { label: 'Refunded', color: '#f43f5e' },
};

// Table Statuses (for restaurants)
export const TABLE_STATUSES = {
  available: { label: 'Available', color: '#22c55e' },
  occupied: { label: 'Occupied', color: '#ef4444' },
  reserved: { label: 'Reserved', color: '#f59e0b' },
  maintenance: { label: 'Maintenance', color: '#6b7280' },
};

// User Roles
export const USER_ROLES = {
  owner: { label: 'Owner', level: 100, permissions: 'all' },
  manager: { label: 'Manager', level: 80, permissions: 'most' },
  supervisor: { label: 'Supervisor', level: 60, permissions: 'many' },
  cashier: { label: 'Cashier', level: 20, permissions: 'limited' },
  staff: { label: 'Staff', level: 10, permissions: 'minimal' },
};

// Shift Statuses
export const SHIFT_STATUSES = {
  open: { label: 'Open', color: '#22c55e' },
  closed: { label: 'Closed', color: '#6b7280' },
  suspended: { label: 'Suspended', color: '#f59e0b' },
};

// Notification Types
export const NOTIFICATION_TYPES = {
  info: { color: '#3b82f6', icon: 'info' },
  success: { color: '#22c55e', icon: 'check-circle' },
  warning: { color: '#f59e0b', icon: 'alert-triangle' },
  error: { color: '#ef4444', icon: 'x-circle' },
};

// Date formats
export const DATE_FORMATS = {
  display: 'MMM dd, yyyy',
  displayFull: 'EEEE, MMMM dd, yyyy',
  time: 'hh:mm a',
  dateTime: 'MMM dd, yyyy hh:mm a',
  iso: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
};

// Storage Keys
export const STORAGE_KEYS = {
  auth: '@derpx:auth',
  settings: '@derpx:settings',
  theme: '@derpx:theme',
  language: '@derpx:language',
  branch: '@derpx:branch',
  shift: '@derpx:shift',
  cart: '@derpx:cart',
  lastSync: '@derpx:last_sync',
};

// API Endpoints (to be configured)
export const API_ENDPOINTS = {
  auth: '/api/auth',
  users: '/api/users',
  products: '/api/products',
  categories: '/api/categories',
  inventory: '/api/inventory',
  sales: '/api/sales',
  orders: '/api/orders',
  customers: '/api/customers',
  suppliers: '/api/suppliers',
  reports: '/api/reports',
  settings: '/api/settings',
};

// Error Messages
export const ERROR_MESSAGES = {
  network: 'Network error. Please check your connection.',
  server: 'Server error. Please try again later.',
  unauthorized: 'Session expired. Please login again.',
  notFound: 'Resource not found.',
  validation: 'Please check your input and try again.',
  generic: 'Something went wrong. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  save: 'Saved successfully!',
  update: 'Updated successfully!',
  delete: 'Deleted successfully!',
  sync: 'Synced successfully!',
  print: 'Printing...',
};

// Receipt & Invoicing
export const RECEIPT_CONFIG = {
  ftaCompliant: true,
  languages: ['en', 'ar'] as const,
  includeQRCode: true,
  qrFormat: 'UAEPCS',
  digitalReceiptMethods: ['sms', 'whatsapp', 'email'] as const,
  supportBluetoothPrint: true,
};

// Offline Sync
export const OFFLINE_CONFIG = {
  enabled: true,
  maxQueueSize: 1000,
  syncIntervalMs: 30000,
  retryAttempts: 3,
};

// Hardware Support
export const HARDWARE_CONFIG = {
  bluetoothBarcodeScanner: true,
  cashDrawerSupport: true,
  cardTerminalIntegration: true,
  thermalPrinterSupport: true,
};