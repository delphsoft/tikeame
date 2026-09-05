import { qrUrl } from "@/lib/data";
import { site } from "@/lib/site";
import { getOrder, putTickets, type OrderRow, type TicketRow, ticketsForOrder } from "./store";

export function issueTickets(order: OrderRow): TicketRow[] {
  const existing = ticketsForOrder(order.id);
  if (existing.length) return existing;
  const tickets: TicketRow[] = [];
  let n = 1;
  for (const item of order.items) {
    for (let i = 0; i < item.qty; i++) {
      tickets.push({
        id: `${order.id}-${n}`,
        orderId: order.id,
        eventSlug: order.eventSlug,
        name: item.name,
        key: item.key,
        status: "valid",
        usedAt: null,
      });
      n += 1;
    }
  }
  putTickets(tickets);
  return tickets;
}

export async function emailTickets(order: OrderRow, tickets: TicketRow[]) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false as const, reason: "no_resend_key" };
  const from = process.env.RESEND_FROM || "Tikeame <hola@tikeame.com.ar>";
  const rows = tickets
    .map(
      (t) =>
        `<tr><td style="padding:8px 0">${t.name}</td><td><img src="${qrUrl(t.id, 120)}" width="80" height="80" alt="QR"/></td><td>${t.id}</td></tr>`,
    )
    .join("");
  const html = `
    <div style="font-family:sans-serif;color:#2B1D4A">
      <h1>Tu tiko está listo</h1>
      <p>${order.eventTitle} · ${order.eventDate} · ${order.venue}</p>
      <p>Orden <b>#${order.id}</b></p>
      <table>${rows}</table>
      <p><a href="${site.url}/confirmacion?order=${order.id}">Ver entradas</a></p>
    </div>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [order.email],
      subject: `Tus entradas — ${order.eventTitle}`,
      html,
    }),
  });
  return { sent: res.ok, reason: res.ok ? "ok" : await res.text() };
}

export async function fulfillOrder(orderId: string) {
  const order = getOrder(orderId);
  if (!order) return null;
  const tickets = issueTickets(order);
  const mail = await emailTickets(order, tickets);
  return { order, tickets, mail };
}
