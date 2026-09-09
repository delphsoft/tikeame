import Link from "next/link";
import { LogoMark } from "./LogoMark";

type LogoProps = {
  href?: string;
  light?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: { text: "text-[18px]", icon: 24 },
  md: { text: "text-[22px] md:text-[24px]", icon: 28 },
  lg: { text: "text-[26px]", icon: 32 },
};

export function Logo({ href = "/", light = false, size = "md", className = "" }: LogoProps) {
  const { text, icon } = sizes[size];
  const mark = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={icon} light={light} />
      <span className={`font-display tracking-[0.01em] ${light ? "text-cream" : "text-ink"} ${text}`}>
        TICKEAME<span className="text-coral">.</span>
      </span>
    </span>
  );
  if (!href) return mark;
  return (
    <Link href={href} className="inline-flex shrink-0">
      {mark}
    </Link>
  );
}
