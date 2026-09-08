import { NextResponse } from "next/server";
import { currentUser } from "@/lib/server/auth";
import { canSeeOrder } from "@/lib/server/guard";
import { qrPng } from "@/lib/server/qr";
import { getOrder, getTicket } from "@/lib/server/store";

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const token = url.searchParams.get("t");
  const user = await currentUser();

  const ticket = await getTicket(id);
  const order = ticket ? await getOrder(ticket.orderId) : null;
  if (!ticket || !order || !canSeeOrder(order, user, token)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const png = await qrPng(ticket.id);
  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, no-store",
    },
  });
}
