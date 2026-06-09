"use client";

import { useCallback, useEffect, useRef } from "react";

const DRAFT_PREFIX = "dts-form-draft:";

function draftStorageKey(scope: string): string {
  return `${DRAFT_PREFIX}${scope}`;
}

export function readFormDraft<T>(scope: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(draftStorageKey(scope));
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeFormDraft<T>(scope: string, value: T): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(draftStorageKey(scope), JSON.stringify(value));
  } catch {
    // QuotaExceededError u otros — no bloquear el formulario.
  }
}

export function clearFormDraft(scope: string): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(draftStorageKey(scope));
}

interface UseFormDraftPersistenceOptions {
  enabled?: boolean;
  debounceMs?: number;
}

/**
 * Guarda el estado del formulario en localStorage mientras el usuario escribe.
 * Llama `clearDraft()` tras crear/actualizar con éxito.
 */
export function useFormDraftPersistence<T>(
  scope: string,
  value: T,
  options: UseFormDraftPersistenceOptions = {},
) {
  const { enabled = true, debounceMs = 400 } = options;
  const skipNextSaveRef = useRef(false);

  const clearDraft = useCallback(() => {
    skipNextSaveRef.current = true;
    clearFormDraft(scope);
  }, [scope]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      writeFormDraft(scope, value);
    }, debounceMs);

    return () => window.clearTimeout(timer);
  }, [debounceMs, enabled, scope, value]);

  return { clearDraft };
}
