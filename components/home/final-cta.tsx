import Link from 'next/link';
import { ArrowLeft, Clock3 } from 'lucide-react';
export function FinalCta(){return <section className="final-cta"><div className="container"><Clock3/><div><h2>غذای امروزت رو انتخاب کردی؟</h2><p>تازه از آشپزخانه، مستقیم تا در خانه شما</p></div><Link href="/menu" className="primary-button">مشاهده منو <ArrowLeft/></Link></div></section>}
