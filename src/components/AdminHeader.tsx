import Link from "next/link";
import { Logo } from "./Logo";

export function AdminHeader({
  active = "resumen",
}: {
  active?: "resumen" | "eventos" | "productoras";
}) {
  const links = [
    { href: "/admin", label: "Resumen", key: "resumen" },
    { href: "/admin#eventos", label: "Eventos", key: "eventos" },
    { href: "/admin#productoras", label: "Productoras", key: "productoras" },
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
        <Link href="/organizador" className="text-[13px] font-extrabold text-cream">
          Vista organizador →
        </Link>
      </div>
    </header>
  );
}
