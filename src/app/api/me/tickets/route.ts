import { NextResponse } from "next/server";
import { currentUser } from "@/lib/server/auth";
import { ticketsByEmail } from "@/lib/server/store";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ tickets: [] });
  return NextResponse.json({ tickets: ticketsByEmail(user.email) });
}
