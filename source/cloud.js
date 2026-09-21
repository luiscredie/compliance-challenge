import { createClient } from '@supabase/supabase-js';
const config=window.CC_CONFIG||{};
const base=new URL('./',document.baseURI);
let client;
// Only the short-lived PKCE verifier crosses tabs. Session tokens stay in sessionStorage.
const authStorage={
 getItem:key=>(key.endsWith('-code-verifier')?localStorage:sessionStorage).getItem(key),
 setItem:(key,value)=>(key.endsWith('-code-verifier')?localStorage:sessionStorage).setItem(key,value),
 removeItem:key=>(key.endsWith('-code-verifier')?localStorage:sessionStorage).removeItem(key)
};
const CC=window.CC={};
const ready=(async()=>{
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(config.supabaseUrl||'')||!config.publishableKey) throw new Error('Configure a conexão do site antes de entrar. Consulte o responsável pela plataforma.');
 client=createClient(config.supabaseUrl,config.publishableKey,{auth:{storage:authStorage,persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce'}});
 window.CC.client=client;
 const {error}=await client.auth.getSession();if(error)throw error;
})();
// Prevent an unhandled rejection before the page attaches its error handler.
ready.catch(()=>{});
function assets(value){
 if(typeof value==='string'&&value.startsWith('/assets/'))return new URL(value.slice(1),base).href;
 if(Array.isArray(value))return value.map(assets);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,assets(v)]));
 return value;
}
async function api(path,body={}){
 await ready;
 const {data,error}=await client.rpc('cc_api',{path,body});
 if(error){
  if(error.code==='28000'){
   await client.auth.signOut({scope:'local'}).catch(()=>{});
   if(!location.pathname.endsWith('/')&&!location.pathname.endsWith('/index.html'))location.assign(new URL('index.html',base));
  }
  throw new Error(error.message||'Não foi possível concluir. Tente novamente.');
 }
 return assets(data);
}
async function login(identifier,password){
 await ready;
 const response=await fetch(config.supabaseUrl+'/functions/v1/identifier-login',{method:'POST',headers:{'Content-Type':'application/json',apikey:config.publishableKey},body:JSON.stringify({identifier,password})});
 const data=await response.json();if(!response.ok)throw new Error('login_failed');
 const {error}=await client.auth.setSession(data);if(error)throw error;
}
Object.assign(CC,{ready,api,assets,base,login});
