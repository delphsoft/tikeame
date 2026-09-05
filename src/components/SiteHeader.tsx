"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "./Logo";

type SiteHeaderProps = {
  variant?: "home" | "organizers" | "event" | "plain" | "landing";
};

export function SiteHeader({ variant = "home" }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const isLanding = variant === "landing" || variant === "organizers";
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
          {(variant === "home" || variant === "plain") && (
            <>
              <a href="#eventos" className="text-sm font-bold text-ink">
                Eventos
              </a>
              <a href="#como-funciona" className="text-sm font-bold text-ink">
                Cómo funciona
              </a>
              <Link href="/login" className="text-sm font-bold text-ink">
                Iniciar sesión
              </Link>
              <Link href="/organizadores" className="text-sm font-bold text-muted">
                Soy organizador
              </Link>
              <a
                href="#eventos"
                className="rounded bg-coral px-5 py-[11px] text-sm font-extrabold text-white"
              >
                Ver eventos
              </a>
            </>
          )}
          {isLanding && (
            <>
              <a href="#como-funciona" className="text-sm font-bold text-ink">
                Cómo funciona
              </a>
              <a href="#fidelizacion" className="text-sm font-bold text-ink">
                RRPP y fidelización
              </a>
              <Link href="/" className="text-sm font-bold text-ink">
                Home eventos
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
              <Link href="/" className="text-xs font-bold text-muted2">
                Eventos
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
          {(variant === "home" || variant === "plain") && (
            <>
              <a href="#eventos" onClick={() => setOpen(false)} className="text-sm font-bold">
                Eventos
              </a>
              <Link href="/login" className="text-sm font-bold">
                Iniciar sesión
              </Link>
              <Link href="/organizadores" className="text-sm font-bold">
                Soy organizador
              </Link>
            </>
          )}
          {isLanding && (
            <>
              <a href="#como-funciona" onClick={() => setOpen(false)} className="text-sm font-bold">
                Cómo funciona
              </a>
              <Link href="/organizador/nuevo" className="text-sm font-bold">
                Sumar mi evento
              </Link>
            </>
          )}
          {variant === "event" && (
            <>
              <Link href="/" className="text-sm font-bold">
                Eventos
              </Link>
              <a href="#tickets" onClick={() => setOpen(false)} className="text-sm font-bold">
                Comprar entradas
              </a>
            </>
          )}
        </div>
      )}
    </header>
  );
}
