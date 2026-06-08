const apiUrl = process.env.NEXT_PUBLIC_API_URL;

interface RefreshResponse {
  access?: string;
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<string | null> {
  if (!apiUrl || !refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${apiUrl}/accounts/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as RefreshResponse;
    return payload.access ?? null;
  } catch {
    return null;
  }
}
