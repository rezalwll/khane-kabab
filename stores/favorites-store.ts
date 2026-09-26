'use client';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
type FavoritesState={ids:string[];toggleFavorite:(id:string)=>void;isFavorite:(id:string)=>boolean};
const safeStorage: StateStorage={getItem:(name)=>{try{return localStorage.getItem(name)}catch{return null}},setItem:(name,value)=>{try{localStorage.setItem(name,value)}catch{}},removeItem:(name)=>{try{localStorage.removeItem(name)}catch{}}};
export const useFavorites=create<FavoritesState>()(persist((set,get)=>({ids:[],toggleFavorite:(id)=>set((state)=>({ids:state.ids.includes(id)?state.ids.filter((value)=>value!==id):[...state.ids,id]})),isFavorite:(id)=>get().ids.includes(id)}),{name:'khane-kabab-favorites',storage:createJSONStorage(()=>safeStorage),partialize:(state)=>({ids:state.ids}),skipHydration:true}));
