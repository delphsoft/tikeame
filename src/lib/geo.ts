export type CityId = "caba" | "cordoba" | "rosario" | "mendoza";

export type City = {
  id: CityId;
  label: string;
  short: string;
  lat: number;
  lng: number;
};

export const CITIES: City[] = [
  { id: "caba", label: "Buenos Aires", short: "CABA", lat: -34.6037, lng: -58.3816 },
  { id: "cordoba", label: "Córdoba", short: "CBA", lat: -31.4201, lng: -64.1888 },
  { id: "rosario", label: "Rosario", short: "ROS", lat: -32.9442, lng: -60.6505 },
  { id: "mendoza", label: "Mendoza", short: "MDZ", lat: -32.8895, lng: -68.8458 },
];

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

export function nearestCity(lat: number, lng: number): City {
  return CITIES.reduce((best, city) =>
    haversineKm({ lat, lng }, city) < haversineKm({ lat, lng }, best) ? city : best,
  );
}

export function formatKm(km: number) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export async function reverseCity(lat: number, lng: number): Promise<City> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=es`;
    const res = await fetch(url);
    if (!res.ok) return nearestCity(lat, lng);
    const data = (await res.json()) as {
      city?: string;
      locality?: string;
      principalSubdivision?: string;
    };
    const blob = `${data.city ?? ""} ${data.locality ?? ""} ${data.principalSubdivision ?? ""}`.toLowerCase();
    if (blob.includes("córdoba") || blob.includes("cordoba")) return CITIES[1];
    if (blob.includes("rosario") || blob.includes("santa fe")) return CITIES[2];
    if (blob.includes("mendoza")) return CITIES[3];
    if (
      blob.includes("buenos aires") ||
      blob.includes("caba") ||
      blob.includes("autónoma") ||
      blob.includes("palermo") ||
      blob.includes("vicente lópez")
    ) {
      return CITIES[0];
    }
  } catch {
    /* fall through */
  }
  return nearestCity(lat, lng);
}
