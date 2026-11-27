export class ConfigError extends Error {
  status = 503;
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}

export function hosted() {
  return Boolean(process.env.VERCEL);
}

/** Host público de este request (Vercel: x-forwarded-host). */
export function publicRequestOrigin(req: Request) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (!host) return undefined;
  const proto =
    req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host.split(",")[0].trim()}`;
}

export function supabaseConfigured() {
  return Boolean(
    process.env.SUPABASE_URL && (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY),
  );
}

export function demoPayAllowed() {
  return !hosted();
}

export function requirePersistentStore() {
  if (hosted() && !supabaseConfigured()) {
    throw new ConfigError("Falta SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en Vercel.");
  }
}
