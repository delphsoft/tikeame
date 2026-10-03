import { NextResponse } from "next/server";
import { settleOrder } from "@/lib/server/settle";
import { getOrder } from "@/lib/server/store";
import { site } from "@/lib/site";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status") || url.searchParams.get("collection_status");
  const paymentId = url.searchParams.get("payment_id") || url.searchParams.get("collection_id");
  const orderId = url.searchParams.get("external_reference");

  if (orderId && paymentId && paymentId !== "null") {
    await settleOrder(orderId, paymentId);
  }

  if (status === "failure") {
    return NextResponse.redirect(new URL(`/checkout?error=pago`, site.url));
  }

  let token = "";
  if (orderId) {
    const order = await getOrder(orderId);
    token = order?.viewToken || "";
  }
  const dest = orderId
    ? `/confirmacion?order=${encodeURIComponent(orderId)}${token ? `&t=${encodeURIComponent(token)}` : ""}`
    : "/confirmacion";
  return NextResponse.redirect(new URL(dest, site.url));
}
