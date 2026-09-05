"use client";

import Link from "next/link";
import { AdminHeader } from "@/components/AdminHeader";
import { ORGANIZERS, eventGross, eventSold, statusLabel, statusTone, useEvents } from "@/lib/events";
import { fmtARS } from "@/lib/money";

export default function AdminPage() {
  const { events, setStatus } = useEvents();
  const sold = events.reduce((s, e) => s + eventSold(e), 0);
  const gmv = events.reduce((s, e) => s + eventGross(e), 0);
  const take = events.reduce((s, e) => s + eventGross(e) * (e.commissionPct / 100), 0);
  const live = events.filter((e) => e.status === "on_sale").length;
  const connected = ORGANIZERS.filter((o) => o.mp === "connected").length;

  return (
    <div className="min-h-screen bg-cream">
      <AdminHeader />
      <div className="mx-auto max-w-[1160px] px-5 py-9 md:px-10">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-coral">
          Tikeame · plataforma
        </div>
        <h1 className="mt-1 font-display text-[28px] uppercase">Super admin</h1>
        <p className="mt-1 max-w-xl text-[13px] text-muted">
          Split Marketplace de Mercado Pago. Tikeame nunca custodia fondos: acá ves GMV, comisión
          y el estado de cada productora.
        </p>

        <div className="mt-7 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "GMV (entradas)", value: fmtARS(gmv), sub: "nunca pasa por Tikeame" },
            { label: "Comisión plataforma", value: fmtARS(take), sub: "2–5% vía split MP" },
            { label: "Eventos en venta", value: String(live), sub: `${events.length} cargados` },
            { label: "Entradas vendidas", value: sold.toLocaleString("es-AR"), sub: `${connected} MP conectados` },
          ].map((s, i) => (
            <div
              key={s.label}
              className="dash-in rounded-md border-2 border-ink bg-white p-[18px]"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="text-[11px] font-extrabold uppercase text-muted">{s.label}</div>
              <div className="mt-2 font-display text-[26px]">{s.value}</div>
              <div className="mt-1 text-xs font-bold text-teal">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="rounded-md border-2 border-ink bg-ink p-5 text-cream lg:col-span-2">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-coral">
              Mercado Pago Marketplace
            </div>
            <div className="mt-3 font-display text-3xl">Split sano</div>
            <p className="mt-2 max-w-lg text-sm text-muted2">
              Cada cobro se parte en el checkout: 100% de la entrada a la productora, comisión
              Tikeame a la cuenta plataforma. No hay wallet interna.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ["Cuentas MP", `${connected}/${ORGANIZERS.length}`],
                ["Región", "gru1 · AR"],
                ["Custodia", "0 pesos"],
              ].map(([k, v]) => (
                <div key={k} className="rounded bg-plum px-4 py-3">
                  <div className="text-[11px] font-extrabold uppercase text-muted2">{k}</div>
                  <div className="mt-1 text-sm font-extrabold">{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-md border-2 border-ink bg-white p-5">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-coral">
              Actividad
            </div>
            <div className="mt-4 flex flex-col gap-3 text-[13px]">
              <div>NEÓN · +38 entradas hoy</div>
              <div>Pulse BA · TECHNO UNDERGROUND publicado</div>
              <div>Costa Events · MP pendiente de OAuth</div>
              <div>Nico Paz · referido desbloqueado</div>
            </div>
          </div>
        </div>

        <section id="eventos" className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-2xl uppercase">Eventos</h2>
            <Link href="/organizador/nuevo" className="text-xs font-extrabold text-coral">
              Crear como organizador →
            </Link>
          </div>
          <div className="overflow-hidden rounded-md border-2 border-ink bg-white">
            <div className="grid grid-cols-[1.4fr_1fr_.8fr_.7fr_.9fr] bg-cream px-4 py-2.5 text-[11px] font-extrabold uppercase text-muted">
              <div>Evento</div>
              <div>Productora</div>
              <div>Vendidas</div>
              <div>%</div>
              <div>Estado</div>
            </div>
            {events.map((e) => (
              <div
                key={e.slug}
                className="grid grid-cols-[1.4fr_1fr_.8fr_.7fr_.9fr] items-center border-t border-border px-4 py-3 text-[13px]"
              >
                <Link href={`/eventos/${e.slug}`} className="font-bold hover:text-coral">
                  {e.title}
                </Link>
                <div className="text-muted">{e.organizerName}</div>
                <div>{eventSold(e).toLocaleString("es-AR")}</div>
                <div>{e.commissionPct}%</div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${statusTone(e.status)}`}>
                    {statusLabel(e.status)}
                  </span>
                  {e.status === "on_sale" ? (
                    <button
                      type="button"
                      onClick={() => setStatus(e.slug, "paused")}
                      className="text-[11px] font-bold text-coral"
                    >
                      Pausar
                    </button>
                  ) : e.status === "paused" || e.status === "draft" ? (
                    <button
                      type="button"
                      onClick={() => setStatus(e.slug, "on_sale")}
                      className="text-[11px] font-bold text-teal"
                    >
                      Activar
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="productoras" className="mt-10 mb-8">
          <h2 className="font-display text-2xl uppercase">Productoras</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {ORGANIZERS.map((o) => {
              const theirs = events.filter((e) => e.organizerId === o.id);
              return (
                <div key={o.id} className="rounded-md border-2 border-ink bg-white p-5">
                  <div className="font-display text-lg uppercase">{o.name}</div>
                  <div className="mt-1 text-xs text-muted">
                    {o.city} · {o.email}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span>{theirs.length} eventos</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        o.mp === "connected"
                          ? "bg-teal text-white"
                          : o.mp === "pending"
                            ? "bg-wash text-muted"
                            : "bg-coral text-white"
                      }`}
                    >
                      MP {o.mp === "connected" ? "conectado" : o.mp === "pending" ? "pendiente" : "error"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
