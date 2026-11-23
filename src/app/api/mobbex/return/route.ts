import { NextResponse } from "next/server";
import { settleOrder } from "@/lib/server/settle";
import { getOrder } from "@/lib/server/store";
import { site } from "@/lib/site";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("order") || url.searchParams.get("reference");
  const status = url.searchParams.get("status") || url.searchParams.get("transactionStatus");

  if (orderId) {
    const order = await getOrder(orderId);
    if (order) await settleOrder(orderId, order.mpPreferenceId);
  }

  if (status && /fail|cancel|error|reject/i.test(status)) {
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
