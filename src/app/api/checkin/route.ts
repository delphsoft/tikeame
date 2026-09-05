import { NextResponse } from "next/server";
import { getOrder } from "@/lib/server/store";
import { addScan, getTicket, listScans, markTicketUsed, newId, paidCount, soldCount } from "@/lib/server/store";

export async function GET() {
  return NextResponse.json({
    scans: listScans(),
    checkedIn: paidCount(),
    sold: soldCount(),
  });
}

export async function POST(req: Request) {
  const body = (await req.json()) as { code?: string };
  const code = (body.code || "").trim();
  const now = new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

  if (!code) {
    return NextResponse.json({ error: "Ingresá el código" }, { status: 400 });
  }

  const ticket = getTicket(code);
  if (!ticket) {
    const scan = {
      id: newId("scan"),
      ticketId: code,
      name: "Código sin registro",
      type: "—",
      status: "invalid" as const,
      time: now,
    };
    addScan(scan);
    return NextResponse.json({ result: scan, checkedIn: paidCount(), sold: soldCount() });
  }

  if (ticket.status === "used") {
    const order = getOrder(ticket.orderId);
    const scan = {
      id: newId("scan"),
      ticketId: ticket.id,
      name: order?.buyerName || "Titular",
      type: ticket.name,
      status: "used" as const,
      time: now,
    };
    addScan(scan);
    return NextResponse.json({ result: scan, checkedIn: paidCount(), sold: soldCount() });
  }

  markTicketUsed(ticket.id);
  const order = getOrder(ticket.orderId);
  const scan = {
    id: newId("scan"),
    ticketId: ticket.id,
    name: order?.buyerName || "Titular",
    type: ticket.name,
    status: "valid" as const,
    time: now,
  };
  addScan(scan);
  return NextResponse.json({ result: scan, checkedIn: paidCount(), sold: soldCount() });
}
