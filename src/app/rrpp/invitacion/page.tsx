"use client";

import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { RRPP_TIERS, tierBadge } from "@/lib/data";

export default function InvitacionPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto flex max-w-[420px] flex-col gap-4 px-5 py-6">
        <Logo href="/" size="sm" />
        <div>
          <h1 className="text-lg font-extrabold leading-snug text-ink">
            La productora de NEÓN te invitó a ser RRPP.
          </h1>
          <p className="mt-2 text-[13px] leading-normal text-muted">
            Mirá cómo funcionan los tiers antes de aceptar.
          </p>
        </div>
        <div className="rounded-[14px] bg-wash px-4 py-3.5 text-[12.5px] font-semibold leading-normal text-ink">
          El criterio es check-ins reales, no ventas. Vender no alcanza: tu gente tiene que entrar.
        </div>
        <div className="flex flex-col gap-2.5">
          {RRPP_TIERS.map((t) => {
            const badge = tierBadge(t.name);
            const range =
              t.max === Infinity
                ? `${t.min}+ check-ins`
                : `${t.min}–${t.max} check-ins`;
            return (
              <div
                key={t.name}
                className="flex flex-col gap-1.5 rounded-[14px] border border-border bg-white px-4 py-3.5"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="rounded-full px-2.5 py-1 text-[11.5px] font-extrabold"
                    style={badge}
                  >
                    {t.name}
                  </span>
                  <span className="text-xs font-bold text-muted">{range}</span>
                </div>
                <div className="text-[13px] text-ink">{t.reward}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-1 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => router.push("/rrpp?id=6")}
            className="rounded-full bg-coral py-[15px] text-sm font-extrabold text-white"
          >
            Aceptar invitación
          </button>
          <button
            type="button"
            onClick={() => router.push("/organizador/rrpp")}
            className="py-2.5 text-[13px] font-bold text-muted"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}
