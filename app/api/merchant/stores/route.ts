import { NextResponse } from "next/server";

import { api } from "@/lib/api/client";
import type { PaginatedResponse } from "@/lib/api/types";
import { getAccessToken } from "@/lib/api/server";
import type { Store } from "@/features/stores/types";
import { decodeJwtPayload } from "@/lib/auth/session";

export async function GET() {
  const token = await getAccessToken();

  if (!token) {
    return NextResponse.json({ detail: "No autenticado" }, { status: 401 });
  }

  const claims = decodeJwtPayload(token);
  const userId = claims?.user_id;

  if (!userId) {
    return NextResponse.json({ detail: "Sesión inválida" }, { status: 401 });
  }

  try {
    const data = await api<PaginatedResponse<Store>>("/stores/", undefined, token);
    const ownedStores = data.results.filter((store) => store.owner_id === userId);

    return NextResponse.json({ results: ownedStores });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al cargar tiendas";
    return NextResponse.json({ detail: message }, { status: 502 });
  }
}
