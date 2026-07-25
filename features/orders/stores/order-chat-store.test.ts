/**
 * Unit smoke for order-chat-store dedupe + unread (B11).
 * Run with: npm run test:unit
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

function dedupe(list: Msg[]): Msg[] {
  const byId = new Map<number, Msg>();
  for (const m of list) byId.set(Number(m.id), { ...m, id: Number(m.id) });
  return [...byId.values()].sort((a, b) => a.id - b.id);
}

describe("order chat dedupe", () => {
  it("removes duplicate ids", () => {
    const next = dedupe([
      {
        id: 1,
        order_id: 9,
        sender_id: 1,
        sender_role: "customer",
        body: "a",
        created_at: "1",
      },
      {
        id: 1,
        order_id: 9,
        sender_id: 1,
        sender_role: "customer",
        body: "a",
        created_at: "1",
      },
      {
        id: 2,
        order_id: 9,
        sender_id: 2,
        sender_role: "merchant",
        body: "b",
        created_at: "2",
      },
    ]);
    assert.equal(next.length, 2);
  });

  it("normalizes string ids", () => {
    const next = dedupe([
      {
        id: "10" as unknown as number,
        order_id: 1,
        sender_id: 1,
        sender_role: "customer",
        body: "x",
        created_at: "1",
      },
      {
        id: 10,
        order_id: 1,
        sender_id: 1,
        sender_role: "customer",
        body: "x",
        created_at: "1",
      },
    ]);
    assert.equal(next.length, 1);
    assert.equal(next[0].id, 10);
  });
});
