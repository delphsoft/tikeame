import Link from "next/link";
import { AdminHeader } from "@/components/AdminHeader";
import { fmtARS } from "@/lib/money";
import { listOrders, listScans, listTickets, listUsers } from "@/lib/server/store";

export const dynamic = "force-dynamic";

function fmtWhen(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
}

function roleLabel(role: string) {
  if (role === "admin") return "Super admin";
  if (role === "organizer") return "Organizador";
  return "Comprador";
}

function statusClass(status: string) {
  if (status === "paid" || status === "valid" || status === "on_sale") return "bg-teal text-white";
  if (status === "used") return "bg-coral text-white";
  if (status === "pending") return "bg-wash text-muted";
  return "bg-ink text-cream";
}

export default async function AdminPage() {
  const [users, orders, tickets, scans] = await Promise.all([
    listUsers(),
    listOrders(),
    listTickets(),
    listScans(),
  ]);

  const buyers = users.filter((u) => u.role === "buyer").length;
  const organizers = users.filter((u) => u.role === "organizer").length;
  const admins = users.filter((u) => u.role === "admin").length;
  const paid = orders.filter((o) => o.status === "paid");
  const failed = orders.filter((o) => o.status === "failed");
  const pending = orders.filter((o) => o.status === "pending");
  const gmv = paid.reduce((s, o) => s + o.total, 0);
  const take = paid.reduce((s, o) => s + o.fee, 0);
  const used = tickets.filter((t) => t.status === "used").length;

  // Métricas de negocio: funnel de conversión, ticket promedio y ranking por evento.
  const attempted = paid.length + failed.length;
  const conversionRate = attempted > 0 ? (paid.length / attempted) * 100 : 0;
  const aov = paid.length > 0 ? gmv / paid.length : 0;
  const checkinRate = tickets.length > 0 ? (used / tickets.length) * 100 : 0;

  const byEvent = new Map<
    string,
    { title: string; gmv: number; fee: number; orders: number; tickets: number; used: number }
  >();
  for (const o of paid) {
    const row = byEvent.get(o.eventSlug) ?? {
      title: o.eventTitle,
      gmv: 0,
      fee: 0,
      orders: 0,
      tickets: 0,
      used: 0,
    };
    row.gmv += o.total;
    row.fee += o.fee;
    row.orders += 1;
    byEvent.set(o.eventSlug, row);
  }
  for (const t of tickets) {
    const row = byEvent.get(t.eventSlug);
    if (!row) continue;
    row.tickets += 1;
    if (t.status === "used") row.used += 1;
  }
  const eventRanking = [...byEvent.entries()].sort((a, b) => b[1].gmv - a[1].gmv);

  return (
    <div className="min-h-screen bg-cream">
      <AdminHeader active="resumen" />
      <div className="mx-auto max-w-[1160px] px-5 py-9 md:px-10">
        <div className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-coral">
          Tickeame · plataforma
        </div>
        <h1 className="mt-1 font-display text-[28px] uppercase">Super admin</h1>
        <p className="mt-1 max-w-xl text-[13px] text-muted">
          Usuarios, órdenes, tickets y check-ins reales. Tickeame nunca custodia fondos: el cobro
          va por Mercado Pago.
        </p>

        <div className="mt-7 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "GMV cobrado", value: fmtARS(gmv), sub: `${paid.length} órdenes pagas` },
            { label: "Comisión", value: fmtARS(take), sub: "fee Tickeame" },
            { label: "Tickets", value: String(tickets.length), sub: `${used} usados en puerta` },
            {
              label: "Usuarios",
              value: String(users.length),
              sub: `${buyers} compradores · ${organizers} orgs · ${admins} admin`,
            },
          ].map((s, i) => (
            <div
              key={s.label}
              className="dash-in rounded-md border-2 border-ink bg-white p-[18px]"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="text-[11px] font-extrabold uppercase text-muted">{s.label}</div>
              <div className="mt-2 font-display text-[26px]">{s.value}</div>
              <div className="mt-1 text-xs font-bold text-teal">{s.sub}</div>
            </div>
          ))}
        </div>

        <section id="metricas" className="mt-10">
          <h2 className="font-display text-2xl uppercase">Métricas</h2>
          <p className="mt-1 text-[13px] text-muted">
            Conversión, ticket promedio y ranking por evento — calculado sobre tus órdenes y tickets reales.
          </p>
          <div className="mt-4 grid gap-3.5 sm:grid-cols-3">
            {[
              {
                label: "Conversión de pago",
                value: `${conversionRate.toFixed(0)}%`,
                sub: `${paid.length} pagas de ${attempted} intentadas${pending.length ? ` · ${pending.length} pendientes` : ""}`,
              },
              {
                label: "Ticket promedio",
                value: fmtARS(aov),
                sub: `sobre ${paid.length} órdenes pagas`,
              },
              {
                label: "Check-in en puerta",
                value: `${checkinRate.toFixed(0)}%`,
                sub: `${used} usados de ${tickets.length} emitidos`,
              },
            ].map((s) => (
              <div key={s.label} className="rounded-md border-2 border-ink bg-white p-[18px]">
                <div className="text-[11px] font-extrabold uppercase text-muted">{s.label}</div>
                <div className="mt-2 font-display text-[26px]">{s.value}</div>
                <div className="mt-1 text-xs font-bold text-teal">{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 overflow-x-auto rounded-md border-2 border-ink bg-white">
            <div className="grid min-w-[720px] grid-cols-[1.6fr_.8fr_.8fr_.7fr_.8fr_.8fr] bg-cream px-4 py-2.5 text-[11px] font-extrabold uppercase text-muted">
              <div>Evento</div>
              <div>GMV</div>
              <div>Comisión</div>
              <div>Órdenes</div>
              <div>Tickets</div>
              <div>Check-in</div>
            </div>
            {eventRanking.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted">Todavía no hay ventas pagas.</p>
            ) : (
              eventRanking.map(([slug, row]) => (
                <div
                  key={slug}
                  className="grid min-w-[720px] grid-cols-[1.6fr_.8fr_.8fr_.7fr_.8fr_.8fr] items-center border-t border-border px-4 py-3 text-[13px]"
                >
                  <div>
                    <Link href={`/eventos/${slug}`} className="font-bold hover:text-coral">
                      {row.title}
                    </Link>
                  </div>
                  <div>{fmtARS(row.gmv)}</div>
                  <div>{fmtARS(row.fee)}</div>
                  <div>{row.orders}</div>
                  <div>{row.tickets}</div>
                  <div>{row.tickets > 0 ? `${((row.used / row.tickets) * 100).toFixed(0)}%` : "—"}</div>
                </div>
              ))
            )}
          </div>
        </section>

        <section id="usuarios" className="mt-10">
          <h2 className="font-display text-2xl uppercase">Usuarios</h2>
          <div className="mt-4 overflow-x-auto rounded-md border-2 border-ink bg-white">
            <div className="grid min-w-[640px] grid-cols-[1.2fr_1.4fr_.9fr_.7fr] bg-cream px-4 py-2.5 text-[11px] font-extrabold uppercase text-muted">
              <div>Nombre</div>
              <div>Email</div>
              <div>Rol</div>
              <div>Id</div>
            </div>
            {users.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted">Todavía no hay cuentas.</p>
            ) : (
              users.map((u) => (
                <div
                  key={u.id}
                  className="grid min-w-[640px] grid-cols-[1.2fr_1.4fr_.9fr_.7fr] items-center border-t border-border px-4 py-3 text-[13px]"
                >
                  <div className="font-bold">{u.name}</div>
                  <div className="truncate text-muted">{u.email}</div>
                  <div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${statusClass(u.role)}`}>
                      {roleLabel(u.role)}
                    </span>
                  </div>
                  <div className="truncate font-mono text-[11px] text-muted">{u.id}</div>
                </div>
              ))
            )}
          </div>
        </section>

        <section id="ordenes" className="mt-10">
          <h2 className="font-display text-2xl uppercase">Órdenes</h2>
          <div className="mt-4 overflow-x-auto rounded-md border-2 border-ink bg-white">
            <div className="grid min-w-[760px] grid-cols-[1fr_1.2fr_1.3fr_.7fr_.7fr_.9fr] bg-cream px-4 py-2.5 text-[11px] font-extrabold uppercase text-muted">
              <div>Orden</div>
              <div>Comprador</div>
              <div>Evento</div>
              <div>Total</div>
              <div>Estado</div>
              <div>Cuando</div>
            </div>
            {orders.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted">Sin compras todavía.</p>
            ) : (
              orders.map((o) => (
                <div
                  key={o.id}
                  className="grid min-w-[760px] grid-cols-[1fr_1.2fr_1.3fr_.7fr_.7fr_.9fr] items-center border-t border-border px-4 py-3 text-[13px]"
                >
                  <div className="font-mono text-[12px] font-bold">{o.id}</div>
                  <div>
                    <div className="font-bold">{o.buyerName}</div>
                    <div className="truncate text-xs text-muted">{o.email}</div>
                  </div>
                  <div>
                    <Link href={`/eventos/${o.eventSlug}`} className="font-bold hover:text-coral">
                      {o.eventTitle}
                    </Link>
                  </div>
                  <div>{fmtARS(o.total)}</div>
                  <div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${statusClass(o.status)}`}>
                      {o.status}
                    </span>
                  </div>
                  <div className="text-xs text-muted">{fmtWhen(o.createdAt)}</div>
                </div>
              ))
            )}
          </div>
        </section>

        <section id="tickets" className="mt-10">
          <h2 className="font-display text-2xl uppercase">Tickets</h2>
          <div className="mt-4 overflow-x-auto rounded-md border-2 border-ink bg-white">
            <div className="grid min-w-[720px] grid-cols-[1.1fr_.9fr_1fr_.7fr_.9fr] bg-cream px-4 py-2.5 text-[11px] font-extrabold uppercase text-muted">
              <div>Ticket</div>
              <div>Orden</div>
              <div>Tipo</div>
              <div>Estado</div>
              <div>Usado</div>
            </div>
            {tickets.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted">Sin tickets emitidos.</p>
            ) : (
              tickets.map((t) => (
                <div
                  key={t.id}
                  className="grid min-w-[720px] grid-cols-[1.1fr_.9fr_1fr_.7fr_.9fr] items-center border-t border-border px-4 py-3 text-[13px]"
                >
                  <div className="font-mono text-[12px] font-bold">{t.id}</div>
                  <div className="font-mono text-[12px] text-muted">{t.orderId}</div>
                  <div>
                    {t.name} · {t.eventSlug}
                  </div>
                  <div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${statusClass(t.status)}`}>
                      {t.status}
                    </span>
                  </div>
                  <div className="text-xs text-muted">{fmtWhen(t.usedAt)}</div>
                </div>
              ))
            )}
          </div>
        </section>

        <section id="checkins" className="mt-10 mb-8">
          <h2 className="font-display text-2xl uppercase">Check-ins</h2>
          <div className="mt-4 overflow-hidden rounded-md border-2 border-ink bg-white">
            <div className="grid grid-cols-[1fr_1fr_.8fr_.8fr] bg-cream px-4 py-2.5 text-[11px] font-extrabold uppercase text-muted">
              <div>Ticket</div>
              <div>Nombre</div>
              <div>Resultado</div>
              <div>Hora</div>
            </div>
            {scans.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted">Nadie escaneó todavía.</p>
            ) : (
              scans.map((s) => (
                <div
                  key={s.id}
                  className="grid grid-cols-[1fr_1fr_.8fr_.8fr] items-center border-t border-border px-4 py-3 text-[13px]"
                >
                  <div className="font-mono text-[12px]">{s.ticketId}</div>
                  <div className="font-bold">{s.name}</div>
                  <div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${statusClass(s.status)}`}>
                      {s.status}
                    </span>
                  </div>
                  <div className="text-xs text-muted">{s.time}</div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
