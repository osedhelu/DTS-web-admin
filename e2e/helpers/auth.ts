import { ACCESS_TOKEN_COOKIE } from "../../lib/auth/cookies";
import type { BrowserContext } from "@playwright/test";

export function buildMockJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  ).toString("base64url");
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  ).toString("base64url");

  return `${header}.${body}.mock-signature`;
}

export async function loginAsMerchant(
  context: BrowserContext,
  email = "merchant@test.com",
) {
  const token = buildMockJwt({
    role: "merchant",
    email,
    user_id: 10,
  });

  await context.addCookies([
    {
      name: ACCESS_TOKEN_COOKIE,
      value: token,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}

export async function loginAsSuperAdmin(
  context: BrowserContext,
  email = "admin@test.com",
) {
  const token = buildMockJwt({
    role: "super_admin",
    email,
    user_id: 1,
  });

  await context.addCookies([
    {
      name: ACCESS_TOKEN_COOKIE,
      value: token,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}
