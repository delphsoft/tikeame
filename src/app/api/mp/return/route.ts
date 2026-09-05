import { NextResponse } from "next/server";
import { fulfillOrder } from "@/lib/server/fulfill";
import { getPayment } from "@/lib/server/mp";
import { getOrder, putOrder } from "@/lib/server/store";
import { site } from "@/lib/site";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status") || url.searchParams.get("collection_status");
  const paymentId = url.searchParams.get("payment_id") || url.searchParams.get("collection_id");
  const ext = url.searchParams.get("external_reference");

  let orderId = ext;
  if (paymentId) {
    const payment = await getPayment(paymentId);
    if (payment?.external_reference) orderId = payment.external_reference;
    if (payment && orderId) {
      const order = getOrder(orderId);
      if (order) {
        order.mpPaymentId = String(payment.id);
        if (payment.status === "approved") {
          order.status = "paid";
          putOrder(order);
          await fulfillOrder(order.id);
        } else {
          putOrder(order);
        }
      }
    }
  }

  if (status === "failure") {
    return NextResponse.redirect(new URL(`/checkout?error=pago`, site.url));
  }
  const dest = orderId ? `/confirmacion?order=${encodeURIComponent(orderId)}` : "/confirmacion";
  return NextResponse.redirect(new URL(dest, site.url));
}
