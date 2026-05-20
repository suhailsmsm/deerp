import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const memoryStorage = new Map();

const webStorage = {
  async getItemAsync(key) {
    try {
      return globalThis.localStorage?.getItem(key) ?? memoryStorage.get(key) ?? null;
    } catch {
      return memoryStorage.get(key) ?? null;
    }
  },

  async setItemAsync(key, value) {
    memoryStorage.set(key, value);
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      // Private browsing or locked-down embeds may block localStorage.
    }
  },

  async deleteItemAsync(key) {
    memoryStorage.delete(key);
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      // Keep logout/session clearing best-effort on web.
    }
  },
};

export const tokenStorage = Platform.OS === 'web' ? webStorage : SecureStore;
