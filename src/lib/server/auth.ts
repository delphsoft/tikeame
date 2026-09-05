import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { authenticate, createUser, db, findUserByEmail, type Role, type User } from "./store";

const COOKIE = "tikeame_session";

function secret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "tikeame-dev-secret-change-me";
}

function sign(userId: string) {
  return `${userId}.${createHmac("sha256", secret()).update(userId).digest("hex")}`;
}

function verify(token: string | undefined) {
  if (!token || !token.includes(".")) return null;
  const userId = token.slice(0, token.indexOf("."));
  const expected = sign(userId);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;
  return userId;
}

export async function setSession(user: User) {
  const jar = await cookies();
  jar.set(COOKIE, sign(user.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.VERCEL === "1",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function currentUser(): Promise<User | null> {
  const jar = await cookies();
  const userId = verify(jar.get(COOKIE)?.value);
  if (!userId) return null;
  return db().users.find((u) => u.id === userId) ?? null;
}

export { authenticate, createUser, findUserByEmail };
export type { Role, User };
