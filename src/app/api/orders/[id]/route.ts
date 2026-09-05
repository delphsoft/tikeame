import { NextResponse } from "next/server";
import { getOrder, ticketsForOrder } from "@/lib/server/store";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const order = getOrder(id);
  if (!order) return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
  const tickets = ticketsForOrder(order.id);
  return NextResponse.json({ order, tickets });
}
