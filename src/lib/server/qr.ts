import QRCode from "qrcode";

export async function qrPng(text: string, size = 240) {
  return QRCode.toBuffer(text, {
    type: "png",
    width: size,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#2B1D4A", light: "#FFFFFF" },
  });
}

export function qrPath(ticketId: string, access?: { orderId?: string; token?: string }) {
  const q = new URLSearchParams();
  if (access?.orderId) q.set("order", access.orderId);
  if (access?.token) q.set("t", access.token);
  const qs = q.toString();
  return `/api/qr/${encodeURIComponent(ticketId)}${qs ? `?${qs}` : ""}`;
}
