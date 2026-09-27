'use client';
import { create } from 'zustand';
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from 'zustand/middleware';
import type { Addon, Food } from '@/types/food';
import { useOrderStore } from '@/stores/order-store';

export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  titleSnapshotForUI: string;
  shortDescriptionSnapshotForUI: string;
  imageSnapshotForUI: string;
  unitPriceSnapshotForUI: number;
  quantity: number;
  selectedOptions: Addon[];
  note?: string;
};
type CartState = {
  items: CartItem[];
  drawerOpen: boolean;
  addItem: (
    food: Food,
    quantity?: number,
    addons?: Addon[],
    note?: string,
  ) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  increment: (key: string) => void;
  decrement: (key: string) => void;
  clearCart: () => void;
  setDrawerOpen: (open: boolean) => void;
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
const itemKey = (food: Food, addons: Addon[], note?: string) =>
  [food.id, ...addons.map((addon) => addon.id).sort(), note?.trim() ?? ''].join(
    '|',
  );

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      drawerOpen: false,
      addItem: (food, quantity = 1, addons = [], note) =>
        set((state) => {
          const key = itemKey(food, addons, note);
          const found = state.items.find((item) => item.key === key);
          const snapshot = {
            key,
            productId: food.id,
            slug: food.slug,
            titleSnapshotForUI: food.title,
            shortDescriptionSnapshotForUI: food.shortDescription,
            imageSnapshotForUI: food.image,
            unitPriceSnapshotForUI: food.price,
            quantity,
            selectedOptions: addons,
            note: note?.trim() || undefined,
          };
          return {
            items: found
              ? state.items.map((item) =>
                  item.key === key
                    ? { ...item, quantity: item.quantity + quantity }
                    : item,
                )
              : [...state.items, snapshot],
            drawerOpen: true,
          };
        }),
      removeItem: (key) =>
        set((state) => {
          const items = state.items.filter((item) => item.key !== key);
          if (items.length === 0) useOrderStore.getState().clearCoupon();
          return { items };
        }),
      updateQuantity: (key, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.key === key
              ? { ...item, quantity: Math.max(1, quantity) }
              : item,
          ),
        })),
      increment: (key) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.key === key ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        })),
      decrement: (key) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.key === key
              ? { ...item, quantity: Math.max(1, item.quantity - 1) }
              : item,
          ),
        })),
      clearCart: () => {
        useOrderStore.getState().clearCoupon();
        set({ items: [] });
      },
      setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
    }),
    {
      name: 'khane-kabab-cart',
      version: 2,
      migrate: (persisted, version) =>
        version < 2
          ? { items: [], drawerOpen: false }
          : (persisted as CartState),
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
    },
  ),
);
