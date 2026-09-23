'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Addon, Food } from '@/types/food';

export type CartItem = { key: string; food: Food; quantity: number; addons: Addon[] };
type CartState = {
  items: CartItem[]; drawerOpen: boolean;
  addItem: (food: Food, quantity?: number, addons?: Addon[]) => void; removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void; increment: (key: string) => void; decrement: (key: string) => void;
  clearCart: () => void; setDrawerOpen: (open: boolean) => void;
};
export const useCart = create<CartState>()(persist((set) => ({
  items: [], drawerOpen: false,
  addItem: (food, quantity = 1, addons = []) => set((state) => { const key = `${food.id}-${addons.map(a=>a.id).sort().join('.')}`; const found = state.items.find(i=>i.key===key); return {items: found ? state.items.map(i=>i.key===key?{...i,quantity:i.quantity+quantity}:i) : [...state.items,{key,food,quantity,addons}],drawerOpen:true}; }),
  removeItem: (key) => set(s=>({items:s.items.filter(i=>i.key!==key)})),
  updateQuantity: (key, quantity) => set(s=>({items:s.items.map(i=>i.key===key?{...i,quantity:Math.max(1,quantity)}:i)})),
  increment: (key) => set(s=>({items:s.items.map(i=>i.key===key?{...i,quantity:i.quantity+1}:i)})),
  decrement: (key) => set(s=>({items:s.items.map(i=>i.key===key?{...i,quantity:Math.max(1,i.quantity-1)}:i)})),
  clearCart: () => set({items:[]}), setDrawerOpen: (drawerOpen) => set({drawerOpen}),
}),{name:'khane-kabab-cart',partialize:(s)=>({items:s.items})}));
export const itemTotal = (item: CartItem) => (item.food.price + item.addons.reduce((sum,a)=>sum+a.price,0))*item.quantity;
