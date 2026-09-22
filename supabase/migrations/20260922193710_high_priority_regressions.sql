create or replace function public.cc_engine_snapshot(uid uuid,sid uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare a cc_private.allowed_users; result jsonb;
begin
 a:=cc_private.engine_actor(uid,sid);
 select jsonb_build_object('revision',s.revision,'state',s.doc,'actor',to_jsonb(a),'stages',(select stages from cc_private.config where id),'content',(select doc from cc_private.campaign_content where id),
 'users',(select coalesce(jsonb_agg(to_jsonb(u)||jsonb_build_object('auth_id',au.id)),'[]') from cc_private.allowed_users u left join auth.users au on lower(au.email)=u.email),
 'legacy',(select coalesce(jsonb_agg(to_jsonb(u)||jsonb_build_object('locale',p.locale,'privacy_at',p.privacy_at,'attempts',(select coalesce(jsonb_agg(to_jsonb(at)),'[]') from cc_private.attempts at where at.user_id=p.id))),'[]') from cc_private.allowed_users u join cc_private.profiles p on p.email=u.email where u.enabled)) into result from cc_private.campaign_state s where s.id;
 return result;
end $$;

revoke all on function public.cc_engine_snapshot(uuid,uuid) from public,anon,authenticated;
grant execute on function public.cc_engine_snapshot(uuid,uuid) to service_role;
