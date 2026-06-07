"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { useUiStore } from "@/lib/stores/ui-store";

export function UiToastBridge() {
  const successMessage = useUiStore((state) => state.successMessage);
  const error = useUiStore((state) => state.error);
  const previous = useRef({ successMessage, error });

  useEffect(() => {
    if (successMessage && successMessage !== previous.current.successMessage) {
      toast.success(successMessage);
    }

    if (error && error !== previous.current.error) {
      toast.error(error);
    }

    previous.current = { successMessage, error };
  }, [successMessage, error]);

  return null;
}
