'use client';
import { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useToastStore } from '@/stores/toast-store';
export function ToastRegion(){const {message,id,clear}=useToastStore();useEffect(()=>{if(!message)return;const timeout=window.setTimeout(clear,2400);return()=>window.clearTimeout(timeout)},[message,id,clear]);return message?<div className="global-toast" role="status" aria-live="polite"><CheckCircle2/>{message}</div>:null}
