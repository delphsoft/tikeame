"use client";

import { useEffect, useState } from "react";
import { OrganizerHeader } from "@/components/OrganizerHeader";
import { scanStatusStyle } from "@/lib/data";

type Scan = {
  id: string;
  ticketId: string;
  name: string;
  type: string;
  status: "valid" | "used" | "invalid";
  time: string;
};

export default function CheckinPage() {
  const [code, setCode] = useState("");
  const [log, setLog] = useState<Scan[]>([]);
  const [checkedIn, setCheckedIn] = useState(0);
  const [sold, setSold] = useState(0);
  const [busy, setBusy] = useState(false);
  const last = log[0];
  const lastStyle = last ? scanStatusStyle(last.status) : null;
  const pct = sold ? Math.round((checkedIn / sold) * 100) : 0;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      fetch("/api/checkin")
        .then((r) => r.json())
        .then((j) => {
          setLog(j.scans ?? []);
          setCheckedIn(j.checkedIn ?? 0);
          setSold(j.sold ?? 0);
        })
        .catch(() => {});
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  async function scan(nextCode?: string) {
    const value = (nextCode ?? code).trim();
    if (!value) return;
    setBusy(true);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: value }),
      });
      const j = (await res.json()) as { result?: Scan; checkedIn?: number; sold?: number };
      if (j.result) setLog((prev) => [j.result!, ...prev].slice(0, 12));
      if (typeof j.checkedIn === "number") setCheckedIn(j.checkedIn);
      if (typeof j.sold === "number") setSold(j.sold);
      setCode("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <OrganizerHeader active="checkin" />
      <div className="mx-auto max-w-[1160px] px-5 py-8 md:px-10">
        <div className="rounded-2xl bg-ink px-7 py-[18px] text-cream">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-base font-extrabold">Check-in</div>
              <div className="mt-0.5 text-xs text-muted2">Escaneá o pegá el ID del QR</div>
            </div>
            <div className="text-right">
              <div className="text-[13px] text-muted2">Ingresados</div>
              <div className="text-xl font-extrabold text-teal">
                {checkedIn} / {sold || "—"}
              </div>
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-plum">
            <div className="h-full rounded-full bg-teal" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-6 lg:flex-row">
          <div className="flex flex-1 flex-col items-center justify-center gap-5 py-8">
            <form
              className="flex w-full max-w-sm flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                scan();
              }}
            >
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="TK-…-1"
                className="rounded-xl border-2 border-ink bg-white px-4 py-3 text-center text-sm font-bold"
                autoFocus
              />
              <button
                type="submit"
                disabled={busy || !code.trim()}
                className="rounded-full bg-coral px-7 py-3.5 text-sm font-extrabold text-white disabled:opacity-50"
              >
                {busy ? "Validando…" : "Validar entrada"}
              </button>
            </form>
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
            <div className="text-xs font-extrabold uppercase tracking-wide text-ink">Últimos escaneos</div>
            {log.length === 0 && <p className="text-xs text-muted">Todavía no hay escaneos en esta sesión.</p>}
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
