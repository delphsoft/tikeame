"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HeroMotion } from "./HeroMotion";
import { DEFAULT_FONDO, FONDO_KEY, isFondoId, type FondoId } from "@/lib/fondos";

export function HomeHero() {
  const [fondo, setFondo] = useState<FondoId>(DEFAULT_FONDO);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const q = new URLSearchParams(window.location.search).get("fondo");
      const stored = localStorage.getItem(FONDO_KEY);
      if (isFondoId(q)) setFondo(q);
      else if (isFondoId(stored)) setFondo(stored);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <HeroMotion fondo={fondo}>
      <div className="max-w-[620px]">
        <div className="text-[13px] font-extrabold uppercase tracking-[0.18em] text-coral">
          Ticketera argentina
        </div>
        <h1 className="mt-3 font-display text-[42px] uppercase leading-[1.08] text-cream md:mt-4 md:text-[72px]">
          El tikeame
          <br />
          que te lleva
          <br />
          <span className="bg-coral px-2.5 text-cream">a la fiesta.</span>
        </h1>
        <p className="mt-6 max-w-[460px] text-[17px] font-semibold leading-[1.55] text-cream">
          Encontrá tu noche, pagá viendo el cargo completo, y entra con QR. Un solo ingreso, sin
          letra chica en el checkout.
        </p>
        <div className="mt-8 flex flex-wrap gap-3.5">
          <a
            href="#eventos"
            className="rounded bg-coral px-7 py-4 text-[15px] font-extrabold text-cream"
          >
            Ver eventos
          </a>
          <Link
            href="/eventos/neon"
            className="rounded border-2 border-cream px-7 py-4 text-[15px] font-extrabold text-cream"
          >
            NEÓN — 12 dic
          </Link>
        </div>
        <Link href="/fondos" className="mt-6 hidden text-xs font-bold text-muted2 md:inline-block">
          Fondo {fondo.toUpperCase()} · ver las 4 alternativas →
        </Link>
      </div>
    </HeroMotion>
  );
}
