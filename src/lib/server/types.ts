import type { FeePayer, FeePlan, PaymentMethod } from "@/lib/pricing";

export type Role = "buyer" | "organizer" | "admin";

export type OrganizerProfile = {
  cuit: string | null;
  razonSocial: string | null;
  condicionIva: string | null;
  domicilioFiscal: string | null;
  feePlan: FeePlan;
  mpConnected?: boolean;
  mpUserId?: string | null;
};

export type MpTokens = {
  accessToken: string;
  refreshToken: string;
  userId: string;
  expiresAt: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  passwordHash: string;
  profile?: OrganizerProfile | null;
};

export type EventStatus = "draft" | "on_sale" | "paused" | "sold_out";

export type EventTicket = {
  key: string;
  name: string;
  price: number;
  cap: number;
  sold: number;
  note: string | null;
};

export type EventRecord = {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  dateLabel: string;
  timeLabel: string;
  dateISO: string;
  venue: string;
  venueName: string;
  venueAddress: string;
  mapsQuery: string;
  about: string;
  lineup: string[];
  hero: string;
  status: EventStatus;
  organizerId: string;
  organizerName: string;
  featured: boolean;
  cityId: string;
  lat: number;
  lng: number;
  tickets: EventTicket[];
  /** Tramo del cargo de servicio (15/12/9) congelado al publicar (plan percent). */
  platformPct?: number;
  tierLabel?: string;
  /** Quién paga MP + Tickeame. Se puede cambiar solo mientras no haya ventas. */
  feePayer?: FeePayer;
  /** Descuento al comprador si paga por transferencia (0–10%). Fijo tras la primera venta. */
  transferDiscountPct?: number;
};

export type ReserveItem = { key: string; qty: number };
export type ReserveResult = { ok: true } | { ok: false; error: string };

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
  processorFee?: number;
  platformFee?: number;
  paymentMethod?: PaymentMethod;
  feePayer?: FeePayer;
  /** Precio de lista antes del descuento por transferencia. */
  listSubtotal?: number;
  discount?: number;
  organizerId?: string | null;
  total: number;
  status: "pending" | "paid" | "failed";
  mpPreferenceId: string | null;
  mpPaymentId: string | null;
  viewToken: string;
  createdAt: string;
  /** true mientras la orden tiene cupo tomado (pending o paid). */
  reserved?: boolean;
  /** Vencimiento de la reserva si sigue pending. */
  expiresAt?: string;
  failReason?: "rejected" | "expired" | "mp_error" | "no_stock_on_late_payment";
  /** Pago aprobado que no pudo emitirse (ej. llegó tarde y no había cupo): requiere devolución. */
  refundRequired?: boolean;
};

export type ScanRow = {
  id: string;
  ticketId: string;
  name: string;
  type: string;
  status: "valid" | "used" | "invalid" | "wrong_event";
  time: string;
  eventSlug?: string | null;
  organizerId?: string | null;
};

export type StoreDriver = {
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
  createUser(input: {
    name: string;
    email: string;
    password: string;
    role: Role;
    profile?: OrganizerProfile | null;
  }): Promise<User>;
  listUsers(): Promise<User[]>;
  getOrganizerProfile(userId: string): Promise<OrganizerProfile | null>;
  saveMpTokens(userId: string, tokens: MpTokens): Promise<void>;
  getMpTokens(userId: string): Promise<MpTokens | null>;
  putEvent(event: EventRecord): Promise<void>;
  getEvent(slug: string): Promise<EventRecord | null>;
  listEvents(filter?: { organizerId?: string; status?: EventStatus }): Promise<EventRecord[]>;
  organizerMonthlyGmv(organizerId: string, when?: Date): Promise<number>;
  putOrder(order: OrderRow): Promise<void>;
  getOrder(id: string): Promise<OrderRow | null>;
  ordersByEmail(email: string): Promise<OrderRow[]>;
  listOrders(): Promise<OrderRow[]>;
  putTickets(tickets: TicketRow[]): Promise<void>;
  ticketsForOrder(orderId: string): Promise<TicketRow[]>;
  getTicket(id: string): Promise<TicketRow | null>;
  listTickets(): Promise<TicketRow[]>;
  markTicketUsed(id: string): Promise<TicketRow | null>;
  addScan(scan: ScanRow): Promise<void>;
  listScans(filter?: { organizerId?: string }): Promise<ScanRow[]>;
  /** Toma (delta=1) o devuelve (delta=-1) cupo de forma atómica. Pasa a sold_out / on_sale solo. */
  reserveTickets(slug: string, items: ReserveItem[], delta: 1 | -1): Promise<ReserveResult>;
  findProfileByCuit(cuit: string): Promise<string | null>;
  ticketsForEvent(slug: string): Promise<TicketRow[]>;
  pendingOrdersBefore(iso: string): Promise<OrderRow[]>;
  paidCount(): Promise<number>;
  soldCount(): Promise<number>;
};
