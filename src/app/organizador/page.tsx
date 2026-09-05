"use client";

import { OrganizerHeader } from "@/components/OrganizerHeader";
import { EVENT, ORGANIZER_SALES, ORGANIZER_STATS, TICKET_TIERS } from "@/lib/data";
import { fmtARS } from "@/lib/money";

export default function OrganizadorPage() {
  function exportCsv() {
    const header = "Comprador,Entrada,Cantidad,Fecha";
    const rows = ORGANIZER_SALES.map((s) => `${s.name},${s.tier},${s.qty},${s.date}`).join("\n");
    const blob = new Blob([header + "\n" + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "neon-ventas.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-cream">
      <OrganizerHeader active="resumen" />
      <div className="mx-auto max-w-[1160px] px-5 py-9 md:px-10">
        <h1 className="font-display text-[26px] uppercase">{EVENT.fullName}</h1>
        <div className="mt-1 text-[13px] text-muted">
          {EVENT.dateLabel} · {EVENT.venue}
        </div>

        <div className="mt-7 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {ORGANIZER_STATS.map((s) => (
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
              {TICKET_TIERS.map((t) => {
                const pct = Math.round((t.sold / t.cap) * 100);
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
              <div className="mt-1 font-display text-[22px]">{fmtARS(3128400)}</div>
              <div className="mt-0.5 text-xs text-muted">Ya descontada la comisión del servicio</div>
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
              {ORGANIZER_SALES.map((sale) => (
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
