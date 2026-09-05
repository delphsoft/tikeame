import Link from "next/link";
import { Logo } from "./Logo";

const links = [
  { href: "/organizador", label: "Eventos", key: "eventos" },
  { href: "/organizador/nuevo", label: "Nuevo evento", key: "nuevo" },
  { href: "/organizador/checkin", label: "Check-in", key: "checkin" },
  { href: "/organizador/rrpp", label: "RRPP", key: "rrpp" },
] as const;

export function OrganizerHeader({
  active,
}: {
  active: "eventos" | "nuevo" | "checkin" | "rrpp" | "detalle";
}) {
  return (
    <header className="bg-ink px-5 py-4 md:px-10">
      <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-5">
          <Logo href="/" light size="sm" />
          <span className="text-[13px] font-bold text-muted2">Panel organizador</span>
          <nav className="flex flex-wrap gap-1">
            {links.map((l) => {
              const isActive = active === l.key || (active === "detalle" && l.key === "eventos");
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${
                    isActive ? "bg-coral text-white" : "text-muted2 hover:text-cream"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <Link href="/admin" className="text-[13px] font-extrabold text-muted2 hover:text-cream">
          Super admin →
        </Link>
      </div>
    </header>
  );
}
