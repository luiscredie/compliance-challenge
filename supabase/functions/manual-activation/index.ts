import { createClient } from 'npm:@supabase/supabase-js@2.116.0';
const origin='https://luiscredie.github.io';
const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Cache-Control':'no-store','Content-Type':'application/json'};
// This endpoint authenticates by a random 256-bit, expiring, single-use activation token.
// It creates a new account only. It cannot reset an existing account or assign roles.
// Only a trusted operator can issue a digest, after verifying the intended recipient.
Deno.serve(async req=>{
 const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='POST')return reply({error:'method_not_allowed'},405);
 if(req.headers.get('origin')&&req.headers.get('origin')!==origin)return reply({error:'forbidden'},403);
 try{
  const raw=await req.text();if(raw.length>4096)return reply({error:'invalid_request'},400);
  const {token,password}=JSON.parse(raw);
  if(typeof token!=='string'||! /^[A-Za-z0-9_-]{43}$/.test(token))return reply({error:'activation_invalid'},400);
  if(typeof password!=='string'||password.length<12||password.length>128||!/[A-Za-z]/.test(password)||!/[0-9]/.test(password))return reply({error:'password_policy'},400);
  const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)))).map(x=>x.toString(16).padStart(2,'0')).join('');
  const service=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  const {data:email,error}=await service.rpc('cc_consume_activation',{digest});
  if(error)return reply({error:'temporarily_unavailable'},503);
  if(!email)return reply({error:'activation_invalid'},400);
  // No user-supplied email or role is accepted. Recipient comes from the protected grant.
  const {error:createError}=await service.auth.admin.createUser({email,password,email_confirm:true,app_metadata:{activation_method:'operator_verified'}});
  if(createError)return reply({error:'activation_failed_contact_admin'},409);
  return reply({ok:true});
 }catch{return reply({error:'temporarily_unavailable'},503);}
});
