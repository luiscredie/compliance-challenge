import { createClient } from '@supabase/supabase-js';
const config=window.CC_CONFIG||{};
const nativeFetch=window.fetch.bind(window);
const base=new URL('./',document.baseURI);
let client;
// Only the short-lived PKCE verifier crosses tabs. Session tokens stay in sessionStorage.
const authStorage={
 getItem:key=>(key.endsWith('-code-verifier')?localStorage:sessionStorage).getItem(key),
 setItem:(key,value)=>(key.endsWith('-code-verifier')?localStorage:sessionStorage).setItem(key,value),
 removeItem:key=>(key.endsWith('-code-verifier')?localStorage:sessionStorage).removeItem(key)
};
const fragment=new URLSearchParams(location.hash.slice(1));
const activationToken=fragment.get('activate')||'';
if(activationToken)history.replaceState(null,'',location.pathname+location.search);
const CC=window.CC={activationToken};
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
async function api(path,body={},method='GET'){
 await ready;
 const {data:{session}}=await client.auth.getSession();
 if(!session)throw Object.assign(new Error('Entre novamente para continuar.'),{status:401});
 const response=await nativeFetch(config.supabaseUrl+'/functions/v1/campaign',{method:'POST',headers:{'Content-Type':'application/json',apikey:config.publishableKey,Authorization:'Bearer '+session.access_token},body:JSON.stringify({path,body,method})});
 const data=await response.json();if(!response.ok)throw Object.assign(new Error(data.detail||'Não foi possível concluir.'),{status:response.status});return assets(data);
}
async function logout(){try{await ready;await client.auth.signOut({scope:'local'});}catch(e){/* best-effort: local sign-out still proceeds even if the remote call fails */}sessionStorage.removeItem('lgpt');sessionStorage.removeItem('lgat');}
async function login(identifier,password){
 await ready;
 const response=await fetch(config.supabaseUrl+'/functions/v1/identifier-login',{method:'POST',headers:{'Content-Type':'application/json',apikey:config.publishableKey},body:JSON.stringify({identifier,password})});
 const data=await response.json();if(!response.ok)throw new Error('login_failed');
 const {error}=await client.auth.setSession(data);if(error)throw error;
}
async function activate(password){
 const response=await fetch(config.supabaseUrl+'/functions/v1/manual-activation',{method:'POST',headers:{'Content-Type':'application/json',apikey:config.publishableKey},body:JSON.stringify({token:CC.activationToken,password})});
 const data=await response.json();if(!response.ok)throw new Error(data.error||'activation_invalid');
 CC.activationToken='';
}
Object.assign(CC,{ready,api,assets,base,login,activate,logout});
// Preserve original page API contracts while sending authenticated requests to Supabase.
window.fetch=async function(input,options={}){
 const raw=typeof input==='string'?input:'';
 if(!raw.startsWith('/api/'))return nativeFetch(input,options);
 try{
  await ready;let body=options.body?JSON.parse(options.body):{},data;
  if(raw==='/api/login'){
   if(!body.password)data={requires_password:true};
   else{await login(body.identity,body.password);data=await api('/api/me');const {data:{session}}=await client.auth.getSession();data.token=session.access_token;}
  }else if(raw==='/api/admin/login'){
   if(body.password)await login(body.username.includes('@')?body.username:body.username+'@lge.com',body.password);
   data=await api('/api/me');if(!data.admin_profile)throw new Error('Acesso administrativo necessário.');
   const {data:{session}}=await client.auth.getSession();data={token:session.access_token,profile:data.admin_profile};
  }else data=await api(raw,body,options.method||'GET');
  if(raw==='/api/admin/export.csv')return new Response(data.csv,{headers:{'Content-Type':'text/csv'}});
  return new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json'}});
 }catch(e){return new Response(JSON.stringify({detail:e.message==='login_failed'?'Identificação ou senha inválida.':e.message}),{status:e.status||400,headers:{'Content-Type':'application/json'}});}
};
ready.then(()=>client.auth.onAuthStateChange((event,session)=>{if(session&&sessionStorage.getItem('lgpt'))sessionStorage.setItem('lgpt',session.access_token);}));

