import type { Metadata } from "next";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = { title: "Panel organizador", ...noIndex };

export default function OrganizadorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
