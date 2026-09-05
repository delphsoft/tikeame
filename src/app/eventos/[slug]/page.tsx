import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { FAQS } from "@/lib/data";
import { getPublicEvent } from "@/lib/public-events";
import { breadcrumbJsonLd, eventJsonLd, faqJsonLd, pageMeta } from "@/lib/seo";
import { EventPage } from "./EventPage";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = getPublicEvent(slug);
  if (!event) {
    return pageMeta({
      title: "Evento",
      description: "Evento en Tikeame.",
      path: `/eventos/${slug}`,
      index: false,
    });
  }
  return pageMeta({
    title: event.name,
    absoluteTitle: `${event.name} | Entradas ${event.venueName} | Tikeame`,
    description: event.description,
    path: `/eventos/${event.slug}`,
    image: event.image,
    index: event.indexable,
  });
}

export async function generateStaticParams() {
  return [{ slug: "neon" }, { slug: "bass-night" }, { slug: "sunrise-open-air" }, { slug: "techno-underground" }];
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const event = getPublicEvent(slug);
  return (
    <>
      {event && (
        <>
          <JsonLd data={eventJsonLd(event)} />
          <JsonLd
            data={breadcrumbJsonLd([
              { name: "Inicio", path: "/" },
              { name: "Eventos", path: "/#eventos" },
              { name: event.name, path: `/eventos/${event.slug}` },
            ])}
          />
          {event.slug === "neon" && <JsonLd data={faqJsonLd(FAQS)} />}
        </>
      )}
      <EventPage slug={slug} />
    </>
  );
}
