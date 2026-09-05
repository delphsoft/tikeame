"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Inicio", match: (p: string) => p === "/" },
  { href: "/#eventos", label: "Eventos", match: (p: string) => p.startsWith("/eventos") },
  { href: "/entradas", label: "Entradas", match: (p: string) => p.startsWith("/entradas") || p.startsWith("/ticket") || p.startsWith("/confirmacion") },
  { href: "/cuenta", label: "Vos", match: (p: string) => p.startsWith("/cuenta") || p.startsWith("/login") },
];

const hidden = ["/organizador", "/admin", "/organizadores", "/fondos", "/rrpp", "/legal"];

export function AppTabs() {
  const path = usePathname() || "/";
  if (hidden.some((h) => path === h || path.startsWith(h + "/"))) return null;

  return (
    <nav
      className="app-tabs md:hidden"
      style={{ paddingBottom: "var(--safe-bottom)" }}
      aria-label="Navegación principal"
    >
      {tabs.map((t) => {
        const on = t.match(path);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-extrabold ${
              on ? "text-coral" : "text-muted"
            }`}
          >
            <span className={`h-1 w-6 rounded-full ${on ? "bg-coral" : "bg-transparent"}`} />
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
