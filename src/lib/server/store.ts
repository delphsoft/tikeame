import { randomBytes } from "node:crypto";
import { requirePersistentStore, supabaseConfigured } from "./env";
import { verifyPassword } from "./password";
import { memoryStore } from "./store-memory";
import { supabaseStore } from "./store-supabase";
import type { OrderRow, Role, ScanRow, StoreDriver, TicketRow } from "./types";

export type { OrderItem, OrderRow, Role, ScanRow, TicketRow, User } from "./types";

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

export async function createUser(input: { name: string; email: string; password: string; role: Role }) {
  return driver().createUser(input);
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
