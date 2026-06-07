"use client";

import { useUiStore } from "@/lib/stores/ui-store";

interface UiFeedbackProps {
  successTestId?: string;
}

export function UiFeedback({ successTestId }: UiFeedbackProps) {
  const error = useUiStore((state) => state.error);
  const successMessage = useUiStore((state) => state.successMessage);

  return (
    <>
      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      {successMessage ? (
        <p
          data-testid={successTestId}
          className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
        >
          {successMessage}
        </p>
      ) : null}
    </>
  );
}
