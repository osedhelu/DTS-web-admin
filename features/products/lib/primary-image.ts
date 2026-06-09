import type { ProductImage } from "@/features/products/types";

export function resolvePrimaryImageUrl(
  images?: ProductImage[] | null,
  fallback?: string | null,
): string | null {
  if (fallback) {
    return fallback;
  }

  const primary = images?.find((image) => image.is_primary);
  if (primary?.url) {
    return primary.url;
  }

  return images?.[0]?.url ?? null;
}
