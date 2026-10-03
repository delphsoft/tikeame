export type PaymentMethod = "card" | "transfer";
export type FeePlan = "percent" | "monthly";
/** Quién absorbe el costo (MP + Tickeame). Lo elige el organizador por evento. */
export type FeePayer = "organizer" | "buyer";

/** Comisión de Mercado Pago estimada (con IVA), descontada del lado del vendedor. */
export const PROCESSOR_PCT: Record<PaymentMethod, number> = {
  card: 8.5,
  transfer: 2,
};

/** Comisión Tickeame escalonada por GMV mensual del organizador (mes calendario). */
export const VOLUME_TIERS = [
  { max: 2_000_000, pct: 5, label: "< $2M / mes" },
  { max: 10_000_000, pct: 3.5, label: "$2M – $10M / mes" },
  { max: Infinity, pct: 2, label: "> $10M / mes" },
] as const;

export const DEFAULT_FEE_PAYER: FeePayer = "organizer";
/** Las comisiones de Tickeame son con IVA incluido (lo que se muestra es lo que se cobra). */
export const COMMISSION_IVA_INCLUDED = true;
/** Descuento por transferencia que el organizador puede ofrecer al comprador (tope). */
export const MAX_TRANSFER_DISCOUNT_PCT = 10;
export const MONTHLY_PLAN_ARS = 45_000;
export const MONTHLY_PLAN_EVENTS = 10;

export type FeeQuote = {
  method: PaymentMethod;
  plan: FeePlan;
  feePayer: FeePayer;
  monthlyGmv: number;
  /** Precio de lista de las entradas. */
  listPrice: number;
  /** Descuento por transferencia aplicado (organizador lo ofrece). */
  discount: number;
  /** Precio de las entradas después del descuento. */
  subtotal: number;
  /** Lo que paga el comprador. */
  total: number;
  /** Cargo de servicio al comprador (0 si paga el organizador). */
  fee: number;
  /** fee como % del subtotal. */
  totalPct: number;
  processorPct: number;
  /** Comisión Tickeame, % del precio de la entrada. */
  platformPct: number;
  /** Lo que retiene MP (estimado). */
  processorFee: number;
  /** Comisión Tickeame (marketplace_fee). */
  platformFee: number;
  /** Lo que le llega al organizador. */
  organizerNet: number;
  /** Costo para el organizador, % del precio. */
  organizerCostPct: number;
  tierLabel: string;
};

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function platformPctFor(monthlyGmv: number, plan: FeePlan): { pct: number; tierLabel: string } {
  if (plan === "monthly") return { pct: 0, tierLabel: "Plan mensual" };
  const tier = VOLUME_TIERS.find((t) => monthlyGmv < t.max) ?? VOLUME_TIERS[VOLUME_TIERS.length - 1];
  return { pct: tier.pct, tierLabel: tier.label };
}

/**
 * Comisión Tickeame = platformPct del precio de la entrada (siempre el mismo $).
 *
 * feePayer "organizer": el comprador paga el precio publicado.
 *   organizador recibe = precio − MP − Tickeame
 * feePayer "buyer": el comprador paga precio + cargo; el organizador recibe el 100%.
 *   total = (precio + Tickeame) / (1 − MP%)   ← MP cobra sobre el total
 *
 * `platformPctOverride`: % congelado en el evento al publicarlo.
 */
export function quoteFees(
  subtotal: number,
  opts: {
    monthlyGmv?: number;
    plan?: FeePlan;
    method?: PaymentMethod;
    platformPctOverride?: number | null;
    feePayer?: FeePayer;
    /** % de descuento al comprador si paga por transferencia (lo pone el organizador). */
    transferDiscountPct?: number | null;
  } = {},
): FeeQuote {
  const method = opts.method ?? "card";
  const plan = opts.plan ?? "percent";
  const feePayer = opts.feePayer ?? DEFAULT_FEE_PAYER;
  const monthlyGmv = opts.monthlyGmv ?? 0;
  const processorPct = PROCESSOR_PCT[method];
  const base = platformPctFor(monthlyGmv, plan);
  const frozen = plan === "percent" && typeof opts.platformPctOverride === "number";
  const platformPct = frozen ? (opts.platformPctOverride as number) : base.pct;
  const tierLabel = frozen ? `Comisión Tickeame ${formatPct(platformPct)} (fijada al publicar)` : base.tierLabel;

  const listPrice = round2(Math.max(0, subtotal));
  const discPct =
    method === "transfer" ? Math.min(MAX_TRANSFER_DISCOUNT_PCT, Math.max(0, opts.transferDiscountPct ?? 0)) : 0;
  const discount = round2(listPrice * (discPct / 100));
  const price = round2(listPrice - discount);
  const platformFee = round2(price * (platformPct / 100));
  const total =
    feePayer === "buyer" && price > 0 ? round2((price + platformFee) / (1 - processorPct / 100)) : price;
  const processorFee = round2(total * (processorPct / 100));
  const fee = round2(total - price);
  const organizerNet = round2(total - processorFee - platformFee);
  return {
    method,
    plan,
    feePayer,
    monthlyGmv,
    listPrice,
    discount,
    subtotal: price,
    total,
    fee,
    totalPct: price ? round2((fee / price) * 100) : 0,
    processorPct,
    platformPct,
    processorFee,
    platformFee,
    organizerNet,
    organizerCostPct: price ? round2(((price - organizerNet) / price) * 100) : 0,
    tierLabel,
  };
}

export function formatPct(n: number) {
  return `${n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)}%`;
}
