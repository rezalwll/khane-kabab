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
  removeOrder: (publicNumber: string) => void;
  getToken: (publicNumber: string) => string | undefined;
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
    (set, get) => ({
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
          ]
            .filter(
              (item) =>
                Date.now() - new Date(item.createdAt).getTime() <
                90 * 24 * 60 * 60 * 1000,
            )
            .slice(0, 20),
        })),
      removeOrder: (publicNumber) =>
        set((state) => ({
          orders: state.orders.filter(
            (item) => item.publicNumber !== publicNumber,
          ),
        })),
      getToken: (publicNumber) =>
        get().orders.find((item) => item.publicNumber === publicNumber)
          ?.trackingToken,
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
