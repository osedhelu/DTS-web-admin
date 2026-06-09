"use client";

import dynamic from "next/dynamic";
import { useState, type FormEvent } from "react";

import {
  CATEGORY_TEMPLATES,
  VERTICAL_OPTIONS,
} from "@/features/onboarding/constants";
import { hasValidCoordinates } from "@/features/onboarding/lib/geolocation";
import {
  onboardingAlertErrorClass,
  onboardingInputClass,
  onboardingLabelClass,
  onboardingPrimaryBtnClass,
  onboardingSecondaryBtnClass,
  onboardingSelectClass,
} from "@/features/onboarding/lib/form-styles";
import { useOnboardingStore } from "@/features/onboarding/stores/onboarding-store";

const StoreLocationPicker = dynamic(
  () =>
    import("@/features/onboarding/components/StoreLocationPicker").then(
      (module) => module.StoreLocationPicker,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-white/10 bg-zinc-900/40 p-4 text-sm text-zinc-400">
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
      <label className={onboardingLabelClass}>
        Nombre de la tienda
        <input
          data-testid="onboarding-store-name"
          type="text"
          required
          value={form.storeName}
          onChange={(event) => updateFormPatch({ storeName: event.target.value })}
          className={onboardingInputClass}
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-zinc-300">Vertical</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {VERTICAL_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`cursor-pointer rounded-xl border p-3 text-left transition-colors ${
                form.vertical === option.value
                  ? "border-emerald-500/50 bg-emerald-500/10 ring-1 ring-emerald-500/30"
                  : "border-white/10 bg-zinc-900/30 hover:border-white/20"
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
              <span className="block text-sm font-semibold text-white">
                {option.label}
              </span>
              <span className="mt-1 block text-xs text-zinc-400">
                {option.description}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className={onboardingLabelClass}>
        Categoría principal
        <select
          data-testid="onboarding-category-template"
          required
          value={form.categoryTemplate}
          onChange={(event) =>
            updateFormPatch({ categoryTemplate: event.target.value })
          }
          className={onboardingSelectClass}
        >
          {templates.map((template) => (
            <option key={template} value={template} className="bg-zinc-900">
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

      <label className={onboardingLabelClass}>
        Teléfono de contacto
        <input
          data-testid="onboarding-phone"
          type="tel"
          required
          value={form.phone}
          onChange={(event) => updateFormPatch({ phone: event.target.value })}
          placeholder="+57 300 123 4567"
          className={onboardingInputClass}
        />
      </label>

      <label className={onboardingLabelClass}>
        Dirección escrita (opcional)
        <input
          data-testid="onboarding-address"
          type="text"
          value={form.address}
          onChange={(event) => updateFormPatch({ address: event.target.value })}
          placeholder="Calle, barrio, referencia"
          className={onboardingInputClass}
        />
      </label>

      {locationError ? (
        <p role="alert" className={onboardingAlertErrorClass}>
          {locationError}
        </p>
      ) : null}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          data-testid="onboarding-step2-back"
          onClick={() => setStep(1)}
          className={onboardingSecondaryBtnClass}
        >
          Atrás
        </button>
        <button
          type="submit"
          data-testid="onboarding-step2-next"
          className={`flex-1 ${onboardingPrimaryBtnClass}`}
        >
          Continuar
        </button>
      </div>
    </form>
  );
}
