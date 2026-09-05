"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { useCart } from "@/lib/cart";
import { qrUrl } from "@/lib/data";
import { fmtARS } from "@/lib/money";

type Payload = {
  order: {
    id: string;
    eventTitle: string;
    eventDate: string;
    eventSlug: string;
    total: number;
    status: string;
    items: { key: string; name: string; qty: number; unitPrice: number }[];
    mpPaymentId: string | null;
  };
  tickets: { id: string; name: string }[];
};

function Inner() {
  const params = useSearchParams();
  const { order: local } = useCart();
  const orderId = params.get("order") || local?.id || "";
  const [data, setData] = useState<Payload | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!orderId) return;
    const frame = requestAnimationFrame(() => {
      fetch(`/api/orders/${encodeURIComponent(orderId)}`)
        .then((r) => r.json())
        .then((j) => {
          if (j.error) setErr(j.error);
          else setData(j as Payload);
        })
        .catch(() => setErr("No se pudo cargar la orden"));
    });
    return () => cancelAnimationFrame(frame);
  }, [orderId]);

  const paid = data?.order.status === "paid";

  return (
    <div className="min-h-screen bg-cream px-5 py-12">
      <div className="mx-auto max-w-[640px]">
        <div className="mb-8 text-center">
          <Logo href="/" size="sm" />
        </div>
        <div className="text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-teal text-[28px] font-extrabold text-white">
            {paid || !data ? "✓" : "…"}
          </div>
          <h1 className="mt-[18px] font-display text-[30px] uppercase">
            {paid ? "¡Compra confirmada!" : data ? "Estamos confirmando el pago" : "Tu compra"}
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {paid
              ? "Te enviamos las entradas a tu email si hay RESEND_API_KEY. También las tenés acá."
              : "Si pagaste con Mercado Pago, esto se actualiza con el webhook."}
          </p>
        </div>

        {err && <p className="mt-6 text-center text-sm font-bold text-coral">{err}</p>}

        {data && (
          <>
            <div className="mt-8 rounded-md border-2 border-ink bg-white px-[22px] py-5">
              <div className="text-xs font-extrabold uppercase tracking-[0.1em] text-coral">Resumen</div>
              <div className="mt-3 flex justify-between text-sm font-bold">
                <span>{data.order.eventTitle}</span>
                <span>{data.order.eventDate}</span>
              </div>
              <div className="my-3.5 h-px bg-border" />
              {data.order.items.map((it) => (
                <div key={it.key} className="mt-1.5 flex justify-between text-[13.5px] text-plum">
                  <span>
                    {it.qty}x {it.name}
                  </span>
                  <span>{fmtARS(it.qty * it.unitPrice)}</span>
                </div>
              ))}
              <div className="my-3.5 h-px bg-border" />
              <div className="flex justify-between text-[17px] font-extrabold">
                <span>Total</span>
                <span>{fmtARS(data.order.total)}</span>
              </div>
              <div className="mt-2 text-xs text-muted">
                Orden #{data.order.id}
                {data.order.mpPaymentId ? ` · MP ${data.order.mpPaymentId}` : " · Demo (sin MP_ACCESS_TOKEN)"}
              </div>
            </div>

            <div className="mt-8 text-xs font-extrabold uppercase tracking-[0.1em] text-coral">Tus entradas</div>
            <div className="mt-3.5 flex flex-col gap-3">
              {data.tickets.map((t) => (
                <Link
                  key={t.id}
                  href={`/ticket?id=${encodeURIComponent(t.id)}`}
                  className="flex items-center gap-4 rounded-md bg-ink p-4"
                >
                  <Image
                    src={qrUrl(t.id, 176)}
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
          </>
        )}

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="min-w-[180px] flex-1 rounded bg-coral py-3.5 text-sm font-extrabold text-white"
          >
            Descargar entradas (PDF)
          </button>
          <Link
            href={data ? `/eventos/${data.order.eventSlug}` : "/"}
            className="min-w-[180px] flex-1 rounded border-2 border-ink bg-white py-3 text-center text-sm font-extrabold text-ink"
          >
            Volver al evento
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmacionPage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
