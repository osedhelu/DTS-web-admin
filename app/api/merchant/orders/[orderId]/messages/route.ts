import { NextRequest, NextResponse } from "next/server";

import { api, ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/server";

interface RouteContext {
  params: Promise<{ orderId: string }>;
}

interface ChatMessage {
  id: number;
  order_id: number;
  sender_id: number;
  sender_role: string;
  body: string;
  created_at: string;
  message_type?: string;
  image_url?: string;
}

interface ChatMessagesPayload {
  chat_closed: boolean;
  messages: ChatMessage[];
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }
  const { orderId } = await context.params;
  try {
    const payload = await api<ChatMessagesPayload | ChatMessage[]>(
      `/orders/${orderId}/messages/`,
      { method: "GET" },
      token,
    );
    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { detail: error.message },
        { status: error.status },
      );
    }
    return NextResponse.json({ detail: "Error al listar chat" }, { status: 502 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }
  const { orderId } = await context.params;
  const body = await request.json();
  try {
    const message = await api<ChatMessage>(
      `/orders/${orderId}/messages/`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      token,
    );
    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { detail: error.message },
        { status: error.status },
      );
    }
    return NextResponse.json({ detail: "Error al enviar chat" }, { status: 502 });
  }
}
