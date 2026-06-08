"use client";

import dynamic from "next/dynamic";
import { useState, type FormEvent } from "react";

import {
  CATEGORY_TEMPLATES,
  VERTICAL_OPTIONS,
} from "@/features/onboarding/constants";
import { hasValidCoordinates } from "@/features/onboarding/lib/geolocation";
import { useOnboardingStore } from "@/features/onboarding/stores/onboarding-store";

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

export function BusinessStep() {
  const form = useOnboardingStore((state) => state.form);
  const updateFormPatch = useOnboardingStore((state) => state.updateForm);
  const setVertical = useOnboardingStore((state) => state.setVertical);
  const setStep = useOnboardingStore((state) => state.setStep);
  const [locationError, setLocationError] = useState<string | null>(null);

  const templates = CATEGORY_TEMPLATES[form.vertical];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasValidCoordinates(form.latitude, form.longitude)) {
      setLocationError(
        "Debes capturar la ubicación GPS o marcar tu tienda en el mapa antes de continuar.",
      );
      return;
    }

    setLocationError(null);
    setStep(3);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Nombre de la tienda
        <input
          data-testid="onboarding-store-name"
          type="text"
          required
          value={form.storeName}
          onChange={(event) => updateFormPatch({ storeName: event.target.value })}
          className="rounded-lg border border-zinc-300 px-3 py-2 font-normal text-zinc-900 outline-none ring-zinc-400 focus:ring-2"
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-zinc-700">Vertical</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {VERTICAL_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`cursor-pointer rounded-lg border p-3 text-left transition-colors ${
                form.vertical === option.value
                  ? "border-zinc-900 bg-zinc-50"
                  : "border-zinc-200 hover:border-zinc-300"
              }`}
            >
              <input
                type="radio"
                name="vertical"
                value={option.value}
                checked={form.vertical === option.value}
                onChange={() => setVertical(option.value)}
                className="sr-only"
                data-testid={`onboarding-vertical-${option.value}`}
              />
              <span className="block text-sm font-semibold text-zinc-900">
                {option.label}
              </span>
              <span className="mt-1 block text-xs text-zinc-600">
                {option.description}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Categoría principal
        <select
          data-testid="onboarding-category-template"
          required
          value={form.categoryTemplate}
          onChange={(event) =>
            updateFormPatch({ categoryTemplate: event.target.value })
          }
          className="rounded-lg border border-zinc-300 px-3 py-2 font-normal text-zinc-900 outline-none ring-zinc-400 focus:ring-2"
        >
          {templates.map((template) => (
            <option key={template} value={template}>
              {template}
            </option>
          ))}
        </select>
      </label>

      <StoreLocationPicker
        latitude={form.latitude}
        longitude={form.longitude}
        locationSource={form.locationSource}
        onChange={(patch) => {
          updateFormPatch(patch);
          setLocationError(null);
        }}
      />

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Teléfono de contacto
        <input
          data-testid="onboarding-phone"
          type="tel"
          required
          value={form.phone}
          onChange={(event) => updateFormPatch({ phone: event.target.value })}
          placeholder="+57 300 123 4567"
          className="rounded-lg border border-zinc-300 px-3 py-2 font-normal text-zinc-900 outline-none ring-zinc-400 focus:ring-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700">
        Dirección escrita (opcional)
        <input
          data-testid="onboarding-address"
          type="text"
          value={form.address}
          onChange={(event) => updateFormPatch({ address: event.target.value })}
          placeholder="Calle, barrio, referencia"
          className="rounded-lg border border-zinc-300 px-3 py-2 font-normal text-zinc-900 outline-none ring-zinc-400 focus:ring-2"
        />
      </label>

      {locationError ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {locationError}
        </p>
      ) : null}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          data-testid="onboarding-step2-back"
          onClick={() => setStep(1)}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Atrás
        </button>
        <button
          type="submit"
          data-testid="onboarding-step2-next"
          className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          Continuar
        </button>
      </div>
    </form>
  );
}
