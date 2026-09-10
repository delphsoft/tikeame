-- Pegá esto en el SQL editor de Supabase (proyecto xhslkgeskwcvefipcmiv).
-- Idempotente: se puede correr más de una vez.

create table if not exists tikeame_events (
  slug text primary key,
  organizer_id text,
  status text not null,
  payload jsonb not null,
  created_at timestamptz default now()
);

create index if not exists tikeame_events_org_idx on tikeame_events (organizer_id);
create index if not exists tikeame_events_status_idx on tikeame_events (status);

create table if not exists tikeame_organizer_profiles (
  user_id text primary key,
  cuit text,
  razon_social text,
  condicion_iva text,
  domicilio_fiscal text,
  fee_plan text not null default 'percent',
  mp_user_id text,
  mp_access_token text,
  mp_refresh_token text,
  mp_token_expires_at timestamptz,
  created_at timestamptz default now()
);

alter table tikeame_events enable row level security;
alter table tikeame_organizer_profiles enable row level security;
