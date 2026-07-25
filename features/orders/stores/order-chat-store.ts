"use client";

import { create } from "@/lib/stores/create-store";
import {
  playAlertBeep,
  unlockAlertAudio,
} from "@/lib/audio/play-alert-beep";

export interface OrderChatMessage {
  id: number;
  order_id: number;
  sender_id: number;
  sender_role: string;
  body: string;
  created_at: string;
}

function normalizeMessage(raw: Record<string, unknown>): OrderChatMessage | null {
  const id = Number(raw.id);
  const orderId = Number(raw.order_id);
  if (!Number.isFinite(id) || !Number.isFinite(orderId)) return null;
  return {
    id,
    order_id: orderId,
    sender_id: Number(raw.sender_id) || 0,
    sender_role: String(raw.sender_role ?? ""),
    body: String(raw.body ?? ""),
    created_at: String(raw.created_at ?? ""),
  };
}

function dedupeMessages(list: OrderChatMessage[]): OrderChatMessage[] {
  const byId = new Map<number, OrderChatMessage>();
  for (const m of list) {
    byId.set(m.id, m);
  }
  return [...byId.values()].sort((a, b) => a.id - b.id);
}

function sumUnread(unreadByOrder: Record<number, number>): number {
  return Object.values(unreadByOrder).reduce((a, b) => a + b, 0);
}

interface OrderChatState {
  modalOpen: boolean;
  orderId: number | null;
  messages: OrderChatMessage[];
  /** Total de mensajes no leídos (suma de unreadByOrder). */
  unreadCount: number;
  /** No leídos por pedido (solo inbound de cliente/conductor). */
  unreadByOrder: Record<number, number>;
  /** Preview del último inbound no leído por pedido. */
  unreadPreviewByOrder: Record<number, string>;
  /** Máximo id de mensaje marcado como leído por pedido. */
  lastSeenByOrder: Record<number, number>;
  isLoading: boolean;
  error: string | null;
  openModal: (orderId: number) => Promise<void>;
  closeModal: () => void;
  refreshMessages: (orderId: number, options?: { silent?: boolean }) => Promise<void>;
  sendMessage: (body: string) => Promise<void>;
  /** Escaneo background: detecta mensajes nuevos de otros roles. */
  scanOrdersForNewMessages: (orderIds: number[]) => Promise<void>;
  clearUnread: () => void;
  clearUnreadForOrder: (orderId: number) => void;
  noteSeenOrderIds: (orderIds: number[]) => void;
}

