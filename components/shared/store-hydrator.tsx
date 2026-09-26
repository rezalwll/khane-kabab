'use client';
import { useEffect } from 'react';
import { useCart } from '@/stores/cart-store';
import { useFavorites } from '@/stores/favorites-store';
export function StoreHydrator(){useEffect(()=>{void useCart.persist.rehydrate();void useFavorites.persist.rehydrate()},[]);return null}
