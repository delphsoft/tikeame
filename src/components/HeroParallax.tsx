"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

type Layer = { x: number; y: number; s: number };

export function HeroParallax({
  src,
  alt = "",
  children,
  minHeight = "landing",
}: {
  src: string;
  alt?: string;
  children: ReactNode;
  minHeight?: "landing" | "event";
}) {
  const ref = useRef<HTMLElement>(null);
  const target = useRef<Layer>({ x: 0, y: 0, s: 0 });
  const [layer, setLayer] = useState<Layer>({ x: 0, y: 0, s: 0 });
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    let raf = 0;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      const id = requestAnimationFrame(() => setReduce(true));
      return () => cancelAnimationFrame(id);
    }

    const flush = () => {
      raf = 0;
      setLayer({ ...target.current });
    };
    const bump = () => {
      if (!raf) raf = requestAnimationFrame(flush);
    };

    const onMove = (e: MouseEvent) => {
      const box = ref.current?.getBoundingClientRect();
      if (!box) return;
      target.current.x = (e.clientX - box.left) / box.width - 0.5;
      target.current.y = (e.clientY - box.top) / box.height - 0.5;
      bump();
    };
    const onScroll = () => {
      const box = ref.current?.getBoundingClientRect();
      if (!box) return;
      target.current.s = Math.max(0, -box.top);
      bump();
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    bump();
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const imgX = reduce ? 0 : layer.x * 28;
  const imgY = reduce ? 0 : layer.y * 20 + layer.s * 0.38;
  const copyX = reduce ? 0 : layer.x * -14;
  const copyY = reduce ? 0 : layer.y * -10;
  const gridX = reduce ? 0 : layer.x * 12;
  const gridY = reduce ? 0 : layer.y * 10;
  const tall = minHeight === "event";

  return (
    <section
      ref={ref}
      className={`relative overflow-hidden ${
        tall
          ? "flex min-h-[560px] flex-col justify-end"
          : "px-5 py-16 md:px-12 md:py-[110px] md:pb-[70px]"
      }`}
    >
      <div
        className="pointer-events-none absolute inset-[-12%] will-change-transform"
        style={{ transform: `translate3d(${imgX}px, ${imgY}px, 0) scale(1.16)` }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority
          className={`hero-zoom object-cover saturate-125 ${tall ? "" : "blur-[6px]"}`}
        />
      </div>

      <div
        className="hero-orb bg-coral/35"
        style={{
          width: 280,
          height: 280,
          top: "12%",
          right: "8%",
          transform: `translate3d(${reduce ? 0 : layer.x * -36}px, ${reduce ? 0 : layer.y * -22}px, 0)`,
        }}
      />
      <div
        className="hero-orb bg-teal/25"
        style={{
          width: 220,
          height: 220,
          bottom: "8%",
          left: "6%",
          animationDelay: "-3s",
          transform: `translate3d(${reduce ? 0 : layer.x * 22}px, ${reduce ? 0 : layer.y * 18}px, 0)`,
        }}
      />

      <div
        className={`absolute inset-0 ${
          tall
            ? "bg-[linear-gradient(180deg,rgba(43,29,74,0.28)_0%,rgba(43,29,74,0.52)_50%,rgba(20,14,36,0.96)_100%)]"
            : "bg-[linear-gradient(120deg,rgba(43,29,74,0.92)_0%,rgba(43,29,74,0.78)_45%,rgba(43,29,74,0.52)_100%)]"
        }`}
      />
      <div
        className="dot-grid pointer-events-none absolute inset-0 will-change-transform"
        style={{ transform: `translate3d(${gridX}px, ${gridY}px, 0)` }}
      />
      <div className="hero-grain absolute inset-0" />

      <div
        className={`relative ${tall ? "mx-auto w-full max-w-[1240px] px-5 pb-[120px] md:px-10" : "mx-auto max-w-[1240px]"}`}
        style={{ transform: `translate3d(${copyX}px, ${copyY}px, 0)` }}
      >
        {children}
      </div>
    </section>
  );
}
