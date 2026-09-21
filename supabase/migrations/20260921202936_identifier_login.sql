-- No directory data in this migration. Only the authentication service can resolve identifiers.
alter table cc_private.allowed_users add column if not exists payroll_id text unique;
create table cc_private.login_limits (identifier text primary key, window_start timestamptz not null, attempts int not null);
alter table cc_private.login_limits enable row level security;
revoke all on cc_private.login_limits from public, anon, authenticated;
create function public.cc_login_email(identifier text) returns text
language plpgsql security definer set search_path='' as $$
declare normalized text:=lower(trim(identifier)); n int; result text;
begin
 if (auth.jwt()->>'role') is distinct from 'service_role' then raise exception 'Forbidden' using errcode='42501'; end if;
 if length(normalized)<2 or length(normalized)>254 then return null; end if;
 insert into cc_private.login_limits as l values(md5(normalized),now(),1)
 on conflict(identifier) do update set
 attempts=case when l.window_start<now()-interval '15 minutes' then 1 else l.attempts+1 end,
 window_start=case when l.window_start<now()-interval '15 minutes' then now() else l.window_start end
 returning attempts into n;
 if n>10 then return null; end if;
 select a.email into result from cc_private.allowed_users a
 where a.enabled and (a.email=normalized or lower(a.employee_id)=normalized or a.payroll_id=normalized);
 return result;
end $$;
revoke all on function public.cc_login_email(text) from public, anon, authenticated;
grant execute on function public.cc_login_email(text) to service_role;
