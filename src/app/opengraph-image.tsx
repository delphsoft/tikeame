import { ImageResponse } from "next/og";

export const alt = "Tikeame — El tikeame que te lleva a la fiesta.";
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
          Ticketera argentina
        </div>
        <div
          style={{
            color: "#F4EEDC",
            fontSize: 68,
            fontWeight: 800,
            lineHeight: 1.05,
            marginTop: 28,
            maxWidth: 900,
          }}
        >
          El tikeame que te lleva a la fiesta.
        </div>
        <div style={{ color: "#B9AFD4", fontSize: 26, marginTop: 28, fontWeight: 600 }}>
          Entradas · QR de un ingreso · Mercado Pago
        </div>
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "baseline",
            color: "#F4EEDC",
            fontSize: 36,
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
