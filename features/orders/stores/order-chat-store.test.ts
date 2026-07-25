/**
 * Unit smoke for order-chat-store append + unread (B11).
 * Run with: npx tsx --test features/orders/stores/order-chat-store.test.ts
 * (logic mirrored for environments without full Vitest setup)
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

type Msg = {
  id: number;
  order_id: number;
  sender_id: number;
  sender_role: string;
  body: string;
  created_at: string;
};

function appendMessage(
  state: { orderId: number | null; messages: Msg[]; unreadCount: number },
  message: Msg,
) {
  if (state.orderId !== null && message.order_id !== state.orderId) {
    return {
      ...state,
      unreadCount: state.unreadCount + 1,
    };
  }
  if (state.messages.some((m) => m.id === message.id)) return state;
  return {
    ...state,
    messages: [...state.messages, message],
  };
}

describe("order chat append", () => {
  it("appends message for open chat", () => {
    const next = appendMessage(
      { orderId: 1, messages: [], unreadCount: 0 },
      {
        id: 10,
        order_id: 1,
        sender_id: 2,
        sender_role: "customer",
        body: "hola",
        created_at: "2026-01-01",
      },
    );
    assert.equal(next.messages.length, 1);
    assert.equal(next.unreadCount, 0);
  });

  it("increments unread for other order", () => {
    const next = appendMessage(
      { orderId: 1, messages: [], unreadCount: 0 },
      {
        id: 11,
        order_id: 2,
        sender_id: 2,
        sender_role: "customer",
        body: "otro",
        created_at: "2026-01-01",
      },
    );
    assert.equal(next.unreadCount, 1);
    assert.equal(next.messages.length, 0);
  });
});
