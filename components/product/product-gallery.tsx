'use client';
import { useState } from 'react';
import Image from 'next/image';
import type { Food } from '@/types/food';
export function ProductGallery({food}:{food:Food}){const [active,setActive]=useState(0);return <div className="product-gallery"><div className="main-photo"><Image key={food.gallery[active]} src={food.gallery[active]} alt={`${food.title}، تصویر ${active+1}`} fill priority sizes="(max-width: 760px) 100vw, 55vw"/></div><div className="thumbs" role="group" aria-label={`تصاویر ${food.title}`}>{food.gallery.map((image,index)=><button type="button" key={`${image}-${index}`} className={index===active?'active':''} onClick={()=>setActive(index)} aria-label={`نمایش تصویر ${index+1} از ${food.title}`} aria-pressed={index===active}><Image src={image} alt="" fill sizes="80px"/></button>)}</div></div>}
