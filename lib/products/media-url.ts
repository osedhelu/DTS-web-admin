export { getApiOrigin, resolveMediaUrl } from "@/lib/media-url";

import { resolveMediaUrl } from "@/lib/media-url";

/** @deprecated Usar resolveMediaUrl desde @/lib/media-url */
export function productMediaUrl(url: string | null | undefined): string {
  return resolveMediaUrl(url);
}
