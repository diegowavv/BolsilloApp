-- Bolsillo: endurecimiento de seguridad (auditoría del 2026-11-26)
-- Idempotente: se puede ejecutar más de una vez.

-- ---------- 1. Funciones internas: no invocables desde la API ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, email)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'), 80),
    left(new.email, 320)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

alter function public.protect_profile_plan() set search_path = public;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.protect_profile_plan() from public, anon, authenticated;

-- ---------- 2. Privilegios mínimos (defensa en profundidad además de RLS) ----------
-- Los visitantes sin sesión no necesitan tocar ninguna tabla.
revoke all on public.profiles, public.categories, public.transactions, public.budgets, public.goals from anon;
-- Nadie desde la API necesita TRUNCATE / REFERENCES / TRIGGER (TRUNCATE ignora RLS).
revoke truncate, references, trigger on public.profiles, public.categories, public.transactions, public.budgets, public.goals from authenticated;
-- En el perfil el usuario solo puede cambiar su nombre (no el plan, el email ni la moneda).
revoke insert, update, delete on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (nombre) on public.profiles to authenticated;

-- ---------- 3. Validación de datos (evita basura y llenar la base a propósito) ----------
do $$
begin
  -- profiles
  alter table public.profiles drop constraint if exists profiles_nombre_len;
  alter table public.profiles add constraint profiles_nombre_len check (nombre is null or char_length(nombre) <= 80);
  alter table public.profiles drop constraint if exists profiles_moneda_valida;
  alter table public.profiles add constraint profiles_moneda_valida check (moneda in ('MXN'));

  -- categories
  alter table public.categories drop constraint if exists categories_nombre_len;
  alter table public.categories add constraint categories_nombre_len check (char_length(nombre) between 1 and 60);
  alter table public.categories drop constraint if exists categories_icono_len;
  alter table public.categories add constraint categories_icono_len check (char_length(icono) <= 40);
  alter table public.categories drop constraint if exists categories_id_len;
  alter table public.categories add constraint categories_id_len check (char_length(id) <= 64);
  alter table public.categories drop constraint if exists categories_grupo_valido;
  alter table public.categories add constraint categories_grupo_valido check (grupo in (
    'vivienda','restaurantes','alimentos','delivery','membresias','servicios','transporte','salud','otros',
    'ingresos','ahorro','inversion'));

  -- transactions
  alter table public.transactions drop constraint if exists transactions_monto_max;
  alter table public.transactions add constraint transactions_monto_max check (monto <= 100000000);
  alter table public.transactions drop constraint if exists transactions_descripcion_len;
  alter table public.transactions add constraint transactions_descripcion_len check (char_length(descripcion) <= 200);
  alter table public.transactions drop constraint if exists transactions_metodo_len;
  alter table public.transactions add constraint transactions_metodo_len check (metodo_pago is null or char_length(metodo_pago) <= 40);
  alter table public.transactions drop constraint if exists transactions_fecha_rango;
  alter table public.transactions add constraint transactions_fecha_rango check (fecha between date '1990-01-01' and date '2100-12-31');

  -- budgets
  alter table public.budgets drop constraint if exists budgets_grupo_valido;
  alter table public.budgets add constraint budgets_grupo_valido check (grupo in (
    'vivienda','restaurantes','alimentos','delivery','membresias','servicios','transporte','salud','otros'));
  alter table public.budgets drop constraint if exists budgets_monto_max;
  alter table public.budgets add constraint budgets_monto_max check (monto <= 100000000);

  -- goals
  alter table public.goals drop constraint if exists goals_nombre_len;
  alter table public.goals add constraint goals_nombre_len check (char_length(nombre) between 1 and 80);
  alter table public.goals drop constraint if exists goals_montos;
  alter table public.goals add constraint goals_montos check (objetivo <= 1000000000 and actual between 0 and 1000000000);
  alter table public.goals drop constraint if exists goals_icono_len;
  alter table public.goals add constraint goals_icono_len check (char_length(icono) <= 40);
end $$;

-- ---------- 4. Coherencia movimiento ↔ categoría ----------
-- La categoría debe ser del sistema o del propio usuario, y su tipo debe coincidir.
create or replace function public.check_transaction_category()
returns trigger
language plpgsql
set search_path = public
as $$
declare c_tipo text; c_user uuid;
begin
  select tipo, user_id into c_tipo, c_user from public.categories where id = new.category_id;
  if not found or (c_user is not null and c_user <> new.user_id) then
    raise exception 'Categoría no válida' using errcode = '23503';
  end if;
  if c_tipo <> new.tipo then
    raise exception 'El tipo del movimiento no coincide con su categoría' using errcode = '23514';
  end if;
  if new.tipo <> 'gasto' then
    new.clasificacion := null;
  end if;
  return new;
end;
$$;
revoke execute on function public.check_transaction_category() from public, anon, authenticated;

drop trigger if exists transactions_check_category on public.transactions;
create trigger transactions_check_category
  before insert or update of category_id, tipo, user_id, clasificacion on public.transactions
  for each row execute function public.check_transaction_category();

-- ---------- 5. Cuotas por usuario (evita llenar la base de datos gratuita) ----------
create or replace function public.enforce_user_quota()
returns trigger
language plpgsql
set search_path = public
as $$
declare n int; max_rows int;
begin
  max_rows := case tg_table_name
    when 'transactions' then 20000
    when 'categories' then 100
    when 'goals' then 50
    else 1000 end;
  execute format('select count(*) from public.%I where user_id = $1', tg_table_name) into n using new.user_id;
  if n >= max_rows then
    raise exception 'Límite alcanzado (% registros)', max_rows using errcode = '53400';
  end if;
  return new;
end;
$$;
revoke execute on function public.enforce_user_quota() from public, anon, authenticated;

drop trigger if exists transactions_quota on public.transactions;
create trigger transactions_quota before insert on public.transactions
  for each row execute function public.enforce_user_quota();
drop trigger if exists categories_quota on public.categories;
create trigger categories_quota before insert on public.categories
  for each row when (new.user_id is not null) execute function public.enforce_user_quota();
drop trigger if exists goals_quota on public.goals;
create trigger goals_quota before insert on public.goals
  for each row execute function public.enforce_user_quota();

create index if not exists categories_user_id_idx on public.categories (user_id) where user_id is not null;
create index if not exists goals_user_id_idx on public.goals (user_id);
create index if not exists budgets_user_id_idx on public.budgets (user_id);
