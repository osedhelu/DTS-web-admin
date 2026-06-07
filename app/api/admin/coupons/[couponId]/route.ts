import { NextRequest, NextResponse } from "next/server";

import { api, ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/server";
import type { Coupon } from "@/features/coupons/types";
import { decodeJwtPayload } from "@/lib/auth/session";

interface RouteContext {
  params: Promise<{ couponId: string }>;
}

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

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await assertSuperAdmin();
  if ("error" in auth) {
    return auth.error;
  }

  const { couponId } = await context.params;
  const body = await request.json();

  try {
    const data = await api<Coupon>(
      `/marketing/coupons/${couponId}/`,
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
    return NextResponse.json({ detail: "Error al actualizar cupón" }, { status: 502 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const auth = await assertSuperAdmin();
  if ("error" in auth) {
    return auth.error;
  }

  const { couponId } = await context.params;

  try {
    await api(`/marketing/coupons/${couponId}/`, { method: "DELETE" }, auth.token);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }
    return NextResponse.json({ detail: "Error al eliminar cupón" }, { status: 502 });
  }
}
