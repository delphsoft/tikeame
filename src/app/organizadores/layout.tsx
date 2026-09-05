import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Vendé entradas online",
  description: site.organizerDescription,
  path: "/organizadores",
});

export default function OrganizadoresLayout({ children }: { children: React.ReactNode }) {
  return children;
}
