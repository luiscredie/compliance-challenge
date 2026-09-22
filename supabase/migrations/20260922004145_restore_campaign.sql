create table cc_private.campaign_state (id boolean primary key default true check(id), revision bigint not null default 0, doc jsonb not null default '{}');
insert into cc_private.campaign_state(id) values(true);
create table cc_private.campaign_content(id boolean primary key default true check(id), doc jsonb not null);
create table cc_private.campaign_backups(id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(), actor uuid, revision bigint, doc jsonb not null);
alter table cc_private.campaign_state enable row level security;
alter table cc_private.campaign_content enable row level security;
alter table cc_private.campaign_backups enable row level security;
revoke all on cc_private.campaign_state,cc_private.campaign_content,cc_private.campaign_backups from public,anon,authenticated;

create function cc_private.engine_actor(uid uuid,sid uuid) returns cc_private.allowed_users language plpgsql security definer set search_path='' as $$
declare a cc_private.allowed_users;
begin
 if auth.jwt()->>'role' is distinct from 'service_role' then raise exception 'Denied' using errcode='42501';end if;
 if uid is null or sid is null or not exists(select 1 from auth.sessions where id=sid and user_id=uid) or exists(select 1 from cc_private.revoked_sessions where session_id=sid) then raise exception 'Sessão encerrada. Entre novamente.' using errcode='28000';end if;
 select u.* into a from cc_private.allowed_users u join auth.users au on lower(au.email)=u.email where au.id=uid and au.email_confirmed_at is not null and (au.banned_until is null or au.banned_until<now()) and u.enabled;
 if a.email is null then raise exception 'Acesso não autorizado.' using errcode='42501';end if;
 insert into cc_private.profiles(id,email) values(uid,a.email) on conflict(id) do nothing;
 return a;
end $$;

