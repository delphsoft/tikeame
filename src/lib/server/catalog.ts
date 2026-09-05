import { EVENT, TICKET_TIERS } from "@/lib/data";

export type CatalogTicket = { key: string; name: string; price: number };

export type CatalogEvent = {
  slug: string;
  title: string;
  subtitle: string;
  dateLabel: string;
  venue: string;
  commissionPct: number;
  tickets: CatalogTicket[];
};

const EXTRA: CatalogEvent[] = [
  {
    slug: "bass-night",
    title: "BASS NIGHT",
    subtitle: "Drum & Bass",
    dateLabel: "Vie 8 de ene",
    venue: "Groove, Palermo",
    commissionPct: 3,
    tickets: [
      { key: "early", name: "Early Bird", price: 5500 },
      { key: "general", name: "General", price: 7500 },
      { key: "vip", name: "VIP", price: 12000 },
      { key: "parking", name: "General + Parking", price: 10500 },
    ],
  },
  {
    slug: "techno-underground",
    title: "TECHNO UNDERGROUND",
    subtitle: "Warehouse",
    dateLabel: "Sáb 14 de feb",
    venue: "Crobar",
    commissionPct: 2.5,
    tickets: [
      { key: "early", name: "Early Bird", price: 7000 },
      { key: "general", name: "General", price: 9500 },
      { key: "vip", name: "VIP", price: 16000 },
      { key: "parking", name: "General + Parking", price: 13000 },
    ],
  },
  {
    slug: "cuarteto-live",
    title: "CUARTETO LIVE",
    subtitle: "Noche cordobesa",
    dateLabel: "Sáb 21 de nov",
    venue: "Quality Espacio, Córdoba",
    commissionPct: 3,
    tickets: [
      { key: "early", name: "Early Bird", price: 8000 },
      { key: "general", name: "General", price: 11000 },
      { key: "vip", name: "VIP", price: 18000 },
      { key: "parking", name: "General + Parking", price: 14000 },
    ],
  },
  {
    slug: "parana-bass",
    title: "PARANÁ BASS",
    subtitle: "Orilla electrónica",
    dateLabel: "Vie 4 de dic",
    venue: "Metropolitano, Rosario",
    commissionPct: 3,
    tickets: [
      { key: "early", name: "Early Bird", price: 7000 },
      { key: "general", name: "General", price: 9000 },
      { key: "vip", name: "VIP", price: 15000 },
      { key: "parking", name: "General + Parking", price: 12000 },
    ],
  },
  {
    slug: "andes-tech",
    title: "ANDES TECH",
    subtitle: "Bodega + techno",
    dateLabel: "Sáb 30 de ene",
    venue: "Bodega Maipú",
    commissionPct: 4,
    tickets: [
      { key: "early", name: "Early Bird", price: 12000 },
      { key: "general", name: "General", price: 16000 },
      { key: "vip", name: "VIP", price: 24000 },
      { key: "parking", name: "General + Parking", price: 19000 },
    ],
  },
];

const NEON: CatalogEvent = {
  slug: "neon",
  title: EVENT.title,
  subtitle: EVENT.subtitle,
  dateLabel: EVENT.dateLabel,
  venue: EVENT.venue,
  commissionPct: 3,
  tickets: TICKET_TIERS.map((t) => ({ key: t.key, name: t.name, price: t.price })),
};

const ALL = [NEON, ...EXTRA];

export function getCatalogEvent(slug: string) {
  return ALL.find((e) => e.slug === slug) ?? null;
}
