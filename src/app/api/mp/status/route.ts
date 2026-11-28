import { NextResponse } from "next/server";
import { currentUser } from "@/lib/server/auth";
import { mobbexEnabled, mobbexTestMode } from "@/lib/server/mobbex";
import { mpOAuthConfigured } from "@/lib/server/mp";
import { enabledProviderIds, getProvider } from "@/lib/server/payments";
import { getOrganizerProfile, organizerMonthlyGmv, organizerPaidTickets } from "@/lib/server/store";
import { FREE_TICKETS, MONTHLY_PLAN_ARS, platformPctFor } from "@/lib/pricing";

export async function GET() {
  const user = await currentUser();
  if (!user || (user.role !== "organizer" && user.role !== "admin")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const profile = await getOrganizerProfile(user.id);
  const monthlyGmv = await organizerMonthlyGmv(user.id);
  const ticketsSold = await organizerPaidTickets(user.id);
  const plan = profile?.feePlan ?? "percent";
  const { pct, tierLabel } = platformPctFor(monthlyGmv, plan, ticketsSold);
  return NextResponse.json({
    oauthConfigured: mpOAuthConfigured(),
    connected: Boolean(profile?.mpConnected),
    paymentProvider: getProvider(profile?.paymentProvider).id,
    enabledProviders: enabledProviderIds(),
    mobbex: {
      serverEnabled: mobbexEnabled(),
      testMode: mobbexTestMode(),
      connected: Boolean(profile?.mobbexConnected || mobbexEnabled()),
      entityName: profile?.mobbexEntityName ?? null,
    },
    mpUserId: profile?.mpUserId ?? null,
    plan,
    monthlyGmv,
    ticketsSold,
    freeTickets: FREE_TICKETS,
    platformPct: pct,
    tierLabel,
    monthlyPrice: MONTHLY_PLAN_ARS,
    cuit: profile?.cuit ?? null,
    razonSocial: profile?.razonSocial ?? null,
  });
}
