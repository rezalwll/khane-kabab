'use client';
import { create } from 'zustand';
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from 'zustand/middleware';
import type { OrderSnapshot } from '@/types/order';

type OrderState = {
  hydrated: boolean;
  couponCode: string;
  lastOrder: OrderSnapshot | null;
  setCoupon: (code: string) => void;
  removeCoupon: () => void;
  clearCoupon: () => void;
  saveLastOrder: (order: OrderSnapshot) => void;
  markHydrated: () => void;
};

const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch {}
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {}
  },
};

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      hydrated: false,
      couponCode: '',
      lastOrder: null,
      setCoupon: (couponCode) => set({ couponCode }),
      removeCoupon: () => set({ couponCode: '' }),
      clearCoupon: () => set({ couponCode: '' }),
      saveLastOrder: (lastOrder) => set({ lastOrder }),
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'khane-kabab-order',
      storage: createJSONStorage(() => safeStorage),
      skipHydration: true,
      partialize: (state) => ({
        couponCode: state.couponCode,
        lastOrder: state.lastOrder,
      }),
    },
  ),
);
