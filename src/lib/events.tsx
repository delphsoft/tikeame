"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { EVENT, TICKET_TIERS, type TicketKey } from "./data";

export type EventStatus = "draft" | "on_sale" | "paused" | "sold_out";

export type EventTicket = {
  key: TicketKey;
  name: string;
  price: number;
  cap: number;
  sold: number;
  note: string | null;
};

export type ManagedEvent = {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  dateLabel: string;
  timeLabel: string;
  dateISO: string;
  venue: string;
  venueName: string;
  venueAddress: string;
  mapsQuery: string;
  about: string;
  lineup: string[];
  hero: string;
  commissionPct: number;
  status: EventStatus;
  organizerId: string;
  organizerName: string;
  featured: boolean;
  tickets: EventTicket[];
};

export type Organizer = {
  id: string;
  name: string;
  city: string;
  email: string;
  mp: "connected" | "pending" | "error";
  since: string;
};

export const ORGANIZERS: Organizer[] = [
  { id: "tiko", name: "Tiko Producciones", city: "CABA", email: "hola@tiko.ar", mp: "connected", since: "2025" },
  { id: "pulse", name: "Pulse BA", city: "Palermo", email: "pulse@ba.ar", mp: "connected", since: "2026" },
  { id: "costa", name: "Costa Events", city: "Costanera", email: "costa@events.ar", mp: "pending", since: "2026" },
];

export const HERO_OPTIONS = [
  { src: "/evento-hero.avif", label: "Club neón" },
  { src: "/upcoming-bass.jpg", label: "Bass night" },
  { src: "/upcoming-sunrise.jpg", label: "Open air" },
  { src: "/upcoming-techno.jpg", label: "Underground" },
  { src: "/gallery-1.jpg", label: "Pista" },
  { src: "/gallery-2.jpg", label: "Booth" },
];

export const SEED_EVENTS: ManagedEvent[] = [
  {
    slug: "neon",
    title: EVENT.title,
    subtitle: EVENT.subtitle,
    category: EVENT.category,
    dateLabel: EVENT.dateLabel,
    timeLabel: EVENT.timeLabel,
    dateISO: "2026-12-12",
    venue: EVENT.venue,
    venueName: EVENT.venueName,
    venueAddress: EVENT.venueAddress,
    mapsQuery: EVENT.mapsQuery,
    about: EVENT.about,
    lineup: EVENT.lineup,
    hero: EVENT.hero,
    commissionPct: 3,
    status: "on_sale",
    organizerId: "tiko",
    organizerName: "Tiko Producciones",
    featured: true,
    tickets: TICKET_TIERS.map((t) => ({
      key: t.key,
      name: t.name,
      price: t.price,
      cap: t.cap,
      sold: t.sold,
      note: t.note,
    })),
  },
  {
    slug: "bass-night",
    title: "BASS NIGHT",
    subtitle: "Drum & Bass",
    category: "Bass",
    dateLabel: "Vie 8 de ene",
    timeLabel: "00:30",
    dateISO: "2027-01-08",
    venue: "Groove, Palermo",
    venueName: "Groove",
    venueAddress: "Santa Fe 4389, Palermo",
    mapsQuery: "Groove Palermo Buenos Aires",
    about: "Una noche de drum & bass y UK garage en Groove. Line up local + un guest internacional.",
    lineup: ["A.G.", "Merca Bae", "Djemba", "Lowriderz"],
    hero: "/upcoming-bass.jpg",
    commissionPct: 3,
    status: "on_sale",
    organizerId: "tiko",
    organizerName: "Tiko Producciones",
    featured: false,
    tickets: [
      { key: "early", name: "Early Bird", price: 5500, cap: 80, sold: 80, note: null },
      { key: "general", name: "General", price: 7500, cap: 220, sold: 94, note: null },
      { key: "vip", name: "VIP", price: 12000, cap: 40, sold: 11, note: "barra" },
      { key: "parking", name: "General + Parking", price: 10500, cap: 20, sold: 4, note: null },
    ],
  },
  {
    slug: "sunrise-open-air",
    title: "SUNRISE OPEN AIR",
    subtitle: "Amanecer en el río",
    category: "Open air",
    dateLabel: "Dom 25 de ene",
    timeLabel: "06:00",
    dateISO: "2027-01-25",
    venue: "Costa Salguero",
    venueName: "Costa Salguero",
    venueAddress: "Av. Costanera Rafael Obligado, CABA",
    mapsQuery: "Costa Salguero Buenos Aires",
    about: "Open air de amanecer frente al río. Sunset to sunrise, sound system propio.",
    lineup: ["Bicep live", "DJ Tennis", "Paula Tape"],
    hero: "/upcoming-sunrise.jpg",
    commissionPct: 4,
    status: "draft",
    organizerId: "costa",
    organizerName: "Costa Events",
    featured: false,
    tickets: [
      { key: "early", name: "Early Bird", price: 9000, cap: 200, sold: 0, note: null },
      { key: "general", name: "General", price: 14000, cap: 800, sold: 0, note: null },
      { key: "vip", name: "VIP", price: 22000, cap: 120, sold: 0, note: "lounge" },
      { key: "parking", name: "General + Parking", price: 17000, cap: 80, sold: 0, note: null },
    ],
  },
  {
    slug: "techno-underground",
    title: "TECHNO UNDERGROUND",
    subtitle: "Warehouse",
    category: "Techno",
    dateLabel: "Sáb 14 de feb",
    timeLabel: "23:00",
    dateISO: "2027-02-14",
    venue: "Crobar",
    venueName: "Crobar",
    venueAddress: "Av. Costanera R. Obligado, Palermo",
    mapsQuery: "Crobar Palermo Buenos Aires",
    about: "Techno de pista larga, luces bajas y cuatro horas de cierre.",
    lineup: ["I Hate Models", "Anfisa Letyago", "Klangkuenstler"],
    hero: "/upcoming-techno.jpg",
    commissionPct: 2.5,
    status: "on_sale",
    organizerId: "pulse",
    organizerName: "Pulse BA",
    featured: false,
    tickets: [
      { key: "early", name: "Early Bird", price: 7000, cap: 100, sold: 42, note: null },
      { key: "general", name: "General", price: 9500, cap: 350, sold: 120, note: null },
      { key: "vip", name: "VIP", price: 16000, cap: 80, sold: 18, note: null },
      { key: "parking", name: "General + Parking", price: 13000, cap: 30, sold: 6, note: null },
    ],
  },
];

