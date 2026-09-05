"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Logo } from "@/components/Logo";
import { useCart } from "@/lib/cart";
import { COMMISSION_PCT, TICKET_TIERS } from "@/lib/data";
import { fmtARS } from "@/lib/money";
import { useSession } from "@/lib/session";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useSession();
  const { qty, eventSlug, itemCount, subtotal, fee, total, setOrder } = useCart();
  const [dni, setDni] = useState("");
  const [iva, setIva] = useState("Consumidor Final");
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const lines = useMemo(
    () =>
      TICKET_TIERS.filter((t) => qty[t.key] > 0).map((t) => ({
        label: `${qty[t.key]}× ${t.name}`,
        amount: qty[t.key] * t.price,
      })),
    [qty],
  );

  async function pay() {
    if (itemCount === 0) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug,
          qty,
          dni,
          iva,
          name,
          email,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        orderId?: string;
        checkoutUrl?: string;
        mode?: string;
      };
      if (!res.ok || !data.orderId || !data.checkoutUrl) {
        setError(data.error || "No se pudo iniciar el pago");
        return;
      }
      if (data.mode === "mercadopago") {
        window.location.href = data.checkoutUrl;
        return;
      }
      setOrder({
        id: data.orderId,
        items: TICKET_TIERS.filter((t) => qty[t.key] > 0).map((t) => ({
          key: t.key,
          name: t.name,
          qty: qty[t.key],
          unitPrice: t.price,
        })),
        subtotal,
        fee,
        total,
        tickets: [],
        buyerName: name || "Comprador",
      });
      router.push(`/confirmacion?order=${encodeURIComponent(data.orderId)}`);
    } catch {
      setError("Error de red");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto flex min-h-screen max-w-[480px] flex-col">
        <header className="flex items-center justify-between px-5 py-4">
          <Logo href="/" size="sm" />
          <span className="text-xs font-bold text-muted">Checkout</span>
        </header>
        <div className="flex flex-1 flex-col gap-3.5 px-5 pb-32">
          <Link href={`/eventos/${eventSlug}`} className="text-[13px] font-bold text-muted">
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
            <span className="text-xs font-bold text-ink">Nombre</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-[10px] border border-border bg-white px-3.5 py-3 text-sm text-ink"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-ink">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="para enviarte el QR"
              className="rounded-[10px] border border-border bg-white px-3.5 py-3 text-sm text-ink"
            />
          </label>
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
              <div className="text-xs text-muted">
                Si hay MP_ACCESS_TOKEN, cobrás en Checkout Pro. Si no, se confirma en demo.
              </div>
            </div>
          </div>
          {error && <p className="text-sm font-bold text-coral">{error}</p>}
        </div>
        <div className="fixed right-0 bottom-[calc(var(--tabbar)+var(--safe-bottom))] left-0 mx-auto max-w-[480px] border-t border-border bg-white px-5 pt-3.5 pb-4 md:bottom-0 md:pb-6">
          <button
            type="button"
            onClick={pay}
            disabled={itemCount === 0 || busy}
            className="w-full rounded-full bg-coral py-[15px] text-[15px] font-extrabold text-white disabled:opacity-50"
          >
            {busy ? "Procesando…" : `Pagar ${fmtARS(total)}`}
          </button>
          <div className="mt-2 text-center text-[11px] text-muted">Pagás en Mercado Pago, sin salir de Tikeame.</div>
        </div>
      </div>
    </div>
  );
}
