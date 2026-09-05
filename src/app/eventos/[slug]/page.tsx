import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EVENT } from "@/lib/data";
import { EventPage } from "./EventPage";

export const metadata: Metadata = {
  title: `${EVENT.fullName}`,
  description: `${EVENT.fullName} · ${EVENT.dateLabel} · ${EVENT.venue}`,
};

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug !== EVENT.slug && !["bass-night", "sunrise-open-air", "techno-underground"].includes(slug)) {
    notFound();
  }
  return <EventPage />;
}
