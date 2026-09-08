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
  createUser(input: { name: string; email: string; password: string; role: Role }): Promise<User>;
  putOrder(order: OrderRow): Promise<void>;
  getOrder(id: string): Promise<OrderRow | null>;
  ordersByEmail(email: string): Promise<OrderRow[]>;
  putTickets(tickets: TicketRow[]): Promise<void>;
  ticketsForOrder(orderId: string): Promise<TicketRow[]>;
  getTicket(id: string): Promise<TicketRow | null>;
  markTicketUsed(id: string): Promise<TicketRow | null>;
  addScan(scan: ScanRow): Promise<void>;
  listScans(): Promise<ScanRow[]>;
  paidCount(): Promise<number>;
  soldCount(): Promise<number>;
};
