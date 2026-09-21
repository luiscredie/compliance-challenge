import { createClient } from 'npm:@supabase/supabase-js@2.116.0';
const origin='https://luiscredie.github.io';
const cors={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Cache-Control':'no-store','Content-Type':'application/json'};
// Public login endpoint: password authentication happens here, before any session is returned.
// The directory resolver is service-role-only. Never log inputs, passwords, or tokens.
Deno.serve(async req=>{
 const reply=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:cors});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 if(req.method!=='POST')return reply({error:'method_not_allowed'},405);
 if(req.headers.get('origin')&&req.headers.get('origin')!==origin)return reply({error:'forbidden'},403);
 try {
  const text=await req.text();if(text.length>4096)return reply({error:'invalid_credentials'},400);
  const {identifier,password}=JSON.parse(text);
  if(typeof identifier!=='string'||identifier.length>254||typeof password!=='string'||password.length>128||!password)return reply({error:'invalid_credentials'},400);
  const options={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};
  const url=Deno.env.get('SUPABASE_URL')!;
  const service=createClient(url,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,options);
  const {data:email,error:lookupError}=await service.rpc('cc_login_email',{identifier});
  if(lookupError)return reply({error:'temporarily_unavailable'},503);
  const auth=createClient(url,Deno.env.get('SUPABASE_ANON_KEY')!,options);
  // Unknown/disabled/rate-limited identifiers still take the password-verification path.
  const {data,error}=await auth.auth.signInWithPassword({email:email||'unavailable-account@invalid.example',password});
  if(error||!email||!data.session)return reply({error:'invalid_credentials'},401);
  return reply({access_token:data.session.access_token,refresh_token:data.session.refresh_token});
 }catch{return reply({error:'temporarily_unavailable'},503);}
});
