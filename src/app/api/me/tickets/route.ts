import { NextResponse } from "next/server";
import { currentUser } from "@/lib/server/auth";
import { getOrder, ticketsByEmail } from "@/lib/server/store";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ tickets: [] });
  const tickets = await ticketsByEmail(user.email);
  const out = [];
  for (const t of tickets) {
    const order = await getOrder(t.orderId);
    out.push({
      id: t.id,
      name: t.name,
      status: t.status,
      eventSlug: t.eventSlug,
      eventTitle: order?.eventTitle,
      eventDate: order?.eventDate,
      venue: order?.venue,
      buyerName: order?.buyerName,
      orderId: t.orderId,
    });
  }
  return NextResponse.json({ tickets: out });
}