export const useOrderChatStore = create<OrderChatState>((set, get) => ({
  modalOpen: false,
  orderId: null,
  messages: [],
  unreadCount: 0,
  unreadByOrder: {},
  unreadPreviewByOrder: {},
  lastSeenByOrder: {},
  isLoading: false,
  error: null,

  openModal: async (orderId) => {
    unlockAlertAudio();
    const unreadByOrder = { ...get().unreadByOrder };
    const unreadPreviewByOrder = { ...get().unreadPreviewByOrder };
    delete unreadByOrder[orderId];
    delete unreadPreviewByOrder[orderId];
    set({
      modalOpen: true,
      orderId,
      isLoading: true,
      error: null,
      unreadByOrder,
      unreadPreviewByOrder,
      unreadCount: sumUnread(unreadByOrder),
    });
    await get().refreshMessages(orderId);
    const msgs = get().messages;
    const maxId = msgs.reduce((m, x) => Math.max(m, x.id), 0);
    set({
      lastSeenByOrder: { ...get().lastSeenByOrder, [orderId]: maxId },
    });
  },

  closeModal: () =>
    set({
      modalOpen: false,
      orderId: null,
      messages: [],
      isLoading: false,
      error: null,
    }),

  refreshMessages: async (orderId, options) => {
    const silent = options?.silent === true;
    if (!silent && get().orderId === orderId) {
      set({ isLoading: get().messages.length === 0, error: null });
    }
    try {
      const response = await fetch(`/api/merchant/orders/${orderId}/messages`);
      const data = (await response.json()) as unknown;
      if (!response.ok) {
        const detail =
          data && typeof data === "object" && "detail" in data
            ? String((data as { detail: unknown }).detail)
            : "No se pudo cargar el chat";
        if (get().orderId === orderId) {
          set({ isLoading: false, error: detail });
        }
        return;
      }
      const list = Array.isArray(data)
        ? dedupeMessages(
            data
              .map((row) =>
                normalizeMessage(row as Record<string, unknown>),
              )
              .filter((m): m is OrderChatMessage => m !== null),
          )
        : [];
      if (get().orderId === orderId && get().modalOpen) {
        const prevMax = get().messages.reduce((m, x) => Math.max(m, x.id), 0);
        const inbound = list.filter(
          (m) => m.id > prevMax && m.sender_role !== "merchant",
        );
        const maxId = list.reduce((m, x) => Math.max(m, x.id), 0);
        set({
          messages: list,
          isLoading: false,
          error: null,
          lastSeenByOrder: {
            ...get().lastSeenByOrder,
            [orderId]: Math.max(get().lastSeenByOrder[orderId] ?? 0, maxId),
          },
        });
        if (silent && inbound.length > 0) {
          playAlertBeep("message");
        }
      }
    } catch {
      if (get().orderId === orderId) {
        set({ isLoading: false, error: "Error de conexión al chat" });
      }
    }
  },

  sendMessage: async (body) => {
    const { orderId } = get();
    if (orderId === null) return;
    const response = await fetch(`/api/merchant/orders/${orderId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const data = (await response.json()) as Record<string, unknown> & {
      detail?: string;
    };
    if (!response.ok) {
      set({ error: data.detail ?? "No se pudo enviar" });
      return;
    }
    const msg = normalizeMessage(data);
    if (!msg) return;
    const next = dedupeMessages([...get().messages, msg]);
    set({
      messages: next,
      lastSeenByOrder: {
        ...get().lastSeenByOrder,
        [orderId]: Math.max(get().lastSeenByOrder[orderId] ?? 0, msg.id),
      },
    });
  },

  scanOrdersForNewMessages: async (orderIds) => {
    const unique = [...new Set(orderIds)].slice(0, 30);
    let heardMessage = false;
    const lastSeen = { ...get().lastSeenByOrder };
    const unreadByOrder = { ...get().unreadByOrder };
    const unreadPreviewByOrder = { ...get().unreadPreviewByOrder };
    const openId = get().modalOpen ? get().orderId : null;

    await Promise.all(
      unique.map(async (orderId) => {
        try {
          const response = await fetch(
            `/api/merchant/orders/${orderId}/messages`,
          );
          if (!response.ok) return;
          const data = (await response.json()) as unknown;
          if (!Array.isArray(data) || data.length === 0) {
            if (lastSeen[orderId] === undefined) lastSeen[orderId] = 0;
            return;
          }
          const list = dedupeMessages(
            data
              .map((row) =>
                normalizeMessage(row as Record<string, unknown>),
              )
              .filter((m): m is OrderChatMessage => m !== null),
          );
          const prevMax = lastSeen[orderId];
          const maxId = list.reduce((m, x) => Math.max(m, x.id), 0);
          if (prevMax === undefined) {
            // Primera vez: marcar como visto sin alertar (historial viejo).
            lastSeen[orderId] = maxId;
            return;
          }

          if (openId === orderId) {
            set({ messages: list });
            lastSeen[orderId] = maxId;
            delete unreadByOrder[orderId];
            delete unreadPreviewByOrder[orderId];
            return;
          }

          const inbound = list.filter(
            (m) => m.id > prevMax && m.sender_role !== "merchant",
          );
          const prevUnread = unreadByOrder[orderId] ?? 0;
          if (inbound.length > 0) {
            unreadByOrder[orderId] = inbound.length;
            unreadPreviewByOrder[orderId] =
              inbound[inbound.length - 1]?.body?.slice(0, 80) ?? "";
            if (inbound.length > prevUnread) {
              heardMessage = true;
            }
            // No avanzar lastSeen: el badge permanece hasta abrir el chat.
          } else if (prevUnread > 0) {
            // Sin nuevos respecto a lastSeen; mantener unread actual.
          } else {
            delete unreadByOrder[orderId];
            delete unreadPreviewByOrder[orderId];
          }
        } catch {
          /* ignore */
        }
      }),
    );

    set({
      lastSeenByOrder: lastSeen,
      unreadByOrder,
      unreadPreviewByOrder,
      unreadCount: sumUnread(unreadByOrder),
    });
    if (heardMessage) {
      playAlertBeep("message");
    }
  },

  clearUnread: () =>
    set({
      unreadCount: 0,
      unreadByOrder: {},
      unreadPreviewByOrder: {},
    }),

  clearUnreadForOrder: (orderId) => {
    const unreadByOrder = { ...get().unreadByOrder };
    const unreadPreviewByOrder = { ...get().unreadPreviewByOrder };
    delete unreadByOrder[orderId];
    delete unreadPreviewByOrder[orderId];
    set({
      unreadByOrder,
      unreadPreviewByOrder,
      unreadCount: sumUnread(unreadByOrder),
    });
  },

  noteSeenOrderIds: (orderIds) => {
    const lastSeen = { ...get().lastSeenByOrder };
    for (const id of orderIds) {
      if (lastSeen[id] === undefined) lastSeen[id] = 0;
    }
    set({ lastSeenByOrder: lastSeen });
  },
}));
