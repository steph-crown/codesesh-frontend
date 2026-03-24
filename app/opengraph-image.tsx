import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site-config";

export const runtime = "edge";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#FBF6F2",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: "#0A0A0A",
            letterSpacing: "-0.03em",
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            fontSize: 32,
            marginTop: 20,
            color: "#4B5563",
            maxWidth: 900,
            textAlign: "center",
            lineHeight: 1.35,
          }}
        >
          Code together, instantly.
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 22,
            color: "#6B7280",
          }}
        >
          Real-time pair programming in the browser
        </div>
      </div>
    ),
    { ...size },
  );
}
