import Link from 'next/link';
import Image from 'next/image';
export function Logo(){return <Link href="/" className="brand" aria-label="خانه کباب طهران"><span className="brand-mark"><Image src="/brand/logo.png" alt="نشان خانه کباب طهران" width={56} height={56}/></span><span><strong>خانه کباب</strong><small>طهران</small></span></Link>}
