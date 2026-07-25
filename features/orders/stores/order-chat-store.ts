"use client";

import { create } from "@/lib/stores/create-store";

export interface OrderChatMessage {
  id: number;
  order_id: number;
  sender_id: number;
  sender_role: string;
  body: string;
  created_at: string;
}

interface OrderChatState {
  orderId: number | null;
  messages: OrderChatMessage[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  openChat: (orderId: number) => Promise<void>;
  appendMessage: (message: OrderChatMessage) => void;
  sendMessage: (body: string) => Promise<void>;
  clearUnread: () => void;
  closeChat: () => void;
}

export const useOrderChatStore = create<OrderChatState>((set, get) => ({
  orderId: null,
  messages: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  openChat: async (orderId) => {
    const isSame = get().orderId === orderId;
    set({
      orderId,
      isLoading: !isSame || get().messages.length === 0,
      error: null,
      unreadCount: 0,
    });
    try {
      const response = await fetch(`/api/merchant/orders/${orderId}/messages`);
      const data = (await response.json()) as OrderChatMessage[] & {
        detail?: string;
      };
      if (!response.ok) {
        set({
          isLoading: false,
          error: data.detail ?? "No se pudo cargar el chat",
          messages: isSame ? get().messages : [],
        });
        return;
      }
      set({
        messages: Array.isArray(data) ? data : [],
        isLoading: false,
        error: null,
      });
    } catch {
      set({ isLoading: false, error: "Error de conexión al chat" });
    }
  },

  appendMessage: (message) => {
    const { messages, orderId } = get();
    if (orderId !== null && message.order_id !== orderId) {
      set({ unreadCount: get().unreadCount + 1 });
      return;
    }
    if (messages.some((m) => m.id === message.id)) return;
    set({
      messages: [...messages, message],
      unreadCount:
        get().orderId === message.order_id
          ? get().unreadCount
          : get().unreadCount + 1,
    });
  },

  sendMessage: async (body) => {
    const { orderId } = get();
    if (orderId === null) return;
    const response = await fetch(`/api/merchant/orders/${orderId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const data = (await response.json()) as OrderChatMessage & { detail?: string };
    if (!response.ok) {
      set({ error: data.detail ?? "No se pudo enviar" });
      return;
    }
    get().appendMessage(data);
  },

  clearUnread: () => set({ unreadCount: 0 }),
  closeChat: () =>
    set({ orderId: null, messages: [], unreadCount: 0, error: null }),
}));
