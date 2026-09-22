import {createClient} from 'npm:@supabase/supabase-js@2.116.0';
import {Engine,ApiError} from './engine.ts';
const origin='https://luiscredie.github.io';
const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Cache-Control':'no-store','Content-Type':'application/json'};
const service=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
// JWT verification is explicit below, followed by a live auth.sessions/allowlist check in SQL.
Deno.serve(async req=>{
 const reply=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='POST')return reply({detail:'Método inválido.'},405);
 if(req.headers.get('origin')&&req.headers.get('origin')!==origin)return reply({detail:'Origem inválida.'},403);
 try{
  const raw=await req.text();if(raw.length>2500000)return reply({detail:'Solicitação muito grande.'},413);
  const input=JSON.parse(raw);if(typeof input.path!=='string'||input.path.length>1000||!input.path.startsWith('/api/'))return reply({detail:'Solicitação inválida.'},400);
  const token=(req.headers.get('authorization')||'').replace(/^Bearer /,'');
  const {data:{user},error:authError}=await service.auth.getUser(token);if(authError||!user)return reply({detail:'Entre novamente para continuar.'},401);
  const claims=JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))),sid=claims.session_id;
  if(!sid)return reply({detail:'Sessão inválida.'},401);
  for(let retry=0;retry<6;retry++){
   const {data:snapshot,error}=await service.rpc('cc_engine_snapshot',{uid:user.id,sid});
   if(error)return reply({detail:error.code==='28000'?'Sessão encerrada. Entre novamente.':'Acesso não autorizado.'},error.code==='28000'?401:403);
   if(!snapshot.content)return reply({detail:'Atualização em andamento. Tente novamente em instantes.'},503);
   const before=JSON.stringify(snapshot.state),engine=new Engine(snapshot,snapshot.content,snapshot.actor);
   const result=await engine.handle(input.path,input.method||'GET',input.body||{});
   if(JSON.stringify(engine.d)!==before||engine.changes.length||engine.backup){
    const {data:saved,error:saveError}=await service.rpc('cc_engine_commit',{uid:user.id,sid,expected_revision:snapshot.revision,new_state:engine.d,changes:engine.changes,events:[...engine.events,...(input.method&&input.method!=='GET'?[{action:'campaign_request',detail:{path:input.path}}]:[])],backup_doc:engine.backup});
    if(saveError){console.error('campaign_commit',saveError.code);return reply({detail:saveError.code==='28000'?'Sessão encerrada. Entre novamente.':'Não foi possível salvar. Confira os dados e tente novamente.'},saveError.code==='28000'?401:409);}
    if(!saved)continue;
   }
   if(result?.account_action==='recovery'||(input.path==='/api/admin/authorized-users'&&input.method==='POST')){
    const email=result.target_email||result.user?.email,bytes=crypto.getRandomValues(new Uint8Array(32)),code=btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
    const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(code)))).map(x=>x.toString(16).padStart(2,'0')).join('');
    const {error:issueError}=await service.rpc('cc_issue_access',{uid:user.id,sid,target_email:email,digest});if(issueError)return reply({detail:'Cadastro salvo. Não foi possível gerar o código; tente novamente no controle Senha.'},409);
    return reply({ok:true,recovery_code:code,activation_url:'https://luiscredie.github.io/compliance-challenge/account.html?activate=1',expires_in_hours:24,message:'Código válido por 24 horas e um único uso. Entregue diretamente à pessoa após verificar sua identidade.'});
   }
   return reply(result);
  }
  return reply({detail:'Houve outra atualização simultânea. Tente novamente.'},409);
 }catch(e){if(e instanceof ApiError)return reply({detail:e.message},e.status);console.error('campaign_error',e instanceof Error?e.message:'unknown');return reply({detail:'Não foi possível concluir a operação. Tente novamente.'},500);}
});
