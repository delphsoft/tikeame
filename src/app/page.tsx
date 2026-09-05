import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { HomeEvents } from "@/components/HomeEvents";
import { HomeHero } from "@/components/HomeHero";
import { Perforation } from "@/components/Perforation";
import { Reveal } from "@/components/Reveal";
import { SiteHeader } from "@/components/SiteHeader";
import { itemListJsonLd, pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Entradas para fiestas y eventos",
  absoluteTitle: "Tikeame | Entradas para fiestas y eventos en Argentina",
  description: site.description,
  path: "/",
});

const steps = [
  {
    n: "01",
    bg: "bg-ink",
    fg: "text-cream",
    title: "Elegí tu evento",
    body: "Fiestas, clubes y open air. Ves fecha, venue y tipos de entrada en un solo lugar.",
  },
  {
    n: "02",
    bg: "bg-coral",
    fg: "text-cream",
    title: "Pagá sin sorpresas",
    body: "El cargo de servicio se ve completo antes de pagar. Mercado Pago, sin salir de Tikeame.",
  },
  {
    n: "03",
    bg: "bg-teal",
    fg: "text-ink",
    title: "Entrá con tu QR",
    body: "La entrada es de un solo ingreso. Se invalida apenas la escanean en la puerta.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream">
      <JsonLd data={itemListJsonLd()} />
      <SiteHeader variant="home" />
      <HomeHero />
      <Perforation />

      <section className="bg-ink px-5 py-11 md:px-12">
        <div className="mx-auto grid max-w-[1240px] gap-6 md:grid-cols-3">
          <Reveal>
            <div className="font-display text-[42px] text-coral">Cargo visible</div>
            <p className="mt-2 text-[13px] font-semibold text-muted2">
              Lo que ves antes de pagar es lo que pagás. Sin extras en el checkout.
            </p>
          </Reveal>
          <Reveal delay={80}>
            <div className="font-display text-[42px] text-teal">QR único</div>
            <p className="mt-2 text-[13px] font-semibold text-muted2">
              Un ingreso. Se quema al escanearse. Nadie entra dos veces con la tuya.
            </p>
          </Reveal>
          <Reveal delay={160}>
            <div className="font-display text-[42px] text-cream">MP</div>
            <p className="mt-2 text-[13px] font-semibold text-muted2">
              Tarjeta, efectivo o dinero en cuenta. El organizador cobra al toque.
            </p>
          </Reveal>
        </div>
      </section>

      <section id="eventos" className="px-5 py-16 md:px-12 md:py-[80px]">
        <Reveal>
          <div className="mx-auto mb-8 max-w-[1240px]">
            <div className="text-[13px] font-extrabold uppercase tracking-[0.1em] text-coral">
              Próximos eventos
            </div>
            <h2 className="mt-2 font-display text-3xl uppercase md:text-[38px]">Cerca tuyo.</h2>
          </div>
        </Reveal>
        <HomeEvents />
      </section>

      <Perforation />

      <section id="como-funciona" className="overflow-hidden px-5 py-16 md:px-12 md:py-[90px]">
        <div className="mx-auto max-w-[1240px]">
          <Reveal>
            <div className="text-center text-[13px] font-extrabold uppercase tracking-[0.1em] text-coral">
              Cómo funciona
            </div>
            <h2 className="mt-3.5 text-center font-display text-3xl uppercase md:text-[38px]">
              De la entrada al QR, en tres pasos.
            </h2>
          </Reveal>
          <div className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-0">
            <div className="absolute top-[38px] right-[8%] left-[8%] z-0 hidden border-t-[3px] border-dashed border-[#D9CCB0] md:block" />
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 90}>
                <div className="relative z-10 flex flex-col items-center px-[22px]">
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

      <section className="relative overflow-hidden bg-coral px-5 py-20 text-center md:px-12 md:py-[90px]">
        <Reveal>
          <h2 className="relative mx-auto max-w-[680px] font-display text-4xl uppercase leading-[1.3] text-white md:text-[44px]">
            ¿Tienes un evento?
          </h2>
          <p className="relative mx-auto mt-[18px] max-w-[480px] text-[17px] font-semibold text-[#FFE4DF]">
            La plata va a tu Mercado Pago. Tikeame nunca la custodia.
          </p>
          <Link
            href="/organizadores"
            className="relative mt-[30px] inline-block rounded bg-ink px-[34px] py-4 text-[15px] font-extrabold text-cream"
          >
            Soy organizador
          </Link>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
