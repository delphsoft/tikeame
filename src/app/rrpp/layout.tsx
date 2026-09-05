import type { Metadata } from "next";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = { title: "Panel RRPP", ...noIndex };

export default function RrppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
