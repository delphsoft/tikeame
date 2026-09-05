"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "./Logo";

type SiteHeaderProps = {
  variant?: "landing" | "event" | "plain";
};

export function SiteHeader({ variant = "landing" }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const dark = variant === "event";

  return (
    <header
      className={`sticky top-0 z-50 border-b ${
        dark
          ? "border-transparent bg-ink/94 text-cream backdrop-blur-md"
          : "border-border bg-cream/94 text-ink backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-5 py-4 md:px-12">
        <Logo href="/" light={dark} />
        <nav className="hidden items-center gap-8 md:flex">
          {variant === "landing" && (
            <>
              <a href="#como-funciona" className="text-sm font-bold text-ink">
                Cómo funciona
              </a>
              <a href="#fidelizacion" className="text-sm font-bold text-ink">
                RRPP y fidelización
              </a>
              <Link href="/organizador" className="text-sm font-bold text-ink">
                Organizador
              </Link>
              <Link
                href="/organizador/nuevo"
                className="rounded bg-coral px-5 py-[11px] text-sm font-extrabold text-white"
              >
                Sumar mi evento
              </Link>
            </>
          )}
          {variant === "event" && (
            <>
              <Link href="/organizador" className="text-xs font-bold text-muted2">
                Organizador
              </Link>
              <Link href="/login" className="text-xs font-bold text-cream">
                Iniciar sesión
              </Link>
              <a
                href="#tickets"
                className="rounded bg-coral px-5 py-2.5 text-[13px] font-extrabold text-white"
              >
                Comprar entradas
              </a>
            </>
          )}
          {variant === "plain" && (
            <Link href="/eventos/neon" className="text-sm font-bold">
              Ver evento
            </Link>
          )}
        </nav>
        <button
          type="button"
          className={`md:hidden text-sm font-extrabold ${dark ? "text-cream" : "text-ink"}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Menú"
        >
          {open ? "Cerrar" : "Menú"}
        </button>
      </div>
      {open && (
        <div className={`flex flex-col gap-3 px-5 pb-4 md:hidden ${dark ? "text-cream" : "text-ink"}`}>
          {variant === "landing" && (
            <>
              <a href="#como-funciona" onClick={() => setOpen(false)} className="text-sm font-bold">
                Cómo funciona
              </a>
              <a href="#fidelizacion" onClick={() => setOpen(false)} className="text-sm font-bold">
                RRPP y fidelización
              </a>
              <Link href="/organizador" className="text-sm font-bold">
                Organizador
              </Link>
              <Link
                href="/organizador/nuevo"
                className="rounded bg-coral px-5 py-3 text-center text-sm font-extrabold text-white"
              >
                Sumar mi evento
              </Link>
            </>
          )}
          {variant === "event" && (
            <>
              <Link href="/organizador" className="text-sm font-bold">
                Organizador
              </Link>
              <Link href="/login" className="text-sm font-bold">
                Iniciar sesión
              </Link>
              <a
                href="#tickets"
                onClick={() => setOpen(false)}
                className="rounded bg-coral px-5 py-3 text-center text-sm font-extrabold text-white"
              >
                Comprar entradas
              </a>
            </>
          )}
        </div>
      )}
    </header>
  );
}
