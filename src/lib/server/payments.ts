import { DEFAULT_PROVIDER, type ProviderId } from "@/lib/pricing";
import { createPreference, getPayment, mpEnabled } from "./mp";
import {
  createMobbexCheckout,
  getMobbexCheckout,
  mobbexEnabled,
  parseMobbexWebhook,
} from "./mobbex";
import { getMpTokens, getOrganizerProfile, getSellerAccessToken } from "./store";
import type { OrderRow } from "./types";

export type PaymentLookup = {
  id: string;
  status: "approved" | "rejected" | "pending";
  reference: string | null;
  amount: number | null;
};

export type PaymentProvider = {
  id: ProviderId;
  label: string;
  serverEnabled: () => boolean;
  organizerReady: (userId: string) => Promise<boolean>;
  createCheckout: (order: OrderRow, title: string, origin?: string) => Promise<{ id: string; url: string } | null>;
  getStatus: (order: OrderRow, paymentRef: string | null) => Promise<PaymentLookup | null>;
};

const mercadopago: PaymentProvider = {
  id: "mercadopago",
  label: "Mercado Pago",
  serverEnabled: () => mpEnabled(),
  async organizerReady(userId) {
    const tokens = await getMpTokens(userId);
    return Boolean(tokens?.accessToken);
  },
  async createCheckout(order, title) {
    const sellerAccessToken = order.organizerId ? await getSellerAccessToken(order.organizerId) : null;
    if (order.organizerId && !sellerAccessToken) {
      throw new Error("El organizador todavía no conectó su Mercado Pago. No se puede cobrar el split.");
    }
    const pref = await createPreference({
      orderId: order.id,
      title,
      total: order.total,
      fee: order.platformFee ?? 0,
      email: order.email,
      paymentMethod: order.paymentMethod,
      sellerAccessToken,
      expiresAt: order.expiresAt
        ? new Date(Date.parse(order.expiresAt) - 5 * 60 * 1000).toISOString()
        : undefined,
    });
    if (!pref) return null;
    return { id: pref.id, url: pref.initPoint };
  },
  async getStatus(order, paymentRef) {
    if (!paymentRef) return null;
    const seller = order.organizerId ? await getSellerAccessToken(order.organizerId).catch(() => null) : null;
    const payment = (await getPayment(paymentRef, seller)) ?? (seller ? await getPayment(paymentRef, null) : null);
    if (!payment) return null;
    const status =
      payment.status === "approved" ? "approved" : payment.status === "rejected" || payment.status === "cancelled" ? "rejected" : "pending";
    return {
      id: String(payment.id),
      status,
      reference: payment.external_reference ?? order.id,
      amount: typeof payment.transaction_amount === "number" ? payment.transaction_amount : null,
    };
  },
};

const mobbex: PaymentProvider = {
  id: "mobbex",
  label: "Mobbex",
  serverEnabled: () => mobbexEnabled(),
  async organizerReady() {
    return mobbexEnabled();
  },
  async createCheckout(order, title, origin) {
    const profile = order.organizerId ? await getOrganizerProfile(order.organizerId) : null;
    const checkout = await createMobbexCheckout({
      order,
      title,
      splitEntityUid: profile?.mobbexEntityUid ?? null,
      splitTaxId: profile?.cuit ?? null,
      origin,
    });
    return { id: checkout.id, url: checkout.url };
  },
  async getStatus(order, paymentRef) {
    if (paymentRef && paymentRef.startsWith("{")) {
      try {
        return parseMobbexWebhook(JSON.parse(paymentRef));
      } catch {
        /* fall through */
      }
    }
    const id = paymentRef || order.mpPreferenceId;
    if (!id) return null;
    return getMobbexCheckout(id);
  },
};

const PROVIDERS: Record<ProviderId, PaymentProvider> = { mercadopago, mobbex };

/**
 * Procesadores habilitados. Por ahora solo Mobbex; para reactivar Mercado Pago:
 *   PAYMENT_PROVIDERS=mobbex,mercadopago
 * El código de MP sigue intacto (y su webhook activo, por órdenes viejas).
 */
export function enabledProviderIds(): ProviderId[] {
  const raw = (process.env.PAYMENT_PROVIDERS || DEFAULT_PROVIDER).split(",").map((s) => s.trim());
  const ids = raw.filter((s): s is ProviderId => s === "mobbex" || s === "mercadopago");
  return ids.length ? Array.from(new Set(ids)) : [DEFAULT_PROVIDER];
}

export function providerEnabled(id: ProviderId) {
  return enabledProviderIds().includes(id);
}

/** Devuelve el procesador pedido si está habilitado; si no, el primero habilitado. */
export function getProvider(id: ProviderId | null | undefined): PaymentProvider {
  const enabled = enabledProviderIds();
  const pick = id && enabled.includes(id) ? id : enabled[0];
  return PROVIDERS[pick];
}

/** Para órdenes ya creadas: siempre su procesador real, aunque esté deshabilitado. */
export function providerOfOrder(id: ProviderId | null | undefined): PaymentProvider {
  return PROVIDERS[id ?? "mercadopago"] ?? PROVIDERS.mercadopago;
}

export function listProviders() {
  return enabledProviderIds().map((id) => ({
    id,
    label: PROVIDERS[id].label,
    serverEnabled: PROVIDERS[id].serverEnabled(),
  }));
}
