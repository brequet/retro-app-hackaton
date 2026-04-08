import { create } from 'zustand';
import { User } from '../types';
import { api } from '../api/client';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadToken: () => Promise<void>;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// Platform-safe storage
async function setItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function removeItem(key: string) {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,

  login: async (email: string, password: string) => {
    const data = await api.post<{ user: User; token: string }>(
      '/api/auth/login',
      { email, password },
      { noAuth: true }
    );
    await setItem(TOKEN_KEY, data.token);
    await setItem(USER_KEY, JSON.stringify(data.user));
    set({ user: data.user, token: data.token, isAuthenticated: true, isAdmin: !!data.user.is_admin });
  },

  register: async (email: string, name: string, password: string) => {
    const data = await api.post<{ user: User; token: string }>(
      '/api/auth/register',
      { email, name, password },
      { noAuth: true }
    );
    await setItem(TOKEN_KEY, data.token);
    await setItem(USER_KEY, JSON.stringify(data.user));
    set({ user: data.user, token: data.token, isAuthenticated: true, isAdmin: !!data.user.is_admin });
  },

  logout: async () => {
    await removeItem(TOKEN_KEY);
    await removeItem(USER_KEY);
    set({ user: null, token: null, isAuthenticated: false, isAdmin: false });
  },

  loadToken: async () => {
    try {
      const token = await getItem(TOKEN_KEY);
      const userStr = await getItem(USER_KEY);
      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({ token, user, isAuthenticated: true, isAdmin: !!user.is_admin, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
