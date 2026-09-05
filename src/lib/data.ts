export const COMMISSION_PCT = 3;

export type TicketKey = "early" | "general" | "vip" | "parking";

export type TicketTier = {
  key: TicketKey;
  name: string;
  price: number;
  soldOut: boolean;
  note: string | null;
  sold: number;
  cap: number;
};

export const TICKET_TIERS: TicketTier[] = [
  { key: "early", name: "Early Bird", price: 6500, soldOut: true, note: null, sold: 120, cap: 120 },
  { key: "general", name: "General", price: 8500, soldOut: false, note: null, sold: 210, cap: 300 },
  { key: "vip", name: "VIP", price: 15000, soldOut: false, note: "barra libre", sold: 52, cap: 100 },
  {
    key: "parking",
    name: "General + Parking",
    price: 12500,
    soldOut: false,
    note: "combo con cochera",
    sold: 30,
    cap: 42,
  },
];

export const PRICES: Record<TicketKey, number> = {
  early: 6500,
  general: 8500,
  vip: 15000,
  parking: 12500,
};

export const EVENT = {
  slug: "neon",
  title: "NEÓN",
  subtitle: "Fiesta Electrónica",
  fullName: "NEÓN — Fiesta Electrónica",
  category: "Electrónica",
  dateLabel: "Sáb 12 de dic",
  timeLabel: "23:59",
  venue: "Crobar, Palermo",
  venueName: "Crobar",
  venueAddress: "Av. Costanera R. Obligado, Palermo",
  mapsQuery: "Crobar Av Costanera R Obligado Palermo Buenos Aires",
  fromPrice: 8500,
  ticketsLeft: 150,
  capacity: 562,
  sold: 412,
  lineup: [
    "Bandalos Chinos DJ Set",
    "Miranda! B2B",
    "El Zar",
    "Alan Gomez",
    "Perras On The Beach",
    "Guiu",
  ],
  about:
    "Una noche de música electrónica en uno de los clubes más grandes de Palermo. Sonido de primer nivel, line up internacional y producción propia de Tiko. Entrada válida para un solo ingreso — se invalida al escanearse en la puerta.",
  eventDate: new Date(2026, 11, 12, 23, 59, 0),
  hero: "/evento-hero.avif",
};

export const FAQS = [
  {
    q: "¿Puedo reingresar si salgo del club?",
    a: "No, la entrada es válida para un solo ingreso y se invalida al escanearse en la puerta.",
  },
  {
    q: "¿Hay límite de edad?",
    a: "Sí, el evento es +18. Se pide DNI físico en la puerta.",
  },
  {
    q: "¿Qué pasa si el evento se cancela?",
    a: "Se reembolsa el 100% del valor de la entrada dentro de los 10 días hábiles.",
  },
  {
    q: "¿Puedo transferir mi entrada a otra persona?",
    a: "Sí, desde Mis entradas podés transferirla hasta 24 hs antes del evento.",
  },
  {
    q: "¿Qué medios de pago aceptan?",
    a: "Tarjetas de crédito/débito, Mercado Pago y transferencia bancaria.",
  },
];

export const UPCOMING = [
  {
    slug: "bass-night",
    date: "Vie 8 de ene",
    title: "BASS NIGHT",
    venue: "Groove, Palermo",
    image: "/upcoming-bass.jpg",
  },
  {
    slug: "sunrise-open-air",
    date: "Dom 25 de ene",
    title: "SUNRISE OPEN AIR",
    venue: "Costa Salguero",
    image: "/upcoming-sunrise.jpg",
  },
  {
    slug: "techno-underground",
    date: "Sáb 14 de feb",
    title: "TECHNO UNDERGROUND",
    venue: "Crobar",
    image: "/upcoming-techno.jpg",
  },
];

export const GALLERY = [
  { src: "/gallery-recap.jpg", recap: true, label: "Recap 2025" },
  { src: "/gallery-1.jpg" },
  { src: "/gallery-2.jpg" },
  { src: "/gallery-3.jpg" },
  { src: "/gallery-4.jpg" },
  { src: "/gallery-5.jpg" },
];

export const SPONSORS = ["KLYNE", "PULSO", "NOCTURNA", "AURAL"];

export type Promoter = {
  id: number;
  name: string;
  initials: string;
  checkins: number;
  tier: "Bronce" | "Plata" | "Oro" | "Embajadora";
  earnings: number;
  slug: string;
};

