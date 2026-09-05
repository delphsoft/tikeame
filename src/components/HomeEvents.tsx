"use client";

import Image from "next/image";
import Link from "next/link";
import { eventSold, eventCapacity, useEvents } from "@/lib/events";
import { fmtARS } from "@/lib/money";

export function HomeEvents() {
  const { events } = useEvents();
  const live = events.filter((e) => e.status === "on_sale");
  const featured = live.find((e) => e.featured) ?? live[0];
  const rest = live.filter((e) => e.slug !== featured?.slug);

  if (!featured) return null;

  const from = featured.tickets.length ? Math.min(...featured.tickets.map((t) => t.price)) : 0;
  const left = Math.max(0, eventCapacity(featured) - eventSold(featured));

  return (
    <div className="mx-auto max-w-[1240px]">
      <Link
        href={`/eventos/${featured.slug}`}
        className="grid overflow-hidden rounded-md border-2 border-ink bg-ink md:grid-cols-[1.4fr_1fr]"
      >
        <div className="relative min-h-[240px] md:min-h-[340px]">
          <Image src={featured.hero} alt={featured.title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
          <div className="absolute bottom-5 left-5">
            <span className="rounded-full bg-coral px-3 py-1 text-[11px] font-extrabold uppercase text-white">
              Destacado
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-between p-6 text-cream md:p-8">
          <div>
            <div className="text-[12px] font-extrabold uppercase tracking-[0.12em] text-coral">
              {featured.category}
            </div>
            <div className="mt-2 font-display text-4xl uppercase leading-none md:text-5xl">
              {featured.title}
            </div>
            <div className="mt-2 font-display text-lg uppercase text-coral">{featured.subtitle}</div>
            <div className="mt-4 text-sm font-semibold text-muted2">
              {featured.dateLabel} · {featured.timeLabel} · {featured.venue}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase text-muted2">Desde</div>
              <div className="font-display text-2xl">{fmtARS(from)}</div>
            </div>
            <div className="text-xs font-bold text-teal">Quedan {left} entradas</div>
            <span className="rounded bg-coral px-5 py-3 text-sm font-extrabold text-white">
              Comprar
            </span>
          </div>
        </div>
      </Link>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {rest.map((e) => (
          <Link
            key={e.slug}
            href={`/eventos/${e.slug}`}
            className="overflow-hidden rounded-md border-2 border-ink bg-white"
          >
            <div className="relative h-[150px]">
              <Image src={e.hero} alt={e.title} fill className="object-cover" />
            </div>
            <div className="p-4">
              <div className="text-[11px] font-extrabold uppercase text-coral">{e.dateLabel}</div>
              <div className="mt-1 text-[15px] font-extrabold">{e.title}</div>
              <div className="mt-0.5 text-xs text-muted">{e.venue}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
