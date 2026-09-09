"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { useSession } from "@/lib/session";

export function AdminHeader({
  active = "resumen",
}: {
  active?: "resumen" | "metricas" | "usuarios" | "ordenes" | "tickets";
}) {
  const router = useRouter();
  const { logout } = useSession();
  const links = [
    { href: "/admin", label: "Resumen", key: "resumen" },
    { href: "/admin#metricas", label: "Métricas", key: "metricas" },
    { href: "/admin#usuarios", label: "Usuarios", key: "usuarios" },
    { href: "/admin#ordenes", label: "Órdenes", key: "ordenes" },
    { href: "/admin#tickets", label: "Tickets", key: "tickets" },
  ] as const;

  return (
    <header className="bg-ink px-5 py-4 md:px-10">
      <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-5">
          <Logo href="/" light size="sm" />
          <span className="rounded-full bg-coral px-2.5 py-1 text-[11px] font-extrabold text-white">
            Super admin
          </span>
          <nav className="flex flex-wrap gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${
                  active === l.key ? "bg-cream text-ink" : "text-muted2 hover:text-cream"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/organizador" className="text-[13px] font-extrabold text-cream">
            Vista organizador →
          </Link>
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              logout();
              router.push("/login");
            }}
            className="text-[13px] font-extrabold text-muted2 hover:text-cream"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
