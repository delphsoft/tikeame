import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type Role = "buyer" | "organizer" | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  passwordHash: string;
};

export type OrderItem = { key: string; name: string; qty: number; unitPrice: number };

export type TicketRow = {
  id: string;
  orderId: string;
  eventSlug: string;
  name: string;
  key: string;
  status: "valid" | "used";
  usedAt: string | null;
};

export type OrderRow = {
  id: string;
  eventSlug: string;
  eventTitle: string;
  eventDate: string;
  venue: string;
  email: string;
  buyerName: string;
  dni: string;
  iva: string;
  items: OrderItem[];
  subtotal: number;
  fee: number;
  total: number;
  status: "pending" | "paid" | "failed";
  mpPreferenceId: string | null;
  mpPaymentId: string | null;
  createdAt: string;
};

export type ScanRow = {
  id: string;
  ticketId: string;
  name: string;
  type: string;
  status: "valid" | "used" | "invalid";
  time: string;
};

type Db = {
  users: User[];
  orders: OrderRow[];
  tickets: TicketRow[];
  scans: ScanRow[];
};

function hashPassword(password: string, salt?: string) {
  const s = salt ?? randomBytes(16).toString("hex");
  const hash = scryptSync(password, s, 32).toString("hex");
  return `${s}:${hash}`;
}

function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 32);
  const prev = Buffer.from(hash, "hex");
  if (next.length !== prev.length) return false;
  return timingSafeEqual(next, prev);
}

function emptyDb(): Db {
  return {
    users: [
      {
        id: "u-buyer",
        name: "Guadalupe Fernández",
        email: "hola@tikeame.com.ar",
        role: "buyer",
        passwordHash: hashPassword("tikeame"),
      },
      {
        id: "u-org",
        name: "Tiko Producciones",
        email: "organizador@tikeame.com.ar",
        role: "organizer",
        passwordHash: hashPassword("tikeame"),
      },
      {
        id: "u-admin",
        name: "Super admin",
        email: "admin@tikeame.com.ar",
        role: "admin",
        passwordHash: hashPassword("tikeame"),
      },
    ],
    orders: [],
    tickets: [],
    scans: [],
  };
}

const g = globalThis as typeof globalThis & { __tikeameDb?: Db };

function filePath() {
  const dir = process.env.VERCEL ? "/tmp" : join(process.cwd(), ".data");
  try {
    mkdirSync(dir, { recursive: true });
  } catch {
    /* ignore */
  }
  return join(dir, "tikeame-store.json");
}

function load(): Db {
  if (g.__tikeameDb) return g.__tikeameDb;
  try {
    const raw = readFileSync(filePath(), "utf8");
    g.__tikeameDb = JSON.parse(raw) as Db;
    return g.__tikeameDb;
  } catch {
    g.__tikeameDb = emptyDb();
    return g.__tikeameDb;
  }
}

function save(db: Db) {
  g.__tikeameDb = db;
  try {
    writeFileSync(filePath(), JSON.stringify(db));
  } catch {
    /* read-only fs */
  }
}

export function db() {
  return load();
}

export function persist() {
  save(load());
}

export function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${randomBytes(3).toString("hex")}`;
}

export function findUserByEmail(email: string) {
  return load().users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export function authenticate(email: string, password: string) {
  const user = findUserByEmail(email);
  if (!user) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;
  return user;
}

export function createUser(input: { name: string; email: string; password: string; role: Role }) {
  const dbx = load();
  if (dbx.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("Ese email ya está registrado");
  }
  const user: User = {
    id: newId("u"),
    name: input.name,
    email: input.email.toLowerCase(),
    role: input.role,
    passwordHash: hashPassword(input.password),
  };
  dbx.users.push(user);
  save(dbx);
  return user;
}

export function putOrder(order: OrderRow) {
  const dbx = load();
  const i = dbx.orders.findIndex((o) => o.id === order.id);
  if (i >= 0) dbx.orders[i] = order;
  else dbx.orders.unshift(order);
  save(dbx);
}

export function getOrder(id: string) {
  return load().orders.find((o) => o.id === id) ?? null;
}

export function ordersByEmail(email: string) {
  return load().orders.filter((o) => o.email.toLowerCase() === email.toLowerCase() && o.status === "paid");
}

export function putTickets(tickets: TicketRow[]) {
  const dbx = load();
  dbx.tickets.push(...tickets);
  save(dbx);
}

export function ticketsForOrder(orderId: string) {
  return load().tickets.filter((t) => t.orderId === orderId);
}

export function ticketsByEmail(email: string) {
  const ids = new Set(ordersByEmail(email).map((o) => o.id));
  return load().tickets.filter((t) => ids.has(t.orderId));
}

export function getTicket(id: string) {
  return load().tickets.find((t) => t.id === id) ?? null;
}

export function markTicketUsed(id: string) {
  const dbx = load();
  const t = dbx.tickets.find((x) => x.id === id);
  if (!t) return null;
  t.status = "used";
  t.usedAt = new Date().toISOString();
  save(dbx);
  return t;
}

export function addScan(scan: ScanRow) {
  const dbx = load();
  dbx.scans.unshift(scan);
  dbx.scans = dbx.scans.slice(0, 40);
  save(dbx);
}

export function listScans() {
  return load().scans;
}

export function paidCount() {
  return load().tickets.filter((t) => t.status === "used").length;
}

export function soldCount() {
  return load().tickets.length;
}
