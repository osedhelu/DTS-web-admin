const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";

export function productMediaUrl(url: string | null | undefined): string {
  if (!url) {
    return "";
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${apiBase}${url.startsWith("/") ? url : `/${url}`}`;
}
