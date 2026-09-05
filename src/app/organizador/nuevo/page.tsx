"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { OrganizerHeader } from "@/components/OrganizerHeader";
import type { TicketKey } from "@/lib/data";
import {
  HERO_OPTIONS,
  formatDateLabel,
  uniqueSlug,
  useEvents,
  type EventStatus,
  type EventTicket,
} from "@/lib/events";

type TicketDraft = { key: TicketKey; name: string; price: string; cap: string; note: string };

const EMPTY_TICKETS: TicketDraft[] = [
  { key: "early", name: "Early Bird", price: "6500", cap: "100", note: "" },
  { key: "general", name: "General", price: "8500", cap: "300", note: "" },
  { key: "vip", name: "VIP", price: "15000", cap: "80", note: "barra libre" },
];

export default function NuevoEventoPage() {
  const router = useRouter();
  const { events, addEvent } = useEvents();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState("Electrónica");
  const [dateISO, setDateISO] = useState("2026-12-20");
  const [timeLabel, setTimeLabel] = useState("23:59");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [about, setAbout] = useState("");
  const [lineup, setLineup] = useState("");
  const [commissionPct, setCommissionPct] = useState(3);
  const [hero, setHero] = useState(HERO_OPTIONS[0].src);
  const [tickets, setTickets] = useState<TicketDraft[]>(EMPTY_TICKETS);
  const [error, setError] = useState("");

  const slugPreview = useMemo(
    () => uniqueSlug(title || "evento", events.map((e) => e.slug)),
    [title, events],
  );

  function updateTicket(i: number, patch: Partial<TicketDraft>) {
    setTickets((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function save(status: EventStatus) {
    if (!title.trim() || !venueName.trim() || !dateISO) {
      setError("Completá nombre, fecha y venue.");
      return;
    }
    const parsed: EventTicket[] = tickets
      .filter((t) => t.name.trim())
      .map((t) => ({
        key: t.key,
        name: t.name.trim(),
        price: Number(t.price) || 0,
        cap: Number(t.cap) || 0,
        sold: 0,
        note: t.note.trim() || null,
      }));
    if (parsed.length === 0) {
      setError("Sumá al menos un tipo de entrada.");
      return;
    }
    addEvent({
      slug: slugPreview,
      title: title.trim(),
      subtitle: subtitle.trim() || category,
      category,
      dateLabel: formatDateLabel(dateISO),
      timeLabel,
      dateISO,
      venue: venueAddress ? `${venueName}` : venueName,
      venueName,
      venueAddress: venueAddress || venueName,
      mapsQuery: `${venueName} ${venueAddress} Buenos Aires`,
      about: about.trim() || `Una noche de ${category.toLowerCase()} producida con Tikeame.`,
      lineup: lineup
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      hero,
      commissionPct,
      status,
      organizerId: "tiko",
      organizerName: "Tiko Producciones",
      featured: false,
      tickets: parsed,
    });
    router.push(`/organizador/${slugPreview}`);
  }

  return (
    <div className="min-h-screen bg-cream">
      <OrganizerHeader active="nuevo" />
      <div className="mx-auto max-w-[780px] px-5 py-9 md:px-10">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-coral">
          Nuevo evento
        </div>
        <h1 className="mt-1 font-display text-[28px] uppercase">Creá tu tiko</h1>
        <p className="mt-1 text-[13px] text-muted">
          Tipos de entrada, capacidad y comisión visible. Publicás cuando quieras.
        </p>

        <section className="mt-8 rounded-md border-2 border-ink bg-white p-6">
          <div className="text-xs font-extrabold uppercase tracking-[0.1em] text-coral">El evento</div>
          <label className="mt-4 block">
            <span className="text-[11px] font-extrabold uppercase text-muted">Nombre</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="NEÓN"
              className="mt-1.5 w-full rounded border-2 border-border px-3.5 py-2.5 text-sm font-bold uppercase"
            />
          </label>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label>
              <span className="text-[11px] font-extrabold uppercase text-muted">Subtítulo</span>
              <input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Fiesta Electrónica"
                className="mt-1.5 w-full rounded border-2 border-border px-3.5 py-2.5 text-sm"
              />
            </label>
            <label>
              <span className="text-[11px] font-extrabold uppercase text-muted">Categoría</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1.5 w-full rounded border-2 border-border px-3.5 py-2.5 text-sm"
              >
                {["Electrónica", "Techno", "Bass", "Open air", "Reggaetón", "Indie"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="mt-3 block">
            <span className="text-[11px] font-extrabold uppercase text-muted">Sobre el evento</span>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={3}
              className="mt-1.5 w-full rounded border-2 border-border px-3.5 py-2.5 text-sm"
            />
          </label>
          <label className="mt-3 block">
            <span className="text-[11px] font-extrabold uppercase text-muted">Line up (separado por comas)</span>
            <input
              value={lineup}
              onChange={(e) => setLineup(e.target.value)}
              placeholder="Bandalos Chinos DJ Set, El Zar"
              className="mt-1.5 w-full rounded border-2 border-border px-3.5 py-2.5 text-sm"
            />
          </label>
          <div className="mt-4 text-[11px] font-extrabold uppercase text-muted">Foto de hero</div>
          <div className="mt-2 grid grid-cols-3 gap-2 md:grid-cols-6">
            {HERO_OPTIONS.map((h) => (
              <button
                key={h.src}
                type="button"
                onClick={() => setHero(h.src)}
                className={`relative h-16 overflow-hidden rounded border-2 ${
                  hero === h.src ? "border-coral" : "border-transparent"
                }`}
              >
                <Image src={h.src} alt={h.label} fill className="object-cover" />
              </button>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-md border-2 border-ink bg-white p-6">
          <div className="text-xs font-extrabold uppercase tracking-[0.1em] text-coral">
            Cuándo y dónde
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label>
              <span className="text-[11px] font-extrabold uppercase text-muted">Fecha</span>
              <input
                type="date"
                value={dateISO}
                onChange={(e) => setDateISO(e.target.value)}
                className="mt-1.5 w-full rounded border-2 border-border px-3.5 py-2.5 text-sm"
              />
            </label>
            <label>
              <span className="text-[11px] font-extrabold uppercase text-muted">Hora</span>
              <input
                type="time"
                value={timeLabel}
                onChange={(e) => setTimeLabel(e.target.value)}
                className="mt-1.5 w-full rounded border-2 border-border px-3.5 py-2.5 text-sm"
              />
            </label>
            <label>
              <span className="text-[11px] font-extrabold uppercase text-muted">Venue</span>
              <input
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="Crobar"
                className="mt-1.5 w-full rounded border-2 border-border px-3.5 py-2.5 text-sm"
              />
            </label>
            <label>
              <span className="text-[11px] font-extrabold uppercase text-muted">Dirección</span>
              <input
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                placeholder="Av. Costanera R. Obligado, Palermo"
                className="mt-1.5 w-full rounded border-2 border-border px-3.5 py-2.5 text-sm"
              />
            </label>
          </div>
        </section>

        <section className="mt-5 rounded-md border-2 border-ink bg-white p-6">
          <div className="text-xs font-extrabold uppercase tracking-[0.1em] text-coral">Entradas</div>
          <div className="mt-4 flex flex-col gap-3">
            {tickets.map((t, i) => (
              <div key={t.key} className="grid gap-2 rounded border border-border bg-cream p-3 md:grid-cols-[1.2fr_.7fr_.6fr_1fr]">
                <input
                  value={t.name}
                  onChange={(e) => updateTicket(i, { name: e.target.value })}
                  className="rounded border-2 border-border bg-white px-3 py-2 text-sm font-bold"
                />
                <input
                  value={t.price}
                  onChange={(e) => updateTicket(i, { price: e.target.value })}
                  className="rounded border-2 border-border bg-white px-3 py-2 text-sm"
                  placeholder="$"
                />
                <input
                  value={t.cap}
                  onChange={(e) => updateTicket(i, { cap: e.target.value })}
                  className="rounded border-2 border-border bg-white px-3 py-2 text-sm"
                  placeholder="Cupo"
                />
                <input
                  value={t.note}
                  onChange={(e) => updateTicket(i, { note: e.target.value })}
                  className="rounded border-2 border-border bg-white px-3 py-2 text-sm"
                  placeholder="Nota"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-md border-2 border-ink bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="text-xs font-extrabold uppercase tracking-[0.1em] text-coral">
              Comisión Tikeame
            </div>
            <div className="font-display text-2xl text-coral">{commissionPct}%</div>
          </div>
          <input
            type="range"
            min={2}
            max={5}
            step={0.5}
            value={commissionPct}
            onChange={(e) => setCommissionPct(Number(e.target.value))}
            className="mt-3 w-full accent-coral"
          />
          <p className="mt-2 text-xs text-muted">
            Visible para tu público antes de pagar. Split 100% a tu Mercado Pago. Tikeame nunca
            custodia la plata. Link público: tikeame.vercel.app/eventos/{slugPreview}
          </p>
        </section>

        {error && <p className="mt-4 text-sm font-bold text-coral">{error}</p>}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => save("on_sale")}
            className="rounded bg-coral px-6 py-3.5 text-sm font-extrabold text-white"
          >
            Publicar evento
          </button>
          <button
            type="button"
            onClick={() => save("draft")}
            className="rounded border-2 border-ink bg-white px-6 py-3.5 text-sm font-extrabold"
          >
            Guardar borrador
          </button>
        </div>
      </div>
    </div>
  );
}
