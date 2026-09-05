"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const isRegister = mode === "register";

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
                placeholder="Tu nombre"
                className="mt-1.5 w-full rounded border-2 border-border px-3.5 py-[11px] text-sm text-ink placeholder:text-muted2"
              />
            </label>
          )}
          <label className="mb-3.5 block">
            <span className="text-[11px] font-extrabold uppercase text-muted">Email</span>
            <input
              type="email"
              placeholder="nombre@mail.com"
              className="mt-1.5 w-full rounded border-2 border-border px-3.5 py-[11px] text-sm text-ink placeholder:text-muted2"
            />
          </label>
          <label className="mb-1.5 block">
            <span className="text-[11px] font-extrabold uppercase text-muted">Contraseña</span>
            <input
              type="password"
              placeholder="••••••••"
              className="mt-1.5 w-full rounded border-2 border-border px-3.5 py-[11px] text-sm text-ink placeholder:text-muted2"
            />
          </label>

          <button
            type="button"
            onClick={() => router.push("/eventos/neon")}
            className="mt-[18px] w-full rounded bg-coral py-3.5 text-sm font-extrabold text-white"
          >
            {isRegister ? "Crear cuenta" : "Ingresar"}
          </button>
          <p className="mt-4 text-center text-xs text-muted">
            Prototipo — no valida credenciales reales.
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
