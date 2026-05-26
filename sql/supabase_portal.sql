create table if not exists public.portal_perfis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  nome text,
  ativo boolean not null default true,
  perfil text not null default 'usuario',
  acesso_financego boolean not null default false,
  acesso_remuneracao_cbmgo boolean not null default false,
  acesso_arremata_carvalho boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

alter table public.portal_perfis enable row level security;

drop policy if exists "Usuário visualiza o próprio perfil" on public.portal_perfis;
create policy "Usuário visualiza o próprio perfil"
on public.portal_perfis
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Usuário atualiza dados básicos do próprio perfil" on public.portal_perfis;
create policy "Usuário atualiza dados básicos do próprio perfil"
on public.portal_perfis
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.criar_perfil_portal()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.portal_perfis (user_id, email, nome)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'nome', new.email))
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_portal on auth.users;
create trigger on_auth_user_created_portal
after insert on auth.users
for each row execute procedure public.criar_perfil_portal();

create or replace function public.set_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

drop trigger if exists trg_portal_perfis_atualizado_em on public.portal_perfis;
create trigger trg_portal_perfis_atualizado_em
before update on public.portal_perfis
for each row execute procedure public.set_atualizado_em();
