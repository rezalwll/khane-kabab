import type { Metadata } from 'next';
import './globals.css';
import './extra.css';
import './states.css';
import './bright-theme.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MobileNav } from '@/components/layout/mobile-nav';
import { CartDrawer } from '@/components/cart/cart-drawer';
export const metadata: Metadata = {metadataBase:new URL('https://khane-kabab-tehran.jamesjasper758pxt.chatgpt.site'),icons:{icon:'/brand/logo.svg'},title: 'خانه کباب طهران | سفارش آنلاین کباب و غذای ایرانی',description: 'سفارش آنلاین انواع چلوکباب، جوجه کباب و غذاهای اصیل ایرانی از خانه کباب طهران.',openGraph:{title:'خانه کباب طهران',description:'طعم اصیل ایران، در کنار شما',images:['/og-bright.png']},twitter:{card:'summary_large_image',title:'خانه کباب طهران',description:'طعم اصیل ایران، در کنار شما',images:['/og-bright.png']}};
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {return <html lang="fa" dir="rtl"><body><Header/>{children}<Footer/><MobileNav/><CartDrawer/></body></html>}
