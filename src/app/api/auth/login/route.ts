import { NextResponse } from "next/server";
import { authenticate, setSession } from "@/lib/server/auth";

export async function POST(req: Request) {
  const body = (await req.json()) as { email?: string; password?: string };
  const user = authenticate(body.email || "", body.password || "");
  if (!user) return NextResponse.json({ error: "Email o contraseña incorrectos" }, { status: 401 });
  await setSession(user);
  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
