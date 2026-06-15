/**
 * DerpX POS - Auth Store
 * Manages authentication state and session
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Business, AuthState, LoginCredentials, RegisterData } from '@/types';

interface AuthStore extends AuthState {
  // Actions
  initialize: () => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  updateBusiness: (business: Partial<Business>) => void;
  setToken: (token: string) => void;
  clearError: () => void;
}

const initialState: AuthState = {
  user: null,
  business: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Initialize auth state on app start
      initialize: async () => {
        // Check if we have persisted state
        const { token, user } = get();
        if (token && user) {
          set({ isLoading: false, isAuthenticated: true });
        } else {
          set({ isLoading: false, isAuthenticated: false });
        }
      },

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true });
        try {
          // TODO: Replace with actual API call
          // Simulated login for now
          await new Promise((resolve) => setTimeout(resolve, 1000));
          
          const mockUser: User = {
            id: '1',
            email: credentials.email,
            name: 'Demo User',
            role: 'owner',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const mockBusiness: Business = {
            id: '1',
            name: 'Demo Business',
            type: 'retail',
            trn: '123456789012345',
            settings: {
              currency: 'AED',
              currencySymbol: 'د.إ',
              vatRate: 0.05,
              vatEnabled: true,
              language: 'en',
              timezone: 'Asia/Dubai',
              dateFormat: 'DD/MM/YYYY',
              timeFormat: 'HH:mm',
            },
          };

          set({
            user: mockUser,
            business: mockBusiness,
            token: 'mock_token_' + Date.now(),
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });
        try {
          // TODO: Replace with actual API call
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const mockUser: User = {
            id: '1',
            email: data.email,
            name: data.name,
            role: 'owner',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const mockBusiness: Business = {
            id: '1',
            name: data.businessName,
            type: data.businessType,
            settings: {
              currency: 'AED',
              currencySymbol: 'د.إ',
              vatRate: 0.05,
              vatEnabled: true,
              language: 'en',
              timezone: 'Asia/Dubai',
              dateFormat: 'DD/MM/YYYY',
              timeFormat: 'HH:mm',
            },
          };

          set({
            user: mockUser,
            business: mockBusiness,
            token: 'mock_token_' + Date.now(),
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set(initialState);
      },

      updateUser: (user: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...user } });
        }
      },

      updateBusiness: (business: Partial<Business>) => {
        const currentBusiness = get().business;
        if (currentBusiness) {
          set({ business: { ...currentBusiness, ...business } });
        }
      },

      setToken: (token: string) => {
        set({ token });
      },

      clearError: () => {
        // Clear any error state
      },
    }),
    {
      name: 'derpx-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        business: state.business,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
