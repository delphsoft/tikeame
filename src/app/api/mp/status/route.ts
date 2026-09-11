import { NextResponse } from "next/server";
import { currentUser } from "@/lib/server/auth";
import { mpOAuthConfigured } from "@/lib/server/mp";
import { getOrganizerProfile, organizerMonthlyGmv } from "@/lib/server/store";
import { MONTHLY_PLAN_ARS, platformPctFor } from "@/lib/pricing";

export async function GET() {
  const user = await currentUser();
  if (!user || (user.role !== "organizer" && user.role !== "admin")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const profile = await getOrganizerProfile(user.id);
  const monthlyGmv = await organizerMonthlyGmv(user.id);
  const plan = profile?.feePlan ?? "percent";
  const { pct, tierLabel } = platformPctFor(monthlyGmv, plan);
  return NextResponse.json({
    oauthConfigured: mpOAuthConfigured(),
    connected: Boolean(profile?.mpConnected),
    mpUserId: profile?.mpUserId ?? null,
    plan,
    monthlyGmv,
    platformPct: pct,
    tierLabel,
    monthlyPrice: MONTHLY_PLAN_ARS,
    cuit: profile?.cuit ?? null,
    razonSocial: profile?.razonSocial ?? null,
  });
}
