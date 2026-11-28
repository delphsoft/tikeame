"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { OrganizerHeader } from "@/components/OrganizerHeader";
import {
  eventCapacity,
  eventGross,
  eventSold,
  statusLabel,
  statusTone,
  useEvents,
} from "@/lib/events";
import { fmtARS } from "@/lib/money";
import { formatPct } from "@/lib/pricing";
import { useSession } from "@/lib/session";

type MpStatus = {
  oauthConfigured?: boolean;
  connected?: boolean;
  mpUserId?: string | null;
  platformPct?: number;
  tierLabel?: string;
  monthlyGmv?: number;
  ticketsSold?: number;
  freeTickets?: number;
  razonSocial?: string | null;
  paymentProvider?: "mercadopago" | "mobbex";
  enabledProviders?: ("mercadopago" | "mobbex")[];
  mobbex?: { serverEnabled?: boolean; testMode?: boolean; connected?: boolean; entityName?: string | null };
  error?: string;
};

function OrganizadorHomeInner() {
  const { mine } = useEvents();
  const { user } = useSession();
  const params = useSearchParams();
  const mpFlash = params.get("mp");
  const mbxFlash = params.get("mobbex");
  const [mp, setMp] = useState<MpStatus | null>(null);
  const [providerError, setProviderError] = useState("");
  const enabled = mp?.enabledProviders ?? ["mobbex"];
  const mpOn = enabled.includes("mercadopago");
  const sold = mine.reduce((s, e) => s + eventSold(e), 0);
  const cap = mine.reduce((s, e) => s + eventCapacity(e), 0);
  const gross = mine.reduce((s, e) => s + eventGross(e), 0);
  const live = mine.filter((e) => e.status === "on_sale").length;

  useEffect(() => {
    fetch("/api/mp/status")
      .then((r) => r.json())
      .then(setMp)
      .catch(() => {});
  }, []);

  async function chooseProvider(provider: "mercadopago" | "mobbex") {
    setProviderError("");
    const res = await fetch("/api/organizer/payment-provider", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setProviderError(data.error || "No se pudo cambiar el procesador");
      return;
    }
    setMp((prev) => (prev ? { ...prev, paymentProvider: provider } : prev));
  }

  return (
    <div className="min-h-screen bg-cream">
      <OrganizerHeader active="eventos" />
      <div className="mx-auto max-w-[1160px] px-5 py-9 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-coral">
              {mp?.razonSocial || user?.name || "Tu productora"}
            </div>
            <h1 className="mt-1 font-display text-[28px] uppercase">Tus eventos</h1>
            <p className="mt-1 text-[13px] text-muted">
              Creá, publicá y cobrá. El split va a tu cuenta{mpOn ? " de Mercado Pago o Mobbex" : " Mobbex"} — Tickeame no custodia fondos.
            </p>
          </div>
          <Link
            href="/organizador/nuevo"
            className="rounded bg-coral px-5 py-3 text-sm font-extrabold text-white"
          >
            + Nuevo evento
          </Link>
        </div>

        {mpOn && mpFlash === "ok" && (
          <div className="mt-5 rounded-md border-2 border-teal bg-white px-4 py-3 text-sm font-bold text-teal">
            Mercado Pago conectado. Las ventas van a tu cuenta, al toque.
          </div>
        )}
        {mpOn && mpFlash && mpFlash !== "ok" && (
          <div className="mt-5 rounded-md border-2 border-coral bg-white px-4 py-3 text-sm font-bold text-coral">
            No se pudo conectar MP ({mpFlash}). Revisá Client Secret y la redirect URI.
          </div>
        )}
        {mbxFlash === "ok" && (
          <div className="mt-5 rounded-md border-2 border-teal bg-white px-4 py-3 text-sm font-bold text-teal">
            Mobbex listo. Las ventas van con split a tu cuenta.
          </div>
        )}
        {mbxFlash && mbxFlash !== "ok" && (
          <div className="mt-5 rounded-md border-2 border-coral bg-white px-4 py-3 text-sm font-bold text-coral">
            No se pudo conectar Mobbex ({mbxFlash}).
          </div>
        )}

        {enabled.length > 1 && (
        <div className="mt-6 rounded-md border-2 border-ink bg-white p-5">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-coral">Cobrar con</div>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {(
              [
                ["mercadopago", "Mercado Pago", "~8% al instante con tarjeta", mp?.connected],
                ["mobbex", "Mobbex", "~3,2% crédito · ~2,3% débito", mp?.mobbex?.connected],
              ] as const
            ).filter(([id]) => enabled.includes(id)).map(([id, label, cost, connected]) => (
              <button
                key={id}
                type="button"
                onClick={() => chooseProvider(id)}
                className={`rounded border-2 p-3 text-left ${(mp?.paymentProvider ?? "mobbex") === id ? "border-coral bg-coral/10" : "border-border bg-white"}`}
              >
                <div className="text-sm font-extrabold">
                  {label} {connected ? "· conectado" : "· falta conectar"}
                </div>
                <div className="mt-1 text-xs text-muted">{cost}</div>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">
            Vale para los próximos eventos. Los que ya tienen ventas siguen con el procesador original.
          </p>
          {providerError && <p className="mt-2 text-xs font-bold text-coral">{providerError}</p>}
        </div>
        )}

        <div className={`mt-6 grid gap-3 md:grid-cols-2 ${mpOn ? "lg:grid-cols-3" : ""}`}>
          <div className="rounded-md border-2 border-ink bg-white p-5">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-coral">Mobbex</div>
            <div className="mt-2 font-display text-2xl uppercase">
              {mp?.mobbex?.serverEnabled ? "Cobro activo" : "Falta configurar"}
            </div>
            <p className="mt-2 text-[13px] text-muted">
              {mp?.mobbex?.serverEnabled
                ? `Split a tu cuenta${mp.mobbex.entityName ? ` · ${mp.mobbex.entityName}` : ""}. ${mp.mobbex.testMode ? "Modo test." : "Producción."}`
                : "Sin API key no se puede cobrar. Pedile a Tickeame que cargue MOBBEX_API_KEY y MOBBEX_ACCESS_TOKEN."}
            </p>
            {mp && mp.mobbex?.serverEnabled === false && (
              <p className="mt-2 text-[11px] text-muted">Falta MOBBEX_API_KEY y MOBBEX_ACCESS_TOKEN en Vercel.</p>
            )}
          </div>
          {mpOn && (
          <div className="rounded-md border-2 border-ink bg-white p-5">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-coral">Mercado Pago</div>
            <div className="mt-2 font-display text-2xl uppercase">
              {mp?.connected ? "Cuenta conectada" : "Falta conectar"}
            </div>
            <p className="mt-2 text-[13px] text-muted">
              {mp?.connected
                ? `Split instantáneo a tu MP${mp.mpUserId ? ` · id ${mp.mpUserId}` : ""}.`
                : "Sin OAuth no hay split a tu cuenta: el cobro no puede salir."}
            </p>
            <a
              href="/api/mp/oauth/start"
              className="mt-4 inline-block rounded bg-coral px-4 py-2.5 text-sm font-extrabold text-white"
            >
              {mp?.connected ? "Reconectar Mercado Pago" : "Conectar Mercado Pago"}
            </a>
            {mp && mp.oauthConfigured === false && (
              <p className="mt-2 text-[11px] text-muted">
                Falta MP_CLIENT_SECRET en Vercel y la redirect URI https://tickeame.com.ar/api/mp/oauth/callback en la app de MP.
              </p>
            )}
          </div>
          )}
          <div className="rounded-md border-2 border-ink bg-ink p-5 text-cream">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-coral">Tu tramo</div>
            <div className="mt-2 font-display text-2xl uppercase">
              {typeof mp?.platformPct === "number" ? formatPct(mp.platformPct) : "—"} Tickeame
            </div>
            <p className="mt-2 text-[13px] text-muted2">
              {mp?.tierLabel ?? "0% las primeras 100 entradas"} · {mp?.ticketsSold ?? 0}/{mp?.freeTickets ?? 100} vendidas.
              Después 2,5% (2% si GMV &gt; $10M/mes). Mobbex aparte, lo absorbe el organizador. El comprador no paga cargo.
            </p>
          </div>
        </div>

        <div className="mt-7 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Eventos en venta", value: String(live), sub: `${mine.length} en total` },
            { label: "Entradas vendidas", value: sold.toLocaleString("es-AR"), sub: `de ${cap}` },
            { label: "Recaudado bruto", value: fmtARS(gross), sub: "100% a tu cuenta" },
            { label: "Ocupación", value: cap ? `${Math.round((sold / cap) * 100)}%` : "0%", sub: "sobre capacidad" },
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

        <div className="mt-8 grid gap-4">
          {mine.map((e) => {
            const soldN = eventSold(e);
            const capN = eventCapacity(e);
            const pct = capN ? Math.round((soldN / capN) * 100) : 0;
            return (
              <Link
                key={e.slug}
                href={`/organizador/${e.slug}`}
                className="grid overflow-hidden rounded-md border-2 border-ink bg-white md:grid-cols-[180px_1fr]"
              >
                <div className="relative h-[140px] md:h-auto">
                  <Image src={e.hero} alt={e.title} fill className="object-cover" />
                </div>
                <div className="flex flex-col justify-between gap-3 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-display text-xl uppercase">{e.title}</div>
                      <div className="text-[13px] text-muted">
                        {e.dateLabel} · {e.timeLabel} · {e.venue}
                      </div>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${statusTone(e.status)}`}>
                      {statusLabel(e.status)}
                    </span>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs font-bold">
                      <span>
                        {soldN}/{capN} entradas
                      </span>
                      <span>{fmtARS(eventGross(e))}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-border">
                      <div className="h-full rounded-full bg-ink" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function OrganizadorHome() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream px-5 py-10 text-sm font-bold text-muted">Cargando panel…</div>
      }
    >
      <OrganizadorHomeInner />
    </Suspense>
  );
}
