"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { useSession } from "@/lib/session";

export default function CuentaPage() {
  const { user, logout } = useSession();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader variant="plain" />
      <div className="mx-auto max-w-[480px] px-5 py-6">
        <h1 className="font-display text-3xl uppercase">Tu cuenta</h1>

        {!user && (
          <div className="mt-6 rounded-2xl border-2 border-ink bg-white p-6">
            <p className="text-sm text-muted">Entrá para ver entradas y preferencias.</p>
            <Link href="/login" className="mt-4 inline-block w-full rounded-full bg-coral py-3 text-center text-sm font-extrabold text-white">
              Iniciar sesión
            </Link>
          </div>
        )}

        {user && (
          <div className="mt-6 rounded-2xl border-2 border-ink bg-white p-5">
            <div className="font-extrabold">{user.name}</div>
            <div className="mt-1 text-sm text-muted">{user.email}</div>
            <div className="mt-2 text-[11px] font-extrabold uppercase text-coral">{user.role}</div>
            <button
              type="button"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                logout();
                router.push("/");
              }}
              className="mt-4 text-sm font-bold text-coral"
            >
              Cerrar sesión
            </button>
          </div>
        )}

        <div className="mt-6 flex flex-col overflow-hidden rounded-2xl border-2 border-ink bg-white">
          <Link href="/entradas" className="border-b border-border px-5 py-4 text-sm font-extrabold">
            Mis entradas
          </Link>
          <Link href="/organizadores" className="border-b border-border px-5 py-4 text-sm font-extrabold">
            Soy organizador
          </Link>
          <Link href="/legal/terminos" className="border-b border-border px-5 py-4 text-sm font-extrabold">
            Términos
          </Link>
          <Link href="/legal/privacidad" className="border-b border-border px-5 py-4 text-sm font-extrabold">
            Privacidad
          </Link>
          <Link href="/legal/arrepentimiento" className="px-5 py-4 text-sm font-extrabold">
            Derecho de arrepentimiento
          </Link>
        </div>
      </div>
    </div>
  );
}
