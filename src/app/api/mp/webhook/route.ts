import { NextResponse } from "next/server";
import { fulfillOrder } from "@/lib/server/fulfill";
import { getPayment } from "@/lib/server/mp";
import { getOrder, putOrder } from "@/lib/server/store";

export async function POST(req: Request) {
  const url = new URL(req.url);
  let type = url.searchParams.get("type") || url.searchParams.get("topic");
  let dataId = url.searchParams.get("data.id") || url.searchParams.get("id");

  try {
    const body = (await req.json()) as { type?: string; action?: string; data?: { id?: string } };
    type = type || body.type || body.action || null;
    dataId = dataId || body.data?.id || null;
  } catch {
    /* query-only notification */
  }

  if (!dataId || (type && !String(type).includes("payment"))) {
    return NextResponse.json({ ok: true });
  }

  const payment = await getPayment(String(dataId));
  if (!payment?.external_reference) return NextResponse.json({ ok: true });

  const order = getOrder(payment.external_reference);
  if (!order) return NextResponse.json({ ok: true });

  order.mpPaymentId = String(payment.id);
  if (payment.status === "approved") {
    order.status = "paid";
    putOrder(order);
    await fulfillOrder(order.id);
  } else if (payment.status === "rejected" || payment.status === "cancelled") {
    order.status = "failed";
    putOrder(order);
  } else {
    putOrder(order);
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
