import { createClient } from 'npm:@supabase/supabase-js@2.116.0';
const origin='https://luiscredie.github.io';
const cors={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Cache-Control':'no-store','Content-Type':'application/json'};
// First-access registration: no admin-issued code. The only gate is membership in
// cc_private.allowed_users (checked via the same cc_login_email lookup identifier-login
// uses), so this only ever creates an account for an identifier already on that list.
// If the account already has a password, this endpoint refuses (use the admin-issued
// recovery-code flow in account.html?activate=1&recover=1 instead) — it never overwrites
// an existing password anonymously.
Deno.serve(async req=>{
 const reply=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:cors});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 if(req.method!=='POST')return reply({error:'method_not_allowed'},405);
 if(req.headers.get('origin')&&req.headers.get('origin')!==origin)return reply({error:'forbidden'},403);
 try{
  const text=await req.text();if(text.length>4096)return reply({error:'invalid_request'},400);
  const {identifier,password}=JSON.parse(text);
  if(typeof identifier!=='string'||identifier.length<2||identifier.length>254)return reply({error:'invalid_request'},400);
  if(typeof password!=='string'||password.length<8||password.length>128||!/[A-Za-z]/.test(password)||!/[0-9]/.test(password))return reply({error:'password_policy'},400);
  const url=Deno.env.get('SUPABASE_URL')!;
  const options={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};
  const service=createClient(url,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,options);
  const {data:email,error:lookupError}=await service.rpc('cc_login_email',{identifier});
  if(lookupError)return reply({error:'temporarily_unavailable'},503);
  if(!email)return reply({error:'not_authorized'},403);
  const {error:createError}=await service.auth.admin.createUser({email,password,email_confirm:true,app_metadata:{activation_method:'self_register'}});
  if(createError){
   const already=/already|exist|registered/i.test(createError.message||'');
   return reply({error:already?'already_registered':'register_failed'},already?409:500);
  }
  const auth=createClient(url,Deno.env.get('SUPABASE_ANON_KEY')!,options);
  const {data:signIn,error:signInError}=await auth.auth.signInWithPassword({email,password});
  if(signInError||!signIn.session)return reply({ok:true,requires_login:true});
  return reply({access_token:signIn.session.access_token,refresh_token:signIn.session.refresh_token});
 }catch{return reply({error:'temporarily_unavailable'},503);}
});
