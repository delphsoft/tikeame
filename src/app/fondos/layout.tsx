import type { Metadata } from "next";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Fondos de hero",
  ...noIndex,
};

export default function FondosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
