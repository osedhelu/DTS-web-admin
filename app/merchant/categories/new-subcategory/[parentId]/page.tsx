import { SubcategoryCreateManager } from "@/features/categories/components/SubcategoryCreateManager";

interface NewSubcategoryPageProps {
  params: Promise<{ parentId: string }>;
}

export default async function NewSubcategoryPage({ params }: NewSubcategoryPageProps) {
  const { parentId } = await params;

  return <SubcategoryCreateManager parentId={Number(parentId)} />;
}
