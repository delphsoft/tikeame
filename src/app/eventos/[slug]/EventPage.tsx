"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Perforation } from "@/components/Perforation";
import { QtyStepper } from "@/components/QtyStepper";
import { SiteHeader } from "@/components/SiteHeader";
import { useCart } from "@/lib/cart";
import {
  COMMISSION_PCT,
  EVENT,
  FAQS,
  GALLERY,
  SPONSORS,
  TICKET_TIERS,
  UPCOMING,
} from "@/lib/data";
import { fmtARS, pad2 } from "@/lib/money";

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  return {
    days: pad2(Math.floor(diff / 86400000)),
    hours: pad2(Math.floor((diff % 86400000) / 3600000)),
    mins: pad2(Math.floor((diff % 3600000) / 60000)),
    secs: pad2(Math.floor((diff % 60000) / 1000)),
  };
}

export function EventPage() {
  const router = useRouter();
  const { qty, inc, dec, subtotal, fee, total, itemCount } = useCart();
  const countdown = useCountdown(EVENT.eventDate);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const buyLabel = itemCount > 0 ? "Comprar" : "Elegí tu entrada";
  const mapsQuery = encodeURIComponent(EVENT.mapsQuery);
  const shareWhatsapp = useMemo(() => {
    const url = typeof window === "undefined" ? "" : window.location.href;
    return (
      "https://wa.me/?text=" +
      encodeURIComponent(`¡Vengan a ${EVENT.fullName} el ${EVENT.dateLabel} en Crobar! ${url}`)
    );
  }, []);

  function goCheckout() {
    if (itemCount === 0) return;
    router.push("/checkout");
  }

  function copyLink() {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-cream pb-[110px]">
      <SiteHeader variant="event" />

      <section className="relative flex min-h-[560px] flex-col justify-end overflow-hidden">
        <Image
          src={EVENT.hero}
          alt="NEÓN — Fiesta Electrónica"
          fill
          priority
          className="hero-zoom object-cover saturate-110"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(43,29,74,0.35)_0%,rgba(43,29,74,0.55)_55%,rgba(20,14,36,0.96)_100%)]" />
        <div className="dot-grid absolute inset-0" />
        <div className="relative mx-auto w-full max-w-[1240px] px-5 pb-[120px] md:px-10">
          <div className="mb-[18px] flex flex-wrap gap-2.5">
            <span className="rounded-full bg-coral px-3.5 py-1.5 text-xs font-extrabold uppercase tracking-wide text-white">
              {EVENT.category}
            </span>
            <span className="rounded-full bg-cream/15 px-3.5 py-1.5 text-xs font-extrabold text-cream">
              Quedan {EVENT.ticketsLeft} entradas
            </span>
          </div>
          <h1 className="font-display text-7xl uppercase leading-[0.98] text-cream md:text-[88px]">
            {EVENT.title}
          </h1>
          <div className="mt-1 font-display text-[26px] uppercase tracking-wide text-coral">
            {EVENT.subtitle}
          </div>
          <div className="mt-[22px] flex flex-wrap gap-7">
            {[
              ["Fecha", EVENT.dateLabel],
              ["Hora", EVENT.timeLabel],
              ["Lugar", EVENT.venue],
              ["Desde", fmtARS(EVENT.fromPrice)],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col gap-0.5">
                <span className="text-[11px] font-bold uppercase text-muted2">{k}</span>
                <span className="text-[15px] font-bold text-cream">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-center gap-9 bg-ink px-5 py-5 md:px-10">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-muted2">
          Empieza en
        </div>
        <div className="flex gap-5">
          {[
            [countdown.days, "días"],
            [countdown.hours, "hs"],
            [countdown.mins, "min"],
          ].map(([v, l]) => (
            <div key={l} className="flex flex-col items-center gap-0.5">
              <span className="font-display text-[28px] text-cream">{v}</span>
              <span className="text-[10px] uppercase text-muted2">{l}</span>
            </div>
          ))}
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-display text-[28px] text-coral">{countdown.secs}</span>
            <span className="text-[10px] uppercase text-muted2">seg</span>
          </div>
        </div>
      </div>

      <Perforation className="mx-5" />

      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 pt-14 md:grid-cols-[1.5fr_1fr] md:gap-14 md:px-10">
        <div>
          <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-coral">
            Line up
          </div>
          <div className="mt-3.5 flex flex-wrap gap-2.5">
            {EVENT.lineup.map((a) => (
              <span
                key={a}
                className="rounded-full border-2 border-ink bg-white px-[18px] py-2 text-sm font-extrabold"
              >
                {a}
              </span>
            ))}
          </div>

          <div className="mt-11 text-xs font-extrabold uppercase tracking-[0.12em] text-coral">
            Sobre el evento
          </div>
          <p className="mt-3.5 max-w-[560px] text-[15.5px] leading-[1.7] text-plum">{EVENT.about}</p>

          <div className="mt-11 flex flex-wrap gap-4">
            <div className="min-w-[220px] flex-1 rounded border-2 border-ink bg-white px-5 py-[18px]">
              <div className="text-[11px] font-extrabold uppercase text-muted">Venue</div>
              <div className="mt-1.5 text-[15px] font-bold">{EVENT.venueName}</div>
              <div className="mt-0.5 text-[13px] text-muted">{EVENT.venueAddress}</div>
              <div className="mt-3 flex gap-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-border bg-cream px-3.5 py-2 text-xs font-extrabold text-ink"
                >
                  Google Maps
                </a>
                <a
                  href={`https://maps.apple.com/?q=${mapsQuery}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-border bg-cream px-3.5 py-2 text-xs font-extrabold text-ink"
                >
                  Apple Maps
                </a>
              </div>
            </div>
            <div className="min-w-[180px] flex-1 rounded border-2 border-ink bg-white px-5 py-[18px]">
              <div className="text-[11px] font-extrabold uppercase text-muted">Edad mínima</div>
              <div className="mt-1.5 text-[15px] font-bold">+18</div>
              <div className="mt-0.5 text-[13px] text-muted">DNI obligatorio en la puerta</div>
            </div>
          </div>

          <div className="mt-6 h-[220px] overflow-hidden rounded border-2 border-ink">
            <iframe
              title="Mapa de Crobar"
              src={`https://www.google.com/maps?q=${mapsQuery}&output=embed`}
              className="block h-full w-full border-0"
              loading="lazy"
            />
          </div>

          <div className="mt-11 text-xs font-extrabold uppercase tracking-[0.12em] text-coral">
            Distribución del espacio
          </div>
          <div className="mt-3.5 grid h-[170px] grid-cols-[1.4fr_1fr] gap-1.5">
            <div className="flex flex-col items-center justify-center gap-1 rounded border-2 border-ink bg-white">
              <div className="text-[13px] font-extrabold">Pista</div>
              <div className="text-[11px] text-muted">General</div>
            </div>
            <div className="grid grid-rows-2 gap-1.5">
              <div className="flex flex-col items-center justify-center gap-1 rounded bg-plum">
                <div className="text-[13px] font-extrabold text-cream">VIP</div>
                <div className="text-[11px] text-muted2">Sector elevado + barra</div>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 rounded bg-border">
                <div className="text-[13px] font-extrabold">Estacionamiento</div>
                <div className="text-[11px] text-muted">Con combo Parking</div>
              </div>
            </div>
          </div>

          <div className="mt-11 text-xs font-extrabold uppercase tracking-[0.12em] text-coral">
            Preguntas frecuentes
          </div>
          <div className="mt-3.5 flex flex-col gap-2">
            {FAQS.map((f, i) => (
              <div key={f.q} className="rounded border-2 border-ink bg-white">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-2.5 px-[18px] py-3.5 text-left text-sm font-extrabold text-ink"
                >
                  {f.q}
                  <span>{openFaq === i ? "–" : "+"}</span>
                </button>
                {openFaq === i && (
                  <div className="px-[18px] pb-4 text-[13.5px] leading-[1.6] text-muted">{f.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div id="tickets" className="self-start lg:sticky lg:top-20">
          <div className="relative rounded-md bg-ink px-[26px] py-7 shadow-[0_24px_48px_rgba(43,29,74,0.22)]">
            <div className="font-display text-xl uppercase text-cream">Elegí tu entrada</div>
            <div className="mt-5 flex flex-col gap-3">
              {TICKET_TIERS.map((t) => (
                <div
                  key={t.key}
                  className="rounded bg-plum px-[18px] py-4"
                  style={{ opacity: t.soldOut ? 0.55 : 1 }}
                >
                  <div className="flex items-center justify-between gap-2.5">
                    <div>
                      <div className="text-[15px] font-extrabold text-cream">{t.name}</div>
                      <div className="mt-0.5 text-[13px] text-muted2">
                        {fmtARS(t.price)}
                        {t.note ? ` · ${t.note}` : ""}
                      </div>
                    </div>
                    {t.soldOut ? (
                      <span className="rounded-full bg-cream/15 px-2.5 py-1 text-[11px] font-extrabold text-cream">
                        AGOTADO
                      </span>
                    ) : (
                      <QtyStepper
                        value={qty[t.key]}
                        onInc={() => inc(t.key)}
                        onDec={() => dec(t.key)}
                        light
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="my-5 h-px bg-cream/20" />
            <div className="flex justify-between text-[13px] font-semibold text-muted2">
              <span>Subtotal</span>
              <span>{fmtARS(subtotal)}</span>
            </div>
            <div className="mt-1.5 flex justify-between text-[13px] font-semibold text-muted2">
              <span>Cargo de servicio ({COMMISSION_PCT}%)</span>
              <span>{fmtARS(fee)}</span>
            </div>
            <div className="mt-3.5 flex justify-between text-[19px] font-extrabold text-cream">
              <span>Total</span>
              <span>{fmtARS(total)}</span>
            </div>
            <div className="mt-3.5 rounded-md bg-teal/16 px-3 py-2.5 text-xs font-bold text-teal">
              El organizador recibe {fmtARS(subtotal)} — el 100%. Sin cargos escondidos.
            </div>
            <button
              type="button"
              onClick={goCheckout}
              className="mt-[18px] w-full rounded bg-coral py-[15px] text-[15px] font-extrabold text-white"
            >
              {buyLabel}
            </button>
            <div className="mt-4 flex items-center justify-center gap-2.5">
              <a
                href={shareWhatsapp}
                target="_blank"
                rel="noreferrer"
                className="flex-1 rounded-full bg-cream/10 py-2 text-center text-xs font-extrabold text-cream"
              >
                Compartir por WhatsApp
              </a>
              <button
                type="button"
                onClick={copyLink}
                className="flex-1 rounded-full bg-cream/10 py-2 text-xs font-extrabold text-cream"
              >
                {copied ? "¡Copiado!" : "Copiar link"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Perforation className="mx-5 mt-14" />

      <div className="mx-auto max-w-[1240px] px-5 pt-11 md:px-10">
        <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-coral">
          Fotos de ediciones anteriores
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-6">
          {GALLERY.map((g) => (
            <div key={g.src + (g.label ?? "")} className="relative h-[150px] overflow-hidden rounded">
              <Image
                src={g.src}
                alt=""
                fill
                className={`object-cover ${g.recap ? "brightness-75" : ""}`}
              />
              {g.recap && (
                <>
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="flex size-11 items-center justify-center rounded-full bg-cream">
                      <div className="ml-0.5 h-0 w-0 border-y-8 border-l-[13px] border-y-transparent border-l-ink" />
                    </div>
                  </div>
                  <div className="absolute bottom-1.5 left-2 text-[10px] font-extrabold uppercase tracking-wide text-cream">
                    {g.label}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <Perforation className="mx-5 mt-14" />

      <div className="mx-auto max-w-[1240px] px-5 pt-11 md:px-10">
        <div className="text-xs font-extrabold uppercase tracking-[0.12em] text-coral">
          Próximos eventos de Tikeame
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {UPCOMING.map((e) => (
            <Link
              key={e.slug}
              href="/eventos/neon"
              className="block overflow-hidden rounded border-2 border-ink bg-white"
            >
              <Image src={e.image} alt={e.title} width={640} height={130} className="h-[130px] w-full object-cover" />
              <div className="px-4 py-3.5">
                <div className="text-[11px] font-extrabold uppercase text-coral">{e.date}</div>
                <div className="mt-1 text-[15px] font-extrabold text-ink">{e.title}</div>
                <div className="mt-0.5 text-xs text-muted">{e.venue}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] px-5 pt-11 md:px-10">
        <div className="text-center text-xs font-extrabold uppercase tracking-[0.12em] text-coral">
          Con el apoyo de
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-10 opacity-70">
          {SPONSORS.map((s) => (
            <div key={s} className="font-display text-xl tracking-wide text-ink">
              {s}
            </div>
          ))}
        </div>
      </div>

      <div className="fixed right-0 bottom-0 left-0 z-40 flex items-center justify-between gap-4 bg-ink px-5 py-3.5 shadow-[0_-8px_24px_rgba(0,0,0,0.18)] md:px-10">
        <div>
          <div className="text-[11px] text-muted2">{itemCount} entradas</div>
          <div className="text-lg font-extrabold text-cream">{fmtARS(total)}</div>
        </div>
        <button
          type="button"
          onClick={goCheckout}
          className="rounded bg-coral px-7 py-3 text-sm font-extrabold text-white"
        >
          {buyLabel}
        </button>
      </div>

    </div>
  );
}
