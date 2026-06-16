/**
 * DerpX POS - Utilities
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency in AED
 */
export function formatCurrency(amount: number, currency: string = 'AED'): string {
  const symbols: Record<string, string> = {
    AED: 'د.إ',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };

  const symbol = symbols[currency] || currency;
  return `${symbol} ${amount.toFixed(2)}`;
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * Format phone number (UAE format)
 */
export function formatPhoneNumber(phone: string): string {
  // Remove non-digits
  const digits = phone.replace(/\D/g, '');
  
  // UAE format: +971 XX XXX XXXX
  if (digits.startsWith('971') && digits.length === 12) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  
  if (digits.length === 10 && digits.startsWith('0')) {
    return `+971 ${digits.slice(1, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  
  return phone;
}

/**
 * Format TRN (Tax Registration Number)
 */
export function formatTRN(trn: string): string {
  // UAE TRN is 15 digits
  const digits = trn.replace(/\D/g, '');
  if (digits.length === 15) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 9)}-${digits.slice(9)}`;
  }
  return trn;
}

/**
 * Validate TRN
 */
export function isValidTRN(trn: string): boolean {
  const digits = trn.replace(/\D/g, '');
  return digits.length === 15;
}

/**
 * Validate UAE phone number
 */
export function isValidUAEPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return (digits.length === 10 && digits.startsWith('0')) || 
         (digits.length === 12 && digits.startsWith('971'));
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate unique ID
 */
export function generateId(prefix: string = ''): string {
  const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return prefix ? `${prefix}_${id}` : id;
}

/**
 * Generate order number
 */
export function generateOrderNumber(prefix: string = 'ORD'): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}-${dateStr}-${random}`;
}

/**
 * Generate invoice number
 */
export function generateInvoiceNumber(prefix: string = 'INV'): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}-${dateStr}-${random}`;
}

/**
 * Calculate VAT amount
 */
export function calculateVAT(amount: number, rate: number = 0.05): number {
  return amount * rate;
}

/**
 * Calculate total with VAT
 */
export function calculateTotalWithVAT(amount: number, rate: number = 0.05): number {
  return amount * (1 + rate);
}

/**
 * Extract VAT from total (reverse calculation)
 */
export function extractVATFromTotal(total: number, rate: number = 0.05): number {
  return total - (total / (1 + rate));
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Sleep/delay utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const delay = baseDelay * Math.pow(2, i);
      await sleep(delay);
    }
  }
  
  throw lastError!;
}

/**
 * Check if value is empty
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Pick keys from object
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Omit keys from object
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result as Omit<T, K>;
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string, format: string = 'MMM dd, yyyy'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = d.getDate().toString().padStart(2, '0');
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  
  return format
    .replace('MMM', month)
    .replace('dd', day)
    .replace('yyyy', year.toString());
}

/**
 * Format time for display
 */
export function formatTime(date: Date | string, format: string = 'hh:mm a'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12;
  
  return format.replace('hh', hours.toString()).replace('mm', minutes).replace('a', ampm);
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return formatDate(d, 'MMM dd');
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(birthDate: Date | string): number {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Title case
 */
export function titleCase(str: string): string {
  return str.toLowerCase().split(' ').map((word) => capitalize(word)).join(' ');
}

/**
 * Generate initials from name
 */
export function getInitials(name: string, maxChars: number = 2): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, maxChars)
    .join('');
}

/**
 * Random integer between min and max
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Shuffle array
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Sum array values
 */
export function sum<T>(array: T[], selector: (item: T) => number): number {
  return array.reduce((total, item) => total + selector(item), 0);
}

/**
 * Average of array values
 */
export function average<T>(array: T[], selector: (item: T) => number): number {
  if (array.length === 0) return 0;
  return sum(array, selector) / array.length;
}

/**
 * Find max value in array
 */
export function max<T>(array: T[], selector: (item: T) => number): T | undefined {
  if (array.length === 0) return undefined;
  return array.reduce((maxItem, item) => (selector(item) > selector(maxItem) ? item : maxItem));
}

/**
 * Find min value in array
 */
export function min<T>(array: T[], selector: (item: T) => number): T | undefined {
  if (array.length === 0) return undefined;
  return array.reduce((minItem, item) => (selector(item) < selector(minItem) ? item : minItem));
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  );
}

/**
 * Get start of day
 */
export function startOfDay(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

/**
 * Get end of day
 */
export function endOfDay(date: Date | string): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

/**
 * Add days to date
 */
export function addDays(date: Date | string, days: number): Date {
  const d = typeof date === 'string' ? new Date(date) : date;
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Parse JWT token (basic)
 */
export function parseJWT(token: string): { exp?: number; iat?: number; [key: string]: unknown } | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
  } catch {
    return null;
  }
}

/**
 * Check if JWT is expired
 */
export function isTokenExpired(token: string): boolean {
  const payload = parseJWT(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
}
