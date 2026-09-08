import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "tikeame_session";
const TTL_SEC = 60 * 60 * 24 * 30;

export function getSessionSecret(): string | null {
  const s = process.env.SESSION_SECRET;
  if (process.env.VERCEL) {
    if (!s || s.length < 16) return null;
    return s;
  }
  return s || "tikeame-dev-secret-change-me";
}

export function signSession(userId: string) {
  const secret = getSessionSecret();
  if (!secret) throw new Error("SESSION_SECRET required");
  const exp = Math.floor(Date.now() / 1000) + TTL_SEC;
  const payload = `${userId}.${exp}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifySession(token: string | undefined): string | null {
  const secret = getSessionSecret();
  if (!secret || !token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expStr, sig] = parts;
  const exp = Number(expStr);
  if (!userId || !Number.isFinite(exp) || exp * 1000 < Date.now()) return null;
  const payload = `${userId}.${expStr}`;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return userId;
}

export function tokensMatch(a: string | null | undefined, b: string | null | undefined) {
  if (!a || !b) return false;
  const secret = getSessionSecret() || "tikeame-view-token";
  const ha = createHmac("sha256", secret).update(a).digest();
  const hb = createHmac("sha256", secret).update(b).digest();
  return timingSafeEqual(ha, hb);
}
