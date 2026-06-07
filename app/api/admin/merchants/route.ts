import { NextRequest, NextResponse } from "next/server";

import { api, ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/server";
import type { AdminMerchant } from "@/features/admin-merchants/types";
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

export async function GET(request: NextRequest) {
  const auth = await assertSuperAdmin();
  if ("error" in auth) {
    return auth.error;
  }

  const query = request.nextUrl.searchParams.toString();
  const path = query ? `/accounts/admin/merchants/?${query}` : "/accounts/admin/merchants/";

  try {
    const data = await api<PaginatedResponse<AdminMerchant>>(path, undefined, auth.token);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ detail: error.message }, { status: error.status });
    }
    return NextResponse.json({ detail: "Error al cargar comercios" }, { status: 502 });
  }
}
