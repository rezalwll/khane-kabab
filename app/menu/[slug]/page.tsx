import { ProductPageContent } from '@/components/product/product-page-content';
export const metadata = { title: 'مشاهده غذا | خانه کباب طهران' };
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProductPageContent slug={slug} />;
}
