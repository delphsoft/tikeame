import { NextResponse } from "next/server";
import { currentUser } from "@/lib/server/auth";
import { getCatalogEvent } from "@/lib/server/catalog";
import { fulfillOrder } from "@/lib/server/fulfill";
import { createPreference, mpEnabled } from "@/lib/server/mp";
import { newId, putOrder, type OrderItem, type OrderRow } from "@/lib/server/store";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    eventSlug?: string;
    qty?: Record<string, number>;
    dni?: string;
    iva?: string;
    name?: string;
    email?: string;
  };

  const event = getCatalogEvent(body.eventSlug || "neon");
  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });

  const qty = body.qty ?? {};
  const items: OrderItem[] = event.tickets
    .map((t) => ({
      key: t.key,
      name: t.name,
      qty: Math.max(0, Math.floor(Number(qty[t.key] ?? 0))),
      unitPrice: t.price,
    }))
    .filter((i) => i.qty > 0);

  if (items.length === 0) {
    return NextResponse.json({ error: "Elegí al menos una entrada" }, { status: 400 });
  }

  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const fee = subtotal * (event.commissionPct / 100);
  const total = subtotal + fee;
  const user = await currentUser();
  const email = (body.email || user?.email || "").trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "Necesitamos un email" }, { status: 400 });

  const order: OrderRow = {
    id: newId("ord").replace("ord-", "TK-").toUpperCase(),
    eventSlug: event.slug,
    eventTitle: `${event.title} — ${event.subtitle}`,
    eventDate: event.dateLabel,
    venue: event.venue,
    email,
    buyerName: body.name?.trim() || user?.name || "Comprador",
    dni: body.dni?.trim() || "",
    iva: body.iva || "Consumidor Final",
    items,
    subtotal,
    fee,
    total,
    status: "pending",
    mpPreferenceId: null,
    mpPaymentId: null,
    createdAt: new Date().toISOString(),
  };
  putOrder(order);

  if (mpEnabled()) {
    try {
      const pref = await createPreference({
        orderId: order.id,
        title: `${event.title} — entradas`,
        total,
        fee,
        email,
      });
      if (pref) {
        order.mpPreferenceId = pref.id;
        putOrder(order);
        return NextResponse.json({ orderId: order.id, checkoutUrl: pref.initPoint, mode: "mercadopago" });
      }
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "No se pudo crear el pago" },
        { status: 502 },
      );
    }
  }

  order.status = "paid";
  putOrder(order);
  await fulfillOrder(order.id);
  return NextResponse.json({
    orderId: order.id,
    checkoutUrl: `/confirmacion?order=${encodeURIComponent(order.id)}`,
    mode: "demo",
  });
}
