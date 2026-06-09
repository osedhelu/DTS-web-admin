"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { UiFeedback } from "@/components/ui/UiFeedback";
import { resolveMediaUrl } from "@/lib/media-url";
import { hasValidCoordinates } from "@/features/onboarding/lib/geolocation";
import { useStoreSettingsStore } from "@/features/store-settings/stores/settings-store";
import { formatStoreVertical } from "@/features/store-settings/utils";
import { useMerchantSessionStore } from "@/features/stores/stores/merchant-session-store";
import type { Store } from "@/features/stores/types";

const StoreLocationPicker = dynamic(
  () =>
    import("@/features/onboarding/components/StoreLocationPicker").then(
      (module) => module.StoreLocationPicker,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-500">
        Cargando mapa de ubicación…
      </div>
    ),
  },
);

interface StoreSettingsFormProps {
  storeId: number;
  initial: Store;
}

export function StoreSettingsForm({ storeId, initial }: StoreSettingsFormProps) {
  const updateProfile = useStoreSettingsStore((state) => state.updateProfile);
  const updateStoreInList = useMerchantSessionStore(
    (state) => state.updateStoreInList,
  );
  const isSaving = useStoreSettingsStore((state) => state.isSaving);

  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [phone, setPhone] = useState(initial.phone);
  const [address, setAddress] = useState(initial.address);
  const [latitude, setLatitude] = useState<number | null>(initial.latitude);
  const [longitude, setLongitude] = useState<number | null>(initial.longitude);
  const [locationSource, setLocationSource] = useState<"gps" | "manual" | null>(
    null,
  );
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(initial.is_open);
  const [logoPreview, setLogoPreview] = useState(() => resolveMediaUrl(initial.logo_url));
  const [logoFile, setLogoFile] = useState<File | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLocationError(null);

    if (!hasValidCoordinates(latitude, longitude)) {
      setLocationError("Debes marcar la ubicación de tu tienda en el mapa.");
      return;
    }

    const locationChanged =
      latitude !== initial.latitude || longitude !== initial.longitude;

    const saved = await updateProfile(storeId, {
      name,
      description,
      phone,
      address,
      status: isOpen ? "open" : "closed",
      logo: logoFile,
      ...(locationChanged ? { latitude, longitude } : {}),
    });

    if (saved) {
      updateStoreInList(saved);
      setLogoPreview(resolveMediaUrl(saved.logo_url));
      setLogoFile(null);
      setLatitude(saved.latitude);
      setLongitude(saved.longitude);
    }
  }

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setLogoFile(file);

    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    }
  }

  return (
    <form
      data-testid="store-settings-form"
      onSubmit={(event) => void handleSubmit(event)}
      className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6"
    >
      <UiFeedback successTestId="store-settings-success-message" />

      <div className="grid gap-6 md:grid-cols-[160px_1fr]">
        <div className="space-y-3">
          <div
            data-testid="store-settings-logo-preview"
            className="flex h-40 w-40 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50"
          >
            {logoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoPreview}
                alt="Logo de la tienda"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm text-zinc-400">Sin logo</span>
            )}
          </div>
          <label className="block text-sm text-zinc-700">
            Logo
            <input
              data-testid="store-settings-logo-input"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="mt-1 block w-full text-sm"
            />
          </label>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-zinc-700">
            Nombre de la tienda
            <input
              data-testid="store-settings-name"
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>

          <label className="block text-sm font-medium text-zinc-700">
            Descripción
            <textarea
              data-testid="store-settings-description"
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-zinc-700">
              Teléfono
              <input
                data-testid="store-settings-phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              />
            </label>

            <div className="block text-sm font-medium text-zinc-700">
              Vertical
              <p
                data-testid="store-settings-vertical"
                className="mt-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-600"
              >
                {formatStoreVertical(initial.vertical)}
              </p>
            </div>
          </div>

          <label className="block text-sm font-medium text-zinc-700">
            Dirección escrita
            <input
              data-testid="store-settings-address"
              type="text"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Calle, barrio, referencia"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>

          <StoreLocationPicker
            variant="settings"
            latitude={latitude}
            longitude={longitude}
            locationSource={locationSource}
            onChange={(patch) => {
              setLatitude(patch.latitude);
              setLongitude(patch.longitude);
              setLocationSource(patch.locationSource);
              setLocationError(null);
            }}
          />

          {locationError ? (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {locationError}
            </p>
          ) : null}

          <label className="flex items-center gap-3 text-sm font-medium text-zinc-700">
            <input
              data-testid="store-settings-status-toggle"
              type="checkbox"
              checked={isOpen}
              onChange={(event) => setIsOpen(event.target.checked)}
              className="h-4 w-4 rounded border-zinc-300"
            />
            Tienda abierta al público
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          data-testid="store-settings-submit"
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isSaving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
