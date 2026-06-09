"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

import { VERTICAL_OPTIONS } from "@/features/onboarding/constants";
import { hasValidCoordinates } from "@/features/onboarding/lib/geolocation";
import {
  onboardingAlertErrorClass,
  onboardingPrimaryBtnClass,
  onboardingSecondaryBtnClass,
  onboardingSummaryClass,
} from "@/features/onboarding/lib/form-styles";
import type { MerchantRegisterPayload } from "@/features/onboarding/types";
import { useOnboardingStore } from "@/features/onboarding/stores/onboarding-store";

function verticalLabel(value: string): string {
  return VERTICAL_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function ReviewStep() {
  const router = useRouter();
  const form = useOnboardingStore((state) => state.form);
  const updateForm = useOnboardingStore((state) => state.updateForm);
  const setStep = useOnboardingStore((state) => state.setStep);
  const isSubmitting = useOnboardingStore((state) => state.isSubmitting);
  const submitError = useOnboardingStore((state) => state.submitError);
  const setSubmitting = useOnboardingStore((state) => state.setSubmitting);
  const setSubmitError = useOnboardingStore((state) => state.setSubmitError);
  const reset = useOnboardingStore((state) => state.reset);

  const hasLocation = hasValidCoordinates(form.latitude, form.longitude);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.acceptTerms) {
      setSubmitError("Debes aceptar los términos para continuar.");
      return;
    }

    if (!hasLocation) {
      setSubmitError("Falta la ubicación de la tienda. Vuelve al paso anterior.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const payload: MerchantRegisterPayload = {
      email: form.email.trim(),
      password: form.password,
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      store_name: form.storeName.trim(),
      vertical: form.vertical,
      category_template: form.categoryTemplate,
      phone: form.phone.trim(),
      address: form.address.trim() || undefined,
      latitude: form.latitude!,
      longitude: form.longitude!,
    };

    try {
      const response = await fetch("/api/public/merchant/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { detail?: string; email?: string };

      if (!response.ok) {
        setSubmitError(data.detail ?? "No se pudo completar el registro");
        return;
      }

      reset();
      router.push(
        `/registro-comercio/exito?email=${encodeURIComponent(data.email ?? form.email)}`,
      );
    } catch {
      setSubmitError("Error de conexión. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div data-testid="onboarding-summary" className={onboardingSummaryClass}>
        <p>
          <span className="font-medium text-white">Cuenta:</span>{" "}
          {form.firstName} {form.lastName} · {form.email}
        </p>
        <p className="mt-2">
          <span className="font-medium text-white">Tienda:</span>{" "}
          {form.storeName}
        </p>
        <p className="mt-2">
          <span className="font-medium text-white">Vertical:</span>{" "}
          {verticalLabel(form.vertical)} · {form.categoryTemplate}
        </p>
        <p className="mt-2">
          <span className="font-medium text-white">Ubicación:</span>{" "}
          {hasLocation
            ? `${form.latitude!.toFixed(5)}, ${form.longitude!.toFixed(5)} (${
                form.locationSource === "gps" ? "GPS" : "mapa"
              })`
            : "Sin ubicación"}
        </p>
        <p className="mt-2">
          <span className="font-medium text-white">Contacto:</span>{" "}
          {form.phone}
          {form.address ? ` · ${form.address}` : ""}
        </p>
      </div>

      <label className="flex items-start gap-2 text-sm text-zinc-300">
        <input
          data-testid="onboarding-accept-terms"
          type="checkbox"
          checked={form.acceptTerms}
          onChange={(event) =>
            updateForm({ acceptTerms: event.target.checked })
          }
          className="mt-1 accent-emerald-500"
        />
        <span>
          Acepto los términos del servicio y la política de tratamiento de datos
          de DTS Delivery.
        </span>
      </label>

      {submitError ? (
        <p role="alert" className={onboardingAlertErrorClass}>
          {submitError}
        </p>
      ) : null}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          data-testid="onboarding-step3-back"
          onClick={() => setStep(2)}
          disabled={isSubmitting}
          className={onboardingSecondaryBtnClass}
        >
          Atrás
        </button>
        <button
          type="submit"
          data-testid="onboarding-submit"
          disabled={isSubmitting || !form.acceptTerms}
          className={`flex-1 ${onboardingPrimaryBtnClass}`}
        >
          {isSubmitting ? "Registrando…" : "Crear mi comercio"}
        </button>
      </div>
    </form>
  );
}
