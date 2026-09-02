/** Public site domain — keep in sync with production DNS. */
export const SITE_DOMAIN = "bollybeefragrancelab.com";

export const SITE_URL =
  (process.env.NEXT_PUBLIC_APP_URL || `https://${SITE_DOMAIN}`).replace(/\/$/, "");

/** Public base URL for email images — never localhost (clients can't fetch it). */
export function emailPublicBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (
    configured &&
    !configured.includes("localhost") &&
    !configured.includes("127.0.0.1")
  ) {
    return configured;
  }
  return `https://${SITE_DOMAIN}`;
}

export function authCallbackUrl(nextPath: string) {
  return `${SITE_URL}/auth/callback?next=${encodeURIComponent(nextPath)}`;
}

export const SITE_NAME = "Bollybee Fragrance Lab";

export const DEFAULT_OG_DESCRIPTION =
  "Premium perfume and fragrance e-commerce. Discover signature scents crafted for Nigeria.";

/** Shared Open Graph image — used in layout and page metadata. */
export const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: SITE_NAME,
} as const;
