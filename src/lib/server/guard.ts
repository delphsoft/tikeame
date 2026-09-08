import { NextResponse } from "next/server";
import { currentUser, type Role, type User } from "./auth";
import { tokensMatch } from "./session-token";
import type { OrderRow } from "./types";

export async function requireUser(roles?: Role[]) {
  const user = await currentUser();
  if (!user) return { user: null as User | null, error: NextResponse.json({ error: "No autenticado" }, { status: 401 }) };
  if (roles && !roles.includes(user.role)) {
    return { user: null as User | null, error: NextResponse.json({ error: "Sin permiso" }, { status: 403 }) };
  }
  return { user, error: null };
}

export function canSeeOrder(order: OrderRow, user: User | null, viewToken?: string | null) {
  if (user?.role === "admin" || user?.role === "organizer") return true;
  if (user && user.email.toLowerCase() === order.email.toLowerCase()) return true;
  if (viewToken && tokensMatch(viewToken, order.viewToken)) return true;
  return false;
}

export function publicOrder(order: OrderRow, includePii: boolean) {
  return {
    id: order.id,
    eventSlug: order.eventSlug,
    eventTitle: order.eventTitle,
    eventDate: order.eventDate,
    venue: order.venue,
    email: includePii ? order.email : undefined,
    buyerName: order.buyerName,
    dni: includePii ? order.dni : undefined,
    iva: includePii ? order.iva : undefined,
    items: order.items,
    subtotal: order.subtotal,
    fee: order.fee,
    total: order.total,
    status: order.status,
    mpPaymentId: order.mpPaymentId,
    createdAt: order.createdAt,
  };
}
