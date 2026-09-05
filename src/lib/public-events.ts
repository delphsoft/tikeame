export type PublicEvent = {
  slug: string;
  title: string;
  subtitle: string;
  name: string;
  description: string;
  startDate: string;
  dateLabel: string;
  timeLabel: string;
  venueName: string;
  venue: string;
  address: string;
  city: string;
  image: string;
  fromPrice: number;
  category: string;
  lineup: string[];
  organizer: string;
  indexable: boolean;
};

export const PUBLIC_EVENTS: PublicEvent[] = [
  {
    slug: "neon",
    title: "NEÓN",
    subtitle: "Fiesta Electrónica",
    name: "NEÓN — Fiesta Electrónica",
    description:
      "Entradas para NEÓN en Crobar, Palermo. Sábado 12 de diciembre, 23:59. Electrónica, line up internacional, QR de un solo ingreso. Comprá online con Mercado Pago.",
    startDate: "2026-12-12T23:59:00-03:00",
    dateLabel: "Sáb 12 de dic",
    timeLabel: "23:59",
    venueName: "Crobar",
    venue: "Crobar, Palermo",
    address: "Av. Costanera Rafael Obligado, Palermo, CABA",
    city: "Buenos Aires",
    image: "/evento-hero.avif",
    fromPrice: 8500,
    category: "Electrónica",
    lineup: [
      "Bandalos Chinos DJ Set",
      "Miranda! B2B",
      "El Zar",
      "Alan Gomez",
      "Perras On The Beach",
      "Guiu",
    ],
    organizer: "Tiko Producciones",
    indexable: true,
  },
  {
    slug: "bass-night",
    title: "BASS NIGHT",
    subtitle: "Drum & Bass",
    name: "BASS NIGHT — Drum & Bass",
    description:
      "Entradas para BASS NIGHT en Groove, Palermo. Viernes 8 de enero. Drum & bass y UK garage. Comprá con Mercado Pago en Tikeame.",
    startDate: "2027-01-08T00:30:00-03:00",
    dateLabel: "Vie 8 de ene",
    timeLabel: "00:30",
    venueName: "Groove",
    venue: "Groove, Palermo",
    address: "Av. Santa Fe 4389, Palermo, CABA",
    city: "Buenos Aires",
    image: "/upcoming-bass.jpg",
    fromPrice: 7500,
    category: "Bass",
    lineup: ["A.G.", "Merca Bae", "Djemba", "Lowriderz"],
    organizer: "Tiko Producciones",
    indexable: true,
  },
  {
    slug: "sunrise-open-air",
    title: "SUNRISE OPEN AIR",
    subtitle: "Amanecer en el río",
    name: "SUNRISE OPEN AIR",
    description:
      "Open air de amanecer en Costa Salguero, Buenos Aires. Domingo 25 de enero. Sunset to sunrise.",
    startDate: "2027-01-25T06:00:00-03:00",
    dateLabel: "Dom 25 de ene",
    timeLabel: "06:00",
    venueName: "Costa Salguero",
    venue: "Costa Salguero",
    address: "Av. Costanera Rafael Obligado, CABA",
    city: "Buenos Aires",
    image: "/upcoming-sunrise.jpg",
    fromPrice: 14000,
    category: "Open air",
    lineup: ["Bicep live", "DJ Tennis", "Paula Tape"],
    organizer: "Costa Events",
    indexable: false,
  },
  {
    slug: "techno-underground",
    title: "TECHNO UNDERGROUND",
    subtitle: "Warehouse",
    name: "TECHNO UNDERGROUND",
    description:
      "Entradas para TECHNO UNDERGROUND en Crobar. Sábado 14 de febrero. Techno de pista larga.",
    startDate: "2027-02-14T23:00:00-03:00",
    dateLabel: "Sáb 14 de feb",
    timeLabel: "23:00",
    venueName: "Crobar",
    venue: "Crobar, Palermo",
    address: "Av. Costanera Rafael Obligado, Palermo, CABA",
    city: "Buenos Aires",
    image: "/upcoming-techno.jpg",
    fromPrice: 9500,
    category: "Techno",
    lineup: ["I Hate Models", "Anfisa Letyago", "Klangkuenstler"],
    organizer: "Pulse BA",
    indexable: true,
  },
];

export function getPublicEvent(slug: string) {
  return PUBLIC_EVENTS.find((e) => e.slug === slug);
}
