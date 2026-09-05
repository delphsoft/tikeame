"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { HeroMotion } from "@/components/HeroMotion";
import { Logo } from "@/components/Logo";
import { FONDO_KEY, FONDOS, type FondoId } from "@/lib/fondos";

export default function FondosPage() {
  const router = useRouter();

  function applyFondo(id: FondoId) {
    localStorage.setItem(FONDO_KEY, id);
    router.push(`/?fondo=${id}`);
  }

  return (
    <div className="min-h-screen bg-[#EDE7D6]">
      <header className="sticky top-0 z-50 flex items-center justify-between bg-cream/95 px-6 py-4 backdrop-blur md:px-10">
        <Logo href="/" size="sm" />
        <div className="text-[13px] font-bold text-muted">4 alternativas de fondo · home cliente</div>
        <Link href="/" className="text-[13px] font-extrabold text-coral">
          Volver a la home →
        </Link>
      </header>

      <div className="px-6 py-8 md:px-10">
        <h1 className="font-display text-3xl uppercase">Animación de background</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Misma foto de pista, cuatro movimientos de cámara. Tocá “Usar en la home” para aplicarla
          a la landing de quien va al evento.
        </p>
      </div>

      <div className="flex flex-col gap-10 px-4 pb-16 md:px-8">
        {FONDOS.map((f) => (
          <section key={f.id} id={f.id} className="overflow-hidden rounded-xl border border-ink/10 shadow-lg">
            <div className="flex flex-wrap items-baseline gap-3 bg-cream px-5 py-3">
              <span className="rounded bg-ink px-2 py-0.5 font-mono text-[11px] font-bold text-white">
                {f.label}
              </span>
              <span className="text-sm font-extrabold">{f.name}</span>
              <span className="text-[13px] text-muted">{f.desc}</span>
            </div>
            <HeroMotion fondo={f.id} minH="card">
              <div className="max-w-[480px]">
                <div className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-coral">
                  Ticketera argentina
                </div>
                <div className="mt-3 font-display text-4xl uppercase leading-[1.1] text-cream md:text-5xl">
                  El tikeame
                  <br />
                  que te lleva
                  <br />
                  <span className="bg-coral px-2 text-cream">a la fiesta.</span>
                </div>
                <button
                  type="button"
                  onClick={() => applyFondo(f.id)}
                  className="mt-6 rounded bg-coral px-5 py-3 text-sm font-extrabold text-white"
                >
                  Usar {f.label} en la home
                </button>
              </div>
            </HeroMotion>
          </section>
        ))}
      </div>
    </div>
  );
}
