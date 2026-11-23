import { NextResponse } from "next/server";
import { parseMobbexWebhook, verifyMobbexWebhook } from "@/lib/server/mobbex";
import { settleOrder } from "@/lib/server/settle";
import { getOrder } from "@/lib/server/store";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const orderHint = url.searchParams.get("order");
  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }
  const parsed = body ? parseMobbexWebhook(body) : null;
  const orderId = orderHint || parsed?.reference;
  if (!orderId) return NextResponse.json({ ok: true });
  if (!verifyMobbexWebhook(req, orderId)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }
  if (!(await getOrder(orderId))) return NextResponse.json({ ok: true });
  await settleOrder(orderId, body ? JSON.stringify(body) : parsed?.id || orderId);
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
