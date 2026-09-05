import type { Metadata } from "next";
import { EVENT } from "@/lib/data";
import { EventPage } from "./EventPage";

export const metadata: Metadata = {
  title: `${EVENT.fullName}`,
  description: `${EVENT.fullName} · ${EVENT.dateLabel} · ${EVENT.venue}`,
};

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <EventPage slug={slug} />;
}
