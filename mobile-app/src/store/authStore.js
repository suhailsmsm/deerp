import { create } from 'zustand';
import { authService } from '../services/api';
import { tokenStorage } from '../services/tokenStorage';

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

      await tokenStorage.setItemAsync('accessToken', data.accessToken);
      await tokenStorage.setItemAsync('refreshToken', data.refreshToken);
      await tokenStorage.setItemAsync('user', JSON.stringify(data.user));

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
      await tokenStorage.deleteItemAsync('accessToken');
      await tokenStorage.deleteItemAsync('refreshToken');
      await tokenStorage.deleteItemAsync('user');

      set({ user: null, accessToken: null, refreshToken: null, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      // Even if logout fails, clear local storage
      await tokenStorage.deleteItemAsync('accessToken');
      await tokenStorage.deleteItemAsync('refreshToken');
      await tokenStorage.deleteItemAsync('user');
      set({ user: null, accessToken: null, refreshToken: null });
    }
  },

  restoreSession: async () => {
    try {
      const user = await tokenStorage.getItemAsync('user');
      const accessToken = await tokenStorage.getItemAsync('accessToken');
      const refreshToken = await tokenStorage.getItemAsync('refreshToken');

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
