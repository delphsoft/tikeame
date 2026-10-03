import type { EventRecord, ReserveItem, ReserveResult } from "./types";

/**
 * Aplica una reserva/liberación sobre el evento en memoria (sin I/O).
 * Lo usan el store local y el fallback de Supabase; en Supabase con schema-v2
 * el mismo cálculo corre en la función SQL tikeame_reserve, con lock de fila.
 */
export function applyReservation(event: EventRecord, items: ReserveItem[], delta: 1 | -1): ReserveResult {
  if (delta === 1 && event.status !== "on_sale") {
    return { ok: false, error: event.status === "sold_out" ? "Entradas agotadas" : "El evento no está a la venta" };
  }
  for (const it of items) {
    const t = event.tickets.find((x) => x.key === it.key);
    if (!t) return { ok: false, error: `Tipo de entrada inexistente: ${it.key}` };
    if (delta === 1 && t.sold + it.qty > t.cap) {
      const left = Math.max(0, t.cap - t.sold);
      return { ok: false, error: left ? `Quedan ${left} ${t.name}` : `${t.name} agotada` };
    }
  }
  for (const it of items) {
    const t = event.tickets.find((x) => x.key === it.key)!;
    t.sold = Math.max(0, t.sold + delta * it.qty);
  }
  const full = event.tickets.every((t) => t.sold >= t.cap);
  if (full && event.status === "on_sale") event.status = "sold_out";
  if (!full && event.status === "sold_out") event.status = "on_sale";
  return { ok: true };
}
