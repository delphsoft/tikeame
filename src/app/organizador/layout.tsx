import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/server/auth";
import { noIndex } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel organizador", ...noIndex };

export default async function OrganizadorLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (user?.role !== "organizer" && user?.role !== "admin") redirect("/login");
  return children;
}
