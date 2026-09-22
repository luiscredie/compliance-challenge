-- Operators issue an activation only after verifying the recipient's identity.
-- Store SHA-256 digests only; never put issued tokens or employee data in source control.
create table cc_private.activations (
 token_hash text primary key check(token_hash ~ '^[0-9a-f]{64}$'),
 email text unique not null references cc_private.allowed_users(email) on delete cascade,
 expires_at timestamptz not null,
 used_at timestamptz,
 created_at timestamptz not null default now()
);
alter table cc_private.activations enable row level security;
revoke all on cc_private.activations from public,anon,authenticated;
create function public.cc_consume_activation(digest text) returns text
language plpgsql security definer set search_path='' as $$
declare result text;
begin
 if (auth.jwt()->>'role') is distinct from 'service_role' then raise exception 'Forbidden' using errcode='42501'; end if;
 update cc_private.activations a set used_at=now()
 where a.token_hash=digest and a.used_at is null and a.expires_at>now()
 and exists(select 1 from cc_private.allowed_users u where u.email=a.email and u.enabled)
 and not exists(select 1 from auth.users u where lower(u.email)=a.email)
 returning a.email into result;
 return result;
end $$;
revoke all on function public.cc_consume_activation(text) from public,anon,authenticated;
grant execute on function public.cc_consume_activation(text) to service_role;
