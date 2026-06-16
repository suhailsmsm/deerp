/**
 * DerpX POS - TypeScript Types
 */

export type ThemeMode = 'dark' | 'light';

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  branchId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'owner' | 'manager' | 'supervisor' | 'cashier' | 'staff';

export interface UserPermissions {
  canAccessPOS: boolean;
  canAccessInventory: boolean;
  canAccessCRM: boolean;
  canAccessSales: boolean;
  canAccessReports: boolean;
  canAccessSettings: boolean;
  canManageUsers: boolean;
  canManageBranches: boolean;
  canManageInventory: boolean;
  canManageProducts: boolean;
  canManageCustomers: boolean;
  canManageSuppliers: boolean;
  canApplyDiscount: boolean;
  canVoidTransaction: boolean;
  canManageShift: boolean;
}

// Business Types
export interface Business {
  id: string;
  name: string;
  type: BusinessType;
  trn?: string; // Tax Registration Number (UAE)
  logo?: string;
  address?: Address;
  phone?: string;
  email?: string;
  settings: BusinessSettings;
}

export type BusinessType = 'retail' | 'supermarket' | 'restaurant' | 'cafe' | 'warehouse' | 'service';

export interface BusinessSettings {
  currency: string;
  currencySymbol: string;
  vatRate: number;
  vatEnabled: boolean;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  receiptFooter?: string;
  invoicePrefix?: string;
  orderPrefix?: string;
}

export interface Address {
  street?: string;
  city?: string;
  emirate?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  categoryId?: string;
  brandId?: string;
  images?: string[];
  variants?: ProductVariant[];
  basePrice: number;
  salePrice?: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold?: number;
  trackInventory: boolean;
  allowBackorder: boolean;
  isAvailable: boolean;
  isFeatured?: boolean;
  tags?: string[];
  attributes?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  salePrice?: number;
  stock: number;
  attributes: Record<string, string>;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  isActive: boolean;
}

// Inventory Types
export interface Inventory {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  branchId?: string;
  location?: string;
  batchNumber?: string;
  expiryDate?: Date;
  lastCountedAt?: Date;
  updatedAt: Date;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  variantId?: string;
  quantityChange: number;
  reason: StockAdjustmentReason;
  notes?: string;
  branchId?: string;
  userId: string;
  createdAt: Date;
}

export type StockAdjustmentReason = 'sale' | 'return' | 'damage' | 'expiry' | 'transfer' | 'correction' | 'purchase';

export interface StockTransfer {
  id: string;
  fromBranchId: string;
  toBranchId: string;
  items: StockTransferItem[];
  status: StockTransferStatus;
  notes?: string;
  createdBy: string;
  approvedBy?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface StockTransferItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

export type StockTransferStatus = 'pending' | 'approved' | 'in_transit' | 'completed' | 'cancelled';

// Cart Types
export interface Cart {
  id: string;
  items: CartItem[];
  customerId?: string;
  tableId?: string;
  orderType: OrderType;
  discount?: number;
  discountType: 'percentage' | 'fixed';
  notes?: string;
  cashierId: string;
  branchId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  quantity: number;
  discount?: number;
  notes?: string;
  image?: string;
  attributes?: Record<string, string>;
}

export type OrderType = 'dine_in' | 'takeaway' | 'delivery';

// Order Types
export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  tableId?: string;
  tableName?: string;
  orderType: OrderType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  discount: number;
  vatAmount: number;
  total: number;
  payments: Payment[];
  notes?: string;
  deliveryAddress?: Address;
  kitchenOrders?: KitchenOrder[];
  cashierId: string;
  cashierName?: string;
  branchId?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  discount: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  notes?: string;
  status: OrderItemStatus;
  image?: string;
}

export type OrderItemStatus = 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'ready' | 'completed' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded';

// Payment Types
export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  status: PaymentStatus;
  processedAt: Date;
  createdAt: Date;
}

export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'split' | 'credit';

export interface PaymentSplit {
  method: PaymentMethod;
  amount: number;
  reference?: string;
}

// Customer Types (CRM)
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  whatsappNumber?: string; // WhatsApp number for notifications
  alternatePhone?: string;
  trn?: string; // Tax Registration Number
  type: CustomerType;
  tags?: string[];
  notes?: string;
  location?: string; // Customer location/area
  latitude?: number; // Map latitude
  longitude?: number; // Map longitude
  address?: Address;
  loyaltyPoints: number;
  totalSpent: number;
  totalOrders: number;
  outstandingBalance: number;
  creditLimit?: number;
  isActive: boolean;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CustomerType = 'individual' | 'business' | 'vip';

