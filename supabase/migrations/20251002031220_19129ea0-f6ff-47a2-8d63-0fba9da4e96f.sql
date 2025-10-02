-- Security fix: lock down usuarios (phone numbers) and gastos (financial data) with user-scoped RLS
-- and add user_id columns to support proper ownership

-- 1) Add user_id columns if missing
alter table public.usuarios
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.gastos
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- 2) Backfill user_id from profiles by matching phone numbers (digits only)
update public.usuarios u
set user_id = coalesce(u.user_id, p.user_id)
from public.profiles p
where u.user_id is null
  and (
    u.telefono = regexp_replace(coalesce(p.phone_personal, ''), '\\D', '', 'g')
    or u.telefono = regexp_replace(coalesce(p.phone_empresa, ''), '\\D', '', 'g')
  );

update public.gastos g
set user_id = coalesce(g.user_id, p.user_id)
from public.profiles p
where g.user_id is null
  and (
    g.telefono = regexp_replace(coalesce(p.phone_personal, ''), '\\D', '', 'g')
    or g.telefono = regexp_replace(coalesce(p.phone_empresa, ''), '\\D', '', 'g')
  );

-- 3) Indexes for performance
create index if not exists idx_usuarios_user_id on public.usuarios(user_id);
create index if not exists idx_gastos_user_id on public.gastos(user_id);

-- 4) Ensure RLS is enabled
alter table public.usuarios enable row level security;
alter table public.gastos enable row level security;

-- 5) Drop insecure, overly permissive policies
-- usuarios
drop policy if exists "Users can insert their own phone data" on public.usuarios;
drop policy if exists "Users can update their own data" on public.usuarios;
drop policy if exists "Users can view their own data" on public.usuarios;

-- gastos
drop policy if exists "Users can delete gastos data" on public.gastos;
drop policy if exists "Users can insert their own gastos" on public.gastos;
drop policy if exists "Users can update gastos data" on public.gastos;
drop policy if exists "Users can view gastos data" on public.gastos;

-- 6) Create secure user-scoped policies
-- usuarios
create policy "Usuarios select own"
  on public.usuarios
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Usuarios insert own"
  on public.usuarios
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Usuarios update own"
  on public.usuarios
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Usuarios delete own"
  on public.usuarios
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- gastos
create policy "Gastos select own"
  on public.gastos
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Gastos insert own"
  on public.gastos
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Gastos update own"
  on public.gastos
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Gastos delete own"
  on public.gastos
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- 7) Add a safe default for inserts from the client: set user_id = auth.uid() when omitted
create or replace function public.set_user_id_default()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id is null then
    new.user_id := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists set_user_id_default_usuarios on public.usuarios;
create trigger set_user_id_default_usuarios
before insert on public.usuarios
for each row
execute function public.set_user_id_default();

drop trigger if exists set_user_id_default_gastos on public.gastos;
create trigger set_user_id_default_gastos
before insert on public.gastos
for each row
execute function public.set_user_id_default();
