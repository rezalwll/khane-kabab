'use client';
import { create } from 'zustand';
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from 'zustand/middleware';
export type GuestOrderAccess = {
  publicNumber: string;
  trackingToken: string;
  createdAt: string;
};
type GuestOrdersState = {
  hydrated: boolean;
  orders: GuestOrderAccess[];
  addOrder: (order: GuestOrderAccess) => void;
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
export const useGuestOrders = create<GuestOrdersState>()(
  persist(
    (set) => ({
      hydrated: false,
      orders: [],
      markHydrated: () => set({ hydrated: true }),
      addOrder: (order) =>
        set((state) => ({
          orders: [
            order,
            ...state.orders.filter(
              (item) => item.publicNumber !== order.publicNumber,
            ),
          ].slice(0, 20),
        })),
    }),
    {
      name: 'khane-kabab-guest-orders',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      skipHydration: true,
      partialize: (state) => ({ orders: state.orders }),
    },
  ),
);
