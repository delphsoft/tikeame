import type { Metadata } from "next";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = { title: "Tu cuenta", ...noIndex };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
