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
        <p role="alert" data-testid="ui-feedback-error" className="sr-only">
          {error}
        </p>
      ) : null}

      {successMessage ? (
        <p
          data-testid={successTestId}
          className="sr-only"
        >
          {successMessage}
        </p>
      ) : null}
    </>
  );
}
