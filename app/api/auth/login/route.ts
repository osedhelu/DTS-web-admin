import { NextRequest, NextResponse } from "next/server";

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth/cookies";
import { decodeJwtPayload } from "@/lib/auth/session";
import { getRoleHomePath, isUserRole } from "@/lib/auth/roles";

interface LoginBody {
  username: string;
  password: string;
}

interface TokenResponse {
  access: string;
  refresh: string;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as LoginBody;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    return NextResponse.json(
      { detail: "NEXT_PUBLIC_API_URL no configurada" },
      { status: 500 },
    );
  }

  const upstream = await fetch(`${apiUrl}/accounts/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!upstream.ok) {
    const errorBody = await upstream.json().catch(() => ({
      detail: "Credenciales inválidas",
    }));

    return NextResponse.json(errorBody, { status: upstream.status });
  }

  const tokens = (await upstream.json()) as TokenResponse;
  const claims = decodeJwtPayload(tokens.access);
  const role = claims?.role;

  if (!role || !isUserRole(role)) {
    return NextResponse.json(
      { detail: "Rol de usuario no permitido en web-admin" },
      { status: 403 },
    );
  }

  if (role !== "merchant" && role !== "super_admin") {
    return NextResponse.json(
      { detail: "Solo comercios y administradores pueden acceder" },
      { status: 403 },
    );
  }

  const response = NextResponse.json({
    ok: true,
    redirectTo: getRoleHomePath(role),
    email: claims.email ?? null,
  });

  response.cookies.set(ACCESS_TOKEN_COOKIE, tokens.access, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  response.cookies.set(REFRESH_TOKEN_COOKIE, tokens.refresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
