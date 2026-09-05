import { NextResponse } from "next/server";
import { createUser, setSession } from "@/lib/server/auth";

export async function POST(req: Request) {
  const body = (await req.json()) as {
    name?: string;
    email?: string;
    password?: string;
    role?: "buyer" | "organizer" | "admin";
  };
  if (!body.email || !body.password || body.password.length < 4) {
    return NextResponse.json({ error: "Email y contraseña de al menos 4 caracteres" }, { status: 400 });
  }
  try {
    const user = createUser({
      name: body.name?.trim() || body.email.split("@")[0],
      email: body.email,
      password: body.password,
      role: body.role === "organizer" ? "organizer" : "buyer",
    });
    await setSession(user);
    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "No se pudo registrar" }, { status: 400 });
  }
}