export interface CustomerInteraction {
  id: string;
  customerId: string;
  type: InteractionType;
  subject?: string;
  notes: string;
  followUpDate?: Date;
  completed: boolean;
  userId: string;
  createdAt: Date;
}

export type InteractionType = 'call' | 'email' | 'sms' | 'whatsapp' | 'visit' | 'note' | 'complaint' | 'feedback';

// Supplier Types
export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: Address;
  trn?: string;
  products?: string[];
  paymentTerms?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Purchase Order Types
export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  status: PurchaseOrderStatus;
  subtotal: number;
  discount: number;
  vatAmount: number;
  total: number;
  expectedDate?: Date;
  receivedDate?: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderItem {
  productId: string;
  variantId?: string;
  name: string;
  quantity: number;
  receivedQuantity: number;
  unitPrice: number;
  total: number;
}

export type PurchaseOrderStatus = 'draft' | 'sent' | 'confirmed' | 'partial' | 'completed' | 'cancelled';

// Shift Types
export interface Shift {
  id: string;
  cashierId: string;
  cashierName: string;
  branchId?: string;
  status: ShiftStatus;
  openingAmount: number;
  closingAmount?: number;
  expectedAmount?: number;
  difference?: number;
  notes?: string;
  openedAt: Date;
  closedAt?: Date;
  transactions: ShiftTransaction[];
}

export interface ShiftTransaction {
  id: string;
  type: 'sale' | 'refund' | 'payment_in' | 'payment_out';
  amount: number;
  method: PaymentMethod;
  orderId?: string;
  notes?: string;
  createdAt: Date;
}

export type ShiftStatus = 'open' | 'closed' | 'suspended';

// Table Types (Restaurant)
export interface Table {
  id: string;
  name: string;
  number: string;
  capacity: number;
  status: TableStatus;
  section?: string;
  currentOrderId?: string;
  notes?: string;
}

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

export interface KitchenOrder {
  id: string;
  orderId: string;
  tableNumber?: string;
  orderType: OrderType;
  items: KitchenOrderItem[];
  status: KitchenOrderStatus;
  printerStation?: string;
  notes?: string;
  createdAt: Date;
  printedAt?: Date;
  completedAt?: Date;
}

export interface KitchenOrderItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served';
}

export type KitchenOrderStatus = 'pending' | 'printing' | 'printed' | 'completed';

// Dashboard & Reports Types
export interface DashboardStats {
  todaySales: number;
  todayOrders: number;
  todayCustomers: number;
  weekSales: number;
  weekOrders: number;
  monthSales: number;
  monthOrders: number;
  topProducts: ProductStats[];
  lowStockProducts: ProductStats[];
  recentOrders: Order[];
}

export interface ProductStats {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
}

export interface SalesReport {
  period: ReportPeriod;
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  salesByDay: DailySales[];
  salesByCategory: CategorySales[];
  salesByPaymentMethod: PaymentMethodSales[];
  topProducts: ProductStats[];
}

export type ReportPeriod = 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom';

export interface DailySales {
  date: string;
  sales: number;
  orders: number;
}

export interface CategorySales {
  categoryId: string;
  categoryName: string;
  sales: number;
  percentage: number;
}

export interface PaymentMethodSales {
  method: PaymentMethod;
  amount: number;
  percentage: number;
}

// Notification Types
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

// Settings Types
export interface AppSettings {
  theme: 'dark' | 'light' | 'auto';
  language: 'en' | 'ar';
  notifications: boolean;
  sound: boolean;
  vibration: boolean;
  printer?: PrinterSettings;
  barcodeScanner: BarcodeScannerSettings;
  receipt: ReceiptSettings;
  invoice: InvoiceSettings;
}

export interface PrinterSettings {
  type: 'bluetooth' | 'wifi' | 'usb';
  name?: string;
  address?: string;
  paperSize: '58mm' | '80mm';
  copies: number;
  autoPrint: boolean;
}

export interface BarcodeScannerSettings {
  type: 'camera' | 'external';
  autoSubmit: boolean;
  sound: boolean;
  vibration: boolean;
}

export interface ReceiptSettings {
  header?: string;
  footer?: string;
  showTaxDetails: boolean;
  showCustomerDetails: boolean;
  qrCodeEnabled: boolean;
}

export interface InvoiceSettings {
  prefix: string;
  footer?: string;
  terms?: string;
  showTaxDetails: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Auth Types
export interface AuthState {
  user: User | null;
  business: Business | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  businessName: string;
  businessType: BusinessType;
}
