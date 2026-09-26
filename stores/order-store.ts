'use client';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import type { OrderSnapshot } from '@/types/order';

type OrderState = {
  hydrated: boolean;
  couponCode: string;
  discountPercent: number;
  lastOrder: OrderSnapshot | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  clearCoupon: () => void;
  saveLastOrder: (order: OrderSnapshot) => void;
  markHydrated: () => void;
};

const safeStorage: StateStorage = {
  getItem: (name) => { try { return localStorage.getItem(name); } catch { return null; } },
  setItem: (name, value) => { try { localStorage.setItem(name, value); } catch {} },
  removeItem: (name) => { try { localStorage.removeItem(name); } catch {} },
};

export const useOrderStore = create<OrderState>()(persist((set) => ({
  hydrated:false, couponCode: '', discountPercent: 0, lastOrder: null,
  applyCoupon: (code) => {
    const valid = code.trim().toUpperCase() === 'KABAB10';
    set(valid ? {couponCode:'KABAB10',discountPercent:10} : {couponCode:'',discountPercent:0});
    return valid;
  },
  removeCoupon: () => set({couponCode:'',discountPercent:0}),
  clearCoupon: () => set({couponCode:'',discountPercent:0}),
  saveLastOrder: (lastOrder) => set({lastOrder}),
  markHydrated: () => set({hydrated:true}),
}), {
  name:'khane-kabab-order', storage:createJSONStorage(()=>safeStorage), skipHydration:true,
  partialize:(state)=>({couponCode:state.couponCode,discountPercent:state.discountPercent,lastOrder:state.lastOrder}),
}));
