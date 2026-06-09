"use client";

import { useEffect, useState } from "react";

import { UiFeedback } from "@/components/ui/UiFeedback";
import { IconActionButton } from "@/components/ui/IconActionButton";
import { EditIcon, TrashIcon } from "@/components/ui/icons";
import { BannerForm } from "@/features/banners/components/BannerForm";
import { useBannersStore } from "@/features/banners/stores/banners-store";
import type { Banner, CreateBannerPayload } from "@/features/banners/types";

export function BannersManager() {
  const banners = useBannersStore((state) => state.banners);
  const isLoading = useBannersStore((state) => state.isLoading);
  const loadBanners = useBannersStore((state) => state.loadBanners);
  const createBanner = useBannersStore((state) => state.createBanner);
  const updateBanner = useBannersStore((state) => state.updateBanner);
  const deleteBanner = useBannersStore((state) => state.deleteBanner);

  const [editing, setEditing] = useState<Banner | null>(null);

  useEffect(() => {
    void loadBanners();
  }, [loadBanners]);

  return (
    <div data-testid="banners-manager" className="space-y-6">
      <UiFeedback successTestId="banners-success-message" />

      {editing ? (
        <BannerForm
          initial={editing}
          submitLabel="Guardar cambios"
          onCancel={() => setEditing(null)}
          onSubmit={async (payload) => {
            const saved = await updateBanner(editing.id, payload);
            if (saved) {
              setEditing(null);
            }
            return saved;
          }}
        />
      ) : (
        <BannerForm
          onSubmit={async (payload) => createBanner(payload as CreateBannerPayload)}
        />
      )}

      {isLoading ? (
        <p className="text-sm text-zinc-500">Cargando banners…</p>
      ) : (
        <div
          data-testid="banners-list"
          className="overflow-x-auto rounded-xl border border-zinc-200 bg-white"
        >
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-zinc-600">
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Orden</th>
                <th className="px-4 py-3">Activo</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner) => (
                <tr
                  key={banner.id}
                  data-testid={`banner-row-${banner.id}`}
                  className="border-b border-zinc-100"
                >
                  <td className="px-4 py-3 font-medium">{banner.title}</td>
                  <td className="px-4 py-3">{banner.sort_order}</td>
                  <td className="px-4 py-3">{banner.is_active ? "Sí" : "No"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <IconActionButton
                        label="Editar banner"
                        testId={`banner-edit-${banner.id}`}
                        icon={<EditIcon />}
                        onClick={() => setEditing(banner)}
                      />
                      <IconActionButton
                        label="Eliminar banner"
                        variant="danger"
                        testId={`banner-delete-${banner.id}`}
                        icon={<TrashIcon />}
                        onClick={() => void deleteBanner(banner.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {banners.length === 0 ? (
            <p className="px-4 py-3 text-sm text-zinc-500">No hay banners creados.</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
