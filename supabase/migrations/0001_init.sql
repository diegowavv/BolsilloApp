-- Bolsillo: esquema inicial
-- Ejecutar en Supabase > SQL Editor (o con `supabase db push`).

create extension if not exists "pgcrypto";

-- ---------- Perfiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text,
  email text,
  moneda text not null default 'MXN',
  plan text not null default 'free' check (plan in ('free', 'premium')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Categorías ----------
-- user_id NULL = categoría del sistema (visible para todos, solo lectura)
create table if not exists public.categories (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references auth.users (id) on delete cascade,
  nombre text not null,
  grupo text not null,
  icono text not null default 'shapes',
  tipo text not null check (tipo in ('ingreso', 'gasto', 'ahorro', 'inversion')),
  clasificacion_default text check (clasificacion_default in ('necesario', 'hormiga', 'innecesario')),
  created_at timestamptz not null default now()
);
create index if not exists categories_user_idx on public.categories (user_id);

-- ---------- Movimientos ----------
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category_id text not null references public.categories (id) on delete restrict,
  tipo text not null check (tipo in ('ingreso', 'gasto', 'ahorro', 'inversion')),
  monto numeric(14, 2) not null check (monto >= 0),
  fecha date not null default current_date,
  descripcion text not null default '',
  clasificacion text check (clasificacion in ('necesario', 'hormiga', 'innecesario')),
  metodo_pago text,
  recurrente boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists transactions_user_fecha_idx on public.transactions (user_id, fecha desc);

-- ---------- Presupuestos (límite mensual por grupo) ----------
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  grupo text not null,
  monto numeric(14, 2) not null check (monto >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, grupo)
);

-- ---------- Metas de ahorro ----------
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nombre text not null,
  objetivo numeric(14, 2) not null check (objetivo > 0),
  actual numeric(14, 2) not null default 0,
  fecha_limite date,
  icono text not null default 'target',
  created_at timestamptz not null default now()
);

-- ---------- Row Level Security: cada usuario solo ve lo suyo ----------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.goals enable row level security;

drop policy if exists "perfil propio: leer" on public.profiles;
create policy "perfil propio: leer" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "perfil propio: editar" on public.profiles;
create policy "perfil propio: editar" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Evita que un usuario se cambie a premium por su cuenta
create or replace function public.protect_profile_plan()
returns trigger language plpgsql as $$
begin
  if new.plan is distinct from old.plan and coalesce(auth.role(), '') <> 'service_role' then
    new.plan := old.plan;
  end if;
  return new;
end;
$$;
drop trigger if exists profiles_protect_plan on public.profiles;
create trigger profiles_protect_plan before update on public.profiles
  for each row execute function public.protect_profile_plan();

drop policy if exists "categorias: leer sistema y propias" on public.categories;
create policy "categorias: leer sistema y propias" on public.categories
  for select using (user_id is null or user_id = auth.uid());
drop policy if exists "categorias: crear propias" on public.categories;
create policy "categorias: crear propias" on public.categories
  for insert with check (user_id = auth.uid());
drop policy if exists "categorias: editar propias" on public.categories;
create policy "categorias: editar propias" on public.categories
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "categorias: borrar propias" on public.categories;
create policy "categorias: borrar propias" on public.categories
  for delete using (user_id = auth.uid());

do $$
declare t text;
begin
  foreach t in array array['transactions', 'budgets', 'goals'] loop
    execute format('drop policy if exists "propios" on public.%I', t);
    execute format(
      'create policy "propios" on public.%I for all using (user_id = auth.uid()) with check (user_id = auth.uid())',
      t
    );
  end loop;
end $$;
