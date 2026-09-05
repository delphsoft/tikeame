import type { Metadata } from "next";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = { title: "Super admin", ...noIndex };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
