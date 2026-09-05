import type { Metadata } from "next";

export const metadata: Metadata = { title: "Super admin" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
