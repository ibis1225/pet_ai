'use client';
import { create } from 'zustand';
import type { User } from '@/types';
import { authApi } from '@/lib/api';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => void;
  loadProfile: () => Promise<void>;
  devLogin: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await authApi.login(email, password);
      localStorage.setItem('token', res.data.access_token);
      set({ user: res.data.user, isAuthenticated: true });
    } finally { set({ isLoading: false }); }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const res = await authApi.register(data);
      localStorage.setItem('token', res.data.access_token);
      set({ user: res.data.user, isAuthenticated: true });
    } finally { set({ isLoading: false }); }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },

  loadProfile: async () => {
    try {
      const res = await authApi.getProfile();
      set({ user: res.data, isAuthenticated: true });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, isAuthenticated: false });
    }
  },

  devLogin: () => {
    localStorage.setItem('token', 'dev-token');
    set({ user: { id: 'dev', email: 'dev@petai.app', name: '개발자', phone: null, role: 'customer', profile_image: null }, isAuthenticated: true });
  },
}));
