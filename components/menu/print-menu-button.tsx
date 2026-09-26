'use client';
import { Printer } from 'lucide-react';

export function PrintMenuButton(){return <button className="print-menu-button" onClick={()=>window.print()}><Printer/>چاپ منو</button>}
