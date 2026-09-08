import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/server/auth";
import { noIndex } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Super admin", ...noIndex };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (user?.role !== "admin") redirect("/login");
  return children;
}
