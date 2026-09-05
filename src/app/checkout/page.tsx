"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Logo } from "@/components/Logo";
import { useCart } from "@/lib/cart";
import { COMMISSION_PCT, TICKET_TIERS } from "@/lib/data";
import { fmtARS } from "@/lib/money";

export default function CheckoutPage() {
  const router = useRouter();
  const { qty, subtotal, fee, total, itemCount, placeOrder } = useCart();
  const [dni, setDni] = useState("");
  const [iva, setIva] = useState("Consumidor Final");

  const lines = useMemo(
    () =>
      TICKET_TIERS.filter((t) => qty[t.key] > 0).map((t) => ({
        label: `${qty[t.key]}× ${t.name}`,
        amount: qty[t.key] * t.price,
      })),
    [qty],
  );

  function pay() {
    if (itemCount === 0) return;
    placeOrder();
    router.push("/confirmacion");
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto flex min-h-screen max-w-[480px] flex-col">
        <header className="flex items-center justify-between px-5 py-4">
          <Logo href="/" size="sm" />
          <span className="text-xs font-bold text-muted">Checkout</span>
        </header>
        <div className="flex flex-1 flex-col gap-3.5 px-5 pb-32">
          <Link href="/eventos/neon" className="text-[13px] font-bold text-muted">
            ← Volver al evento
          </Link>
          <div className="text-[12.5px] font-bold uppercase tracking-wide text-ink">Tu pedido</div>
          <div className="flex flex-col gap-2.5 rounded-2xl border border-border bg-white px-[18px] py-4">
            {lines.length === 0 ? (
              <p className="text-sm text-muted">No hay entradas seleccionadas.</p>
            ) : (
              lines.map((l) => (
                <div key={l.label} className="flex justify-between text-sm font-semibold text-ink">
                  <span>{l.label}</span>
                  <span>{fmtARS(l.amount)}</span>
                </div>
              ))
            )}
          </div>
          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-white px-[18px] py-4">
            <div className="flex justify-between text-[13px] text-muted">
              <span>Subtotal</span>
              <span>{fmtARS(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[13px] text-muted">
              <span>Cargo de servicio ({COMMISSION_PCT}%)</span>
              <span>{fmtARS(fee)}</span>
            </div>
            <div className="my-0.5 h-px bg-border" />
            <div className="flex justify-between text-base font-extrabold text-ink">
              <span>Total</span>
              <span>{fmtARS(total)}</span>
            </div>
          </div>
          <div className="rounded-[14px] bg-[#E9F8F2] px-4 py-3.5 text-[12.5px] font-semibold leading-normal text-[#1F6E58]">
            El organizador recibe {fmtARS(subtotal)} — el 100% de lo que pagás por tu entrada.
          </div>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-ink">DNI o CUIT</span>
            <input
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder="Ej: 30-71234567-9"
              className="rounded-[10px] border border-border bg-white px-3.5 py-3 text-sm text-ink"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-ink">Condición frente al IVA</span>
            <select
              value={iva}
              onChange={(e) => setIva(e.target.value)}
              className="rounded-[10px] border border-border bg-white px-3.5 py-3 text-sm text-ink"
            >
              <option>Consumidor Final</option>
              <option>Monotributista</option>
              <option>Responsable Inscripto</option>
            </select>
          </label>
          <div className="flex items-center gap-3 rounded-[14px] border border-border bg-white px-4 py-3.5">
            <div className="size-9 shrink-0 rounded-lg bg-ink" />
            <div>
              <div className="text-sm font-bold text-ink">Mercado Pago</div>
              <div className="text-xs text-muted">Tarjeta, efectivo o dinero en cuenta</div>
            </div>
          </div>
        </div>
        <div className="fixed right-0 bottom-[calc(var(--tabbar)+var(--safe-bottom))] left-0 mx-auto max-w-[480px] border-t border-border bg-white px-5 pt-3.5 pb-4 md:bottom-0 md:pb-6">
          <button
            type="button"
            onClick={pay}
            disabled={itemCount === 0}
            className="w-full rounded-full bg-coral py-[15px] text-[15px] font-extrabold text-white disabled:opacity-50"
          >
            Pagar {fmtARS(total)}
          </button>
          <div className="mt-2 text-center text-[11px] text-muted">
            Pagás en Mercado Pago, sin salir de Tikeame.
          </div>
        </div>
      </div>
    </div>
  );
}
