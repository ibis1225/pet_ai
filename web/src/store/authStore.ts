'use client';
import { create } from 'zustand';
import { useEffect, useState } from 'react';
import type { User } from '@/types';
import { authApi } from '@/lib/api';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => void;
  loadProfile: () => Promise<void>;
  devLogin: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  hydrated: false,

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

  hydrate: () => {
    const token = localStorage.getItem('token');
    set({ isAuthenticated: !!token, hydrated: true });
  },
}));

// Hook to safely hydrate auth state on client side
export function useAuthHydration() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrated = useAuthStore((s) => s.hydrated);
  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrate, hydrated]);
}
