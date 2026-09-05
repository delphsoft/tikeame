"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { useSession } from "@/lib/session";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useSession();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<"buyer" | "organizer" | "admin">("buyer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isRegister = mode === "register";

  async function go() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(isRegister ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: email || "hola@tikeame.com.ar",
          password: password || "tikeame",
          role,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        user?: { name: string; email: string; role: "buyer" | "organizer" | "admin" };
      };
      if (!res.ok || !data.user) {
        setError(data.error || "No se pudo entrar");
        return;
      }
      login(data.user);
      if (data.user.role === "admin") router.push("/admin");
      else if (data.user.role === "organizer") router.push("/organizador");
      else router.push("/entradas");
    } catch {
      setError("Error de red");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-6">
      <div className="w-full max-w-[400px]">
        <div className="mb-7 text-center">
          <Logo href="/" size="lg" />
        </div>
        <div className="rounded border-2 border-ink bg-white px-7 py-[30px] shadow-[0_24px_48px_rgba(43,29,74,0.12)]">
          <div className="mb-6 flex gap-1 rounded-full bg-cream p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className="flex-1 rounded-full py-2 text-[13px] font-extrabold"
              style={{
                background: isRegister ? "transparent" : "#2B1D4A",
                color: isRegister ? "#6B5D8A" : "#F4EEDC",
              }}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className="flex-1 rounded-full py-2 text-[13px] font-extrabold"
              style={{
                background: isRegister ? "#2B1D4A" : "transparent",
                color: isRegister ? "#F4EEDC" : "#6B5D8A",
              }}
            >
              Crear cuenta
            </button>
          </div>

          {isRegister && (
            <label className="mb-3.5 block">
              <span className="text-[11px] font-extrabold uppercase text-muted">Nombre</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                className="mt-1.5 w-full rounded border-2 border-border px-3.5 py-[11px] text-sm text-ink placeholder:text-muted2"
              />
            </label>
          )}
          <label className="mb-3.5 block">
            <span className="text-[11px] font-extrabold uppercase text-muted">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@mail.com"
              className="mt-1.5 w-full rounded border-2 border-border px-3.5 py-[11px] text-sm text-ink placeholder:text-muted2"
            />
          </label>
          <label className="mb-1.5 block">
            <span className="text-[11px] font-extrabold uppercase text-muted">Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="tikeame"
              className="mt-1.5 w-full rounded border-2 border-border px-3.5 py-[11px] text-sm text-ink placeholder:text-muted2"
            />
          </label>

          <div className="mt-3 mb-1 text-[11px] font-extrabold uppercase text-muted">Entrar como</div>
          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                ["buyer", "Comprador"],
                ["organizer", "Organizador"],
                ["admin", "Super admin"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setRole(id)}
                className={`rounded py-2 text-[11px] font-extrabold ${
                  role === id ? "bg-ink text-cream" : "bg-cream text-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={go}
            disabled={busy}
            className="mt-[18px] w-full rounded bg-coral py-3.5 text-sm font-extrabold text-white disabled:opacity-50"
          >
            {busy ? "…" : isRegister ? "Crear cuenta" : "Ingresar"}
          </button>
          {error && <p className="mt-3 text-center text-sm font-bold text-coral">{error}</p>}
          <p className="mt-4 text-center text-xs text-muted">
            Demo: hola@tikeame.com.ar / tikeame — o registrate. Cookie httpOnly en el servidor.
          </p>
        </div>
        <div className="mt-5 text-center">
          <Link href="/eventos/neon" className="text-[13px] font-bold text-coral">
            ← Volver al evento
          </Link>
        </div>
      </div>
    </div>
  );
}
