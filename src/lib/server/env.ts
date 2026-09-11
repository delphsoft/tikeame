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
