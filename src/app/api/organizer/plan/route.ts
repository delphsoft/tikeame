import { NextResponse } from "next/server";
import { currentUser } from "@/lib/server/auth";
import { MONTHLY_PLAN_ARS, platformPctFor } from "@/lib/pricing";
import { organizerMonthlyGmv } from "@/lib/server/store";

export async function GET() {
  const user = await currentUser();
  if (!user || (user.role !== "organizer" && user.role !== "admin")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const monthlyGmv = await organizerMonthlyGmv(user.id);
  const plan = user.profile?.feePlan ?? "percent";
  const { pct, tierLabel } = platformPctFor(monthlyGmv, plan);
  return NextResponse.json({
    plan,
    monthlyGmv,
    platformPct: pct,
    tierLabel,
    monthlyPrice: MONTHLY_PLAN_ARS,
  });
}
