'use client';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import type { Addon, Food } from '@/types/food';

export type CartItem = { key: string; food: Food; quantity: number; addons: Addon[]; note?: string };
type CartState = {
  items: CartItem[]; drawerOpen: boolean;
  addItem: (food: Food, quantity?: number, addons?: Addon[], note?: string) => void;
  removeItem: (key: string) => void; updateQuantity: (key: string, quantity: number) => void;
  increment: (key: string) => void; decrement: (key: string) => void;
  clearCart: () => void; setDrawerOpen: (open: boolean) => void;
};
const safeStorage: StateStorage = {
  getItem: (name) => { try { return localStorage.getItem(name); } catch { return null; } },
  setItem: (name, value) => { try { localStorage.setItem(name, value); } catch {} },
  removeItem: (name) => { try { localStorage.removeItem(name); } catch {} },
};
const itemKey = (food: Food, addons: Addon[], note?: string) => [food.id,...addons.map((addon)=>addon.id).sort(),note?.trim()??''].join('|');

export const useCart = create<CartState>()(persist((set) => ({
  items: [], drawerOpen: false,
  addItem: (food, quantity = 1, addons = [], note) => set((state) => {
    const key=itemKey(food,addons,note); const found=state.items.find((item)=>item.key===key);
    return {items:found?state.items.map((item)=>item.key===key?{...item,quantity:item.quantity+quantity}:item):[...state.items,{key,food,quantity,addons,note:note?.trim()||undefined}],drawerOpen:true};
  }),
  removeItem:(key)=>set((state)=>({items:state.items.filter((item)=>item.key!==key)})),
  updateQuantity:(key,quantity)=>set((state)=>({items:state.items.map((item)=>item.key===key?{...item,quantity:Math.max(1,quantity)}:item)})),
  increment:(key)=>set((state)=>({items:state.items.map((item)=>item.key===key?{...item,quantity:item.quantity+1}:item)})),
  decrement:(key)=>set((state)=>({items:state.items.map((item)=>item.key===key?{...item,quantity:Math.max(1,item.quantity-1)}:item)})),
  clearCart:()=>set({items:[]}), setDrawerOpen:(drawerOpen)=>set({drawerOpen}),
}),{name:'khane-kabab-cart',storage:createJSONStorage(()=>safeStorage),partialize:(state)=>({items:state.items}),skipHydration:true}));
export const itemTotal=(item:CartItem)=>(item.food.price+item.addons.reduce((sum,addon)=>sum+addon.price,0))*item.quantity;
export const cartSubtotal=(items:CartItem[])=>items.reduce((sum,item)=>sum+itemTotal(item),0);
