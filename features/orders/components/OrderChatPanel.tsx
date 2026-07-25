"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

import { useOrderChatStore } from "@/features/orders/stores/order-chat-store";

interface OrderChatPanelProps {
  orderId: number;
}

const POLL_MS = 5_000;

export function OrderChatPanel({ orderId }: OrderChatPanelProps) {
  const messages = useOrderChatStore((s) => s.messages);
  const isLoading = useOrderChatStore((s) => s.isLoading);
  const error = useOrderChatStore((s) => s.error);
  const openChat = useOrderChatStore((s) => s.openChat);
  const sendMessage = useOrderChatStore((s) => s.sendMessage);
  const closeChat = useOrderChatStore((s) => s.closeChat);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void openChat(orderId);
    const id = window.setInterval(() => {
      void openChat(orderId);
    }, POLL_MS);
    return () => {
      window.clearInterval(id);
      closeChat();
    };
  }, [orderId, openChat, closeChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
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
      data-testid={`order-chat-panel-${orderId}`}
      className="mt-4 rounded-xl border border-zinc-200 bg-white p-3"
    >
      <p className="text-sm font-medium text-zinc-800">Chat del pedido</p>
      {error ? (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-3 max-h-48 space-y-2 overflow-y-auto rounded-lg bg-zinc-50 p-2">
        {isLoading && messages.length === 0 ? (
          <p className="text-xs text-zinc-500">Cargando…</p>
        ) : messages.length === 0 ? (
          <p className="text-xs text-zinc-500">Sin mensajes aún.</p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-lg px-2 py-1 text-xs ${
                m.sender_role === "merchant"
                  ? "ml-6 bg-emerald-100 text-emerald-900"
                  : "mr-6 bg-white text-zinc-700"
              }`}
            >
              <span className="font-semibold">
                {m.sender_role === "merchant"
                  ? "Tú"
                  : m.sender_role === "customer"
                    ? "Cliente"
                    : m.sender_role === "driver"
                      ? "Conductor"
                      : m.sender_role}
              </span>
              : {m.body}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={onSubmit} className="mt-2 flex gap-2">
        <input
          data-testid={`order-chat-input-${orderId}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Escribe al cliente o conductor…"
          className="flex-1 rounded-lg border border-zinc-200 px-2 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={sending}
          data-testid={`order-chat-send-${orderId}`}
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
        >
          {sending ? "…" : "Enviar"}
        </button>
      </form>
    </div>
  );
}
