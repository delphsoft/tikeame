import type { Metadata } from "next";

export const metadata: Metadata = { title: "Fondos de hero" };

export default function FondosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
