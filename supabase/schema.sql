-- =========================================================================
-- PolvIn — Schema Supabase para sincronização multiusuário
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
--
-- RFC-027 (2026-08): a partir desta RFC, Supabase deixa de ser uma
-- sincronização "opcional" (best-effort, com localStorage como fonte de
-- verdade) e passa a ser a FONTE DE VERDADE dos dados — conta agora é
-- obrigatória para usar o app. Quem for aplicar este schema num projeto
-- novo precisa saber que, sem ele aplicado e sem SUPABASE_URL/ANON_KEY
-- configurados em js/supabase-config.js, o app inteiro fica bloqueado
-- (tela "Ambiente não configurado" no boot) — não existe mais um "modo
-- 100% local" como caminho de produção. O modelo de dados abaixo (tabela
-- única chave/valor) não mudou por causa disso: a mudança é só de postura
-- (obrigatório vs. opcional), não de shape de dado — confirmado
-- independentemente pelo Database Engineer nesta mesma RFC.
-- =========================================================================

create table if not exists public.user_data (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  value jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

-- Cobre o padrão de acesso "select * do usuário" (ex.: syncOnLogin /
-- fetchRemoteRows em js/cloud.js, hoje obrigatório em todo login, não mais
-- opcional a partir da RFC-027). Fica redundante com a chave primária
-- composta (user_id, key) logo abaixo — o índice implícito da PK já tem
-- user_id como coluna líder e por si só já atenderia um "where user_id =
-- ?" — mas mantemos este índice explícito por clareza de intenção e como
-- garantia caso a PK mude no futuro; custo de manutenção é desprezível
-- para o volume de linhas por usuário desta tabela. Nenhum índice novo é
-- necessário para o padrão de query atual.
create index if not exists user_data_user_id_idx on public.user_data (user_id);

alter table public.user_data enable row level security;

-- Confirmado na RFC-027 (conta obrigatória): as 4 políticas abaixo (uma
-- por operação de CRUD) continuam corretas e suficientes. Conta deixar de
-- ser opcional não muda o modelo de ameaça desta tabela — linhas sem
-- usuário autenticado correspondente (auth.uid() = user_id nunca é
-- verdadeiro para anon) já eram, e continuam sendo, inacessíveis. Também
-- não há necessidade de uma tabela nova (ex.: um "profile" separado para
-- nome/avatar de exibição) — o Software Architect decidiu que identidade
-- de exibição deriva inteiramente de auth.users/user_metadata (via
-- Supabase Auth), não de uma tabela própria do app; auditoria detalhada
-- de RLS/ameaças fica com o Cyber Security Specialist na etapa seguinte.
--
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

-- =========================================================================
-- Migração pontual — RFC-027: remoção de STORAGE_KEYS.ACCOUNT
--
-- A partir da RFC-027, "if_account" deixa de existir como chave de
-- storage (identidade de conta passa a vir só de auth.users/Supabase
-- Auth — ver js/auth.js). Qualquer linha "if_account" remanescente de
-- testes anteriores (de quando a chave ainda era escrita normalmente)
-- fica órfã: nunca mais é lida nem sobrescrita por nenhum código do app,
-- então não some sozinha. Limpa aqui para não deixar lixo de schema
-- antigo em nenhum projeto onde este arquivo for (re)executado. Idempotente
-- por natureza (um "delete where" que não encontra linhas é um no-op) —
-- pode ficar neste arquivo permanentemente, sem risco de rodar de novo.
delete from public.user_data where key = 'if_account';
