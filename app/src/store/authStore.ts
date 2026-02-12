import { create } from 'zustand';
import { User } from '../types';
import { authApi, setAuthToken } from '../lib/api';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => void;
  setToken: (token: string) => void;
  loadProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await authApi.login(email, password);
      const { access_token, user } = response.data;
      setAuthToken(access_token);
      set({ token: access_token, user, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const response = await authApi.register(data);
      const { access_token, user } = response.data;
      setAuthToken(access_token);
      set({ token: access_token, user, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    setAuthToken(null);
    set({ user: null, token: null, isAuthenticated: false });
  },

  setToken: (token) => {
    setAuthToken(token);
    set({ token, isAuthenticated: true });
  },

  loadProfile: async () => {
    try {
      const response = await authApi.getProfile();
      set({ user: response.data });
    } catch {
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));
