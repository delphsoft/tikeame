import { createHmac, timingSafeEqual } from "node:crypto";
import { site } from "@/lib/site";

export function mpEnabled() {
  return Boolean(process.env.MP_ACCESS_TOKEN);
}

/** Live origin for MP redirects/webhooks. Use vercel.app until nic.ar DNS is live. */
function mpPublicUrl() {
  const explicit = process.env.MP_PUBLIC_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return site.url;
}

export function verifyMpSignature(req: Request, dataId: string) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true;
  const signature = req.headers.get("x-signature") || "";
  const requestId = req.headers.get("x-request-id") || "";
  const ts = /ts=([^,]+)/.exec(signature)?.[1];
  const v1 = /v1=([^,]+)/.exec(signature)?.[1];
  if (!ts || !v1) return false;
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  try {
    const a = Buffer.from(v1, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function createPreference(input: {
  orderId: string;
  title: string;
  total: number;
  fee: number;
  email: string;
  paymentMethod?: "card" | "transfer";
}) {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return null;

  const body: Record<string, unknown> = {
    items: [
      {
        title: input.title,
        quantity: 1,
        currency_id: "ARS",
        unit_price: Number(input.total.toFixed(2)),
      },
    ],
    payer: { email: input.email },
    external_reference: input.orderId,
    statement_descriptor: "TICKEAME",
    back_urls: {
      success: `${mpPublicUrl()}/api/mp/return?status=success`,
      failure: `${mpPublicUrl()}/api/mp/return?status=failure`,
      pending: `${mpPublicUrl()}/api/mp/return?status=pending`,
    },
    auto_return: "approved",
    notification_url: process.env.MP_WEBHOOK_URL || `${mpPublicUrl()}/api/mp/webhook`,
    metadata: { orderId: input.orderId },
  };

  if (input.paymentMethod === "transfer") {
    body.excluded_payment_types = [{ id: "credit_card" }, { id: "debit_card" }, { id: "prepaid_card" }];
  }
  if (input.paymentMethod === "card") {
    body.excluded_payment_types = [{ id: "ticket" }, { id: "atm" }, { id: "bank_transfer" }];
  }

  if (input.fee > 0) body.marketplace_fee = Number(input.fee.toFixed(2));

  const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mercado Pago preference failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { id: string; init_point: string; sandbox_init_point?: string };
  return {
    id: data.id,
    initPoint: token.startsWith("TEST-") ? data.sandbox_init_point || data.init_point : data.init_point,
  };
}

export async function getPayment(id: string) {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return null;
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return (await res.json()) as {
    id: number;
    status: string;
    external_reference?: string;
  };
}
