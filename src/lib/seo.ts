import type { Metadata } from "next";
import { getPublicEvent, type PublicEvent } from "./public-events";
import { site } from "./site";

export const noIndex: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export function absUrl(path = "/") {
  if (path.startsWith("http")) return path;
  return new URL(path, site.url).toString();
}

export function pageMeta({
  title,
  description,
  path,
  absoluteTitle,
  image,
  type = "website",
  index = true,
}: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: string;
  image?: string;
  type?: "website" | "article";
  index?: boolean;
}): Metadata {
  const url = absUrl(path);
  const ogTitle = absoluteTitle ?? `${title} · ${site.name}`;
  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    alternates: { canonical: url },
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      title: ogTitle,
      description,
      url,
      siteName: site.name,
      locale: site.locale,
      type,
      images: image ? [{ url: absUrl(image), alt: ogTitle }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: site.url,
    email: site.email,
    description: site.description,
    logo: absUrl("/opengraph-image"),
    areaServed: { "@type": "Country", name: "Argentina" },
    sameAs: [],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    description: site.description,
    inLanguage: "es-AR",
    publisher: { "@type": "Organization", name: site.name, url: site.url },
  };
}

export function eventJsonLd(event: PublicEvent) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: event.indexable
      ? "https://schema.org/EventScheduled"
      : "https://schema.org/EventScheduled",
    image: [absUrl(event.image)],
    url: absUrl(`/eventos/${event.slug}`),
    eventType: event.category,
    location: {
      "@type": "Place",
      name: event.venueName,
      address: {
        "@type": "PostalAddress",
        streetAddress: event.address,
        addressLocality: event.city,
        addressCountry: "AR",
      },
    },
    organizer: {
      "@type": "Organization",
      name: event.organizer,
    },
    performer: event.lineup.map((name) => ({ "@type": "PerformingGroup", name })),
    offers: {
      "@type": "Offer",
      url: absUrl(`/eventos/${event.slug}`),
      price: event.fromPrice,
      priceCurrency: "ARS",
      availability: "https://schema.org/InStock",
      validFrom: "2026-09-05",
    },
    isAccessibleForFree: false,
    inLanguage: "es-AR",
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absUrl(item.path),
    })),
  };
}

export function itemListJsonLd() {
  const events = (["neon", "bass-night", "techno-underground"]
    .map((slug) => getPublicEvent(slug))
    .filter(Boolean) as PublicEvent[]);
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Próximos eventos en Tikeame",
    itemListElement: events.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absUrl(`/eventos/${e.slug}`),
      name: e.name,
    })),
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function serviceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Tikeame para organizadores",
    serviceType: "Ticketera online",
    provider: { "@type": "Organization", name: site.name, url: site.url },
    areaServed: { "@type": "Country", name: "Argentina" },
    description: site.organizerDescription,
    offers: {
      "@type": "Offer",
      description: "Comisión total visible de 2 a 5%, split Mercado Pago",
    },
  };
}

export { getPublicEvent };
