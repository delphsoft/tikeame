import { NextResponse } from "next/server";
import { MAX_TRANSFER_DISCOUNT_PCT, platformPctFor } from "@/lib/pricing";
import { currentUser } from "@/lib/server/auth";
import {
  getEvent,
  getOrganizerProfile,
  listEvents,
  organizerMonthlyGmv,
  putEvent,
  type EventRecord,
  type EventStatus,
} from "@/lib/server/store";

const STATUSES: EventStatus[] = ["draft", "on_sale", "paused", "sold_out"];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mine = url.searchParams.get("mine") === "1";
  const user = await currentUser();
  try {
    if (mine) {
      if (!user || (user.role !== "organizer" && user.role !== "admin")) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
      const events = await listEvents({ organizerId: user.role === "admin" ? undefined : user.id });
      return NextResponse.json({ events });
    }
    // Público: a la venta + agotados (el agotado se sigue mostrando, no desaparece).
    const [onSale, soldOut] = await Promise.all([
      listEvents({ status: "on_sale" }),
      listEvents({ status: "sold_out" }),
    ]);
    return NextResponse.json({ events: [...onSale, ...soldOut] });
  } catch {
    return NextResponse.json({ events: [] });
  }
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || (user.role !== "organizer" && user.role !== "admin")) {
    return NextResponse.json({ error: "Tenés que entrar como organizador." }, { status: 401 });
  }
  const event = (await req.json()) as EventRecord;
  if (!event?.slug || !event.title) {
    return NextResponse.json({ error: "Falta nombre del evento" }, { status: 400 });
  }
  if (!Array.isArray(event.tickets) || event.tickets.length === 0) {
    return NextResponse.json({ error: "Cargá al menos un tipo de entrada" }, { status: 400 });
  }
  for (const t of event.tickets) {
    if (!t.key || !(Number(t.price) > 0) || !Number.isInteger(Number(t.cap)) || Number(t.cap) <= 0) {
      return NextResponse.json({ error: `Precio y cupo inválidos en "${t.name || t.key}"` }, { status: 400 });
    }
  }
  if (!STATUSES.includes(event.status)) event.status = "draft";

  const existing = await getEvent(event.slug);
  if (existing && existing.organizerId !== user.id && user.role !== "admin") {
    return NextResponse.json({ error: "Ese slug ya lo usa otro evento" }, { status: 409 });
  }

  // `sold` lo maneja solo el server (checkout). Nunca se toma del body.
  const prevSold = new Map((existing?.tickets ?? []).map((t) => [t.key, t.sold]));
  for (const t of event.tickets) {
    t.price = Number(t.price);
    t.cap = Number(t.cap);
    t.sold = prevSold.get(t.key) ?? 0;
    if (t.cap < t.sold) {
      return NextResponse.json(
        { error: `"${t.name}" ya tiene ${t.sold} vendidas: el cupo no puede ser menor` },
        { status: 400 },
      );
    }
  }
  for (const [key, sold] of prevSold) {
    if (sold > 0 && !event.tickets.some((t) => t.key === key)) {
      return NextResponse.json({ error: "No se puede borrar un tipo de entrada con ventas" }, { status: 400 });
    }
  }
  const full = event.tickets.every((t) => t.sold >= t.cap);
  if (event.status === "sold_out" && !full) event.status = "on_sale";
  if (event.status === "on_sale" && full) event.status = "sold_out";

  // Quién paga: elegible por evento; se congela apenas hay una venta (el precio no cambia a mitad).
  const hasSales = (existing?.tickets ?? []).some((t) => t.sold > 0);
  if (hasSales && existing) {
    event.feePayer = existing.feePayer ?? "organizer";
    event.transferDiscountPct = existing.transferDiscountPct ?? 0;
  } else {
    event.feePayer = event.feePayer === "buyer" ? "buyer" : "organizer";
    const d = Number(event.transferDiscountPct ?? 0);
    event.transferDiscountPct = Number.isFinite(d) ? Math.min(MAX_TRANSFER_DISCOUNT_PCT, Math.max(0, d)) : 0;
  }

  event.organizerId = existing?.organizerId ?? user.id;
  event.organizerName = existing?.organizerName ?? (user.profile?.razonSocial || user.name);

  // Congelar el tramo de comisión al crear: el precio no cambia durante la venta.
  if (existing?.platformPct != null) {
    event.platformPct = existing.platformPct;
    event.tierLabel = existing.tierLabel;
  } else {
    const profile = await getOrganizerProfile(event.organizerId);
    if ((profile?.feePlan ?? "percent") === "percent") {
      const gmv = await organizerMonthlyGmv(event.organizerId);
      const tier = platformPctFor(gmv, "percent");
      event.platformPct = tier.pct;
      event.tierLabel = tier.tierLabel;
    } else {
      delete event.platformPct;
      delete event.tierLabel;
    }
  }

  await putEvent(event);
  return NextResponse.json({ ok: true, slug: event.slug, platformPct: event.platformPct ?? null });
}
