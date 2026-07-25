"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import { useOrderChatStore } from "@/features/orders/stores/order-chat-store";

const POLL_MS = 4_000;

export function OrderChatButton({ orderId }: { orderId: number }) {
  const openModal = useOrderChatStore((s) => s.openModal);
  return (
    <button
      type="button"
      data-testid={`order-chat-open-${orderId}`}
      onClick={() => void openModal(orderId)}
      className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50"
    >
      Chat
    </button>
  );
}

/** Modal global único — montar una sola vez en el dashboard. */
export function OrderChatModal() {
  const modalOpen = useOrderChatStore((s) => s.modalOpen);
  const orderId = useOrderChatStore((s) => s.orderId);
  const messages = useOrderChatStore((s) => s.messages);
  const isLoading = useOrderChatStore((s) => s.isLoading);
  const error = useOrderChatStore((s) => s.error);
  const refreshMessages = useOrderChatStore((s) => s.refreshMessages);
  const sendMessage = useOrderChatStore((s) => s.sendMessage);
  const closeModal = useOrderChatStore((s) => s.closeModal);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!modalOpen || orderId === null) return;
    const id = window.setInterval(() => {
      void refreshMessages(orderId, { silent: true });
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [modalOpen, orderId, refreshMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    if (!modalOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeModal();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen, closeModal]);

  if (!modalOpen || orderId === null) return null;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      await sendMessage(text);
      setDraft("");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-chat-title"
      data-testid={`order-chat-modal-${orderId}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
          <div>
            <h2
              id="order-chat-title"
              className="text-sm font-semibold text-zinc-900"
            >
              Chat · Pedido #{orderId}
            </h2>
            <p className="text-xs text-zinc-500">Cliente y conductor</p>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="rounded-lg px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100"
            aria-label="Cerrar chat"
          >
            ✕
          </button>
        </div>

        {error ? (
          <p className="px-4 pt-2 text-xs text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex-1 space-y-2 overflow-y-auto bg-zinc-50 px-4 py-3">
          {isLoading && messages.length === 0 ? (
            <p className="text-xs text-zinc-500">Cargando…</p>
          ) : messages.length === 0 ? (
            <p className="text-xs text-zinc-500">Sin mensajes aún.</p>
          ) : (
            messages.map((m) => {
              const mine = m.sender_role === "merchant";
              const label =
                m.sender_role === "merchant"
                  ? "Tú"
                  : m.sender_role === "customer"
                    ? "Cliente"
                    : m.sender_role === "driver"
                      ? "Conductor"
                      : m.sender_role;
              return (
                <div
                  key={m.id}
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    mine
                      ? "ml-auto bg-emerald-600 text-white"
                      : "mr-auto bg-white text-zinc-800 shadow-sm"
                  }`}
                >
                  <p className="text-[10px] font-semibold opacity-80">{label}</p>
                  <p>{m.body}</p>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={onSubmit}
          className="flex gap-2 border-t border-zinc-200 p-3"
        >
          <input
            data-testid={`order-chat-input-${orderId}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Escribe al cliente o conductor…"
            className="flex-1 rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
            autoFocus
          />
          <button
            type="submit"
            disabled={sending}
            data-testid={`order-chat-send-${orderId}`}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {sending ? "…" : "Enviar"}
          </button>
        </form>
      </div>
    </div>
  );
}