create function public.cc_engine_snapshot(uid uuid,sid uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare a cc_private.allowed_users; result jsonb;
begin
 a:=cc_private.engine_actor(uid,sid);
 select jsonb_build_object('revision',s.revision,'state',s.doc,'actor',to_jsonb(a),'stages',(select stages from cc_private.config where id),'content',(select doc from cc_private.campaign_content where id),
 'users',(select coalesce(jsonb_agg(to_jsonb(u)||jsonb_build_object('auth_id',au.id)),'[]') from cc_private.allowed_users u left join auth.users au on lower(au.email)=u.email),
 'legacy',(select coalesce(jsonb_agg(to_jsonb(u)||jsonb_build_object('locale',p.locale,'privacy_at',p.privacy_at,'attempts',(select coalesce(jsonb_agg(to_jsonb(at)),'[]') from cc_private.attempts at where at.user_id=p.id))),'[]') from cc_private.allowed_users u join cc_private.profiles p on p.email=u.email)) into result from cc_private.campaign_state s where s.id;
 return result;
end $$;

create function public.cc_engine_commit(uid uuid,sid uuid,expected_revision bigint,new_state jsonb,changes jsonb default '[]',events jsonb default '[]',backup_doc jsonb default null) returns boolean language plpgsql security definer set search_path='' as $$
declare a cc_private.allowed_users;rev bigint; ch jsonb; u jsonb; target cc_private.allowed_users;
begin
 select revision into rev from cc_private.campaign_state where id for update;
 a:=cc_private.engine_actor(uid,sid);
 if rev<>expected_revision then return false;end if;
 if jsonb_typeof(new_state)<>'object' or octet_length(new_state::text)>50000000 then raise exception 'Estado inválido.';end if;
 for ch in select value from jsonb_array_elements(changes) loop
  if a.role not in ('super_admin','site_admin') then raise exception 'Acesso administrativo necessário.';end if;
  if ch->>'kind'='add' then
   u:=ch->'user';if a.role<>'super_admin' and u->>'site'<>a.site then raise exception 'Unidade fora do escopo.';end if;
   insert into cc_private.allowed_users(email,employee_id,payroll_id,name,site,enabled,role) values(lower(trim(u->>'email')),trim(u->>'employee_id'),nullif(trim(u->>'payroll_id'),''),trim(u->>'name'),u->>'site',coalesce((u->>'enabled')::boolean,true),'participant');
  elsif ch->>'kind'='import' then
   if a.role<>'super_admin' then raise exception 'Super Admin necessário.';end if;
   for u in select value from jsonb_array_elements(ch->'users') loop
    insert into cc_private.allowed_users(email,employee_id,payroll_id,name,site,enabled,role) values(lower(trim(u->>'email')),coalesce(nullif(trim(u->>'employee_id'),''),trim(u->>'matricula')),nullif(trim(u->>'matricula'),''),trim(u->>'name'),u->>'site',coalesce((u->>'enabled')::boolean,true),'participant')
     on conflict(email) do update set name=excluded.name,enabled=excluded.enabled where cc_private.allowed_users.role='participant';
   end loop;
  else
   select * into target from cc_private.allowed_users where email=ch->>'email';
   if target.email is null or (a.role<>'super_admin' and (target.site<>a.site or target.role<>'participant')) then raise exception 'Conta fora do escopo.';end if;
   if ch->>'kind'='site' then
    if a.role<>'super_admin' then raise exception 'Super Admin necessário.';end if;
    update cc_private.allowed_users set site=ch->>'site' where email=target.email;
   elsif ch->>'kind'='disable' then
    if target.email=a.email then raise exception 'Não é possível excluir sua própria conta.';end if;
    update cc_private.allowed_users set enabled=false where email=target.email;
    insert into cc_private.revoked_sessions(session_id) select s.id from auth.sessions s join auth.users au on au.id=s.user_id where lower(au.email)=target.email on conflict do nothing;
   else raise exception 'Alteração inválida.';end if;
  end if;
 end loop;
 if backup_doc is not null and backup_doc<>'null'::jsonb then
  if a.role<>'super_admin' then raise exception 'Super Admin necessário.';end if;
  insert into cc_private.campaign_backups(actor,revision,doc) values(uid,rev,backup_doc);
 end if;
 update cc_private.campaign_state set doc=new_state,revision=rev+1 where id;
 for ch in select value from jsonb_array_elements(events) loop
  insert into cc_private.audit(user_id,action,detail) values(uid,ch->>'action',coalesce(ch->'detail','{}'));
 end loop;
 return true;
end $$;
revoke all on function public.cc_engine_snapshot(uuid,uuid),public.cc_engine_commit(uuid,uuid,bigint,jsonb,jsonb,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.cc_engine_snapshot(uuid,uuid),public.cc_engine_commit(uuid,uuid,bigint,jsonb,jsonb,jsonb,jsonb) to service_role;
revoke all on function cc_private.engine_actor(uuid,uuid) from public,anon,authenticated;
create table cc_private.access_codes(token_hash text primary key check(token_hash ~ '^[a-f0-9]{64}$'), email text not null references cc_private.allowed_users(email) on delete cascade, expires_at timestamptz not null,used_at timestamptz,created_at timestamptz not null default now());
alter table cc_private.access_codes enable row level security;
revoke all on cc_private.access_codes from public,anon,authenticated;
create function public.cc_issue_access(uid uuid,sid uuid,target_email text,digest text) returns jsonb language plpgsql security definer set search_path='' as $$
declare a cc_private.allowed_users;t cc_private.allowed_users;
begin
 a:=cc_private.engine_actor(uid,sid);select * into t from cc_private.allowed_users where email=target_email and enabled;
 if a.role not in ('site_admin','super_admin') or t.email is null or (a.role<>'super_admin' and (t.site<>a.site or t.role<>'participant')) then raise exception 'Conta fora do escopo.' using errcode='42501';end if;
 update cc_private.access_codes set used_at=now() where email=t.email and used_at is null;
 insert into cc_private.access_codes(token_hash,email,expires_at) values(digest,t.email,now()+interval '24 hours');
 insert into cc_private.audit(user_id,action,detail) values(uid,'access_code_issued',jsonb_build_object('email',t.email));
 return jsonb_build_object('ok',true);
end $$;
create function public.cc_consume_access(digest text) returns jsonb language plpgsql security definer set search_path='' as $$
declare mail text;u uuid;
begin
 if auth.jwt()->>'role' is distinct from 'service_role' then raise exception 'Denied' using errcode='42501';end if;
 update cc_private.access_codes c set used_at=now() where c.token_hash=digest and c.used_at is null and c.expires_at>now() and exists(select 1 from cc_private.allowed_users a where a.email=c.email and a.enabled) returning c.email into mail;
 if mail is null then return null;end if;
 select id into u from auth.users where lower(email)=mail;
 return jsonb_build_object('email',mail,'user_id',u);
end $$;
revoke all on function public.cc_issue_access(uuid,uuid,text,text),public.cc_consume_access(text) from public,anon,authenticated;
grant execute on function public.cc_issue_access(uuid,uuid,text,text),public.cc_consume_access(text) to service_role;
