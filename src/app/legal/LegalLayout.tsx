import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import type { ReactNode } from "react";

export function LegalLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader variant="plain" />
      <article className="mx-auto max-w-[640px] px-5 py-8">
        <Link href="/" className="text-xs font-bold text-muted">
          ← Inicio
        </Link>
        <h1 className="mt-3 font-display text-3xl uppercase">{title}</h1>
        <div className="mt-6 flex flex-col gap-4 text-[15px] leading-relaxed text-plum">{children}</div>
      </article>
    </div>
  );
}
