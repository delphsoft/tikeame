import { ImageResponse } from "next/og";
import { getPublicEvent } from "@/lib/public-events";

export const alt = "Evento en Tikeame";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function EventOg({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getPublicEvent(slug);

  const kicker = event?.category ?? "Evento";
  const title = event?.title ?? "TIKEAME";
  const sub = event ? `${event.dateLabel} · ${event.venue}` : "Entradas online";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#2B1D4A",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            color: "#FF6B5B",
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            color: "#F4EEDC",
            fontSize: 84,
            fontWeight: 800,
            lineHeight: 0.95,
            marginTop: 24,
            textTransform: "uppercase",
          }}
        >
          {title}
        </div>
        <div style={{ color: "#FF6B5B", fontSize: 32, fontWeight: 700, marginTop: 12 }}>
          {event?.subtitle ?? ""}
        </div>
        <div style={{ color: "#B9AFD4", fontSize: 26, marginTop: 28, fontWeight: 600 }}>{sub}</div>
        <div
          style={{
            marginTop: "auto",
            color: "#F4EEDC",
            fontSize: 28,
            fontWeight: 800,
          }}
        >
          TIKEAME<span style={{ color: "#FF6B5B" }}>.</span>
        </div>
      </div>
    ),
    size,
  );
}
