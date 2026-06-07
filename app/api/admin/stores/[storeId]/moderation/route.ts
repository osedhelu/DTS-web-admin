import { NextRequest, NextResponse } from "next/server";

import { api, ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/server";
import { decodeJwtPayload } from "@/lib/auth/session";

async function assertSuperAdmin() {
  const token = await getAccessToken();
  if (!token) {
    return { error: NextResponse.json({ detail: "No autenticado" }, { status: 401 }) };
  }

  const claims = decodeJwtPayload(token);
  if (claims?.role !== "super_admin") {
    return { error: NextResponse.json({ detail: "Acceso denegado" }, { status: 403 }) };
  }

  return { token };
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ storeId: string }> },
) {
  const auth = await assertSuperAdmin();
  if ("error" in auth) {
    return auth.error;
  }

  const { storeId } = await context.params;

  try {
    const body = await request.json();
    const data = await api<{ is_active: boolean }>(
      `/stores/${storeId}/moderation/`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      },
      auth.token,
    );
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }
    return NextResponse.json({ detail: "Error al actualizar moderación" }, { status: 502 });
  }
}
