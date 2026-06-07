"use client";

import { useState } from "react";

import type {
  Banner,
  CreateBannerPayload,
  UpdateBannerPayload,
} from "@/features/banners/types";

interface BannerFormProps {
  initial?: Banner | null;
  submitLabel?: string;
  onSubmit: (payload: CreateBannerPayload | UpdateBannerPayload) => Promise<boolean>;
  onCancel?: () => void;
}

const defaultPayload: CreateBannerPayload = {
  title: "",
  image_url: "",
  link_url: "",
  is_active: true,
  sort_order: 0,
};

export function BannerForm({
  initial = null,
  submitLabel,
  onSubmit,
  onCancel,
}: BannerFormProps) {
  const [payload, setPayload] = useState<CreateBannerPayload>(
    initial
      ? {
          title: initial.title,
          image_url: initial.image_url,
          link_url: initial.link_url,
          is_active: initial.is_active,
          sort_order: initial.sort_order,
        }
      : defaultPayload,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    const saved = await onSubmit(payload);
    if (saved && !initial) {
      setPayload(defaultPayload);
    }

    setIsSubmitting(false);
  }

  return (
    <form
      data-testid={initial ? "banner-edit-form" : "banner-form"}
      onSubmit={(event) => void handleSubmit(event)}
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4"
    >
      <h3 className="text-sm font-semibold text-zinc-900">
        {initial ? "Editar banner" : "Nuevo banner"}
      </h3>

      <label className="flex flex-col gap-1 text-sm">
        Título
        <input
          data-testid="banner-title"
          required
          value={payload.title}
          onChange={(event) =>
            setPayload((current) => ({ ...current, title: event.target.value }))
          }
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        URL de imagen
        <input
          data-testid="banner-image-url"
          required
          type="url"
          value={payload.image_url}
          onChange={(event) =>
            setPayload((current) => ({ ...current, image_url: event.target.value }))
          }
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Enlace (opcional)
        <input
          data-testid="banner-link-url"
          type="url"
          value={payload.link_url ?? ""}
          onChange={(event) =>
            setPayload((current) => ({ ...current, link_url: event.target.value }))
          }
          className="rounded-lg border border-zinc-300 px-3 py-2"
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          data-testid="banner-is-active"
          type="checkbox"
          checked={payload.is_active ?? true}
          onChange={(event) =>
            setPayload((current) => ({ ...current, is_active: event.target.checked }))
          }
        />
        Activo
      </label>

      <div className="flex gap-2">
        <button
          type="submit"
          data-testid="banner-submit"
          disabled={isSubmitting}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isSubmitting ? "Guardando…" : (submitLabel ?? "Crear banner")}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm"
          >
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}
