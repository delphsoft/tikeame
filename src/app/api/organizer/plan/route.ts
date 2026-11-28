import { NextResponse } from "next/server";
import { currentUser } from "@/lib/server/auth";
import { FREE_TICKETS, MONTHLY_PLAN_ARS, platformPctFor } from "@/lib/pricing";
import { organizerMonthlyGmv, organizerPaidTickets } from "@/lib/server/store";

export async function GET() {
  const user = await currentUser();
  if (!user || (user.role !== "organizer" && user.role !== "admin")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const monthlyGmv = await organizerMonthlyGmv(user.id);
  const ticketsSold = await organizerPaidTickets(user.id);
  const plan = user.profile?.feePlan ?? "percent";
  const { pct, tierLabel } = platformPctFor(monthlyGmv, plan, ticketsSold);
  return NextResponse.json({
    plan,
    monthlyGmv,
    ticketsSold,
    freeTickets: FREE_TICKETS,
    platformPct: pct,
    tierLabel,
    monthlyPrice: MONTHLY_PLAN_ARS,
  });
}
