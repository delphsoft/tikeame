import { NextResponse } from "next/server";
import { currentUser } from "@/lib/server/auth";
import { canSeeOrder, publicOrder } from "@/lib/server/guard";
import { getOrder, ticketsForOrder } from "@/lib/server/store";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const token = url.searchParams.get("t");
  const user = await currentUser();

  if (!user && !token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const order = await getOrder(id);
  if (!order || !canSeeOrder(order, user, token)) {
    return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
  }

  const includePii = Boolean(user && (user.role === "admin" || user.email.toLowerCase() === order.email.toLowerCase()));
  const tickets = await ticketsForOrder(order.id);
  return NextResponse.json({
    order: publicOrder(order, includePii),
    tickets: tickets.map((t) => ({ id: t.id, name: t.name, status: t.status, eventSlug: t.eventSlug })),
  });
}
