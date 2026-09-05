"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Logo } from "@/components/Logo";
import {
  PROMOTERS,
  REFERRALS,
  RRPP_TIERS,
  promoterLink,
  tierBadge,
} from "@/lib/data";
import { fmtARS } from "@/lib/money";

function RrppInner() {
  const params = useSearchParams();
  const id = Number(params.get("id") ?? "2");
  const promoter = PROMOTERS.find((p) => p.id === id) ?? PROMOTERS[1];
  const [copied, setCopied] = useState(false);
  const badge = tierBadge(promoter.tier);
  const link = promoterLink(promoter.slug);

  const currentIdx = RRPP_TIERS.findIndex(
    (t) => promoter.checkins >= t.min && promoter.checkins <= t.max,
  );
  const nextTier = RRPP_TIERS[currentIdx + 1];
  const current = RRPP_TIERS[currentIdx] ?? RRPP_TIERS[0];
  const tierProgressPct = nextTier
    ? Math.round(((promoter.checkins - current.min) / (nextTier.min - current.min)) * 100)
    : 100;
  const progressMessage = nextTier
    ? `Te faltan ${nextTier.min - promoter.checkins} check-ins reales para llegar a ${nextTier.name}.`
    : "Llegaste al tier más alto. Sos Embajadora.";

  const referralRows = useMemo(
    () =>
      REFERRALS.map((r) => ({
        name: r.name,
        label: r.unlocked ? "Desbloqueado" : "Pendiente",
        bg: r.unlocked ? "#3EC9A7" : "#EFEBF7",
        fg: r.unlocked ? "#FFFFFF" : "#6B5D8A",
      })),
    [],
  );

  function copy() {
    navigator.clipboard?.writeText("https://" + link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-[420px] px-5 py-6">
        <div className="mb-4 flex items-center justify-between">
          <Logo href="/" size="sm" />
          <Link href="/organizador/rrpp" className="text-xs font-bold text-muted">
            Ranking
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-[52px] shrink-0 items-center justify-center rounded-full bg-ink text-base font-extrabold text-cream">
              {promoter.initials}
            </div>
            <div>
              <div className="text-base font-extrabold text-ink">{promoter.name}</div>
              <span
                className="mt-1 inline-block rounded-full px-2.5 py-1 text-[11px] font-extrabold"
                style={badge}
              >
                {promoter.tier}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 rounded-2xl border border-border bg-white px-[18px] py-4">
            <div className="text-[11px] font-bold uppercase text-muted">Tu link</div>
            <div className="flex items-center justify-between gap-2.5 rounded-[10px] bg-cream px-3.5 py-2.5">
              <span className="text-[13px] font-bold text-ink">{link}</span>
              <button
                type="button"
                onClick={copy}
                className="rounded-full bg-ink px-3 py-1.5 text-[11px] font-extrabold text-cream"
              >
                {copied ? "¡Copiado!" : "Copiar"}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-white px-[18px] py-4">
            <div className="text-[11px] font-bold uppercase text-muted">Progreso de tier</div>
            <div className="h-2.5 rounded-[5px] bg-cream">
              <div
                className="h-full rounded-[5px] bg-coral"
                style={{ width: `${tierProgressPct}%` }}
              />
            </div>
            <div className="text-[12.5px] font-semibold text-ink">{progressMessage}</div>
          </div>

          <div className="rounded-2xl border border-border bg-white px-[18px] py-4">
            <div className="text-[11px] font-bold uppercase text-muted">Ganancias este evento</div>
            <div className="mt-1.5 text-[22px] font-extrabold text-ink">
              {fmtARS(promoter.earnings)}
            </div>
          </div>

          <div className="flex flex-col gap-2.5 rounded-2xl border border-border bg-white px-[18px] py-4">
            <div className="text-[11px] font-bold uppercase text-muted">Tus referidos</div>
            {referralRows.map((r) => (
              <div key={r.name} className="flex items-center justify-between">
                <span className="text-[13px] font-semibold text-ink">{r.name}</span>
                <span
                  className="rounded-full px-2 py-1 text-[10.5px] font-extrabold"
                  style={{ background: r.bg, color: r.fg }}
                >
                  {r.label}
                </span>
              </div>
            ))}
          </div>

          {promoter.tier === "Embajadora" && (
            <Link
              href="/rrpp/embajador"
              className="text-center text-[13px] font-bold text-coral"
            >
              Ver beneficios de Embajadora →
            </Link>
          )}

          <a
            href={`https://wa.me/?text=${encodeURIComponent("Entrá a NEÓN con mi link: https://" + link)}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-coral py-3.5 text-center text-sm font-extrabold text-white"
          >
            Compartir mi link
          </a>
        </div>
      </div>
    </div>
  );
}

export default function RrppPage() {
  return (
    <Suspense>
      <RrppInner />
    </Suspense>
  );
}
