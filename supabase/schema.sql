-- Opcional: corrê esto en Supabase cuando conectes la DB.
-- Hoy el store vive en memoria + .data/tikeame-store.json (local) o /tmp (Vercel).

create table if not exists tikeame_users (
  id text primary key,
  name text not null,
  email text unique not null,
  role text not null,
  password_hash text not null,
  created_at timestamptz default now()
);

create table if not exists tikeame_orders (
  id text primary key,
  payload jsonb not null,
  status text not null,
  created_at timestamptz default now()
);

create table if not exists tikeame_tickets (
  id text primary key,
  order_id text references tikeame_orders(id),
  payload jsonb not null,
  status text not null,
  used_at timestamptz
);
