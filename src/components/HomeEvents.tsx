"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { eventCapacity, eventSold, useEvents, type ManagedEvent } from "@/lib/events";
import { CITIES, formatKm, haversineKm, reverseCity, type City, type CityId } from "@/lib/geo";
import { fmtARS } from "@/lib/money";

const LOC_KEY = "tikeame-city";
type Mode = "near" | "all" | CityId;

function fromPrice(e: ManagedEvent) {
  return e.tickets.length ? Math.min(...e.tickets.map((t) => t.price)) : 0;
}

export function HomeEvents() {
  const { events } = useEvents();
  const live = events.filter((e) => e.status === "on_sale");
  const [mode, setMode] = useState<Mode>("near");
  const [here, setHere] = useState<{ lat: number; lng: number } | null>(null);
  const [detected, setDetected] = useState<City | null>(null);
  const [status, setStatus] = useState<"idle" | "locating" | "ok" | "denied">("idle");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const saved = localStorage.getItem(LOC_KEY) as Mode | null;
      if (saved === "all" || saved === "caba" || saved === "cordoba" || saved === "rosario" || saved === "mendoza") {
        setMode(saved);
        setStatus("ok");
        return;
      }
      if (!navigator.geolocation) {
        setMode("caba");
        setStatus("denied");
        return;
      }
      setStatus("locating");
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setHere(coords);
          const city = await reverseCity(coords.lat, coords.lng);
          setDetected(city);
          setMode("near");
          setStatus("ok");
        },
        () => {
          setMode("caba");
          setStatus("denied");
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
      );
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function pick(next: Mode) {
    setMode(next);
    setOpen(false);
    if (next !== "near") localStorage.setItem(LOC_KEY, next);
    else localStorage.removeItem(LOC_KEY);
    if (next === "near" && !here && navigator.geolocation) {
      setStatus("locating");
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setHere(coords);
          setDetected(await reverseCity(coords.lat, coords.lng));
          setStatus("ok");
        },
        () => setStatus("denied"),
        { timeout: 8000 },
      );
    }
  }

  const origin = useMemo(() => {
    if (mode === "near" && here) return here;
    if (mode !== "near" && mode !== "all") {
      const city = CITIES.find((c) => c.id === mode);
      return city ? { lat: city.lat, lng: city.lng } : null;
    }
    if (detected) return { lat: detected.lat, lng: detected.lng };
    return null;
  }, [mode, here, detected]);

  const filtered = useMemo(() => {
    let list = live;
    if (mode !== "all" && mode !== "near") list = live.filter((e) => e.cityId === mode);
    if (mode === "near" && detected) {
      list = live.filter((e) => e.cityId === detected.id);
      if (list.length === 0) list = live;
    }
    if (origin) {
      list = [...list].sort(
        (a, b) => haversineKm(origin, { lat: a.lat, lng: a.lng }) - haversineKm(origin, { lat: b.lat, lng: b.lng }),
      );
    }
    return list;
  }, [live, mode, detected, origin]);

  const featured = filtered[0];
  const rest = filtered.slice(1);
  const cityLabel =
    mode === "all"
      ? "Todo el país"
      : mode === "near"
        ? detected?.label ?? (status === "locating" ? "Detectando…" : "Cerca mío")
        : CITIES.find((c) => c.id === mode)?.label ?? "Ciudad";

  return (
    <div className="mx-auto max-w-[1240px]">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-white px-4 py-2 text-[13px] font-extrabold"
        >
          <span className="size-2 rounded-full bg-teal" />
          {cityLabel}
          <span className="text-muted">▾</span>
        </button>
        {status === "denied" && mode !== "all" && (
          <span className="text-xs font-bold text-muted">Ubicación bloqueada — elegí ciudad</span>
        )}
      </div>

      {open && (
        <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl border-2 border-ink bg-white p-3 sm:grid-cols-3">
          <button type="button" onClick={() => pick("near")} className={chip(mode === "near")}>
            Cerca mío
          </button>
          {CITIES.map((c) => (
            <button key={c.id} type="button" onClick={() => pick(c.id)} className={chip(mode === c.id)}>
              {c.label}
            </button>
          ))}
          <button type="button" onClick={() => pick("all")} className={chip(mode === "all")}>
            Todo el país
          </button>
        </div>
      )}

      {!featured && (
        <p className="rounded-md border-2 border-ink bg-white p-5 text-sm text-muted">
          No hay eventos en venta en esta ciudad. Probá otra ubicación.
        </p>
      )}

      {featured && (
        <Link
          href={`/eventos/${featured.slug}`}
          className="grid overflow-hidden rounded-2xl border-2 border-ink bg-ink md:grid-cols-[1.4fr_1fr]"
        >
          <div className="relative min-h-[220px] md:min-h-[340px]">
            <Image src={featured.hero} alt={featured.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-coral px-3 py-1 text-[11px] font-extrabold uppercase text-white">
                Cerca
              </span>
              {origin && (
                <span className="rounded-full bg-cream/15 px-3 py-1 text-[11px] font-extrabold text-cream">
                  {formatKm(haversineKm(origin, { lat: featured.lat, lng: featured.lng }))}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col justify-between p-5 text-cream md:p-8">
            <div>
              <div className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-coral">
                {featured.category}
              </div>
              <div className="mt-2 font-display text-4xl uppercase leading-none md:text-5xl">{featured.title}</div>
              <div className="mt-2 font-display text-lg uppercase text-coral">{featured.subtitle}</div>
              <div className="mt-4 text-sm font-semibold text-muted2">
                {featured.dateLabel} · {featured.timeLabel} · {featured.venue}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase text-muted2">Desde</div>
                <div className="font-display text-2xl">{fmtARS(fromPrice(featured))}</div>
              </div>
              <div className="text-xs font-bold text-teal">
                Quedan {Math.max(0, eventCapacity(featured) - eventSold(featured))}
              </div>
              <span className="rounded-full bg-coral px-5 py-3 text-sm font-extrabold text-white">Comprar</span>
            </div>
          </div>
        </Link>
      )}

      <div className="mt-4 flex flex-col gap-3 md:mt-6 md:grid md:grid-cols-3 md:gap-4">
        {rest.map((e) => (
          <Link
            key={e.slug}
            href={`/eventos/${e.slug}`}
            className="flex overflow-hidden rounded-2xl border-2 border-ink bg-white md:block"
          >
            <div className="relative h-[96px] w-[110px] shrink-0 md:h-[150px] md:w-full">
              <Image src={e.hero} alt={e.title} fill className="object-cover" />
            </div>
            <div className="flex flex-1 flex-col justify-center p-3.5 md:p-4">
              <div className="text-[11px] font-extrabold uppercase text-coral">
                {e.dateLabel}
                {origin && ` · ${formatKm(haversineKm(origin, { lat: e.lat, lng: e.lng }))}`}
              </div>
              <div className="mt-1 text-[15px] font-extrabold">{e.title}</div>
              <div className="mt-0.5 text-xs text-muted">{e.venue}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function chip(on: boolean) {
  return `rounded-full px-3 py-2 text-[13px] font-extrabold ${on ? "bg-ink text-cream" : "bg-cream text-ink"}`;
}
