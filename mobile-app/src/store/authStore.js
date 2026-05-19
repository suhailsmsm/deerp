import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),

  login: async (email, password, tenantId, deviceId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login(email, password, tenantId, deviceId);

      await SecureStore.setItemAsync('accessToken', data.accessToken);
      await SecureStore.setItemAsync('refreshToken', data.refreshToken);
      await SecureStore.setItemAsync('user', JSON.stringify(data.user));

      set({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isLoading: false,
      });

      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Login failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('user');

      set({ user: null, accessToken: null, refreshToken: null, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      // Even if logout fails, clear local storage
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('user');
      set({ user: null, accessToken: null, refreshToken: null });
    }
  },

  restoreSession: async () => {
    try {
      const user = await SecureStore.getItemAsync('user');
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const refreshToken = await SecureStore.getItemAsync('refreshToken');

      if (user && accessToken && refreshToken) {
        set({
          user: JSON.parse(user),
          accessToken,
          refreshToken,
        });
        return true;
      }
    } catch (error) {
      console.error('Failed to restore session:', error);
    }
    return false;
  },

  clearError: () => set({ error: null }),
}));
