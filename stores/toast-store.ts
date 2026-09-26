'use client';
import { create } from 'zustand';
type ToastState={message:string;id:number;show:(message:string)=>void;clear:()=>void};
export const useToastStore=create<ToastState>((set)=>({message:'',id:0,show:(message)=>set((state)=>({message,id:state.id+1})),clear:()=>set({message:''})}));
