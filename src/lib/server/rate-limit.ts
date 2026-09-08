type Bucket = { n: number; reset: number };

const buckets = new Map<string, Bucket>();

export function clientIp(req: Request) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") || "local";
}

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (buckets.size > 4000) {
    for (const [k, b] of buckets) {
      if (b.reset < now) buckets.delete(k);
    }
  }
  const prev = buckets.get(key);
  if (!prev || prev.reset < now) {
    buckets.set(key, { n: 1, reset: now + windowMs });
    return true;
  }
  if (prev.n >= limit) return false;
  prev.n += 1;
  return true;
}
