"use client";

import { useRef, useState } from "react";

import { resolveMediaUrl } from "@/lib/media-url";
import type { ProductImage } from "@/features/products/types";

interface ProductImageGalleryProps {
  images: ProductImage[];
  onUpload: (file: File) => Promise<ProductImage | null>;
  isUploading?: boolean;
}

export function ProductImageGallery({
  images,
  onUpload,
  isUploading = false,
}: ProductImageGalleryProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    await onUpload(file);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  const galleryImages =
    previewUrl && images.length === 0
      ? [{ id: -1, url: previewUrl, is_primary: true }]
      : images;

  return (
    <section
      data-testid="product-image-gallery"
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-zinc-900">Fotos del producto</h3>
        <p className="text-sm text-zinc-600">
          Sube imágenes para mostrar en el catálogo.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {galleryImages.map((image) => (
          <figure
            key={image.id}
            data-testid={`product-image-${image.id}`}
            className="relative h-24 w-24 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveMediaUrl(image.url) || image.url}
              alt="Producto"
              className="h-full w-full object-cover"
            />
            {image.is_primary ? (
              <span className="absolute bottom-1 left-1 rounded bg-zinc-900/80 px-1.5 py-0.5 text-[10px] text-white">
                Principal
              </span>
            ) : null}
          </figure>
        ))}

        {galleryImages.length === 0 ? (
          <div
            data-testid="product-image-placeholder"
            className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed border-zinc-300 text-xs text-zinc-400"
          >
            Sin fotos
          </div>
        ) : null}
      </div>

      <div>
        <input
          ref={inputRef}
          data-testid="product-image-input"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          data-testid="product-image-upload"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
        >
          {isUploading ? "Subiendo…" : "Subir foto"}
        </button>
      </div>
    </section>
  );
}
