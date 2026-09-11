import { ConfigError } from "./env";
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

function creds() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new ConfigError("Falta SUPABASE_URL y SUPABASE_SECRET_KEY (o SERVICE_ROLE).");
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

function toUser(row: UserRow, profile?: OrganizerProfile | null): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    passwordHash: row.password_hash,
    profile: profile ?? null,
  };
}

function missingTable(err: unknown) {
  return err instanceof ConfigError && /PGRST205|schema cache|Could not find the table/i.test(err.message);
}

type ProfileDb = {
  user_id: string;
  cuit: string | null;
  razon_social: string | null;
  condicion_iva: string | null;
  domicilio_fiscal: string | null;
  fee_plan: string | null;
  mp_user_id?: string | null;
  mp_access_token?: string | null;
  mp_refresh_token?: string | null;
  mp_token_expires_at?: string | null;
};

type ProfileDoc = OrganizerProfile & { tokens?: MpTokens | null };

function eventDocId(slug: string) {
  return `EVT-${slug}`;
}
function profileDocId(userId: string) {
  return `PRF-${userId}`;
}

type EventDb = { slug: string; organizer_id: string | null; status: string; payload: EventRecord };

function toProfile(row: ProfileDb): OrganizerProfile {
  return {
    cuit: row.cuit,
    razonSocial: row.razon_social,
    condicionIva: row.condicion_iva,
    domicilioFiscal: row.domicilio_fiscal,
    feePlan: row.fee_plan === "monthly" ? "monthly" : "percent",
    mpConnected: Boolean(row.mp_access_token),
    mpUserId: row.mp_user_id ?? null,
  };
}

async function loadProfile(userId: string): Promise<OrganizerProfile | null> {
  try {
    const rows = await sb<ProfileDb[]>(
      `tikeame_organizer_profiles?user_id=eq.${encodeURIComponent(userId)}&select=*`,
    );
    return rows?.[0] ? toProfile(rows[0]) : null;
  } catch (err) {
    if (!missingTable(err)) return null;
  }
  try {
    const rows = await sb<OrderDb[]>(`tikeame_orders?id=eq.${encodeURIComponent(profileDocId(userId))}&select=*`);
    const doc = rows?.[0]?.payload as unknown as ProfileDoc | undefined;
    if (!doc) return null;
    return {
      cuit: doc.cuit ?? null,
      razonSocial: doc.razonSocial ?? null,
      condicionIva: doc.condicionIva ?? null,
      domicilioFiscal: doc.domicilioFiscal ?? null,
      feePlan: doc.feePlan === "monthly" ? "monthly" : "percent",
      mpConnected: Boolean(doc.tokens?.accessToken),
      mpUserId: doc.tokens?.userId ?? null,
    };
  } catch {
    return null;
  }
}

async function loadMpTokens(userId: string): Promise<MpTokens | null> {
  try {
    const rows = await sb<ProfileDb[]>(
      `tikeame_organizer_profiles?user_id=eq.${encodeURIComponent(userId)}&select=*`,
    );
    const row = rows?.[0];
    if (row?.mp_access_token && row.mp_refresh_token) {
      return {
        accessToken: row.mp_access_token,
        refreshToken: row.mp_refresh_token,
        userId: row.mp_user_id || "",
        expiresAt: row.mp_token_expires_at || new Date().toISOString(),
      };
    }
  } catch (err) {
    if (!missingTable(err)) return null;
  }
  try {
    const rows = await sb<OrderDb[]>(`tikeame_orders?id=eq.${encodeURIComponent(profileDocId(userId))}&select=*`);
    const doc = rows?.[0]?.payload as unknown as ProfileDoc | undefined;
    return doc?.tokens ?? null;
  } catch {
    return null;
  }
}

async function persistProfileDoc(userId: string, patch: Partial<ProfileDoc>) {
  const existing = await sb<OrderDb[]>(`tikeame_orders?id=eq.${encodeURIComponent(profileDocId(userId))}&select=*`);
  const prev = (existing?.[0]?.payload as unknown as ProfileDoc) || {};
  const next: ProfileDoc = { ...prev, ...patch };
  await sb("tikeame_orders?on_conflict=id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      id: profileDocId(userId),
      email: `_profile_${userId}@tickeame.internal`,
      status: "org_profile",
      view_token: "profile",
      payload: next,
    }),
  });
}

function toOrder(row: OrderDb): OrderRow {
  return { ...row.payload, id: row.id, email: row.email, status: row.status as OrderRow["status"], viewToken: row.view_token };
}

