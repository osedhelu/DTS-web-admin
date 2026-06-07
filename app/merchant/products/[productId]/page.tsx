import { ProductEditManager } from "@/features/products/components/ProductEditManager";

interface ProductEditPageProps {
  params: Promise<{ productId: string }>;
}

export default async function MerchantProductEditPage({
  params,
}: ProductEditPageProps) {
  const { productId } = await params;

  return (
    <section className="space-y-6">
      <ProductEditManager productId={Number(productId)} />
    </section>
  );
}
