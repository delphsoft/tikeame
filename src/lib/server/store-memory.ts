import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { hosted } from "./env";
import { hashPassword } from "./password";
import type {
  EventRecord,
  MpTokens,
  OrderRow,
  OrganizerProfile,
  Role,
  ScanRow,
  StoreDriver,
  TicketRow,
  User,
} from "./types";

type Db = {
  users: User[];
  orders: OrderRow[];
  tickets: TicketRow[];
  scans: ScanRow[];
  events: EventRecord[];
  profiles: Record<string, OrganizerProfile>;
  mpTokens: Record<string, MpTokens>;
};

function emptyDb(): Db {
  const users: User[] = hosted()
    ? []
    : [
        {
          id: "u-buyer",
          name: "Guadalupe Fernández",
          email: "hola@tickeame.com.ar",
          role: "buyer",
          passwordHash: hashPassword("tikeame"),
        },
        {
          id: "u-org",
          name: "Tiko Producciones",
          email: "organizador@tickeame.com.ar",
          role: "organizer",
          passwordHash: hashPassword("tikeame"),
        },
        {
          id: "u-admin",
          name: "Super admin",
          email: "admin@tickeame.com.ar",
          role: "admin",
          passwordHash: hashPassword("tikeame"),
        },
      ];
  return { users, orders: [], tickets: [], scans: [], events: [], profiles: {}, mpTokens: {} };
}

const g = globalThis as typeof globalThis & { __tikeameDb?: Db };

function filePath() {
  const dir = join(process.cwd(), ".data");
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

export const memoryStore: StoreDriver = {
  async findUserByEmail(email) {
    return load().users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  },
  async findUserById(id) {
    return load().users.find((u) => u.id === id) ?? null;
  },
  async createUser(input: {
    name: string;
    email: string;
    password: string;
    role: Role;
    profile?: OrganizerProfile | null;
  }) {
    const dbx = load();
    if (dbx.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      throw new Error("Ese email ya está registrado");
    }
    const user: User = {
      id: `u-${Date.now().toString(36)}`,
      name: input.name,
      email: input.email.toLowerCase(),
      role: input.role,
      passwordHash: hashPassword(input.password),
      profile: input.profile ?? null,
    };
    dbx.users.push(user);
    if (input.profile) dbx.profiles[user.id] = input.profile;
    save(dbx);
    return user;
  },
  async getOrganizerProfile(userId) {
    const dbx = load();
    const profile = dbx.profiles[userId];
    if (!profile) return null;
    const tokens = dbx.mpTokens[userId];
    return { ...profile, mpConnected: Boolean(tokens?.accessToken), mpUserId: tokens?.userId ?? null };
  },
  async saveMpTokens(userId, tokens) {
    const dbx = load();
    dbx.mpTokens[userId] = tokens;
    save(dbx);
  },
  async getMpTokens(userId) {
    return load().mpTokens[userId] ?? null;
  },
  async putEvent(event) {
    const dbx = load();
    const i = dbx.events.findIndex((e) => e.slug === event.slug);
    if (i >= 0) dbx.events[i] = event;
    else dbx.events.unshift(event);
    save(dbx);
  },
  async getEvent(slug) {
    return load().events.find((e) => e.slug === slug) ?? null;
  },
  async listEvents(filter) {
    return load().events.filter((e) => {
      if (filter?.organizerId && e.organizerId !== filter.organizerId) return false;
      if (filter?.status && e.status !== filter.status) return false;
      return true;
    });
  },
  async organizerMonthlyGmv(organizerId, when = new Date()) {
    const start = new Date(when.getFullYear(), when.getMonth(), 1).toISOString();
    const end = new Date(when.getFullYear(), when.getMonth() + 1, 1).toISOString();
    return load()
      .orders.filter(
        (o) =>
          o.status === "paid" &&
          o.organizerId === organizerId &&
          o.createdAt >= start &&
          o.createdAt < end,
      )
      .reduce((s, o) => s + o.subtotal, 0);
  },
  async listUsers() {
    return load().users;
  },
  async putOrder(order) {
    const dbx = load();
    const i = dbx.orders.findIndex((o) => o.id === order.id);
    if (i >= 0) dbx.orders[i] = order;
    else dbx.orders.unshift(order);
    save(dbx);
  },
  async getOrder(id) {
    return load().orders.find((o) => o.id === id) ?? null;
  },
  async ordersByEmail(email) {
    return load().orders.filter((o) => o.email.toLowerCase() === email.toLowerCase() && o.status === "paid");
  },
  async listOrders() {
    return load().orders.filter((o) => o.status === "paid" || o.status === "pending" || o.status === "failed");
  },
  async putTickets(tickets) {
    const dbx = load();
    for (const t of tickets) {
      if (!dbx.tickets.some((x) => x.id === t.id)) dbx.tickets.push(t);
    }
    save(dbx);
  },
  async ticketsForOrder(orderId) {
    return load().tickets.filter((t) => t.orderId === orderId);
  },
  async getTicket(id) {
    return load().tickets.find((t) => t.id === id) ?? null;
  },
  async listTickets() {
    return load().tickets;
  },
  async markTicketUsed(id) {
    const dbx = load();
    const t = dbx.tickets.find((x) => x.id === id);
    if (!t) return null;
    t.status = "used";
    t.usedAt = new Date().toISOString();
    save(dbx);
    return t;
  },
  async addScan(scan) {
    const dbx = load();
    dbx.scans.unshift(scan);
    dbx.scans = dbx.scans.slice(0, 40);
    save(dbx);
  },
  async listScans() {
    return load().scans;
  },
  async paidCount() {
    return load().tickets.filter((t) => t.status === "used").length;
  },
  async soldCount() {
    return load().tickets.length;
  },
};


