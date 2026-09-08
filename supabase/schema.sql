-- Corré esto en el SQL editor de Supabase (service role bypasea RLS).
-- Anon key no tiene policies: no puede leer ni escribir.

create table if not exists tikeame_users (
  id text primary key,
  name text not null,
  email text unique not null,
  role text not null check (role in ('buyer', 'organizer', 'admin')),
  password_hash text not null,
  created_at timestamptz default now()
);

create table if not exists tikeame_orders (
  id text primary key,
  email text not null,
  status text not null,
  view_token text not null,
  payload jsonb not null,
  created_at timestamptz default now()
);

create table if not exists tikeame_tickets (
  id text primary key,
  order_id text references tikeame_orders(id),
  status text not null,
  payload jsonb not null,
  used_at timestamptz
);

create table if not exists tikeame_scans (
  id text primary key,
  ticket_id text,
  payload jsonb not null,
  created_at timestamptz default now()
);

create index if not exists tikeame_orders_email_idx on tikeame_orders (email);
create index if not exists tikeame_tickets_order_idx on tikeame_tickets (order_id);
create index if not exists tikeame_scans_created_idx on tikeame_scans (created_at desc);

alter table tikeame_users enable row level security;
alter table tikeame_orders enable row level security;
alter table tikeame_tickets enable row level security;
alter table tikeame_scans enable row level security;

-- Primer admin en producción: registrate con el email de BOOTSTRAP_ADMIN_EMAIL
-- o insertá a mano y cambiá role = 'admin'.
