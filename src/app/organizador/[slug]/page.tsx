"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { OrganizerHeader } from "@/components/OrganizerHeader";
import { ORGANIZER_SALES } from "@/lib/data";
import { eventCapacity, eventGross, eventSold, statusLabel, statusTone, useEvents } from "@/lib/events";
import { fmtARS } from "@/lib/money";

export default function EventDashPage() {
  const { slug } = useParams<{ slug: string }>();
  const { getEvent } = useEvents();
  const event = getEvent(slug);

  if (!event) {
    return (
      <div className="min-h-screen bg-cream">
        <OrganizerHeader active="detalle" />
        <div className="mx-auto max-w-[720px] px-5 py-20 text-center">
          <h1 className="font-display text-3xl uppercase">Evento no encontrado</h1>
          <Link href="/organizador" className="mt-4 inline-block text-sm font-bold text-coral">
            ← Volver a tus eventos
          </Link>
        </div>
      </div>
    );
  }

  const sold = eventSold(event);
  const cap = eventCapacity(event);
  const gross = eventGross(event);
  const fee = gross * (event.commissionPct / 100);
  const net = gross - fee;
  const isNeon = event.slug === "neon";
  const sales = isNeon ? ORGANIZER_SALES : [];

  function exportCsv() {
    const header = "Comprador,Entrada,Cantidad,Fecha";
    const rows = (sales.length ? sales : [{ name: "—", tier: "—", qty: 0, date: "—" }])
      .map((s) => `${s.name},${s.tier},${s.qty},${s.date}`)
      .join("\n");
    const blob = new Blob([header + "\n" + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug}-ventas.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-cream">
      <OrganizerHeader active="detalle" />
      <div className="mx-auto max-w-[1160px] px-5 py-9 md:px-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/organizador" className="text-xs font-bold text-muted">
              ← Eventos
            </Link>
            <h1 className="mt-2 font-display text-[26px] uppercase">
              {event.title} — {event.subtitle}
            </h1>
            <div className="mt-1 text-[13px] text-muted">
              {event.dateLabel} · {event.venue} · comisión {event.commissionPct}%
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${statusTone(event.status)}`}>
              {statusLabel(event.status)}
            </span>
            <Link
              href={`/eventos/${event.slug}`}
              className="rounded-full border-2 border-ink bg-white px-3.5 py-1.5 text-xs font-extrabold"
            >
              Ver página pública
            </Link>
          </div>
        </div>

        <div className="mt-7 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Entradas vendidas", value: String(sold), sub: `de ${cap}` },
            { label: "Ingresos netos", value: fmtARS(net), sub: "100% para vos" },
            { label: "Entradas restantes", value: String(Math.max(0, cap - sold)), sub: `de ${cap} totales` },
            { label: "Ocupación", value: cap ? `${Math.round((sold / cap) * 100)}%` : "0%", sub: "sobre capacidad total" },
          ].map((s) => (
            <div key={s.label} className="rounded-md border-2 border-ink bg-white p-[18px]">
              <div className="text-[11px] font-extrabold uppercase text-muted">{s.label}</div>
              <div className="mt-2 font-display text-[26px]">{s.value}</div>
              <div className="mt-1 text-xs font-bold text-teal">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-[0.1em] text-coral">
              Ventas por tipo de entrada
            </div>
            <div className="mt-4 flex flex-col gap-3.5">
              {event.tickets.map((t) => {
                const pct = t.cap ? Math.round((t.sold / t.cap) * 100) : 0;
                return (
                  <div key={t.key}>
                    <div className="flex justify-between text-[13px] font-bold">
                      <span>{t.name}</span>
                      <span>
                        {t.sold}/{t.cap}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-border">
                      <div className="h-full rounded-full bg-ink" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-7 rounded-md bg-teal/12 px-4 py-3.5">
              <div className="text-[11px] font-extrabold uppercase text-teal">Ingresos netos</div>
              <div className="mt-1 font-display text-[22px]">{fmtARS(net)}</div>
              <div className="mt-0.5 text-xs text-muted">
                Comisión Tikeame {fmtARS(fee)} · ya descontada
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div className="text-xs font-extrabold uppercase tracking-[0.1em] text-coral">
                Ventas recientes
              </div>
              <button
                type="button"
                onClick={exportCsv}
                className="rounded-full border-2 border-ink bg-white px-3.5 py-1.5 text-xs font-extrabold text-ink"
              >
                Exportar CSV
              </button>
            </div>
            <div className="mt-4 overflow-hidden rounded-md border-2 border-ink bg-white">
              <div className="grid grid-cols-[1.4fr_1fr_0.6fr_0.9fr] bg-cream px-4 py-2.5 text-[11px] font-extrabold uppercase text-muted">
                <div>Comprador</div>
                <div>Entrada</div>
                <div>Cant.</div>
                <div>Fecha</div>
              </div>
              {sales.length === 0 && (
                <div className="px-4 py-6 text-sm text-muted">Todavía no hay ventas en este evento.</div>
              )}
              {sales.map((sale) => (
                <div
                  key={sale.name + sale.date}
                  className="grid grid-cols-[1.4fr_1fr_0.6fr_0.9fr] border-t border-border px-4 py-2.5 text-[13px]"
                >
                  <div className="font-bold">{sale.name}</div>
                  <div className="text-muted">{sale.tier}</div>
                  <div>{sale.qty}</div>
                  <div className="text-muted">{sale.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
