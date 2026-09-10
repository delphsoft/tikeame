import type { FeePlan, PaymentMethod } from "@/lib/pricing";

export type Role = "buyer" | "organizer" | "admin";

export type OrganizerProfile = {
  cuit: string | null;
  razonSocial: string | null;
  condicionIva: string | null;
  domicilioFiscal: string | null;
  feePlan: FeePlan;
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
  processorFee?: number;
  platformFee?: number;
  paymentMethod?: PaymentMethod;
  organizerId?: string | null;
  total: number;
  status: "pending" | "paid" | "failed";
  mpPreferenceId: string | null;
  mpPaymentId: string | null;
  viewToken: string;
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
  listScans(): Promise<ScanRow[]>;
  paidCount(): Promise<number>;
  soldCount(): Promise<number>;
};