export const PROMOTERS: Promoter[] = [
  { id: 1, name: "Lucía Gómez", initials: "LG", checkins: 68, tier: "Embajadora", earnings: 102000, slug: "lugomez" },
  { id: 2, name: "Nico Paz", initials: "NP", checkins: 52, tier: "Oro", earnings: 78000, slug: "nicopaz" },
  { id: 3, name: "Sofía Martínez", initials: "SM", checkins: 41, tier: "Oro", earnings: 61500, slug: "sofimartinez" },
  { id: 4, name: "Bruno Ledesma", initials: "BL", checkins: 28, tier: "Plata", earnings: 42000, slug: "brunol" },
  { id: 5, name: "Valentina Ríos", initials: "VR", checkins: 19, tier: "Plata", earnings: 28500, slug: "valeriors" },
  { id: 6, name: "Tomás Acosta", initials: "TA", checkins: 9, tier: "Bronce", earnings: 13500, slug: "tomasacosta" },
];

export const RRPP_TIERS = [
  { name: "Bronce" as const, min: 0, max: 15, reward: "5% de descuento en tu próxima entrada" },
  { name: "Plata" as const, min: 16, max: 35, reward: "10% de descuento + upgrade de sector prioritario" },
  { name: "Oro" as const, min: 36, max: 60, reward: "15% de descuento + acceso backstage" },
  { name: "Embajadora" as const, min: 61, max: Infinity, reward: "Comisión fija por evento + invitación VIP" },
];

export const ORGANIZER_STATS = [
  { label: "Entradas vendidas", value: "412", sub: "+38 hoy" },
  { label: "Ingresos netos", value: "$3.1M", sub: "100% para vos" },
  { label: "Entradas restantes", value: "150", sub: "de 562 totales" },
  { label: "Ocupación", value: "73%", sub: "sobre capacidad total" },
];

export const ORGANIZER_SALES = [
  { name: "Martina Gómez", tier: "General", qty: 2, date: "2 sep" },
  { name: "Lucas Ferrero", tier: "VIP", qty: 1, date: "2 sep" },
  { name: "Sol Ibarra", tier: "General + Parking", qty: 2, date: "1 sep" },
  { name: "Bruno Testa", tier: "General", qty: 4, date: "1 sep" },
  { name: "Nina Suárez", tier: "Early Bird", qty: 1, date: "31 ago" },
  { name: "Iván Roldán", tier: "General", qty: 2, date: "31 ago" },
];

export const DASHBOARD_ACTIVITY = [
  { text: "Compra · 2× General — Guadalupe Fernández", time: "22:41" },
  { text: "Check-in · Bruno Ledesma (VIP)", time: "22:38" },
  { text: "Compra · 1× VIP — Tomás Acosta", time: "22:30" },
  { text: "Referido desbloqueado · vía Nico Paz", time: "22:12" },
];

export const SCAN_DEMO = [
  { name: "Bruno Ledesma", type: "VIP", status: "valid" as const, time: "22:04" },
  { name: "Valentina Ríos", type: "General", status: "used" as const, time: "22:05" },
  { name: "Código sin registro", type: "—", status: "invalid" as const, time: "22:06" },
  { name: "Tomás Acosta", type: "General", status: "valid" as const, time: "22:07" },
  { name: "Sofía Martínez", type: "VIP", status: "valid" as const, time: "22:09" },
];

export const REFERRALS = [
  { name: "Bruno Ledesma", unlocked: true },
  { name: "Sofía Martínez", unlocked: false },
  { name: "Valentina Ríos", unlocked: true },
  { name: "Tomás Acosta", unlocked: false },
];

export const FUNNEL = [
  { label: "Compartidos", value: 1200 },
  { label: "Compraron", value: 340 },
  { label: "Desbloqueados", value: 210 },
];

export function promoterLink(slug: string) {
  return `tikeame.com.ar/r/${slug}`;
}

export function qrUrl(data: string, size = 160) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=0&data=${encodeURIComponent(data)}`;
}

export function tierBadge(tier: Promoter["tier"]) {
  switch (tier) {
    case "Bronce":
      return { background: "#F4EEDC", color: "#2B1D4A" };
    case "Plata":
      return { background: "#EDE9F5", color: "#2B1D4A" };
    case "Oro":
      return { background: "#FF6B5B", color: "#FFFFFF" };
    case "Embajadora":
      return { background: "#3EC9A7", color: "#FFFFFF" };
  }
}

export function scanStatusStyle(status: "valid" | "used" | "invalid") {
  if (status === "valid") return { bg: "#E9F8F2", fg: "#2FA98A", label: "Válido" };
  if (status === "used") return { bg: "#FFF1EE", fg: "#E85445", label: "Ya ingresó" };
  return { bg: "#EFEBF7", fg: "#6B5D8A", label: "No reconocido" };
}
