import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/guard";
import { getProvider, providerEnabled } from "@/lib/server/payments";
import { setPaymentProvider } from "@/lib/server/store";

/** Elegir con qué procesador cobran los PRÓXIMOS eventos (los publicados no cambian). */
export async function POST(req: Request) {
  const { user, error } = await requireUser(["organizer", "admin"]);
  if (!user) return error ?? NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { provider?: string };
  const id = body.provider === "mobbex" ? "mobbex" : body.provider === "mercadopago" ? "mercadopago" : null;
  if (!id) return NextResponse.json({ error: "Procesador inválido" }, { status: 400 });
  if (!providerEnabled(id)) {
    return NextResponse.json({ error: "Ese procesador no está disponible por ahora." }, { status: 400 });
  }
  const provider = getProvider(id);
  if (!(await provider.organizerReady(user.id))) {
    return NextResponse.json({ error: `Primero conectá tu cuenta de ${provider.label}.` }, { status: 409 });
  }
  await setPaymentProvider(user.id, id);
  return NextResponse.json({ ok: true, provider: id });
}
