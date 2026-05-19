import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { settingsService } from '../services/api';

export const useSettingsStore = create((set) => ({
  profile: null,
  settings: {
    language: 'en',
    theme: 'light',
    currency: 'AED',
    vatRate: 5,
    receiptFormat: 'standard',
    printReceipt: true,
    emailReceipt: false,
    soundEnabled: true,
    vibrateEnabled: true,
    defaultPaymentMethod: 'cash',
  },
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const profile = await settingsService.getProfile();
      set({ profile, isLoading: false });
      return profile;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch profile';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await settingsService.updateProfile(profileData);
      set({ profile, isLoading: false });
      return profile;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update profile';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const settings = await settingsService.getMobileSettings();
      await AsyncStorage.setItem('appSettings', JSON.stringify(settings));
      set({ settings, isLoading: false });
      return settings;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch settings';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateSettings: async (newSettings) => {
    set({ isLoading: true, error: null });
    try {
      const settings = await settingsService.updateMobileSettings(newSettings);
      await AsyncStorage.setItem('appSettings', JSON.stringify(settings));
      set({ settings, isLoading: false });
      return settings;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update settings';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  loadLocalSettings: async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('appSettings');
      if (savedSettings) {
        set({ settings: JSON.parse(savedSettings) });
      }
    } catch (error) {
      console.error('Failed to load local settings:', error);
    }
  },

  clearError: () => set({ error: null }),
}));
