import { CategoryEditManager } from "@/features/categories/components/CategoryEditManager";

interface EditCategoryPageProps {
  params: Promise<{ categoryId: string }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { categoryId } = await params;

  return <CategoryEditManager categoryId={Number(categoryId)} />;
}
