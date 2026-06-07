import { NextRequest, NextResponse } from "next/server";

import { api, ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/server";
import type { Coupon } from "@/features/coupons/types";
import { decodeJwtPayload } from "@/lib/auth/session";
import type { PaginatedResponse } from "@/lib/api/types";

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

export async function GET() {
  const auth = await assertSuperAdmin();
  if ("error" in auth) {
    return auth.error;
  }

  try {
    const data = await api<PaginatedResponse<Coupon>>(
      "/marketing/coupons/",
      undefined,
      auth.token,
    );
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }
    return NextResponse.json({ detail: "Error al cargar cupones" }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await assertSuperAdmin();
  if ("error" in auth) {
    return auth.error;
  }

  try {
    const body = await request.json();
    const data = await api<Coupon>(
      "/marketing/coupons/",
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      auth.token,
    );
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }
    return NextResponse.json({ detail: "Error al crear cupón" }, { status: 502 });
  }
}
