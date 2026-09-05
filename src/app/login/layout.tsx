import type { Metadata } from "next";
import { noIndex, pageMeta } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMeta({
    title: "Iniciar sesión",
    description: "Entrá a Tikeame como comprador, organizador o super admin.",
    path: "/login",
    index: false,
  }),
  ...noIndex,
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
