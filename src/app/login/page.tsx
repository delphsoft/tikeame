"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Logo } from "@/components/Logo";
import { useSession } from "@/lib/session";

type Audience = "buyer" | "organizer";

function destination(role: string, next: string | null) {
  if (next && next.startsWith("/")) return next;
  if (role === "admin") return "/admin";
  if (role === "organizer") return "/organizador";
  return "/entradas";
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useSession();
  const preset = params.get("as");
  const next = params.get("next");
  const initialAudience: Audience | null =
    preset === "organizer" ? "organizer" : preset === "buyer" || preset === "admin" ? "buyer" : null;

  const [audience, setAudience] = useState<Audience | null>(initialAudience);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isRegister = mode === "register";
  const isOrganizer = audience === "organizer";

  const copy = useMemo(() => {
    if (isOrganizer) {
      return {
        kicker: "Panel organizador",
        title: isRegister ? "Creá tu cuenta de productora" : "Entrá a tu panel",
        hint: "Vendé, cobrá en tu Mercado Pago y hacé check-in.",
      };
    }
    return {
      kicker: "Comprador",
      title: isRegister ? "Creá tu cuenta" : "Entrá a Tikeame",
      hint: "Tus entradas y QR, en un solo lugar.",
    };
  }, [isOrganizer, isRegister]);

  async function go() {
    if (!audience) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(isRegister ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role: audience,
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
      router.push(destination(data.user.role, next));
    } catch {
      setError("Error de red");
    } finally {
      setBusy(false);
    }
  }

  if (!audience) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream p-6">
        <div className="w-full max-w-[520px]">
          <div className="mb-7 text-center">
            <Logo href="/" size="lg" />
          </div>
          <h1 className="text-center font-display text-3xl uppercase">¿Cómo querés entrar?</h1>
          <p className="mt-2 text-center text-sm text-muted">Elegí tu tipo de cuenta.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Link
              href="/login?as=buyer"
              onClick={(e) => {
                e.preventDefault();
                setAudience("buyer");
              }}
              className="rounded-md border-2 border-ink bg-white p-5 text-left hover:border-coral"
            >
              <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-coral">Cliente</div>
              <div className="mt-2 font-display text-2xl uppercase">Voy al evento</div>
              <p className="mt-2 text-[13px] text-muted">Comprar entradas, ver QR y mis tikos.</p>
            </Link>
            <Link
              href="/login?as=organizer"
              onClick={(e) => {
                e.preventDefault();
                setAudience("organizer");
              }}
              className="rounded-md border-2 border-ink bg-ink p-5 text-left text-cream hover:border-coral"
            >
              <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-coral">Productora</div>
              <div className="mt-2 font-display text-2xl uppercase">Soy organizador</div>
              <p className="mt-2 text-[13px] text-muted2">Crear eventos, cobrar y check-in en puerta.</p>
            </Link>
          </div>
          <p className="mt-6 text-center text-xs text-muted">
            Super admin entra con su email desde cualquiera de las dos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-6">
      <div className="w-full max-w-[400px]">
        <div className="mb-7 text-center">
          <Logo href="/" size="lg" />
        </div>
        <div className="rounded border-2 border-ink bg-white px-7 py-[30px] shadow-[0_24px_48px_rgba(43,29,74,0.12)]">
          <button
            type="button"
            onClick={() => setAudience(null)}
            className="mb-3 text-[11px] font-extrabold uppercase text-coral"
          >
            ← Cambiar tipo de cuenta
          </button>
          <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-coral">{copy.kicker}</div>
          <h1 className="mt-1 font-display text-2xl uppercase">{copy.title}</h1>
          <p className="mt-1 mb-5 text-[13px] text-muted">{copy.hint}</p>

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
                placeholder={isOrganizer ? "Tu productora" : "Tu nombre"}
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
              placeholder="mínimo 8 caracteres"
              className="mt-1.5 w-full rounded border-2 border-border px-3.5 py-[11px] text-sm text-ink placeholder:text-muted2"
            />
          </label>

          <button
            type="button"
            onClick={go}
            disabled={busy}
            className="mt-[18px] w-full rounded bg-coral py-3.5 text-sm font-extrabold text-white disabled:opacity-50"
          >
            {busy ? "…" : isRegister ? "Crear cuenta" : "Ingresar"}
          </button>
          {error && <p className="mt-3 text-center text-sm font-bold text-coral">{error}</p>}
        </div>
        <div className="mt-5 text-center">
          <Link href={isOrganizer ? "/organizadores" : "/"} className="text-[13px] font-bold text-coral">
            {isOrganizer ? "← Volver a organizadores" : "← Volver a eventos"}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-cream text-sm font-bold text-muted">
          Cargando…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
