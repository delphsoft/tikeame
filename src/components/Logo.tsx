import Link from "next/link";

type LogoProps = {
  href?: string;
  light?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "text-[18px]",
  md: "text-[22px] md:text-[24px]",
  lg: "text-[26px]",
};

export function Logo({ href = "/", light = false, size = "md", className = "" }: LogoProps) {
  const mark = (
    <span
      className={`font-display tracking-[0.01em] ${light ? "text-cream" : "text-ink"} ${sizes[size]} ${className}`}
    >
      TIKEAME<span className="text-coral">.</span>
    </span>
  );
  if (!href) return mark;
  return (
    <Link href={href} className="shrink-0">
      {mark}
    </Link>
  );
}
