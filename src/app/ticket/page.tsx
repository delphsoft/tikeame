"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { qrSrc } from "@/lib/data";

type TicketView = {
  id: string;
  name: string;
  eventTitle?: string;
  eventDate?: string;
  venue?: string;
  buyerName?: string;
  orderId?: string;
};

function TicketInner() {
  const params = useSearchParams();
  const id = params.get("id");
  const orderId = params.get("order");
  const token = params.get("t");
  const [ticket, setTicket] = useState<TicketView | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const load = orderId
        ? fetch(`/api/orders/${encodeURIComponent(orderId)}${token ? `?t=${encodeURIComponent(token)}` : ""}`).then(
            async (r) => {
              const j = (await r.json()) as {
                error?: string;
                order?: { id: string; eventTitle: string; eventDate: string; venue: string; buyerName: string };
                tickets?: { id: string; name: string }[];
              };
              if (j.error || !j.order) throw new Error(j.error || "No encontrada");
              const row = j.tickets?.find((t) => t.id === id) ?? j.tickets?.[0];
              if (!row) throw new Error("Entrada no encontrada");
              return {
                id: row.id,
                name: row.name,
                eventTitle: j.order.eventTitle,
                eventDate: j.order.eventDate,
                venue: j.order.venue,
                buyerName: j.order.buyerName,
                orderId: j.order.id,
              } satisfies TicketView;
            },
          )
        : fetch("/api/me/tickets").then(async (r) => {
            const j = (await r.json()) as { tickets?: TicketView[] };
            const row = j.tickets?.find((t) => t.id === id) ?? j.tickets?.[0] ?? null;
            if (!row) throw new Error("Entrá a tu cuenta para ver esta entrada.");
            return row;
          });

      load.then(setTicket).catch((e: unknown) => setErr(e instanceof Error ? e.message : "No se pudo cargar"));
    });
    return () => cancelAnimationFrame(frame);
  }, [id, orderId, token]);

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-[420px] px-5 py-6">
        <div className="mb-4 flex items-center justify-between">
          <Logo href="/" size="sm" />
          <Link href="/entradas" className="text-xs font-bold text-muted">
            ← Mis entradas
          </Link>
        </div>
        {err && <p className="text-sm font-bold text-coral">{err}</p>}
        {ticket && (
          <div className="overflow-hidden rounded-[20px] bg-ink">
            <div className="px-5 pt-5 pb-4">
              <div className="text-[11px] font-bold uppercase tracking-wide text-teal">Válido</div>
              <div className="mt-1 text-[19px] font-extrabold text-cream">{ticket.eventTitle || "Tickeame"}</div>
              <div className="mt-1 text-[13px] text-muted2">
                {[ticket.eventDate, ticket.venue].filter(Boolean).join(" · ")}
              </div>
            </div>
            <div className="flex justify-center bg-cream p-6">
              <Image
                src={qrSrc(ticket.id, { orderId: ticket.orderId || orderId || undefined, token: token || undefined })}
                alt="Código QR"
                width={200}
                height={200}
                unoptimized
                className="rounded-xl bg-white p-2"
              />
            </div>
            <div className="flex flex-col gap-2.5 px-5 py-5">
              <Row label="Titular" value={ticket.buyerName || "—"} />
              <Row label="Tipo" value={ticket.name} />
              <Row label="Código" value={ticket.id} />
            </div>
          </div>
        )}
        <p className="mt-4 text-center text-xs leading-normal text-muted">
          Válida para un solo ingreso. Se invalida apenas se escanea en la puerta.
        </p>
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
