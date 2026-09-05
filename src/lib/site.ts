const vercel =
  process.env.VERCEL_PROJECT_PRODUCTION_URL &&
  `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;

export const site = {
  name: "Tikeame",
  tagline: "El tikeame que te lleva a la fiesta.",
  url: process.env.NEXT_PUBLIC_SITE_URL || vercel || "https://tikeame.vercel.app",
  email: "hola@tikeame.com.ar",
  locale: "es_AR",
  description:
    "Comprá entradas para fiestas y eventos en Argentina. Cargo visible antes de pagar, QR de un solo ingreso y Mercado Pago. Tikeame nunca custodia fondos.",
  organizerDescription:
    "Ticketera para productoras. Split automático a tu cuenta de Mercado Pago, comisión 2–5% visible, check-in y RRPP por ingresos reales. Tikeame nunca custodia tu plata.",
  keywords: [
    "entradas online Argentina",
    "ticketera argentina",
    "comprar entradas fiestas",
    "entradas QR",
    "ticketera Mercado Pago",
    "eventos Palermo",
    "fiestas electrónicas Buenos Aires",
    "vender entradas online",
    "check-in eventos",
  ],
};
