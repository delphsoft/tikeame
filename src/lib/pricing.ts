export type PaymentMethod = "card" | "transfer";
export type FeePlan = "percent" | "monthly";

export const PROCESSOR_PCT: Record<PaymentMethod, number> = {
  card: 8.5,
  transfer: 2,
};

export const VOLUME_TIERS = [
  { max: 2_000_000, pct: 15, label: "< $2M / mes" },
  { max: 10_000_000, pct: 12, label: "$2M – $10M / mes" },
  { max: Infinity, pct: 9, label: "> $10M / mes" },
] as const;

export const FEE_FLOOR_PCT = 4;
export const MONTHLY_PLAN_ARS = 45_000;
export const MONTHLY_PLAN_EVENTS = 10;

export type FeeQuote = {
  method: PaymentMethod;
  plan: FeePlan;
  monthlyGmv: number;
  processorPct: number;
  platformPct: number;
  totalPct: number;
  processorFee: number;
  platformFee: number;
  fee: number;
  total: number;
  subtotal: number;
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

export function quoteFees(
  subtotal: number,
  opts: { monthlyGmv?: number; plan?: FeePlan; method?: PaymentMethod } = {},
): FeeQuote {
  const method = opts.method ?? "card";
  const plan = opts.plan ?? "percent";
  const monthlyGmv = opts.monthlyGmv ?? 0;
  const processorPct = PROCESSOR_PCT[method];
  const { pct: platformPct, tierLabel } = platformPctFor(monthlyGmv, plan);
  const totalPct = Math.max(FEE_FLOOR_PCT, processorPct + platformPct);
  const fee = round2(subtotal * (totalPct / 100));
  const processorFee = round2(subtotal * (processorPct / 100));
  const platformFee = round2(fee - processorFee);
  return {
    method,
    plan,
    monthlyGmv,
    processorPct,
    platformPct,
    totalPct,
    processorFee,
    platformFee,
    fee,
    total: round2(subtotal + fee),
    subtotal,
    tierLabel,
  };
}

export function formatPct(n: number) {
  return `${n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)}%`;
}
