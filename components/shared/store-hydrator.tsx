'use client';
import { useEffect } from 'react';
import { useCart } from '@/stores/cart-store';
import { useFavorites } from '@/stores/favorites-store';
import { useOrderStore } from '@/stores/order-store';
export function StoreHydrator(){useEffect(()=>{void Promise.all([useCart.persist.rehydrate(),useFavorites.persist.rehydrate(),useOrderStore.persist.rehydrate()]).then(()=>{if(useCart.getState().items.length===0)useOrderStore.getState().clearCoupon();useOrderStore.getState().markHydrated()})},[]);return null}
