import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/guard";
import { hosted } from "@/lib/server/env";
import {
  addScan,
  getEvent,
  getOrder,
  getTicket,
  listEvents,
  listScans,
  markTicketUsed,
  newId,
  ticketsForEvent,
  type ScanRow,
  type TicketRow,
  type User,
} from "@/lib/server/store";

/** ¿Este usuario puede escanear entradas de este evento? */
async function ownsEvent(user: User, slug: string) {
  if (user.role === "admin") return true;
  const event = await getEvent(slug).catch(() => null);
  if (event) return event.organizerId === user.id;
  // Eventos del catálogo demo (sin dueño real): solo en local.
  return !hosted();
}

async function counters(user: User, eventSlug?: string | null) {
  let slugs: string[];
  if (eventSlug) {
    slugs = (await ownsEvent(user, eventSlug)) ? [eventSlug] : [];
  } else {
    const events = await listEvents({ organizerId: user.role === "admin" ? undefined : user.id });
    slugs = events.map((e) => e.slug);
  }
  let tickets: TicketRow[] = [];
  for (const s of slugs) tickets = tickets.concat(await ticketsForEvent(s));
  return { checkedIn: tickets.filter((t) => t.status === "used").length, sold: tickets.length };
}

export async function GET(req: Request) {
  const { user, error } = await requireUser(["organizer", "admin"]);
  if (error || !user) return error ?? NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const eventSlug = new URL(req.url).searchParams.get("event");
  return NextResponse.json({
    scans: await listScans(user.role === "admin" ? undefined : { organizerId: user.id }),
    ...(await counters(user, eventSlug)),
  });
}

export async function POST(req: Request) {
  const { user, error } = await requireUser(["organizer", "admin"]);
  if (error || !user) return error ?? NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = (await req.json()) as { code?: string; event?: string };
  const code = (body.code || "").trim();
  const eventSlug = body.event?.trim() || null;
  const now = new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

  if (!code) {
    return NextResponse.json({ error: "Ingresá el código" }, { status: 400 });
  }

  const respond = async (scan: ScanRow) => {
    await addScan(scan);
    return NextResponse.json({ result: scan, ...(await counters(user, eventSlug)) });
  };
  const base = { id: newId("scan"), organizerId: user.id, time: now };

  const ticket = await getTicket(code);
  // Ticket inexistente, o de un evento que no es de este organizador: para él es inválido.
  if (!ticket || !(await ownsEvent(user, ticket.eventSlug))) {
    return respond({ ...base, ticketId: code, name: "Código sin registro", type: "—", status: "invalid", eventSlug });
  }

  const order = await getOrder(ticket.orderId);
  const who = { name: order?.buyerName || "Titular", type: ticket.name, eventSlug: ticket.eventSlug };

  // Si la puerta está configurada para un evento, una entrada válida de otro evento no pasa.
  if (eventSlug && ticket.eventSlug !== eventSlug) {
    return respond({ ...base, ...who, ticketId: ticket.id, status: "wrong_event" });
  }
  if (order && order.status !== "paid") {
    return respond({ ...base, ...who, ticketId: ticket.id, status: "invalid" });
  }

  // markTicketUsed solo transiciona valid → used; si devuelve null, otra puerta la escaneó primero.
  const marked = ticket.status === "valid" ? await markTicketUsed(ticket.id) : null;
  return respond({ ...base, ...who, ticketId: ticket.id, status: marked ? "valid" : "used" });
}
