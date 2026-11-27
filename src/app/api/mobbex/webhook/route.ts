import { NextResponse } from "next/server";
import { parseMobbexWebhook, verifyMobbexWebhook } from "@/lib/server/mobbex";
import { settleOrder } from "@/lib/server/settle";
import { getOrder } from "@/lib/server/store";

async function readBody(req: Request): Promise<unknown> {
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return req.json().catch(() => null);
  }
  if (ct.includes("form")) {
    const form = await req.formData().catch(() => null);
    if (!form) return null;
    const raw = form.get("data");
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw);
      } catch {
        return { data: raw };
      }
    }
    return Object.fromEntries(form.entries());
  }
  const text = await req.text().catch(() => "");
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const orderHint = url.searchParams.get("order");
  const body = await readBody(req);
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
