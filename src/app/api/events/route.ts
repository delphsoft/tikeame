import { NextResponse } from "next/server";
import { currentUser } from "@/lib/server/auth";
import { listEvents, putEvent, type EventRecord } from "@/lib/server/store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mine = url.searchParams.get("mine") === "1";
  const user = await currentUser();
  try {
    if (mine) {
      if (!user || (user.role !== "organizer" && user.role !== "admin")) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
      const events = await listEvents({ organizerId: user.role === "admin" ? undefined : user.id });
      return NextResponse.json({ events });
    }
    const events = await listEvents({ status: "on_sale" });
    return NextResponse.json({ events });
  } catch {
    return NextResponse.json({ events: [] });
  }
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || (user.role !== "organizer" && user.role !== "admin")) {
    return NextResponse.json({ error: "Tenés que entrar como organizador." }, { status: 401 });
  }
  const event = (await req.json()) as EventRecord;
  if (!event?.slug || !event.title) {
    return NextResponse.json({ error: "Falta nombre del evento" }, { status: 400 });
  }
  event.organizerId = user.id;
  event.organizerName = user.profile?.razonSocial || user.name;
  await putEvent(event);
  return NextResponse.json({ ok: true, slug: event.slug });
}
