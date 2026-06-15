/**
 * DerpX POS - Settings Store
 * Manages app settings, preferences, and configuration
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, ThemeMode, PrinterSettings, BarcodeScannerSettings } from '@/types';

interface SettingsState extends AppSettings {
  // Business branding
  businessLogo?: string; // Base64 encoded image or URI
  merchantPhone?: string; // Merchant phone for WhatsApp notifications
  businessTrn?: string; // Business TRN number
  businessName?: string; // Business name
  businessAddress?: string; // Business address
  businessPhone?: string; // Business phone
  
  // VAT Settings
  vatEnabled?: boolean; // Enable/disable VAT
  vatInclusive?: boolean; // VAT inclusive pricing
  
  // Discount Settings
  discountEnabled?: boolean; // Enable/disable discounts

  // Actions
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (language: 'en' | 'ar') => void;
  toggleNotifications: () => void;
  toggleSound: () => void;
  toggleVibration: () => void;
  updatePrinterSettings: (settings: Partial<PrinterSettings>) => void;
  updateScannerSettings: (settings: Partial<BarcodeScannerSettings>) => void;
  setBusinessLogo: (logoUri: string) => void;
  clearBusinessLogo: () => void;
  setMerchantPhone: (phone: string) => void;
  setBusinessTrn: (trn: string) => void;
  setBusinessName: (name: string) => void;
  setVatEnabled: (enabled: boolean) => void;
  toggleVatInclusive: () => void;
  setDiscountEnabled: (enabled: boolean) => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  language: 'en',
  notifications: true,
  sound: true,
  vibration: true,
  barcodeScanner: {
    type: 'camera',
    autoSubmit: true,
    sound: true,
    vibration: true,
  },
  receipt: {
    showTaxDetails: true,
    showCustomerDetails: false,
    qrCodeEnabled: true,
  },
  invoice: {
    prefix: 'INV',
    showTaxDetails: true,
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      businessLogo: undefined,

      setTheme: (theme: ThemeMode) => {
        set({ theme });
      },

      setLanguage: (language: 'en' | 'ar') => {
        set({ language });
      },

      toggleNotifications: () => {
        set((state) => ({ notifications: !state.notifications }));
      },

      toggleSound: () => {
        set((state) => ({ sound: !state.sound }));
      },

      toggleVibration: () => {
        set((state) => ({ vibration: !state.vibration }));
      },

      updatePrinterSettings: (settings: Partial<PrinterSettings>) => {
        set((state) => ({
          printer: { ...state.printer, ...settings } as PrinterSettings,
        }));
      },

      updateScannerSettings: (settings: Partial<BarcodeScannerSettings>) => {
        set((state) => ({
          barcodeScanner: { ...state.barcodeScanner, ...settings },
        }));
      },

      setBusinessLogo: (logoUri: string) => {
        set({ businessLogo: logoUri });
      },

      clearBusinessLogo: () => {
        set({ businessLogo: undefined });
      },

      setMerchantPhone: (phone: string) => {
        set({ merchantPhone: phone });
      },

      setBusinessTrn: (trn: string) => {
        set({ businessTrn: trn });
      },

      setBusinessName: (name: string) => {
        set({ businessName: name });
      },

      setVatEnabled: (enabled: boolean) => {
        set({ vatEnabled: enabled });
      },

      toggleVatInclusive: () => {
        set((state) => ({ vatInclusive: !state.vatInclusive }));
      },

      setDiscountEnabled: (enabled: boolean) => {
        set({ discountEnabled: enabled });
      },

      resetSettings: () => {
        set(defaultSettings);
      },
    }),
    {
      name: 'derpx-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        notifications: state.notifications,
        sound: state.sound,
        vibration: state.vibration,
        barcodeScanner: state.barcodeScanner,
        receipt: state.receipt,
        invoice: state.invoice,
        businessLogo: state.businessLogo,
        merchantPhone: state.merchantPhone,
        businessTrn: state.businessTrn,
        businessName: state.businessName,
        vatEnabled: state.vatEnabled,
        vatInclusive: state.vatInclusive,
        discountEnabled: state.discountEnabled,
      }),
    }
  )
);
