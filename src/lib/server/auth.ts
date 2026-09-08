import { cookies } from "next/headers";
import { ConfigError } from "./env";
import { getSessionSecret, SESSION_COOKIE, signSession, verifySession } from "./session-token";
import { authenticate, createUser, findUserByEmail, findUserById, type Role, type User } from "./store";

export async function setSession(user: User) {
  if (!getSessionSecret()) {
    throw new ConfigError("Falta SESSION_SECRET en Vercel (mínimo 16 caracteres).");
  }
  const jar = await cookies();
  jar.set(SESSION_COOKIE, signSession(user.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.VERCEL === "1",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function currentUser(): Promise<User | null> {
  const jar = await cookies();
  const userId = verifySession(jar.get(SESSION_COOKIE)?.value);
  if (!userId) return null;
  try {
    return (await findUserById(userId)) ?? null;
  } catch {
    return null;
  }
}

export { authenticate, createUser, findUserByEmail };
export type { Role, User };
