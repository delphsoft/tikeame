"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { OrganizerHeader } from "@/components/OrganizerHeader";
import { FUNNEL, PROMOTERS, promoterLink, tierBadge } from "@/lib/data";
import { fmtARS } from "@/lib/money";

export default function AdminRrppPage() {
  const router = useRouter();
  const max = FUNNEL[0].value;

  return (
    <div className="min-h-screen bg-cream">
      <OrganizerHeader active="rrpp" />
      <div className="mx-auto max-w-[1160px] px-5 py-8 md:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-lg font-extrabold text-ink">RRPP y Referidos — NEÓN</h1>
          <Link
            href="/rrpp/invitacion"
            className="rounded-full bg-coral px-5 py-2.5 text-[13px] font-extrabold text-white"
          >
            Invitar RRPP
          </Link>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-white">
          <div className="grid grid-cols-[40px_1.6fr_1fr_1fr_1fr] bg-cream px-[18px] py-3 text-[11px] font-extrabold uppercase text-muted">
            <span>#</span>
            <span>Promoter</span>
            <span>Check-ins reales</span>
            <span>Tier</span>
            <span>Ganancias</span>
          </div>
          {PROMOTERS.map((p, i) => {
            const badge = tierBadge(p.tier);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => router.push(`/rrpp?id=${p.id}`)}
                className="grid w-full grid-cols-[40px_1.6fr_1fr_1fr_1fr] items-center border-t border-border px-[18px] py-3.5 text-left"
              >
                <span className="text-[13px] font-bold text-muted">{i + 1}</span>
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-full bg-ink text-xs font-extrabold text-cream">
                    {p.initials}
                  </div>
                  <span className="text-[13.5px] font-bold text-ink">{p.name}</span>
                </div>
                <span className="text-[13.5px] text-ink">{p.checkins}</span>
                <span
                  className="w-fit rounded-full px-2.5 py-1 text-[11.5px] font-extrabold"
                  style={badge}
                >
                  {p.tier}
                </span>
                <span className="text-[13.5px] font-bold text-ink">{fmtARS(p.earnings)}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-white p-5">
          <div className="mb-3.5 text-[13px] font-extrabold text-ink">Embudo de referidos</div>
          <div className="flex flex-col gap-3">
            {FUNNEL.map((f) => (
              <div key={f.label}>
                <div className="mb-1 flex justify-between text-[12.5px] text-ink">
                  <span>{f.label}</span>
                  <span>{f.value.toLocaleString("es-AR")}</span>
                </div>
                <div className="h-2.5 rounded-[5px] bg-cream">
                  <div
                    className="h-full rounded-[5px] bg-teal"
                    style={{ width: `${Math.round((f.value / max) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-4 text-xs text-muted">
          Links de promoters: {PROMOTERS.slice(0, 2).map((p) => promoterLink(p.slug)).join(" · ")}
        </p>
      </div>
    </div>
  );
}
