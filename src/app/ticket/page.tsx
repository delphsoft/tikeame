"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import { useCart } from "@/lib/cart";
import { EVENT, qrUrl } from "@/lib/data";

function TicketInner() {
  const params = useSearchParams();
  const { order } = useCart();
  const id = params.get("id");
  const tickets = order?.tickets ?? [
    { id: "TK-4F2A-91", name: "General", key: "general" as const },
  ];
  const ticket = tickets.find((t) => t.id === id) ?? tickets[0];
  const index = tickets.findIndex((t) => t.id === ticket.id);
  const code = ticket.id.length > 12 ? ticket.id : "TK-4F2A-91";
  const buyer = order?.buyerName ?? "Guadalupe Fernández";

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-[420px] px-5 py-6">
        <div className="mb-4 flex items-center justify-between">
          <Logo href="/" size="sm" />
          <Link href="/confirmacion" className="text-xs font-bold text-muted">
            ← Mis entradas
          </Link>
        </div>
        <div className="overflow-hidden rounded-[20px] bg-ink">
          <div className="px-5 pt-5 pb-4">
            <div className="text-[11px] font-bold uppercase tracking-wide text-teal">Válido</div>
            <div className="mt-1 text-[19px] font-extrabold text-cream">{EVENT.fullName}</div>
            <div className="mt-1 text-[13px] text-muted2">
              {EVENT.dateLabel} · {EVENT.timeLabel} · {EVENT.venue}
            </div>
          </div>
          <div className="flex justify-center bg-cream p-6">
            <Image
              src={qrUrl(ticket.id, 200)}
              alt="Código QR"
              width={200}
              height={200}
              unoptimized
              className="rounded-xl bg-white p-2"
            />
          </div>
          <div className="flex flex-col gap-2.5 px-5 py-5">
            <Row label="Titular" value={buyer} />
            <Row label="Tipo" value={ticket.name} />
            <Row label="Entrada" value={`${index + 1} de ${tickets.length}`} />
            <Row label="Código" value={code} />
          </div>
        </div>
        <p className="mt-4 text-center text-xs leading-normal text-muted">
          Válida para un solo ingreso. Se invalida apenas se escanea en la puerta.
        </p>
        <button
          type="button"
          className="mt-4 w-full rounded-full border border-border bg-white py-3.5 text-sm font-extrabold text-ink"
        >
          Agregar a Wallet
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[13px]">
      <span className="text-muted2">{label}</span>
      <span className="font-bold text-cream">{value}</span>
    </div>
  );
}

export default function TicketPage() {
  return (
    <Suspense>
      <TicketInner />
    </Suspense>
  );
}
