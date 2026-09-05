import Link from "next/link";
import { Logo } from "./Logo";

const links = [
  { href: "/organizador", label: "Resumen" },
  { href: "/organizador/checkin", label: "Check-in" },
  { href: "/organizador/rrpp", label: "RRPP y Referidos" },
];

export function OrganizerHeader({ active }: { active: "resumen" | "checkin" | "rrpp" }) {
  return (
    <header className="bg-ink px-5 py-4 md:px-10">
      <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-5">
          <Logo href="/" light size="sm" />
          <span className="text-[13px] font-bold text-muted2">Panel organizador</span>
          <nav className="flex flex-wrap gap-1">
            {links.map((l) => {
              const isActive =
                (active === "resumen" && l.href === "/organizador") ||
                (active === "checkin" && l.href.includes("checkin")) ||
                (active === "rrpp" && l.href.includes("rrpp"));
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
        <Link href="/eventos/neon" className="text-[13px] font-extrabold text-cream">
          Ver página del evento →
        </Link>
      </div>
    </header>
  );
}
