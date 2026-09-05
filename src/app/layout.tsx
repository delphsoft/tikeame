import type { Metadata, Viewport } from "next";
import { Anton, Manrope } from "next/font/google";
import { CartProvider } from "@/lib/cart";
import { site } from "@/lib/site";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Tikeame — Tu plata. Tu evento. Tu tiko.",
    template: "%s · Tikeame",
  },
  description: site.description,
  applicationName: "Tikeame",
  openGraph: {
    title: "Tikeame — Ticketera argentina",
    description: site.description,
    type: "website",
    locale: "es_AR",
    url: site.url,
  },
};

export const viewport: Viewport = {
  themeColor: "#F4EEDC",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className={`${anton.variable} ${manrope.variable} h-full antialiased`}>
      <body className="min-h-full bg-cream font-sans text-ink">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
