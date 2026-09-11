import { randomBytes } from "node:crypto";
import { requirePersistentStore, supabaseConfigured } from "./env";
import { verifyPassword } from "./password";
import { mpOAuthRefresh } from "./mp";
import { memoryStore } from "./store-memory";
import { supabaseStore } from "./store-supabase";
import type { EventRecord, EventStatus, MpTokens, OrderRow, OrganizerProfile, Role, ScanRow, StoreDriver, TicketRow } from "./types";

export type { EventRecord, EventStatus, OrderItem, OrderRow, OrganizerProfile, Role, ScanRow, TicketRow, User } from "./types";

function driver(): StoreDriver {
  requirePersistentStore();
  return supabaseConfigured() ? supabaseStore : memoryStore;
}

export function newId(prefix: string) {
  return `${prefix}-${randomBytes(6).toString("hex")}`;
}

export function newViewToken() {
  return randomBytes(16).toString("hex");
}

export function newOrderId() {
  return `TK-${randomBytes(6).toString("hex").toUpperCase()}`;
}

export async function findUserByEmail(email: string) {
  return driver().findUserByEmail(email);
}

export async function findUserById(id: string) {
  return driver().findUserById(id);
}

export async function authenticate(email: string, password: string) {
  const user = await driver().findUserByEmail(email);
  if (!user) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;
  return user;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role: Role;
  profile?: OrganizerProfile | null;
}) {
  return driver().createUser(input);
}

export async function getOrganizerProfile(userId: string) {
  return driver().getOrganizerProfile(userId);
}

export async function saveMpTokens(userId: string, tokens: MpTokens) {
  return driver().saveMpTokens(userId, tokens);
}

export async function getMpTokens(userId: string) {
  return driver().getMpTokens(userId);
}

export async function getSellerAccessToken(userId: string): Promise<string | null> {
  const tokens = await driver().getMpTokens(userId);
  if (!tokens?.accessToken) return null;
  const exp = Date.parse(tokens.expiresAt);
  const soon = Date.now() + 24 * 60 * 60 * 1000;
  if (!Number.isFinite(exp) || exp > soon) return tokens.accessToken;
  if (!tokens.refreshToken) return tokens.accessToken;
  try {
    const next = await mpOAuthRefresh(tokens.refreshToken);
    await driver().saveMpTokens(userId, next);
    return next.accessToken;
  } catch {
    return tokens.accessToken;
  }
}

export async function putEvent(event: EventRecord) {
  return driver().putEvent(event);
}

export async function getEvent(slug: string) {
  return driver().getEvent(slug);
}

export async function listEvents(filter?: { organizerId?: string; status?: EventStatus }) {
  return driver().listEvents(filter);
}

export async function organizerMonthlyGmv(organizerId: string, when?: Date) {
  return driver().organizerMonthlyGmv(organizerId, when);
}

export async function listUsers() {
  return driver().listUsers();
}

export async function putOrder(order: OrderRow) {
  return driver().putOrder(order);
}

export async function getOrder(id: string) {
  return driver().getOrder(id);
}

export async function ordersByEmail(email: string) {
  return driver().ordersByEmail(email);
}

export async function listOrders() {
  return driver().listOrders();
}

export async function putTickets(tickets: TicketRow[]) {
  return driver().putTickets(tickets);
}

export async function ticketsForOrder(orderId: string) {
  return driver().ticketsForOrder(orderId);
}

export async function ticketsByEmail(email: string) {
  const orders = await driver().ordersByEmail(email);
  const ids = new Set(orders.map((o) => o.id));
  const all: TicketRow[] = [];
  for (const id of ids) {
    all.push(...(await driver().ticketsForOrder(id)));
  }
  return all;
}

export async function getTicket(id: string) {
  return driver().getTicket(id);
}

export async function listTickets() {
  return driver().listTickets();
}

export async function markTicketUsed(id: string) {
  return driver().markTicketUsed(id);
}

export async function addScan(scan: ScanRow) {
  return driver().addScan(scan);
}

export async function listScans() {
  return driver().listScans();
}

export async function paidCount() {
  return driver().paidCount();
}

export async function soldCount() {
  return driver().soldCount();
}
