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
        className={`relative z-10 w-full rounded-xl border border-zinc-200 bg-white p-6 shadow-xl ${panelClassName}`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 id="modal-title" className="text-lg font-semibold text-zinc-900">
              {title}
            </h3>
            {description ? (
              <p className="mt-1 text-sm text-zinc-600">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            data-testid="modal-close"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
