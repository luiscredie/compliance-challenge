'use strict';
const $=id=>document.getElementById(id);
let locale=sessionStorage.getItem('cc_locale')||'pt-BR', dictionaries={}, me=null, admin=null, rankingScope='site', acceptingPrivacy=false;
const t=k=>dictionaries[locale]?.[k]||dictionaries['pt-BR']?.[k]||k;
const message=text=>{$('message').textContent=text||'';};
function applyLanguage(){document.documentElement.lang=locale;document.querySelectorAll('[data-t]').forEach(el=>el.textContent=t(el.dataset.t));$('language').value=locale;}
async function task(fn,button){if(button)button.disabled=true;message('');try{await fn();}catch(e){message(e.message||t('failure'));}finally{if(button)button.disabled=false;}}
function passwordValid(p){return p.length>=12&&p.length<=128&&/[a-zA-Z]/.test(p)&&/[0-9]/.test(p);}
function td(row,text){const cell=document.createElement('td');cell.textContent=text;row.append(cell);return cell;}
function renderRanking(){const tbody=$('rankingRows');tbody.replaceChildren();for(const r of me?.rankings?.[rankingScope]||[]){const tr=document.createElement('tr');if(r.is_current)tr.className='current';for(const v of [r.position,r.identity,r.site,Number(r.score).toLocaleString(locale)])td(tr,v);tbody.append(tr);}}
function renderStages(){
 $('stages').replaceChildren();for(let stage=1;stage<=3;stage++){
  const done=me.participant.completed[String(stage)],open=me.config.stages[String(stage)].open,previous=stage===1||me.participant.completed[String(stage-1)];
  const article=document.createElement('article');article.className='panel';
  const label=document.createElement('p');label.className='eyebrow';label.textContent=t('stage')+' '+stage;
  const title=document.createElement('h2');title.textContent=me.config.stage_meta[String(stage)].label;
  const score=document.createElement('p');score.textContent=Number(me.participant.stage_scores[String(stage)]).toLocaleString(locale)+' '+t('points');
  const go=document.createElement(open&&previous&&!done?'a':'button');go.className='button primary';
  go.textContent=done?t('completed'):!open?t('closed'):!previous?t('previous'):t('play');
  if(go.tagName==='A')go.href='stage'+stage+'.html';else go.disabled=true;
  article.append(label,title,score,go);$('stages').append(article);
 }
}
async function refresh(){
 me=await CC.api('/api/me');$('loginPanel').hidden=true;$('newPasswordPanel').hidden=true;$('dashboard').hidden=false;$('logout').hidden=false;
 $('participantName').textContent=me.participant.name;$('participantSite').textContent=me.participant.site+' · '+me.participant.masked_identity;$('totalScore').textContent=Number(me.participant.score).toLocaleString(locale);
 renderStages();renderRanking();$('adminPanel').hidden=!me.admin_profile;
 if(me.admin_profile)await loadAdmin();
 acceptingPrivacy=me.privacy_required;
 if(acceptingPrivacy&&!$('privacy').open)$('privacy').showModal();
}
async function loadAdmin(){
 admin=await CC.api('/api/admin/overview');const isSuper=admin.role==='super_admin';$('securityReport').hidden=!isSuper;$('addUserDetails').hidden=!isSuper;$('stageControls').replaceChildren();
 if(isSuper)for(let st=1;st<=3;st++){const b=document.createElement('button');const open=admin.stages[String(st)].open;b.textContent=(open?t('close'):t('open'))+' '+t('stage')+' '+st;b.onclick=()=>task(async()=>{await CC.api('/api/admin/stages/'+st,{open:!open});await refresh();},b);$('stageControls').append(b);}
 $('adminRows').replaceChildren();for(const p of admin.participants){const tr=document.createElement('tr');td(tr,p.name);td(tr,p.site);td(tr,p.participant?.score??'—');const cell=td(tr,'');if(p.role==='participant'||isSuper){const b=document.createElement('button');b.textContent=t('revoke');b.onclick=()=>task(async()=>{if(!confirm(t('confirmRevoke')+' '+p.name+'?'))return;await CC.api('/api/admin/revoke-sessions',{email:p.email});message(t('revoked'));},b);cell.append(b);}$('adminRows').append(tr);}
}
$('loginForm').onsubmit=e=>{e.preventDefault();task(async()=>{await CC.ready;try{await CC.login($('email').value.trim(),$('password').value);}catch{throw new Error(t('loginFailed'));}$('password').value='';await refresh();},e.submitter);};
$('signup').onclick=e=>task(async()=>{
 await CC.ready;if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('email').value.trim()))throw new Error(t('emailForSetup'));if(!$('email').reportValidity()||!passwordValid($('password').value))throw new Error(t('passwordPolicy'));
 const {error}=await CC.client.auth.signUp({email:$('email').value.trim(),password:$('password').value,options:{emailRedirectTo:new URL('index.html?flow=verify',CC.base).href}});
 if(error)throw new Error(t('signupFailed'));$('password').value='';message(t('checkEmail'));
},e.currentTarget);
$('recover').onclick=e=>task(async()=>{await CC.ready;if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($('email').value.trim()))throw new Error(t('emailForRecovery'));const {error}=await CC.client.auth.resetPasswordForEmail($('email').value.trim(),{redirectTo:new URL('index.html?flow=recovery',CC.base).href});if(error)throw new Error(t('emailFailed'));message(t('recoveryRequested'));},e.currentTarget);
$('newPasswordForm').onsubmit=e=>{e.preventDefault();task(async()=>{const p=$('newPassword').value;if(!passwordValid(p))throw new Error(t('passwordPolicy'));if(p!==$('confirmPassword').value)throw new Error(t('passwordMismatch'));const {error}=await CC.client.auth.updateUser({password:p});if(error)throw new Error(t('passwordFailed'));await CC.client.auth.signOut({scope:'global'});history.replaceState(null,'','index.html');$('newPasswordPanel').hidden=true;$('loginPanel').hidden=false;$('newPassword').value='';$('confirmPassword').value='';message(t('passwordSaved'));},e.submitter);};
$('logout').onclick=e=>task(async()=>{await CC.api('/api/logout');await CC.client.auth.signOut({scope:'local'});sessionStorage.removeItem('lgpt');location.replace('index.html');},e.currentTarget);
$('language').onchange=()=>task(async()=>{locale=$('language').value;sessionStorage.setItem('cc_locale',locale);applyLanguage();if(me){await CC.api('/api/profile/locale',{locale});await refresh();}});
$('acceptPrivacy').onclick=e=>task(async()=>{if(acceptingPrivacy){await CC.api('/api/privacy/acknowledge');acceptingPrivacy=false;} $('privacy').close();},e.currentTarget);
$('privacy').addEventListener('cancel',e=>{if(acceptingPrivacy)e.preventDefault();});
$('showPrivacy').onclick=()=>{$('privacy').showModal();};
$('siteRanking').onclick=()=>{rankingScope='site';renderRanking();};$('globalRanking').onclick=()=>{rankingScope='global';renderRanking();};
$('securityReport').onclick=e=>task(async()=>{const report=await CC.api('/api/admin/security-report/export');const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='compliance-security-report.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},e.currentTarget);
$('addUserForm').onsubmit=e=>{e.preventDefault();task(async()=>{await CC.api('/api/admin/authorized-users',{email:$('userEmail').value.trim(),name:$('userName').value.trim(),employee_id:$('employeeId').value.trim(),site:$('userSite').value});$('addUserForm').reset();await loadAdmin();message(t('authorized'));},e.submitter);};
(async()=>{try{
 for(const loc of ['pt-BR','en-US','es-ES']){const response=await fetch('locales/'+loc+'/ui.json');if(!response.ok)throw new Error('Não foi possível carregar os idiomas.');dictionaries[loc]=await response.json();}
 if(!dictionaries[locale])locale='pt-BR';applyLanguage();await CC.ready;
 const {data:{session}}=await CC.client.auth.getSession();const flow=new URLSearchParams(location.search).get('flow');
 if(!session&&flow==='recovery')message(t('recoveryExpired'));
 if(session&&flow==='recovery'){$('loginPanel').hidden=true;$('newPasswordPanel').hidden=false;}
 else if(session){history.replaceState(null,'','index.html');await refresh();}
 }catch(e){message(e.message);}
})();
