import { NextResponse } from "next/server";
import { verifyMpSignature } from "@/lib/server/mp";
import { fetchPaymentFor, settleOrder } from "@/lib/server/settle";
import { getOrder } from "@/lib/server/store";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const orderHint = url.searchParams.get("order");
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

  if (!verifyMpSignature(req, String(dataId))) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  let orderId = orderHint;
  if (!orderId) {
    // Preferences viejas sin ?order=: probar con el token de plataforma.
    const payment = await fetchPaymentFor(String(dataId), null);
    orderId = payment?.external_reference ?? null;
  }
  if (!orderId || !(await getOrder(orderId))) return NextResponse.json({ ok: true });

  await settleOrder(orderId, String(dataId));
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
