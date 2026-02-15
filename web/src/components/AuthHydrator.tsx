'use client';
import { useAuthHydration } from '@/store/authStore';

export default function AuthHydrator() {
  useAuthHydration();
  return null;
}
