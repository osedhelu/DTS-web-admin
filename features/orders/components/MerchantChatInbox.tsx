"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { OrderChatModal } from "@/features/orders/components/OrderChatPanel";
import { useOrderChatStore } from "@/features/orders/stores/order-chat-store";
import type { PaginatedResponse } from "@/lib/api/types";

const SCAN_MS = 5_000;

async function fetchOrderIds(orderType: "delivery" | "service"): Promise<number[]> {
  try {
    const response = await fetch(`/api/merchant/orders?order_type=${orderType}`);
    if (!response.ok) return [];
    const data = (await response.json()) as PaginatedResponse<{ id: number }>;
    const rows = Array.isArray(data.results) ? data.results : [];
    return rows
      .map((row) => Number(row.id))
      .filter((id) => Number.isFinite(id) && id > 0);
  } catch {
    return [];
  }
}

/** Escanea chats en background y monta el modal global del merchant. */
export function MerchantChatInbox() {
  const scanOrdersForNewMessages = useOrderChatStore(
    (s) => s.scanOrdersForNewMessages,
  );

  useEffect(() => {
    let cancelled = false;

    async function tick() {
      const [deliveryIds, serviceIds] = await Promise.all([
        fetchOrderIds("delivery"),
        fetchOrderIds("service"),
      ]);
      if (cancelled) return;
      const ids = [...new Set([...deliveryIds, ...serviceIds])].slice(0, 30);
      if (ids.length === 0) return;
      await scanOrdersForNewMessages(ids);
    }

    void tick();
    const timer = window.setInterval(() => {
      void tick();
    }, SCAN_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [scanOrdersForNewMessages]);

  return <OrderChatModal />;
}

export function MerchantMessagesButton() {
  const unreadCount = useOrderChatStore((s) => s.unreadCount);
  const unreadByOrder = useOrderChatStore((s) => s.unreadByOrder);
  const unreadPreviewByOrder = useOrderChatStore((s) => s.unreadPreviewByOrder);
  const openModal = useOrderChatStore((s) => s.openModal);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const items = useMemo(
    () =>
      Object.entries(unreadByOrder)
        .map(([orderId, count]) => ({
          orderId: Number(orderId),
          count,
          preview: unreadPreviewByOrder[Number(orderId)] ?? "",
        }))
        .filter((item) => item.count > 0)
        .sort((a, b) => b.count - a.count),
    [unreadByOrder, unreadPreviewByOrder],
  );

  useEffect(() => {
    if (!open) return;
    function onDocClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const badgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        data-testid="merchant-messages-button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="relative inline-flex items-center rounded-lg border border-transparent bg-emerald-600 px-4 py-2.5 text-sm font-medium leading-5 text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200"
      >
        <svg
          className="me-1.5 -ms-0.5 h-4 w-4"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 13h3.439a.991.991 0 0 1 .908.6 3.978 3.978 0 0 0 7.306 0 .99.99 0 0 1 .908-.6H20M4 13v6a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-6M4 13l2-9h12l2 9M9 7h6m-7 3h8"
          />
        </svg>
        <span className="sr-only">Notificaciones de chat</span>
        Mensajes
        {unreadCount > 0 ? (
          <span
            data-testid="merchant-messages-badge"
            className="absolute -end-2 -top-2 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-red-600 text-xs font-bold text-white"
          >
            {badgeLabel}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          data-testid="merchant-messages-menu"
          className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg"
        >
          <div className="border-b border-zinc-100 px-4 py-3">
            <p className="text-sm font-semibold text-zinc-900">
              Mensajes del chat
            </p>
            <p className="text-xs text-zinc-500">
              {unreadCount > 0
                ? `${unreadCount} sin leer`
                : "Sin mensajes nuevos"}
            </p>
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-zinc-500">
              Cuando un cliente o conductor te escriba, aparecerá aquí.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {items.map((item) => (
                <li key={item.orderId}>
                  <button
                    type="button"
                    role="menuitem"
                    data-testid={`merchant-messages-item-${item.orderId}`}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-zinc-50"
                    onClick={() => {
                      setOpen(false);
                      void openModal(item.orderId);
                    }}
                  >
                    <span className="mt-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-bold text-white">
                      {item.count > 99 ? "99+" : item.count}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-zinc-900">
                        Pedido #{item.orderId}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-zinc-500">
                        {item.preview || "Nuevo mensaje"}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