export const supabaseStore: StoreDriver = {
  async findUserByEmail(email) {
    const rows = await sb<UserRow[]>(`tikeame_users?email=eq.${encodeURIComponent(email.toLowerCase())}&select=*`);
    if (!rows?.[0]) return null;
    const profile = await loadProfile(rows[0].id);
    return toUser(rows[0], profile);
  },
  async findUserById(id) {
    const rows = await sb<UserRow[]>(`tikeame_users?id=eq.${encodeURIComponent(id)}&select=*`);
    if (!rows?.[0]) return null;
    const profile = await loadProfile(rows[0].id);
    return toUser(rows[0], profile);
  },
  async createUser(input) {
    const user: User = {
      id: `u-${Date.now().toString(36)}`,
      name: input.name,
      email: input.email.toLowerCase(),
      role: input.role,
      passwordHash: hashPassword(input.password),
      profile: input.profile ?? null,
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
    if (input.profile) {
      try {
        await sb("tikeame_organizer_profiles?on_conflict=user_id", {
          method: "POST",
          headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
          body: JSON.stringify({
            user_id: user.id,
            cuit: input.profile.cuit,
            razon_social: input.profile.razonSocial,
            condicion_iva: input.profile.condicionIva,
            domicilio_fiscal: input.profile.domicilioFiscal,
            fee_plan: input.profile.feePlan,
          }),
        });
      } catch (err) {
        if (!missingTable(err)) throw err;
        await persistProfileDoc(user.id, input.profile);
      }
    }
    return user;
  },
  async getOrganizerProfile(userId) {
    return loadProfile(userId);
  },
  async saveMpTokens(userId, tokens) {
    try {
      await sb("tikeame_organizer_profiles?on_conflict=user_id", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({
          user_id: userId,
          mp_user_id: tokens.userId,
          mp_access_token: tokens.accessToken,
          mp_refresh_token: tokens.refreshToken,
          mp_token_expires_at: tokens.expiresAt,
        }),
      });
      return;
    } catch (err) {
      if (!missingTable(err)) throw err;
    }
    await persistProfileDoc(userId, { tokens, mpConnected: true, mpUserId: tokens.userId });
  },
  async getMpTokens(userId) {
    return loadMpTokens(userId);
  },
  async putEvent(event) {
    try {
      await sb("tikeame_events?on_conflict=slug", {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({
          slug: event.slug,
          organizer_id: event.organizerId,
          status: event.status,
          payload: event,
        }),
      });
      return;
    } catch (err) {
      if (!missingTable(err)) throw err;
    }
    await sb("tikeame_orders?on_conflict=id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        id: eventDocId(event.slug),
        email: `_event_${event.slug}@tickeame.internal`,
        status: "event",
        view_token: "event",
        payload: event,
      }),
    });
  },
  async getEvent(slug) {
    try {
      const rows = await sb<EventDb[]>(`tikeame_events?slug=eq.${encodeURIComponent(slug)}&select=*`);
      if (rows?.[0]?.payload) return rows[0].payload;
    } catch (err) {
      if (!missingTable(err)) throw err;
    }
    const rows = await sb<OrderDb[]>(`tikeame_orders?id=eq.${encodeURIComponent(eventDocId(slug))}&select=*`);
    return (rows?.[0]?.payload as unknown as EventRecord) ?? null;
  },
  async listEvents(filter) {
    try {
      const params = new URLSearchParams();
      params.set("select", "*");
      params.set("order", "created_at.desc");
      params.set("limit", "200");
      if (filter?.organizerId) params.set("organizer_id", `eq.${filter.organizerId}`);
      if (filter?.status) params.set("status", `eq.${filter.status}`);
      const rows = await sb<EventDb[]>(`tikeame_events?${params.toString()}`);
      return (rows ?? []).map((r) => r.payload);
    } catch (err) {
      if (!missingTable(err)) throw err;
    }
    const rows = await sb<OrderDb[]>("tikeame_orders?status=eq.event&select=*&order=created_at.desc&limit=200");
    return (rows ?? [])
      .map((r) => r.payload as unknown as EventRecord)
      .filter((e) => {
        if (filter?.organizerId && e.organizerId !== filter.organizerId) return false;
        if (filter?.status && e.status !== filter.status) return false;
        return true;
      });
  },
  async organizerMonthlyGmv(organizerId, when = new Date()) {
    const start = new Date(when.getFullYear(), when.getMonth(), 1).toISOString();
    const end = new Date(when.getFullYear(), when.getMonth() + 1, 1).toISOString();
    const rows = await sb<OrderDb[]>(
      `tikeame_orders?status=eq.paid&created_at=gte.${encodeURIComponent(start)}&created_at=lt.${encodeURIComponent(end)}&select=*`,
    );
    return (rows ?? [])
      .map(toOrder)
      .filter((o) => o.organizerId === organizerId)
      .reduce((s, o) => s + o.subtotal, 0);
  },
  async listUsers() {
    const rows = await sb<UserRow[]>("tikeame_users?select=*&order=created_at.desc&limit=300");
    return (rows ?? []).map((row) => toUser(row));
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
    const rows = await sb<OrderDb[]>(
      "tikeame_orders?status=in.(pending,paid,failed)&select=*&order=created_at.desc&limit=300",
    );
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
