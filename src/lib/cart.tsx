"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { COMMISSION_PCT, PRICES, TICKET_TIERS, type TicketKey } from "./data";

export type Qty = Record<TicketKey, number>;

export type OrderItem = {
  key: TicketKey;
  name: string;
  qty: number;
  unitPrice: number;
};

export type Ticket = {
  id: string;
  name: string;
  key: TicketKey;
};

export type Order = {
  id: string;
  items: OrderItem[];
  subtotal: number;
  fee: number;
  total: number;
  tickets: Ticket[];
  buyerName: string;
};

const EMPTY_QTY: Qty = { early: 0, general: 0, vip: 0, parking: 0 };
const DEFAULT_QTY: Qty = { early: 0, general: 2, vip: 0, parking: 0 };
const CART_KEY = "tikeame-cart";
const ORDER_KEY = "tikeame-order";

function totalsFrom(qty: Qty) {
  const subtotal =
    qty.early * PRICES.early +
    qty.general * PRICES.general +
    qty.vip * PRICES.vip +
    qty.parking * PRICES.parking;
  const fee = subtotal * (COMMISSION_PCT / 100);
  const total = subtotal + fee;
  const itemCount = qty.early + qty.general + qty.vip + qty.parking;
  return { subtotal, fee, total, itemCount };
}

type CartContextValue = {
  qty: Qty;
  eventSlug: string;
  setEventSlug: (slug: string) => void;
  setQty: (next: Qty | ((prev: Qty) => Qty)) => void;
  inc: (key: TicketKey) => void;
  dec: (key: TicketKey) => void;
  subtotal: number;
  fee: number;
  total: number;
  itemCount: number;
  order: Order | null;
  setOrder: (order: Order | null) => void;
  placeOrder: (buyerName?: string) => Order;
};

const CartContext = createContext<CartContextValue | null>(null);

const SLUG_KEY = "tikeame-event-slug";

export function CartProvider({ children }: { children: ReactNode }) {
  const [qty, setQtyState] = useState<Qty>(DEFAULT_QTY);
  const [eventSlug, setEventSlugState] = useState("neon");
  const [order, setOrderState] = useState<Order | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const raw = sessionStorage.getItem(CART_KEY);
        if (raw) setQtyState(JSON.parse(raw) as Qty);
        const rawOrder = sessionStorage.getItem(ORDER_KEY);
        if (rawOrder) setOrderState(JSON.parse(rawOrder) as Order);
        const slug = sessionStorage.getItem(SLUG_KEY);
        if (slug) setEventSlugState(slug);
      } catch {
        /* ignore */
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const setQty = useCallback((next: Qty | ((prev: Qty) => Qty)) => {
    setQtyState((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      sessionStorage.setItem(CART_KEY, JSON.stringify(value));
      return value;
    });
  }, []);

  const inc = useCallback(
    (key: TicketKey) => setQty((q) => ({ ...q, [key]: q[key] + 1 })),
    [setQty],
  );
  const dec = useCallback(
    (key: TicketKey) => setQty((q) => ({ ...q, [key]: Math.max(0, q[key] - 1) })),
    [setQty],
  );

  const placeOrder = useCallback(
    (buyerName = "Guadalupe Fernández") => {
      const used = totalsFrom(qty).itemCount > 0 ? qty : DEFAULT_QTY;
      const { subtotal, fee, total } = totalsFrom(used);
      const id = "NEON-" + String(48000 + Math.floor(Math.random() * 900)).padStart(5, "0");
      const items: OrderItem[] = TICKET_TIERS.filter((t) => used[t.key] > 0).map((t) => ({
        key: t.key,
        name: t.name,
        qty: used[t.key],
        unitPrice: t.price,
      }));
      const tickets: Ticket[] = [];
      let n = 1;
      for (const item of items) {
        for (let i = 0; i < item.qty; i++) {
          tickets.push({ id: `${id}-${n}`, name: item.name, key: item.key });
          n += 1;
        }
      }
      const next: Order = { id, items, subtotal, fee, total, tickets, buyerName };
      setOrderState(next);
      sessionStorage.setItem(ORDER_KEY, JSON.stringify(next));
      return next;
    },
    [qty],
  );

  const setEventSlug = useCallback((slug: string) => {
    setEventSlugState(slug);
    sessionStorage.setItem(SLUG_KEY, slug);
  }, []);

  const setOrder = useCallback((next: Order | null) => {
    setOrderState(next);
    if (next) sessionStorage.setItem(ORDER_KEY, JSON.stringify(next));
  }, []);

  const totals = useMemo(() => totalsFrom(qty), [qty]);

  const value = useMemo(
    () => ({
      qty,
      eventSlug,
      setEventSlug,
      setQty,
      inc,
      dec,
      ...totals,
      order,
      setOrder,
      placeOrder,
    }),
    [qty, eventSlug, setEventSlug, setQty, inc, dec, totals, order, setOrder, placeOrder],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export { EMPTY_QTY, DEFAULT_QTY, totalsFrom };
