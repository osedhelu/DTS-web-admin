import { cookies } from "next/headers";

import { api } from "@/lib/api/client";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies";

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function serverApi<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = await getAccessToken();
  return api<T>(path, init, token);
}
