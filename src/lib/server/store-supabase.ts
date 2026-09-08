import { ConfigError } from "./env";
import { hashPassword } from "./password";
import type { OrderRow, Role, ScanRow, StoreDriver, TicketRow, User } from "./types";

function creds() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new ConfigError("Falta SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.");
  return { url: url.replace(/\/$/, ""), key };
}

async function sb<T>(path: string, init?: RequestInit): Promise<T> {
  const { url, key } = creds();
  const res = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 409) throw new Error("Ese email ya está registrado");
    throw new ConfigError(`Supabase ${res.status}: ${text.slice(0, 240)}`);
  }
  if (res.status === 204) return null as T;
  const text = await res.text();
  if (!text) return null as T;
  return JSON.parse(text) as T;
}

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  password_hash: string;
};

type OrderDb = {
  id: string;
  email: string;
  status: string;
  view_token: string;
  payload: OrderRow;
};

type TicketDb = {
  id: string;
  order_id: string;
  status: string;
  payload: TicketRow;
  used_at: string | null;
};

type ScanDb = { id: string; ticket_id: string; payload: ScanRow };

function toUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    passwordHash: row.password_hash,
  };
}

function toOrder(row: OrderDb): OrderRow {
  return { ...row.payload, id: row.id, email: row.email, status: row.status as OrderRow["status"], viewToken: row.view_token };
}

export const supabaseStore: StoreDriver = {
  async findUserByEmail(email) {
    const rows = await sb<UserRow[]>(`tikeame_users?email=eq.${encodeURIComponent(email.toLowerCase())}&select=*`);
    return rows?.[0] ? toUser(rows[0]) : null;
  },
  async findUserById(id) {
    const rows = await sb<UserRow[]>(`tikeame_users?id=eq.${encodeURIComponent(id)}&select=*`);
    return rows?.[0] ? toUser(rows[0]) : null;
  },
  async createUser(input) {
    const user: User = {
      id: `u-${Date.now().toString(36)}`,
      name: input.name,
      email: input.email.toLowerCase(),
      role: input.role,
      passwordHash: hashPassword(input.password),
    };
    await sb("tikeame_users", {
      method: "POST",
      body: JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        password_hash: user.passwordHash,
      }),
    });
    return user;
  },
  async listUsers() {
    const rows = await sb<UserRow[]>("tikeame_users?select=*&order=created_at.desc&limit=300");
    return (rows ?? []).map(toUser);
  },
  async putOrder(order) {
    await sb("tikeame_orders?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        id: order.id,
        email: order.email,
        status: order.status,
        view_token: order.viewToken,
        payload: order,
      }),
    });
  },
  async getOrder(id) {
    const rows = await sb<OrderDb[]>(`tikeame_orders?id=eq.${encodeURIComponent(id)}&select=*`);
    return rows?.[0] ? toOrder(rows[0]) : null;
  },
  async ordersByEmail(email) {
    const rows = await sb<OrderDb[]>(
      `tikeame_orders?email=eq.${encodeURIComponent(email.toLowerCase())}&status=eq.paid&select=*`,
    );
    return (rows ?? []).map(toOrder);
  },
  async listOrders() {
    const rows = await sb<OrderDb[]>("tikeame_orders?select=*&order=created_at.desc&limit=300");
    return (rows ?? []).map(toOrder);
  },
  async putTickets(tickets) {
    if (tickets.length === 0) return;
    await sb("tikeame_tickets?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify(
        tickets.map((t) => ({
          id: t.id,
          order_id: t.orderId,
          status: t.status,
          payload: t,
          used_at: t.usedAt,
        })),
      ),
    });
  },
  async ticketsForOrder(orderId) {
    const rows = await sb<TicketDb[]>(`tikeame_tickets?order_id=eq.${encodeURIComponent(orderId)}&select=*`);
    return (rows ?? []).map((r) => r.payload);
  },
  async getTicket(id) {
    const rows = await sb<TicketDb[]>(`tikeame_tickets?id=eq.${encodeURIComponent(id)}&select=*`);
    return rows?.[0]?.payload ?? null;
  },
  async listTickets() {
    const rows = await sb<TicketDb[]>("tikeame_tickets?select=*&order=id.desc&limit=400");
    return (rows ?? []).map((r) => r.payload);
  },
  async markTicketUsed(id) {
    const ticket = await supabaseStore.getTicket(id);
    if (!ticket) return null;
    ticket.status = "used";
    ticket.usedAt = new Date().toISOString();
    await sb(`tikeame_tickets?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ status: "used", used_at: ticket.usedAt, payload: ticket }),
    });
    return ticket;
  },
  async addScan(scan) {
    await sb("tikeame_scans", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ id: scan.id, ticket_id: scan.ticketId, payload: scan }),
    });
  },
  async listScans() {
    const rows = await sb<ScanDb[]>("tikeame_scans?select=payload&order=created_at.desc&limit=200");
    return (rows ?? []).map((r) => r.payload);
  },
  async paidCount() {
    const rows = await sb<{ id: string }[]>("tikeame_tickets?status=eq.used&select=id");
    return (rows ?? []).length;
  },
  async soldCount() {
    const rows = await sb<{ id: string }[]>("tikeame_tickets?select=id");
    return (rows ?? []).length;
  },
};
