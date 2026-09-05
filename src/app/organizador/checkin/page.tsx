"use client";

import { useState } from "react";
import { OrganizerHeader } from "@/components/OrganizerHeader";
import { SCAN_DEMO, scanStatusStyle } from "@/lib/data";

type Scan = (typeof SCAN_DEMO)[number] & { id: number };

export default function CheckinPage() {
  const [log, setLog] = useState<Scan[]>([]);
  const [checkedIn, setCheckedIn] = useState(342);
  const sold = 500;
  const last = log[0];
  const lastStyle = last ? scanStatusStyle(last.status) : null;
  const pct = Math.round((checkedIn / sold) * 100);

  function runScan() {
    const next = SCAN_DEMO[log.length % SCAN_DEMO.length];
    setLog((prev) => [{ ...next, id: Date.now() }, ...prev].slice(0, 6));
    if (next.status === "valid") setCheckedIn((n) => Math.min(sold, n + 1));
  }

  return (
    <div className="min-h-screen bg-cream">
      <OrganizerHeader active="checkin" />
      <div className="mx-auto max-w-[1160px] px-5 py-8 md:px-10">
        <div className="rounded-2xl bg-ink px-7 py-[18px] text-cream">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-base font-extrabold">Check-in — NEÓN Fiesta Electrónica</div>
              <div className="mt-0.5 text-xs text-muted2">Puerta principal</div>
            </div>
            <div className="text-right">
              <div className="text-[13px] text-muted2">Ingresados</div>
              <div className="text-xl font-extrabold text-teal">
                {checkedIn} / {sold}
              </div>
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-plum">
            <div className="h-full rounded-full bg-teal" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-6 lg:flex-row">
          <div className="flex flex-1 flex-col items-center justify-center gap-5 py-8">
            <div className="flex size-[280px] items-center justify-center rounded-3xl border-[3px] border-dashed border-ink opacity-55">
              <div className="px-6 text-center text-[13px] text-ink">
                Apuntá la cámara
                <br />
                al código QR
              </div>
            </div>
            <button
              type="button"
              onClick={runScan}
              className="rounded-full bg-coral px-7 py-3.5 text-sm font-extrabold text-white"
            >
              Simular escaneo
            </button>
            {last && lastStyle && (
              <div
                className="min-w-[280px] rounded-[14px] px-5 py-3.5 text-center"
                style={{ background: lastStyle.bg }}
              >
                <div className="text-[13px] font-extrabold" style={{ color: lastStyle.fg }}>
                  {lastStyle.label}
                </div>
                <div className="mt-1 text-sm font-bold text-ink">{last.name}</div>
                <div className="text-xs text-muted">
                  {last.type} · {last.time}
                </div>
              </div>
            )}
          </div>
          <div className="flex w-full flex-col gap-2.5 overflow-auto rounded-2xl border border-border bg-white p-4 lg:w-[280px]">
            <div className="text-xs font-extrabold uppercase tracking-wide text-ink">
              Últimos escaneos
            </div>
            {log.length === 0 && (
              <p className="text-xs text-muted">Todavía no hay escaneos en esta sesión.</p>
            )}
            {log.map((row) => {
              const st = scanStatusStyle(row.status);
              return (
                <div
                  key={row.id}
                  className="flex items-center justify-between gap-2 rounded-[10px] bg-cream px-2.5 py-2"
                >
                  <div>
                    <div className="text-[13px] font-bold text-ink">{row.name}</div>
                    <div className="text-[11px] text-muted">
                      {row.type} · {row.time}
                    </div>
                  </div>
                  <div
                    className="rounded-full px-2 py-1 text-[10px] font-extrabold"
                    style={{ color: st.fg, background: st.bg }}
                  >
                    {st.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
