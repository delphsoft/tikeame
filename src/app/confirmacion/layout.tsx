import type { Metadata } from "next";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = { title: "Compra confirmada", ...noIndex };

export default function ConfirmacionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
