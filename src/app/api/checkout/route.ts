import { NextResponse } from "next/server";
import { quoteFees, type PaymentMethod } from "@/lib/pricing";
import { currentUser } from "@/lib/server/auth";
import { resolveCatalogEvent } from "@/lib/server/catalog";
import { ConfigError, demoPayAllowed, hosted, supabaseConfigured } from "@/lib/server/env";
import { fulfillOrder } from "@/lib/server/fulfill";
import { createPreference, mpEnabled } from "@/lib/server/mp";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import {
  getOrganizerProfile,
  getSellerAccessToken,
  newOrderId,
  newViewToken,
  organizerMonthlyGmv,
  putOrder,
  type OrderItem,
  type OrderRow,
} from "@/lib/server/store";

export async function POST(req: Request) {
  if (!rateLimit(`checkout:${clientIp(req)}`, 20, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Demasiados intentos. Probá en un rato." }, { status: 429 });
  }

  if (hosted() && !mpEnabled()) {
    return NextResponse.json(
      { error: "El cobro en producción requiere MP_ACCESS_TOKEN. El pago demo no corre en Vercel." },
      { status: 503 },
    );
  }
  if (hosted() && !supabaseConfigured()) {
    return NextResponse.json(
      { error: "Falta SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY para persistir órdenes." },
      { status: 503 },
    );
  }

  const body = (await req.json()) as {
    eventSlug?: string;
    qty?: Record<string, number>;
    dni?: string;
    iva?: string;
    name?: string;
    email?: string;
    paymentMethod?: PaymentMethod;
  };

  const event = await resolveCatalogEvent(body.eventSlug || "neon");
  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });

  const qty = body.qty ?? {};
  const items: OrderItem[] = event.tickets
    .map((t) => ({
      key: t.key,
      name: t.name,
      qty: Math.min(10, Math.max(0, Math.floor(Number(qty[t.key] ?? 0)))),
      unitPrice: t.price,
    }))
    .filter((i) => i.qty > 0);

  if (items.length === 0) {
    return NextResponse.json({ error: "Elegí al menos una entrada" }, { status: 400 });
  }

  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const method: PaymentMethod = body.paymentMethod === "transfer" ? "transfer" : "card";
  const organizerId = event.organizerId;
  const profile = organizerId ? await getOrganizerProfile(organizerId) : null;
  const monthlyGmv = organizerId ? await organizerMonthlyGmv(organizerId) : 0;
  const quote = quoteFees(subtotal, {
    method,
    plan: profile?.feePlan ?? "percent",
    monthlyGmv,
  });
  const fee = quote.fee;
  const total = quote.total;
  const user = await currentUser();
  const email = (body.email || user?.email || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Necesitamos un email válido" }, { status: 400 });
  }

  const order: OrderRow = {
    id: newOrderId(),
    eventSlug: event.slug,
    eventTitle: `${event.title} — ${event.subtitle}`,
    eventDate: event.dateLabel,
    venue: event.venue,
    email,
    buyerName: body.name?.trim() || user?.name || "Comprador",
    dni: (body.dni || "").trim().slice(0, 20),
    iva: body.iva || "Consumidor Final",
    items,
    subtotal,
    fee,
    processorFee: quote.processorFee,
    platformFee: quote.platformFee,
    paymentMethod: method,
    organizerId,
    total,
    status: "pending",
    mpPreferenceId: null,
    mpPaymentId: null,
    viewToken: newViewToken(),
    createdAt: new Date().toISOString(),
  };

  try {
    await putOrder(order);
  } catch (err) {
    const message = err instanceof ConfigError ? err.message : "No se pudo guardar la orden";
    return NextResponse.json({ error: message }, { status: 503 });
  }

  if (mpEnabled()) {
    try {
      const sellerAccessToken = organizerId ? await getSellerAccessToken(organizerId) : null;
      if (organizerId && !sellerAccessToken) {
        return NextResponse.json(
          { error: "El organizador todavía no conectó su Mercado Pago. No se puede cobrar el split." },
          { status: 503 },
        );
      }
      const pref = await createPreference({
        orderId: order.id,
        title: `${event.title} — entradas`,
        total,
        fee: quote.platformFee,
        email,
        paymentMethod: method,
        sellerAccessToken,
      });
      if (pref) {
        order.mpPreferenceId = pref.id;
        await putOrder(order);
        return NextResponse.json({
          orderId: order.id,
          viewToken: order.viewToken,
          checkoutUrl: pref.initPoint,
          mode: "mercadopago",
        });
      }
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "No se pudo crear el pago" },
        { status: 502 },
      );
    }
  }

  if (!demoPayAllowed()) {
    return NextResponse.json({ error: "Mercado Pago no está configurado." }, { status: 503 });
  }

  order.status = "paid";
  await putOrder(order);
  await fulfillOrder(order.id);
  return NextResponse.json({
    orderId: order.id,
    viewToken: order.viewToken,
    checkoutUrl: `/confirmacion?order=${encodeURIComponent(order.id)}&t=${encodeURIComponent(order.viewToken)}`,
    mode: "demo",
  });
}
