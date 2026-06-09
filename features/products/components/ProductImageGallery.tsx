"use client";

import { useRef, useState } from "react";

import { resolveMediaUrl } from "@/lib/media-url";
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

export function ProductImageGallery({
  images,
  onUpload,
  onDelete,
  onSetPrimary,
  onReplace,
  isUploading = false,
  busyImageId = null,
}: ProductImageGalleryProps) {
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replacingImageId, setReplacingImageId] = useState<number | null>(null);

  async function handleUploadChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    await onUpload(file);

    if (uploadInputRef.current) {
      uploadInputRef.current.value = "";
    }
  }

  function handleReplaceClick(imageId: number) {
    setReplacingImageId(imageId);
    replaceInputRef.current?.click();
  }

  async function handleReplaceChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    const imageId = replacingImageId;

    if (!file || imageId === null) {
      return;
    }

    await onReplace(imageId, file);
    setReplacingImageId(null);

    if (replaceInputRef.current) {
      replaceInputRef.current.value = "";
    }
  }

  async function handleDelete(imageId: number) {
    const confirmed = window.confirm("¿Eliminar esta foto del producto?");
    if (!confirmed) {
      return;
    }

    await onDelete(imageId);
  }

  return (
    <section
      data-testid="product-image-gallery"
      className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50/50 p-5"
    >
      <div>
        <h3 className="text-base font-semibold text-zinc-900">Fotos del producto</h3>
        <p className="mt-1 text-sm text-zinc-600">
          Sube, reemplaza o elimina imágenes. Marca una como principal para el catálogo.
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        {images.map((image) => {
          const isBusy = busyImageId === image.id;
          const src = resolveMediaUrl(image.url) || image.url;

          return (
            <article
              key={image.id}
              data-testid={`product-image-${image.id}`}
              className="w-36 space-y-2"
            >
              <figure className="relative aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="Producto" className="h-full w-full object-cover" />
                {image.is_primary ? (
                  <span className="absolute left-2 top-2 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    Principal
                  </span>
                ) : null}
              </figure>

              <div className="flex flex-wrap gap-1.5">
                {!image.is_primary ? (
                  <button
                    type="button"
                    data-testid={`product-image-primary-${image.id}`}
                    disabled={isBusy}
                    onClick={() => void onSetPrimary(image.id)}
                    className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
                  >
                    Principal
                  </button>
                ) : null}
                <button
                  type="button"
                  data-testid={`product-image-replace-${image.id}`}
                  disabled={isBusy}
                  onClick={() => handleReplaceClick(image.id)}
                  className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
                >
                  {isBusy ? "…" : "Reemplazar"}
                </button>
                <button
                  type="button"
                  data-testid={`product-image-delete-${image.id}`}
                  disabled={isBusy}
                  onClick={() => void handleDelete(image.id)}
                  className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-medium text-red-700 hover:bg-red-100 disabled:opacity-60"
                >
                  Eliminar
                </button>
              </div>
            </article>
          );
        })}

        {images.length === 0 ? (
          <div
            data-testid="product-image-placeholder"
            className="flex aspect-square w-36 items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white text-xs text-zinc-400"
          >
            Sin fotos
          </div>
        ) : null}
      </div>

      <div>
        <input
          ref={uploadInputRef}
          data-testid="product-image-input"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleUploadChange}
        />
        <input
          ref={replaceInputRef}
          data-testid="product-image-replace-input"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleReplaceChange}
        />
        <button
          type="button"
          data-testid="product-image-upload"
          disabled={isUploading}
          onClick={() => uploadInputRef.current?.click()}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
        >
          {isUploading ? "Subiendo…" : "Subir foto"}
        </button>
      </div>
    </section>
  );
}
