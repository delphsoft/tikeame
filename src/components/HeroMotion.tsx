"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { FONDOS, type FondoId } from "@/lib/fondos";

export function HeroMotion({
  fondo,
  children,
  minH = "full",
  autoPlay = true,
}: {
  fondo: FondoId;
  children: ReactNode;
  minH?: "full" | "card";
  autoPlay?: boolean;
}) {
  const spec = FONDOS.find((f) => f.id === fondo) ?? FONDOS[0];
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.pause();
      return;
    }
    if (!autoPlay) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [autoPlay, spec.video]);

  const tall = minH === "full";

  return (
    <section
      className={`relative overflow-hidden ${
        tall
          ? "flex min-h-[68svh] flex-col justify-end px-5 pb-12 md:min-h-[92vh] md:px-12 md:pb-20"
          : "flex min-h-[420px] flex-col justify-end px-6 py-10 md:min-h-[520px]"
      }`}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        poster="/crowd-hero.jpg"
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src={spec.video} type="video/mp4" />
      </video>
      <div className="hero-wash-attendee absolute inset-0" />
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="hero-grain absolute inset-0" />
      {fondo === "d" && (
        <>
          <div className="hero-orb bg-coral/40" style={{ width: 260, height: 260, top: "10%", right: "6%" }} />
          <div
            className="hero-orb bg-teal/30"
            style={{ width: 200, height: 200, bottom: "12%", left: "8%", animationDelay: "-4s" }}
          />
        </>
      )}
      <div className="relative z-10 mx-auto w-full max-w-[1240px]">{children}</div>
    </section>
  );
}
