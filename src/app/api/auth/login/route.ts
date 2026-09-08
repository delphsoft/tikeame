import { NextResponse } from "next/server";
import { authenticate, setSession } from "@/lib/server/auth";
import { ConfigError } from "@/lib/server/env";
import { clientIp, rateLimit } from "@/lib/server/rate-limit";
import { getSessionSecret } from "@/lib/server/session-token";

export async function POST(req: Request) {
  if (!rateLimit(`login:${clientIp(req)}`, 8, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Demasiados intentos. Probá en un rato." }, { status: 429 });
  }
  if (!getSessionSecret()) {
    return NextResponse.json({ error: "Falta SESSION_SECRET en el servidor." }, { status: 503 });
  }

  const body = (await req.json()) as { email?: string; password?: string };
  const email = (body.email || "").trim();
  const password = body.password || "";
  if (!email || !password) {
    return NextResponse.json({ error: "Email y contraseña requeridos" }, { status: 400 });
  }

  try {
    const user = await authenticate(email, password);
    if (!user) return NextResponse.json({ error: "Email o contraseña incorrectos" }, { status: 401 });
    await setSession(user);
    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    const message = err instanceof ConfigError ? err.message : "No se pudo entrar";
    return NextResponse.json({ error: message }, { status: err instanceof ConfigError ? 503 : 500 });
  }
}
