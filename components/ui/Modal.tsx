"use client";

import { useEffect } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  testId?: string;
  panelClassName?: string;
}

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  testId = "app-modal",
  panelClassName = "max-w-md",
}: ModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar modal"
        className="absolute inset-0 bg-zinc-900/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        data-testid={testId}
        className={`relative z-10 flex max-h-[min(90dvh,48rem)] w-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl ${panelClassName}`}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-zinc-100 px-5 py-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <h3
              id="modal-title"
              className="text-lg font-semibold leading-tight text-zinc-900"
            >
              {title}
            </h3>
            {description ? (
              <p className="mt-1 break-words text-sm leading-snug text-zinc-600">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            data-testid="modal-close"
            onClick={onClose}
            className="shrink-0 rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
          >
            ✕
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-5 py-4 sm:px-6">
          {children}
        </div>
      </div>
    </div>
  );
}
