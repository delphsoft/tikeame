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

-- Reserva atómica de cupo (checkout). Lockea la fila del evento, valida estado
-- y cupo por tipo de entrada, suma/resta `sold` y pasa a sold_out / on_sale.
-- delta = 1 reserva, delta = -1 libera.
create or replace function tikeame_reserve(p_slug text, p_items jsonb, p_delta int)
returns jsonb
language plpgsql
as $$
declare
  ev jsonb;
  tickets jsonb;
  it jsonb;
  t jsonb;
  i int;
  found boolean;
  qty int;
  all_full boolean := true;
  st text;
begin
  if p_delta not in (1, -1) then
    return jsonb_build_object('ok', false, 'error', 'delta inválido');
  end if;

  select payload into ev from tikeame_events where slug = p_slug for update;
  if ev is null then
    return jsonb_build_object('ok', false, 'error', 'Evento no encontrado');
  end if;

  st := ev->>'status';
  if p_delta = 1 and st <> 'on_sale' then
    return jsonb_build_object('ok', false, 'error',
      case when st = 'sold_out' then 'Entradas agotadas' else 'El evento no está a la venta' end);
  end if;

  tickets := ev->'tickets';

  -- validar
  for it in select * from jsonb_array_elements(p_items) loop
    qty := (it->>'qty')::int;
    found := false;
    for i in 0 .. jsonb_array_length(tickets) - 1 loop
      t := tickets->i;
      if t->>'key' = it->>'key' then
        found := true;
        if p_delta = 1 and (t->>'sold')::int + qty > (t->>'cap')::int then
          return jsonb_build_object('ok', false, 'error',
            case when (t->>'cap')::int - (t->>'sold')::int > 0
              then 'Quedan ' || ((t->>'cap')::int - (t->>'sold')::int) || ' ' || (t->>'name')
              else (t->>'name') || ' agotada' end);
        end if;
      end if;
    end loop;
    if not found then
      return jsonb_build_object('ok', false, 'error', 'Tipo de entrada inexistente: ' || (it->>'key'));
    end if;
  end loop;

  -- aplicar
  for it in select * from jsonb_array_elements(p_items) loop
    qty := (it->>'qty')::int;
    for i in 0 .. jsonb_array_length(tickets) - 1 loop
      t := tickets->i;
      if t->>'key' = it->>'key' then
        tickets := jsonb_set(tickets, array[i::text, 'sold'],
          to_jsonb(greatest(0, (t->>'sold')::int + p_delta * qty)));
      end if;
    end loop;
  end loop;

  for i in 0 .. jsonb_array_length(tickets) - 1 loop
    t := tickets->i;
    if (t->>'sold')::int < (t->>'cap')::int then all_full := false; end if;
  end loop;

  if all_full and st = 'on_sale' then st := 'sold_out'; end if;
  if not all_full and st = 'sold_out' then st := 'on_sale'; end if;

  ev := jsonb_set(jsonb_set(ev, '{tickets}', tickets), '{status}', to_jsonb(st));
  update tikeame_events set payload = ev, status = st where slug = p_slug;
  return jsonb_build_object('ok', true);
end;
$$;

-- Solo el service role (backend) puede reservar; anon/authenticated no.
revoke execute on function tikeame_reserve(text, jsonb, int) from public, anon, authenticated;
grant execute on function tikeame_reserve(text, jsonb, int) to service_role;

-- Un CUIT, un organizador.
create unique index if not exists tikeame_organizer_profiles_cuit_uq
  on tikeame_organizer_profiles (cuit) where cuit is not null;

create index if not exists tikeame_tickets_event_idx on tikeame_tickets ((payload->>'eventSlug'));
create index if not exists tikeame_orders_pending_exp_idx on tikeame_orders ((payload->>'expiresAt')) where status = 'pending';
