export type FondoId = "a" | "b" | "c" | "d";

export const FONDO_KEY = "tikeame-hero-fondo";

export const FONDOS: {
  id: FondoId;
  label: string;
  name: string;
  desc: string;
  video: string;
}[] = [
  {
    id: "a",
    label: "A",
    name: "Push-in",
    desc: "La cámara entra a la pista. La más inmersiva para quien va al evento.",
    video: "/crowd-push.mp4",
  },
  {
    id: "b",
    label: "B",
    name: "Pan",
    desc: "Barrido horizontal sobre la gente. Ritmo de recap, menos agresivo.",
    video: "/crowd-pan.mp4",
  },
  {
    id: "c",
    label: "C",
    name: "Tilt",
    desc: "Sube desde la pista hacia las luces del escenario.",
    video: "/crowd-tilt.mp4",
  },
  {
    id: "d",
    label: "D",
    name: "Flares",
    desc: "Flotante, haze y destellos. Más club, menos documental.",
    video: "/crowd-flare.mp4",
  },
];

export const DEFAULT_FONDO: FondoId = "a";

export function isFondoId(v: string | null | undefined): v is FondoId {
  return v === "a" || v === "b" || v === "c" || v === "d";
}
