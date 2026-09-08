import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/guard";
import { addScan, getOrder, getTicket, listScans, markTicketUsed, newId, paidCount, soldCount } from "@/lib/server/store";

export async function GET() {
  const { error } = await requireUser(["organizer", "admin"]);
  if (error) return error;
  return NextResponse.json({
    scans: await listScans(),
    checkedIn: await paidCount(),
    sold: await soldCount(),
  });
}

export async function POST(req: Request) {
  const { error } = await requireUser(["organizer", "admin"]);
  if (error) return error;

  const body = (await req.json()) as { code?: string };
  const code = (body.code || "").trim();
  const now = new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

  if (!code) {
    return NextResponse.json({ error: "Ingresá el código" }, { status: 400 });
  }

  const ticket = await getTicket(code);
  if (!ticket) {
    const scan = {
      id: newId("scan"),
      ticketId: code,
      name: "Código sin registro",
      type: "—",
      status: "invalid" as const,
      time: now,
    };
    await addScan(scan);
    return NextResponse.json({ result: scan, checkedIn: await paidCount(), sold: await soldCount() });
  }

  if (ticket.status === "used") {
    const order = await getOrder(ticket.orderId);
    const scan = {
      id: newId("scan"),
      ticketId: ticket.id,
      name: order?.buyerName || "Titular",
      type: ticket.name,
      status: "used" as const,
      time: now,
    };
    await addScan(scan);
    return NextResponse.json({ result: scan, checkedIn: await paidCount(), sold: await soldCount() });
  }

  await markTicketUsed(ticket.id);
  const order = await getOrder(ticket.orderId);
  const scan = {
    id: newId("scan"),
    ticketId: ticket.id,
    name: order?.buyerName || "Titular",
    type: ticket.name,
    status: "valid" as const,
    time: now,
  };
  await addScan(scan);
  return NextResponse.json({ result: scan, checkedIn: await paidCount(), sold: await soldCount() });
}
