-- Base schema for cc_private, reconstructed from how later migrations and
-- supabase/functions/campaign/engine.ts use these tables.
--
-- WHY THIS FILE EXISTS: migrations 20260921202936 onward already reference
-- cc_private.allowed_users, cc_private.config, cc_private.profiles,
-- cc_private.attempts, cc_private.audit and cc_private.revoked_sessions, but
-- no migration in the repository ever creates them — someone ran the base
-- schema by hand in the Supabase SQL editor and it was never committed. This
-- file fills that gap so `supabase db push` can rebuild the project from
-- scratch (disaster recovery, staging, a second environment).
--
-- Every statement is idempotent (`if not exists`), so running this against
-- the live project alongside the already-applied hand-run schema is safe: it
-- will not touch existing tables or data, only fill in what is missing.
-- Still, compare column-by-column against the live schema before relying on
-- this for a fresh deploy — it was inferred from usage, not exported.

create schema if not exists cc_private;
revoke all on schema cc_private from public, anon, authenticated;

-- Employee directory. `email` is the join key every other private table uses.
create table if not exists cc_private.allowed_users (
  email text primary key,
  employee_id text not null,
  name text not null,
  site text not null check (site in ('SAO','SVC','MAO','FRG')),
  enabled boolean not null default true,
  role text not null default 'participant' check (role in ('participant','site_admin','super_admin'))
);
create unique index if not exists allowed_users_employee_id_idx on cc_private.allowed_users (lower(employee_id));
alter table cc_private.allowed_users enable row level security;
revoke all on cc_private.allowed_users from public, anon, authenticated;

-- Single-row bootstrap config, read once by cc_engine_snapshot when
-- cc_private.campaign_state.doc is still empty (brand-new deployment).
-- After the first commit, campaign_state.doc.config.stages is authoritative.
create table if not exists cc_private.config (
  id boolean primary key default true check (id),
  stages jsonb not null default '{"1":{"open":true,"label":"Primeiros Passos"},"2":{"open":false,"label":"Na Sua Realidade"},"3":{"open":false,"label":"Zona Crítica"}}'::jsonb
);
insert into cc_private.config (id) values (true) on conflict (id) do nothing;
alter table cc_private.config enable row level security;
revoke all on cc_private.config from public, anon, authenticated;

-- One row per authenticated participant; created lazily by
-- cc_private.engine_actor() on first successful session validation.
create table if not exists cc_private.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique not null,
  locale text,
  privacy_at timestamptz
);
alter table cc_private.profiles enable row level security;
revoke all on cc_private.profiles from public, anon, authenticated;

-- Legacy attempts imported once from the old Python file-store (pre-Supabase
-- campaigns). Read-only from the engine's point of view: it seeds
-- d.legacy_imported on first snapshot and is never written back to.
create table if not exists cc_private.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references cc_private.profiles (id) on delete cascade,
  stage int not null check (stage in (1,2,3)),
  track text,
  mission_order jsonb,
  results jsonb not null default '[]'::jsonb,
  answers jsonb not null default '{}'::jsonb,
  opened_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  state jsonb
);
create index if not exists attempts_user_id_idx on cc_private.attempts (user_id);
alter table cc_private.attempts enable row level security;
revoke all on cc_private.attempts from public, anon, authenticated;

create table if not exists cc_private.audit (
  id bigserial primary key,
  user_id uuid,
  action text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table cc_private.audit enable row level security;
revoke all on cc_private.audit from public, anon, authenticated;

-- Sessions listed here are treated as logged out even though the JWT itself
-- has not expired yet (used when an admin disables a participant).
create table if not exists cc_private.revoked_sessions (
  session_id uuid primary key,
  revoked_at timestamptz not null default now()
);
alter table cc_private.revoked_sessions enable row level security;
revoke all on cc_private.revoked_sessions from public, anon, authenticated;
