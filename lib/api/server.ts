import { cookies } from "next/headers";

import { api } from "@/lib/api/client";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth/cookies";
import { refreshAccessToken } from "@/lib/auth/refresh";
import { decodeJwtPayload, isSessionExpired } from "@/lib/auth/session";

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const claims = token ? decodeJwtPayload(token) : null;

  if (token && claims && !isSessionExpired(claims)) {
    return token;
  }

  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) {
    return undefined;
  }

  const refreshed = await refreshAccessToken(refreshToken);
  if (!refreshed) {
    return undefined;
  }

  cookieStore.set(ACCESS_TOKEN_COOKIE, refreshed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  return refreshed;
}

export async function serverApi<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = await getAccessToken();
  return api<T>(path, init, token);
}
