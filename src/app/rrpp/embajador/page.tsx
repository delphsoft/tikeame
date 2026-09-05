import Link from "next/link";
import { Logo } from "@/components/Logo";

const perks = [
  {
    color: "bg-teal",
    title: "Comisión mejorada",
    body: "Ganás más por cada check-in real que generás.",
  },
  {
    color: "bg-coral",
    title: "Acceso anticipado",
    body: "Comprás antes que nadie en cada nueva fecha.",
  },
  {
    color: "bg-ink",
    title: "Regalo de cumpleaños",
    body: "Una entrada de regalo el mes de tu cumple.",
  },
];

export default function EmbajadorPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-[420px]">
        <div className="bg-ink px-6 py-7 text-center">
          <div className="mb-4 flex justify-center">
            <Logo href="/" light size="sm" />
          </div>
          <div className="mx-auto mb-3.5 flex size-16 items-center justify-center rounded-full bg-teal text-[26px]">
            ★
          </div>
          <h1 className="text-xl font-extrabold text-cream">¡Sos Embajadora Tikeame!</h1>
          <p className="mt-2 text-[13px] leading-normal text-muted2">
            Fuiste a 3 eventos este año. Ya sos parte del círculo Embajador.
          </p>
        </div>
        <div className="flex flex-col gap-3 px-5 py-6">
          {perks.map((p) => (
            <div
              key={p.title}
              className="flex items-start gap-3.5 rounded-[14px] border border-border bg-white px-[18px] py-4"
            >
              <div className={`size-9 shrink-0 rounded-[10px] ${p.color}`} />
              <div>
                <div className="text-sm font-bold text-ink">{p.title}</div>
                <div className="mt-0.5 text-[12.5px] text-muted">{p.body}</div>
              </div>
            </div>
          ))}
          <Link
            href="/rrpp?id=1"
            className="mt-1.5 rounded-full bg-coral py-3.5 text-center text-sm font-extrabold text-white"
          >
            Ver mi panel RRPP
          </Link>
        </div>
      </div>
    </div>
  );
}
