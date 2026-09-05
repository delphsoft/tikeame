"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { Logo } from "@/components/Logo";
import { DEFAULT_QTY, useCart, type Order } from "@/lib/cart";
import { COMMISSION_PCT, TICKET_TIERS, qrUrl } from "@/lib/data";
import { fmtARS } from "@/lib/money";

function fallbackOrder(): Order {
  const qty = { ...DEFAULT_QTY, vip: 1 };
  const items = TICKET_TIERS.filter((t) => qty[t.key] > 0).map((t) => ({
    key: t.key,
    name: t.name,
    qty: qty[t.key],
    unitPrice: t.price,
  }));
  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const fee = subtotal * (COMMISSION_PCT / 100);
  const tickets = items.flatMap((item, idx) =>
    Array.from({ length: item.qty }, (_, i) => ({
      id: `NEON-48213-${idx + i + 1}`,
      name: item.name,
      key: item.key,
    })),
  );
  return {
    id: "NEON-48213",
    items,
    subtotal,
    fee,
    total: subtotal + fee,
    tickets,
    buyerName: "Guadalupe Fernández",
  };
}

export default function ConfirmacionPage() {
  const { order } = useCart();
  const data = order ?? fallbackOrder();

  const tickets = useMemo(
    () =>
      data.tickets.map((t) => ({
        ...t,
        qr: qrUrl(t.id, 176),
      })),
    [data.tickets],
  );

  return (
    <div className="min-h-screen bg-cream px-5 py-12">
      <div className="mx-auto max-w-[640px]">
        <div className="mb-8 text-center">
          <Logo href="/" size="sm" />
        </div>
        <div className="text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-teal text-[28px] font-extrabold text-white">
            ✓
          </div>
          <h1 className="mt-[18px] font-display text-[30px] uppercase">¡Compra confirmada!</h1>
          <p className="mt-1.5 text-sm text-muted">
            Te enviamos las entradas a tu email. También las tenés acá abajo.
          </p>
        </div>

        <div className="mt-8 rounded-md border-2 border-ink bg-white px-[22px] py-5">
          <div className="text-xs font-extrabold uppercase tracking-[0.1em] text-coral">Resumen</div>
          <div className="mt-3 flex justify-between text-sm font-bold">
            <span>NEÓN — Fiesta Electrónica</span>
            <span>Sáb 12 de dic</span>
          </div>
          <div className="my-3.5 h-px bg-border" />
          {data.items.map((it) => (
            <div key={it.key} className="mt-1.5 flex justify-between text-[13.5px] text-plum">
              <span>
                {it.qty}x {it.name}
              </span>
              <span>{fmtARS(it.qty * it.unitPrice)}</span>
            </div>
          ))}
          <div className="my-3.5 h-px bg-border" />
          <div className="flex justify-between text-[17px] font-extrabold">
            <span>Total pagado</span>
            <span>{fmtARS(data.total)}</span>
          </div>
          <div className="mt-2 text-xs text-muted">
            Orden #{data.id} · Pagado con Mercado Pago (simulado)
          </div>
        </div>

        <div className="mt-8 text-xs font-extrabold uppercase tracking-[0.1em] text-coral">
          Tus entradas
        </div>
        <div className="mt-3.5 flex flex-col gap-3">
          {tickets.map((t) => (
            <Link
              key={t.id}
              href={`/ticket?id=${encodeURIComponent(t.id)}`}
              className="flex items-center gap-4 rounded-md bg-ink p-4"
            >
              <Image
                src={t.qr}
                alt={`Código QR de ${t.name}`}
                width={88}
                height={88}
                unoptimized
                className="size-[88px] shrink-0 rounded bg-white p-1.5"
              />
              <div>
                <div className="text-[15px] font-extrabold text-cream">{t.name}</div>
                <div className="mt-1 text-xs text-muted2">ID {t.id}</div>
                <div className="mt-0.5 text-[11px] text-muted2">Válida para un solo ingreso</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="min-w-[180px] flex-1 rounded bg-coral py-3.5 text-sm font-extrabold text-white"
          >
            Descargar entradas (PDF)
          </button>
          <Link
            href="/eventos/neon"
            className="min-w-[180px] flex-1 rounded border-2 border-ink bg-white py-3 text-center text-sm font-extrabold text-ink"
          >
            Volver al evento
          </Link>
        </div>
      </div>
    </div>
  );
}
