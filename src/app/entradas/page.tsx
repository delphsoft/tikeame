"use client";

import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { useCart } from "@/lib/cart";
import { qrUrl } from "@/lib/data";

export default function EntradasPage() {
  const { order } = useCart();

  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader variant="plain" />
      <div className="mx-auto max-w-[480px] px-5 py-6">
        <h1 className="font-display text-3xl uppercase">Mis entradas</h1>
        <p className="mt-1 text-sm text-muted">Las tenés acá y en el mail, cuando el pago está confirmado.</p>

        {!order && (
          <div className="mt-8 rounded-2xl border-2 border-ink bg-white p-6 text-center">
            <p className="text-sm text-muted">Todavía no compraste. Agendá tu próxima noche.</p>
            <Link href="/#eventos" className="mt-4 inline-block rounded-full bg-coral px-5 py-3 text-sm font-extrabold text-white">
              Ver eventos
            </Link>
          </div>
        )}

        {order && (
          <div className="mt-6 flex flex-col gap-3">
            <div className="text-xs font-extrabold uppercase tracking-[0.1em] text-coral">
              Orden #{order.id}
            </div>
            {order.tickets.map((t) => (
              <Link
                key={t.id}
                href={`/ticket?id=${encodeURIComponent(t.id)}`}
                className="flex items-center gap-3 rounded-2xl bg-ink p-3.5"
              >
                <Image
                  src={qrUrl(t.id, 120)}
                  alt={`QR ${t.name}`}
                  width={72}
                  height={72}
                  unoptimized
                  className="rounded bg-white p-1"
                />
                <div>
                  <div className="text-[15px] font-extrabold text-cream">{t.name}</div>
                  <div className="mt-1 text-xs text-muted2">{t.id}</div>
                  <div className="mt-0.5 text-[11px] text-muted2">Un solo ingreso</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
