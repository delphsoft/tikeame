import { fulfillOrder } from "./fulfill";
import { getPayment } from "./mp";
import {
  getOrder,
  getSellerAccessToken,
  pendingOrdersBefore,
  putOrder,
  reserveTickets,
  type OrderRow,
} from "./store";

/** Minutos que una orden pending retiene cupo. La preference de MP vence 5 min antes. */
export const RESERVATION_MINUTES = 20;

function reserveItems(order: OrderRow) {
  return order.items.map((i) => ({ key: i.key, qty: i.qty }));
}

/** Devuelve el cupo de una orden (idempotente). */
export async function releaseOrder(order: OrderRow, reason: NonNullable<OrderRow["failReason"]>) {
  if (order.reserved) {
    await reserveTickets(order.eventSlug, reserveItems(order), -1).catch(() => null);
    order.reserved = false;
  }
  order.status = "failed";
  order.failReason = reason;
  await putOrder(order);
}

/** Libera órdenes pending vencidas. Se llama en cada checkout (lazy sweep, sin cron). */
export async function expireStalePending() {
  const stale = await pendingOrdersBefore(new Date().toISOString()).catch(() => []);
  for (const o of stale) {
    if (!o.reserved) continue;
    await releaseOrder(o, "expired");
  }
}

/** Busca el pago con el token correcto (vendedor si hay split). */
export async function fetchPaymentFor(paymentId: string, order: OrderRow | null) {
  const seller = order?.organizerId ? await getSellerAccessToken(order.organizerId).catch(() => null) : null;
  return (await getPayment(paymentId, seller)) ?? (seller ? await getPayment(paymentId, null) : null);
}

/**
 * Aplica el estado de un pago de MP a la orden. Idempotente: webhook y back_url
 * pueden llegar los dos, en cualquier orden.
 */
export async function settleOrder(orderId: string, paymentId: string) {
  const order = await getOrder(orderId);
  if (!order) return null;
  const payment = await fetchPaymentFor(paymentId, order);
  if (!payment || payment.external_reference !== order.id) return order;

  order.mpPaymentId = String(payment.id);

  if (payment.status === "approved") {
    if (order.status === "paid") return order;
    if (typeof payment.transaction_amount === "number" && payment.transaction_amount + 0.01 < order.total) {
      // Monto distinto al de la orden: no emitir.
      order.refundRequired = true;
      await releaseOrder(order, "mp_error");
      return order;
    }
    if (!order.reserved) {
      // Pago que llegó después de que venciera la reserva: intentar retomar cupo.
      const again = await reserveTickets(order.eventSlug, reserveItems(order), 1);
      if (!again.ok) {
        order.status = "failed";
        order.failReason = "no_stock_on_late_payment";
        order.refundRequired = true;
        await putOrder(order);
        return order;
      }
      order.reserved = true;
    }
    order.status = "paid";
    order.failReason = undefined;
    await putOrder(order);
    await fulfillOrder(order.id);
    return order;
  }

  if (payment.status === "rejected" || payment.status === "cancelled") {
    if (order.status !== "paid") await releaseOrder(order, "rejected");
    return order;
  }

  await putOrder(order);
  return order;
}
