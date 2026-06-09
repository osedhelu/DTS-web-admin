"use client";

import { MediaImageGallery } from "@/components/ui/MediaImageGallery";
import type { ProductImage } from "@/features/products/types";

interface ProductImageGalleryProps {
  images: ProductImage[];
  onUpload: (file: File) => Promise<ProductImage | null>;
  onDelete: (imageId: number) => Promise<boolean>;
  onSetPrimary: (imageId: number) => Promise<ProductImage | null>;
  onReplace: (imageId: number, file: File) => Promise<ProductImage | null>;
  isUploading?: boolean;
  busyImageId?: number | null;
}

export function ProductImageGallery(props: ProductImageGalleryProps) {
  return (
    <MediaImageGallery
      {...props}
      title="Fotos del producto"
      description="Sube, reemplaza o elimina imágenes. Marca una como principal para el catálogo."
      testIdPrefix="product-image"
    />
  );
}
