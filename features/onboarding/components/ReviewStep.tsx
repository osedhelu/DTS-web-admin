"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

import { VERTICAL_OPTIONS } from "@/features/onboarding/constants";
import { hasValidCoordinates } from "@/features/onboarding/lib/geolocation";
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.acceptTerms) {
      setSubmitError("Debes aceptar los términos para continuar.");
      return;
    }

    if (!hasValidCoordinates(form.latitude, form.longitude)) {
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
      latitude: form.latitude,
      longitude: form.longitude,
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
      <div
        data-testid="onboarding-summary"
        className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700"
      >
        <p>
          <span className="font-medium text-zinc-900">Cuenta:</span>{" "}
          {form.firstName} {form.lastName} · {form.email}
        </p>
        <p className="mt-2">
          <span className="font-medium text-zinc-900">Tienda:</span>{" "}
          {form.storeName}
        </p>
        <p className="mt-2">
          <span className="font-medium text-zinc-900">Vertical:</span>{" "}
          {verticalLabel(form.vertical)} · {form.categoryTemplate}
        </p>
        <p className="mt-2">
          <span className="font-medium text-zinc-900">Ubicación:</span>{" "}
          {form.latitude !== null && form.longitude !== null
            ? `${form.latitude.toFixed(5)}, ${form.longitude.toFixed(5)} (${
                form.locationSource === "gps" ? "GPS" : "mapa"
              })`
            : "Sin ubicación"}
        </p>
        <p className="mt-2">
          <span className="font-medium text-zinc-900">Contacto:</span>{" "}
          {form.phone}
          {form.address ? ` · ${form.address}` : ""}
        </p>
      </div>

      <label className="flex items-start gap-2 text-sm text-zinc-700">
        <input
          data-testid="onboarding-accept-terms"
          type="checkbox"
          checked={form.acceptTerms}
          onChange={(event) =>
            updateForm({ acceptTerms: event.target.checked })
          }
          className="mt-1"
        />
        <span>
          Acepto los términos del servicio y la política de tratamiento de datos
          de DTS Delivery.
        </span>
      </label>

      {submitError ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {submitError}
        </p>
      ) : null}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          data-testid="onboarding-step3-back"
          onClick={() => setStep(2)}
          disabled={isSubmitting}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
        >
          Atrás
        </button>
        <button
          type="submit"
          data-testid="onboarding-submit"
          disabled={isSubmitting || !form.acceptTerms}
          className="flex-1 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Registrando…" : "Crear mi comercio"}
        </button>
      </div>
    </form>
  );
}
