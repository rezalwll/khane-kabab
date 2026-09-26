import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { formatPrice } from '@/lib/format-price';
export function OfferBanner(){return <section className="container offer"><div className="offer-image"><Image src="/images/foods/kebab.jpg" alt="پک دو نفره کباب" fill sizes="(max-width: 760px) 100vw, 50vw"/></div><div className="offer-copy"><span>پیشنهاد ویژه خانه کباب</span><h2>پک دو نفره کباب</h2><p>دو پرس چلوکباب کوبیده، سالاد شیرازی و دوغ سنتی</p><div className="offer-price"><del>{formatPrice(820000)}</del><strong>{formatPrice(729000)}</strong></div><Link href="/menu" className="primary-button">سفارش پک <ArrowLeft/></Link></div></section>}
