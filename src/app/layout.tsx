import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Anton, Manrope } from "next/font/google";
import { JsonLd } from "@/components/JsonLd";
import { AppTabs } from "@/components/AppTabs";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { GoogleAnalyticsPageview } from "@/components/GoogleAnalyticsPageview";
import { CartProvider } from "@/lib/cart";
import { EventsProvider } from "@/lib/events";
import { SessionProvider } from "@/lib/session";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
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
    default: "Tickeame | Entradas para fiestas y eventos en Argentina",
    template: "%s · Tickeame",
  },
  description: site.description,
  applicationName: site.name,
  keywords: site.keywords,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  category: "tickets",
  formatDetection: { telephone: false, email: false, address: false },
  alternates: { canonical: site.url },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    title: "Tickeame | Entradas para fiestas y eventos en Argentina",
    description: site.description,
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: site.name,
  },
  twitter: {
    card: "summary_large_image",
    title: "Tickeame | Entradas para fiestas y eventos en Argentina",
    description: site.description,
  },
  icons: { icon: "/icon" },
  appleWebApp: { capable: true, title: site.name, statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#F4EEDC",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-AR" className={`${anton.variable} ${manrope.variable} h-full antialiased`}>
      <body className="min-h-full bg-cream font-sans text-ink">
        <GoogleAnalytics />
        <GoogleAnalyticsPageview />
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <CartProvider>
          <EventsProvider>
            <SessionProvider>
              <div className="app-shell">{children}</div>
              <AppTabs />
            </SessionProvider>
          </EventsProvider>
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
