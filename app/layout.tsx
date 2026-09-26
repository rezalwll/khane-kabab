import type { Metadata } from 'next';
import './globals.css';
import './extra.css';
import './states.css';
import './bright-theme.css';
import './polish.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MobileNav } from '@/components/layout/mobile-nav';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { StoreHydrator } from '@/components/shared/store-hydrator';
import { ToastRegion } from '@/components/shared/toast-region';
const siteUrl=process.env.NEXT_PUBLIC_SITE_URL??'http://localhost:3000';
export const metadata: Metadata = {metadataBase:new URL(siteUrl),icons:{icon:'/brand/logo.png',shortcut:'/brand/logo.png',apple:'/brand/logo.png'},title: 'خانه کباب طهران | سفارش آنلاین کباب و غذای ایرانی',description: 'سفارش آنلاین انواع چلوکباب، جوجه کباب و غذاهای اصیل ایرانی از خانه کباب طهران.',openGraph:{title:'خانه کباب طهران',description:'طعم اصیل ایران، در کنار شما',locale:'fa_IR',type:'website',images:['/og-bright.png']},twitter:{card:'summary_large_image',title:'خانه کباب طهران',description:'طعم اصیل ایران، در کنار شما',images:['/og-bright.png']}};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {return <html lang="fa" dir="rtl"><body><StoreHydrator/><Header/>{children}<Footer/><MobileNav/><CartDrawer/><ToastRegion/></body></html>}
