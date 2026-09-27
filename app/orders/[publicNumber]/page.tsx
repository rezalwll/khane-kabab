import { OrderTrackingContent } from '@/components/order/order-tracking-content';
export const metadata = { title: 'پیگیری سفارش | خانه کباب طهران' };
export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ publicNumber: string }>;
}) {
  const { publicNumber } = await params;
  return (
    <main className="inner-page success-page">
      <div className="container">
        <OrderTrackingContent publicNumber={publicNumber} />
      </div>
    </main>
  );
}
