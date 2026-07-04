// Shared State Management with Zustand

import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  updatedAt: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: number;
  active: boolean;
  expiresAt: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  updatedAt: string;
}

interface SharedState {
  profile: CustomerProfile | null;
  products: Product[];
  promotions: Promotion[];
  loading: boolean;
  error: string | null;
  lastSyncTime: number | null;

  // Actions
  setProfile: (profile: CustomerProfile) => void;
  setProducts: (products: Product[]) => void;
  setPromotions: (promotions: Promotion[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  sync: (data: Partial<SharedState>) => void;
}

export const useSharedStore = create<SharedState>((set) => ({
  profile: null,
  products: [],
  promotions: [],
  loading: false,
  error: null,
  lastSyncTime: null,

  setProfile: (profile) =>
    set({
      profile,
      lastSyncTime: Date.now(),
    }),

  setProducts: (products) =>
    set({
      products,
      lastSyncTime: Date.now(),
    }),

  setPromotions: (promotions) =>
    set({
      promotions,
      lastSyncTime: Date.now(),
    }),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  sync: (data) => set(data),
}));
