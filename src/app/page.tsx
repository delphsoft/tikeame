import Link from "next/link";
import { Footer } from "@/components/Footer";
import { HeroParallax } from "@/components/HeroParallax";
import { Perforation } from "@/components/Perforation";
import { Reveal } from "@/components/Reveal";
import { SiteHeader } from "@/components/SiteHeader";

const steps = [
  {
    n: "01",
    bg: "bg-ink",
    fg: "text-cream",
    rot: "-rotate-[1.5deg]",
    title: "Creá tu evento",
    body: "Tipos de entrada, capacidad y ventana de venta en minutos. Sumá códigos de invitación si los necesitás.",
  },
  {
    n: "02",
    bg: "bg-coral",
    fg: "text-cream",
    rot: "rotate-[1.5deg] mt-3.5",
    title: "Vendé con Mercado Pago",
    body: "Split automático a tu cuenta. La plata nunca pasa por nosotros.",
  },
  {
    n: "03",
    bg: "bg-teal",
    fg: "text-ink",
    rot: "-rotate-[1.5deg]",
    title: "Mirá todo en tu dashboard",
    body: "Recaudado, entradas vendidas, check-ins en la puerta y ranking de RRPP, en tiempo real.",
  },
];

const rrpp = [
  {
    title: "RRPP por check-ins reales",
    body: "Comisión escalonada según cuánta gente entró de verdad, no cuánto vendieron.",
  },
  {
    title: "Referidos que se desbloquean al entrar",
    body: "Nunca cashback: siempre descuento, crédito o upgrade, y solo cuando el referido hace check-in.",
  },
  {
    title: "Clientes que vuelven",
    body: "Un mismo perfil de cliente cruza todos los eventos de la productora, con tiers y embajadores.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader variant="landing" />

      <HeroParallax src="/evento-hero.avif">
        <div className="max-w-[560px]">
          <div className="text-[13px] font-extrabold uppercase tracking-[0.18em] text-coral">
            Ticketera argentina
          </div>
          <h1 className="mt-[18px] font-display text-5xl uppercase leading-[1.15] text-cream md:text-[72px]">
            Tu plata.
            <br />
            Tu evento.
            <br />
            <span className="bg-coral px-2.5 text-cream">Tu tiko.</span>
          </h1>
          <p className="mt-[26px] max-w-[480px] text-[17px] font-semibold leading-[1.55] text-cream">
            La plata de tus entradas, en tu cuenta al toque. Sin sorpresas en la comisión, sin
            planillas para armar a mano, sin RRPP que se aprovecha del sistema.
          </p>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <Link
              href="/organizador/nuevo"
              className="rounded bg-coral px-7 py-4 text-[15px] font-extrabold text-cream"
            >
              Sumar mi evento
            </Link>
            <a
              href="#como-funciona"
              className="rounded border-2 border-cream px-7 py-4 text-[15px] font-extrabold text-cream"
            >
              Cómo funciona
            </a>
            <Link
              href="/eventos/neon"
              className="rounded px-7 py-4 text-[15px] font-extrabold text-cream underline-offset-4 hover:underline"
            >
              Ver evento demo
            </Link>
          </div>
        </div>
      </HeroParallax>

      <Perforation />

      <section className="bg-ink px-5 py-11 md:px-12">
        <div className="mx-auto grid max-w-[1240px] gap-6 md:grid-cols-3">
          <Reveal>
            <div className="font-display text-[42px] text-coral">2–5%</div>
            <p className="mt-2 text-[13px] font-semibold text-muted2">
              Cargo total, visible antes de pagar. Vos elegís el %.
            </p>
          </Reveal>
          <Reveal delay={80}>
            <div className="font-display text-[42px] text-teal">100%</div>
            <p className="mt-2 text-[13px] font-semibold text-muted2">
              Split automático a tu cuenta de Mercado Pago.
            </p>
          </Reveal>
          <Reveal delay={160}>
            <div className="font-display text-[42px] text-cream">0</div>
            <p className="mt-2 text-[13px] font-semibold text-muted2">
              Plata que pasa por Tikeame. Nunca la custodiamos.
            </p>
          </Reveal>
        </div>
      </section>

      <section id="como-funciona" className="overflow-hidden px-5 py-16 md:px-12 md:py-[90px]">
        <div className="mx-auto max-w-[1240px]">
          <Reveal>
            <div className="text-center text-[13px] font-extrabold uppercase tracking-[0.1em] text-coral">
              Cómo funciona
            </div>
            <h2 className="mt-3.5 text-center font-display text-3xl uppercase md:text-[38px]">
              De crear el evento a cobrar, sin intermediarios.
            </h2>
          </Reveal>
          <div className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-0">
            <div className="absolute top-[38px] right-[8%] left-[8%] z-0 hidden border-t-[3px] border-dashed border-[#D9CCB0] md:block" />
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 90}>
                <div className={`relative z-10 flex flex-col items-center px-[22px] ${s.rot}`}>
                  <div
                    className={`flex size-[72px] items-center justify-center rounded-full ${s.bg} shadow-[0_10px_0_-3px_rgba(43,29,74,0.15)]`}
                  >
                    <span className={`font-display text-[26px] ${s.fg}`}>{s.n}</span>
                  </div>
                  <div className="ticket-holes relative mt-6 w-full rounded border-2 border-ink bg-white px-[22px] py-[26px]">
                    <div className="text-center text-[17px] font-extrabold">{s.title}</div>
                    <p className="mt-2 text-center text-sm leading-[1.55] text-muted">{s.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Perforation />

      <section id="fidelizacion" className="bg-ink px-5 py-16 md:px-12 md:py-[90px]">
        <div className="mx-auto max-w-[1240px]">
          <Reveal>
            <div className="text-center text-[13px] font-extrabold uppercase tracking-[0.1em] text-teal">
              RRPP y fidelización
            </div>
            <h2 className="mx-auto mt-3.5 max-w-[780px] text-center font-display text-3xl uppercase leading-[1.3] text-cream md:text-[38px]">
              Premiamos que tu gente entre, no que compre y no vaya.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {rrpp.map((card, i) => (
              <Reveal key={card.title} delay={i * 90}>
                <div className="rounded bg-plum px-6 py-7">
                  <div className="text-base font-extrabold text-cream">{card.title}</div>
                  <p className="mt-2.5 text-sm leading-[1.55] text-muted2">{card.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-coral px-5 py-20 text-center md:px-12 md:py-[100px]">
        <div className="hero-orb bg-white/20" style={{ width: 320, height: 320, top: -80, right: -40 }} />
        <Reveal>
          <h2 className="relative mx-auto max-w-[680px] font-display text-4xl uppercase leading-[1.3] text-white md:text-[44px]">
            El tikeame que te lleva a la fiesta.
          </h2>
          <p className="relative mx-auto mt-[18px] max-w-[480px] text-[17px] font-semibold leading-normal text-[#FFE4DF]">
            Sumá tu evento y mostrale a tu público cuánto está pagando, de verdad.
          </p>
          <Link
            href="/organizador/nuevo"
            className="relative mt-[30px] inline-block rounded bg-ink px-[34px] py-4 text-[15px] font-extrabold text-cream"
          >
            Sumar mi evento
          </Link>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
