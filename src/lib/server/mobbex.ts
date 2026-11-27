import { createHmac, timingSafeEqual } from "node:crypto";
import { site } from "@/lib/site";
import type { OrderRow } from "./types";

export function mobbexEnabled() {
  return Boolean(process.env.MOBBEX_API_KEY && process.env.MOBBEX_ACCESS_TOKEN);
}

export function mobbexTestMode() {
  const raw = process.env.MOBBEX_TEST;
  if (raw === "0" || raw === "false") return false;
  return true;
}

export function mobbexPublicUrl() {
  const explicit = process.env.MOBBEX_PUBLIC_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return site.url;
}

/** Mobbex rechaza return/webhook en localhost (403). */
function publicHttpsOrigin(origin?: string) {
  const fallback = mobbexPublicUrl().replace(/\/$/, "");
  if (!origin) return fallback;
  try {
    const u = new URL(origin);
    const local =
      u.hostname === "localhost" || u.hostname === "127.0.0.1" || u.hostname.endsWith(".local");
    if (u.protocol !== "https:" || local) return fallback;
    return origin.replace(/\/$/, "");
  } catch {
    return fallback;
  }
}

function headers() {
  return {
    "content-type": "application/json",
    "x-api-key": process.env.MOBBEX_API_KEY || "",
    "x-access-token": process.env.MOBBEX_ACCESS_TOKEN || "",
  };
}

async function mobbexFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`https://api.mobbex.com/p${path}`, {
    ...init,
    headers: { ...headers(), ...(init?.headers || {}) },
  });
  const text = await res.text();
  let json: { result?: boolean; data?: T; error?: string } | null = null;
  try {
    json = JSON.parse(text) as { result?: boolean; data?: T; error?: string };
  } catch {
    throw new Error(`Mobbex ${res.status}: ${text.slice(0, 240)}`);
  }
  if (!res.ok || json?.result === false) {
    throw new Error(json?.error || `Mobbex ${res.status}: ${text.slice(0, 240)}`);
  }
  return json.data as T;
}

export type MobbexCheckout = { id: string; url: string };

export async function createMobbexCheckout(input: {
  order: OrderRow;
  title: string;
  splitEntityUid?: string | null;
  splitTaxId?: string | null;
  origin?: string;
}): Promise<MobbexCheckout> {
  if (!mobbexEnabled()) throw new Error("Falta MOBBEX_API_KEY / MOBBEX_ACCESS_TOKEN.");
  const origin = publicHttpsOrigin(input.origin);
  const webhookOrigin = mobbexPublicUrl().replace(/\/$/, "");
  const webhookSecret = process.env.MOBBEX_WEBHOOK_SECRET || "";
  const webhook = new URL(`${webhookOrigin}/api/mobbex/webhook`);
  webhook.searchParams.set("order", input.order.id);
  if (webhookSecret) webhook.searchParams.set("s", signWebhook(input.order.id, webhookSecret));

  const body: Record<string, unknown> = {
    total: Number(input.order.total.toFixed(2)),
    currency: "ARS",
    description: input.title,
    reference: input.order.id,
    test: mobbexTestMode(),
    timeout: 20,
    return_url: `${origin}/api/mobbex/return?order=${encodeURIComponent(input.order.id)}`,
    webhook: webhook.toString(),
    customer: {
      email: input.order.email,
      name: input.order.buyerName || "Comprador",
      identification: input.order.dni || "00000000",
    },
    items: [
      {
        description: input.title,
        quantity: 1,
        total: Number(input.order.total.toFixed(2)),
      },
    ],
  };

  if (input.splitEntityUid && (input.order.platformFee ?? 0) >= 0) {
    body.split = [
      {
        entity: input.splitEntityUid,
        tax_id: input.splitTaxId || undefined,
        total: Number(input.order.total.toFixed(2)),
        fee: Number((input.order.platformFee ?? 0).toFixed(2)),
        reference: input.order.id,
      },
    ];
  }

  const data = await mobbexFetch<MobbexCheckout>("/checkout", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!data?.id || !data?.url) throw new Error("Mobbex no devolvió URL de checkout.");
  return data;
}

export type MobbexPaymentStatus = {
  id: string;
  status: "approved" | "rejected" | "pending";
  reference: string | null;
  amount: number | null;
};

function mapStatus(code: unknown): MobbexPaymentStatus["status"] {
  const n = Number(code);
  if (n === 200 || n === 201 || n === 210 || n === 2 || n === 3) return "approved";
  if (n >= 400) return "rejected";
  return "pending";
}

export function parseMobbexWebhook(payload: unknown): MobbexPaymentStatus | null {
  const root = payload as {
    data?: {
      payment?: {
        id?: string;
        status?: { code?: string | number };
        reference?: string;
        total?: number;
      };
      checkout?: { uid?: string; reference?: string };
    };
    payment?: { id?: string; status?: { code?: string | number }; reference?: string; total?: number };
  };
  const payment = root?.data?.payment || root?.payment;
  if (!payment) return null;
  return {
    id: String(payment.id || root?.data?.checkout?.uid || ""),
    status: mapStatus(payment.status?.code),
    reference: payment.reference || root?.data?.checkout?.reference || null,
    amount: typeof payment.total === "number" ? payment.total : null,
  };
}

export async function getMobbexCheckout(id: string): Promise<MobbexPaymentStatus | null> {
  try {
    const data = await mobbexFetch<{
      uid?: string;
      id?: string;
      reference?: string;
      total?: number;
      status?: { code?: string | number } | string | number;
      payment?: { status?: { code?: string | number }; total?: number; reference?: string; id?: string };
    }>(`/checkout/${encodeURIComponent(id)}`);
    const code = (data.payment?.status?.code ?? data.status) as unknown;
    return {
      id: String(data.payment?.id || data.uid || data.id || id),
      status: mapStatus(typeof code === "object" && code && "code" in (code as object) ? (code as { code: unknown }).code : code),
      reference: data.payment?.reference || data.reference || null,
      amount: data.payment?.total ?? data.total ?? null,
    };
  } catch {
    return null;
  }
}

export function signWebhook(orderId: string, secret: string) {
  return createHmac("sha256", secret).update(orderId).digest("hex").slice(0, 32);
}

export function verifyMobbexWebhook(req: Request, orderId: string) {
  const secret = process.env.MOBBEX_WEBHOOK_SECRET;
  if (!secret) return true;
  const url = new URL(req.url);
  const got = url.searchParams.get("s") || "";
  const expected = signWebhook(orderId, secret);
  try {
    const a = Buffer.from(got);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
