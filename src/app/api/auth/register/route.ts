import { NextResponse } from "next/server";
import { validCuit } from "@/lib/cuit";
import type { FeePlan } from "@/lib/pricing";
import { createUser, setSession } from "@/lib/server/auth";
import { ConfigError } from "@/lib/server/env";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { getSessionSecret } from "@/lib/server/session-token";

export async function POST(req: Request) {
  if (!rateLimit(`register:${clientIp(req)}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Demasiados intentos. Probá en un rato." }, { status: 429 });
  }
  if (!getSessionSecret()) {
    return NextResponse.json({ error: "Falta SESSION_SECRET en el servidor." }, { status: 503 });
  }

  const body = (await req.json()) as {
    name?: string;
    email?: string;
    password?: string;
    role?: "buyer" | "organizer" | "admin";
    cuit?: string;
    razonSocial?: string;
    condicionIva?: string;
    domicilioFiscal?: string;
    feePlan?: FeePlan;
  };
  const email = (body.email || "").trim().toLowerCase();
  if (!email || !email.includes("@") || !body.password || body.password.length < 8) {
    return NextResponse.json({ error: "Email válido y contraseña de al menos 8 caracteres" }, { status: 400 });
  }

  const bootstrap = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  let role: "buyer" | "organizer" | "admin" = body.role === "organizer" ? "organizer" : "buyer";
  if (bootstrap && email === bootstrap) role = "admin";

  let profile = null;
  if (role === "organizer") {
    const cuit = body.cuit || "";
    if (!validCuit(cuit)) {
      return NextResponse.json({ error: "CUIT inválido. Lo necesitamos para el alta fiscal." }, { status: 400 });
    }
    if (!body.razonSocial?.trim() || !body.condicionIva || !body.domicilioFiscal?.trim()) {
      return NextResponse.json(
        { error: "Completá razón social, condición IVA y domicilio fiscal." },
        { status: 400 },
      );
    }
    profile = {
      cuit: cuit.replace(/\D/g, ""),
      razonSocial: body.razonSocial.trim(),
      condicionIva: body.condicionIva,
      domicilioFiscal: body.domicilioFiscal.trim(),
      feePlan: body.feePlan === "monthly" ? "monthly" as const : "percent" as const,
    };
  }

  try {
    const user = await createUser({
      name: body.name?.trim() || email.split("@")[0],
      email,
      password: body.password,
      role,
      profile,
    });
    await setSession(user);
    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    const status = err instanceof ConfigError ? 503 : 400;
    return NextResponse.json({ error: err instanceof Error ? err.message : "No se pudo registrar" }, { status });
  }
}
