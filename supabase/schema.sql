-- =========================================================================
-- Fin+ — Schema Supabase para sincronização multiusuário
--
-- Como usar: no painel do seu projeto Supabase, abra o "SQL Editor" e
-- execute este arquivo inteiro (Run). Ele é seguro para rodar mais de uma
-- vez (usa "if not exists"/"or replace" onde possível).
--
-- Modelo de dados: uma única tabela genérica chave/valor por usuário
-- (user_data), em vez de uma tabela por funcionalidade. Isso espelha
-- exatamente a estrutura que o app já usa no localStorage (ver
-- STORAGE_KEYS em js/storage.js) — cada linha é uma chave (ex.:
-- "if_transactions") com o JSON correspondente em "value". A proteção real
-- vem das políticas de RLS abaixo: cada pessoa só lê/escreve as próprias
-- linhas, identificadas por auth.uid() (usuário autenticado no momento).
-- =========================================================================

create table if not exists public.user_data (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  value jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

create index if not exists user_data_user_id_idx on public.user_data (user_id);

alter table public.user_data enable row level security;

-- Remove políticas antigas antes de recriar, para este script poder ser
-- executado de novo sem erro de "policy already exists".
drop policy if exists "select_own_rows" on public.user_data;
drop policy if exists "insert_own_rows" on public.user_data;
drop policy if exists "update_own_rows" on public.user_data;
drop policy if exists "delete_own_rows" on public.user_data;

create policy "select_own_rows" on public.user_data
  for select using (auth.uid() = user_id);

create policy "insert_own_rows" on public.user_data
  for insert with check (auth.uid() = user_id);

create policy "update_own_rows" on public.user_data
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "delete_own_rows" on public.user_data
  for delete using (auth.uid() = user_id);

-- Mantém "updated_at" sempre correto mesmo se algum dia um cliente
-- esquecer de enviá-lo manualmente num UPDATE.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_user_data_updated_at on public.user_data;
create trigger set_user_data_updated_at
  before update on public.user_data
  for each row execute function public.set_updated_at();
