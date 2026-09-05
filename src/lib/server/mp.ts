import { site } from "@/lib/site";

export function mpEnabled() {
  return Boolean(process.env.MP_ACCESS_TOKEN);
}

export async function createPreference(input: {
  orderId: string;
  title: string;
  total: number;
  fee: number;
  email: string;
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
    statement_descriptor: "TIKEAME",
    back_urls: {
      success: `${site.url}/api/mp/return?status=success`,
      failure: `${site.url}/api/mp/return?status=failure`,
      pending: `${site.url}/api/mp/return?status=pending`,
    },
    auto_return: "approved",
    notification_url: process.env.MP_WEBHOOK_URL || `${site.url}/api/mp/webhook`,
    metadata: { orderId: input.orderId },
  };

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
