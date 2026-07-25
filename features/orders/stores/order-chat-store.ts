"use client";

import { create } from "@/lib/stores/create-store";
import { playAlertBeep } from "@/lib/audio/play-alert-beep";

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

interface OrderChatState {
  modalOpen: boolean;
  orderId: number | null;
  messages: OrderChatMessage[];
  unreadCount: number;
  /** Máximo id de mensaje visto por pedido (alertas en background). */
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
  noteSeenOrderIds: (orderIds: number[]) => void;
}

export const useOrderChatStore = create<OrderChatState>((set, get) => ({
  modalOpen: false,
  orderId: null,
  messages: [],
  unreadCount: 0,
  lastSeenByOrder: {},
  isLoading: false,
  error: null,

  openModal: async (orderId) => {
    set({
      modalOpen: true,
      orderId,
      isLoading: true,
      error: null,
      unreadCount: 0,
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
        set({ messages: list, isLoading: false, error: null });
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
    const unique = [...new Set(orderIds)].slice(0, 20);
    let newUnread = 0;
    let heardMessage = false;
    const lastSeen = { ...get().lastSeenByOrder };
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
            lastSeen[orderId] = maxId;
            return;
          }
          const inbound = list.filter(
            (m) => m.id > prevMax && m.sender_role !== "merchant",
          );
          if (inbound.length > 0) {
            if (openId === orderId) {
              set({ messages: list });
            } else {
              newUnread += inbound.length;
              heardMessage = true;
            }
          }
          lastSeen[orderId] = Math.max(prevMax, maxId);
        } catch {
          /* ignore */
        }
      }),
    );

    set({
      lastSeenByOrder: lastSeen,
      unreadCount: get().unreadCount + newUnread,
    });
    if (heardMessage) {
      playAlertBeep("message");
    }
  },

  clearUnread: () => set({ unreadCount: 0 }),

  noteSeenOrderIds: (orderIds) => {
    const lastSeen = { ...get().lastSeenByOrder };
    for (const id of orderIds) {
      if (lastSeen[id] === undefined) lastSeen[id] = 0;
    }
    set({ lastSeenByOrder: lastSeen });
  },
}));
