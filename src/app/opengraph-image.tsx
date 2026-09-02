import { ImageResponse } from "next/og";
import { DEFAULT_OG_DESCRIPTION, SITE_DOMAIN, SITE_NAME } from "@/lib/site";

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #faf8f5 0%, #ede4e0 45%, #e8d5d0 100%)",
          color: "#1a1816",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #5c3d4a 0%, #c4a4a4 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#faf8f5",
              fontSize: 52,
              fontFamily: "Georgia, serif",
            }}
          >
            B
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                fontSize: 64,
                fontFamily: "Georgia, serif",
                color: "#5c3d4a",
                letterSpacing: "-0.02em",
              }}
            >
              Bollybee
            </div>
            <div
              style={{
                fontSize: 22,
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                color: "#5c3d4a",
                opacity: 0.75,
              }}
            >
              Fragrance Lab
            </div>
          </div>
        </div>
        <p
          style={{
            marginTop: 48,
            maxWidth: 760,
            fontSize: 32,
            lineHeight: 1.45,
            color: "#6b6560",
          }}
        >
          {DEFAULT_OG_DESCRIPTION}
        </p>
        <p
          style={{
            marginTop: "auto",
            fontSize: 22,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#8a8580",
          }}
        >
          {SITE_DOMAIN}
        </p>
      </div>
    ),
    { ...size }
  );
}
