import type { Metadata } from "next";
import { DEFAULT_OG_DESCRIPTION, OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/site";

export function pageMetadata(
  title: string,
  description: string = DEFAULT_OG_DESCRIPTION
): Metadata {
  const fullTitle = title.includes("Bollybee") ? title : `${title} | Bollybee`;

  return {
    title,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url: SITE_URL,
      siteName: SITE_NAME,
      locale: "en_NG",
      type: "website",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