const CREATED_KEY = "tikeame-created-events";
const STATUS_KEY = "tikeame-event-status";

export function slugify(input: string) {
  const base = input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "evento";
}

export function uniqueSlug(title: string, existing: string[]) {
  const base = slugify(title);
  if (!existing.includes(base)) return base;
  let i = 2;
  while (existing.includes(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}

export function formatDateLabel(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  const raw = d.toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" });
  return raw.replace(".", "");
}

export function eventCapacity(e: ManagedEvent) {
  return e.tickets.reduce((s, t) => s + t.cap, 0);
}

export function eventSold(e: ManagedEvent) {
  return e.tickets.reduce((s, t) => s + t.sold, 0);
}

export function eventGross(e: ManagedEvent) {
  return e.tickets.reduce((s, t) => s + t.sold * t.price, 0);
}

export function statusLabel(status: EventStatus) {
  switch (status) {
    case "draft":
      return "Borrador";
    case "on_sale":
      return "En venta";
    case "paused":
      return "Pausado";
    case "sold_out":
      return "Agotado";
  }
}

export function statusTone(status: EventStatus) {
  switch (status) {
    case "draft":
      return "bg-wash text-muted";
    case "on_sale":
      return "bg-teal text-white";
    case "paused":
      return "bg-coral text-white";
    case "sold_out":
      return "bg-ink text-cream";
  }
}

type EventsContextValue = {
  events: ManagedEvent[];
  mine: ManagedEvent[];
  addEvent: (event: ManagedEvent) => void;
  setStatus: (slug: string, status: EventStatus) => void;
  getEvent: (slug: string) => ManagedEvent | undefined;
};

const EventsContext = createContext<EventsContextValue | null>(null);

export function EventsProvider({ children }: { children: ReactNode }) {
  const [created, setCreated] = useState<ManagedEvent[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, EventStatus>>({});

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(CREATED_KEY);
        if (raw) setCreated(JSON.parse(raw) as ManagedEvent[]);
        const st = localStorage.getItem(STATUS_KEY);
        if (st) setStatusMap(JSON.parse(st) as Record<string, EventStatus>);
      } catch {
        /* ignore */
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const addEvent = useCallback((event: ManagedEvent) => {
    setCreated((prev) => {
      const next = [event, ...prev.filter((e) => e.slug !== event.slug)];
      localStorage.setItem(CREATED_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setStatus = useCallback((slug: string, status: EventStatus) => {
    setStatusMap((prev) => {
      const next = { ...prev, [slug]: status };
      localStorage.setItem(STATUS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const events = useMemo(() => {
    const merged = [...created, ...SEED_EVENTS.filter((s) => !created.some((c) => c.slug === s.slug))];
    return merged.map((e) => (statusMap[e.slug] ? { ...e, status: statusMap[e.slug] } : e));
  }, [created, statusMap]);

  const mine = useMemo(() => events.filter((e) => e.organizerId === "tiko"), [events]);

  const getEvent = useCallback((slug: string) => events.find((e) => e.slug === slug), [events]);

  const value = useMemo(
    () => ({ events, mine, addEvent, setStatus, getEvent }),
    [events, mine, addEvent, setStatus, getEvent],
  );

  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}

export function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error("useEvents must be used within EventsProvider");
  return ctx;
}
