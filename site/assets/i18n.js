(()=>{
'use strict';
const SUPPORTED=['pt-BR','en-US','es-ES'],DEFAULT='pt-BR',CONTENT='pt-BR',STORE='lg_compliance_locale';
let locale=DEFAULT,dict={messages:{},legacy:{},attributes:{},patterns:[]},observer=null,busy=false;
const textBase=new WeakMap(),textRendered=new WeakMap(),attrBase=new WeakMap(),attrRendered=new WeakMap();
const normLocale=v=>{v=String(v||'').trim();const a={'pt':'pt-BR','pt-br':'pt-BR','en':'en-US','en-us':'en-US','es':'es-ES','es-es':'es-ES'};return SUPPORTED.includes(v)?v:(a[v.toLowerCase()]||DEFAULT)};
const browserLocale=()=>normLocale((navigator.languages&&navigator.languages[0])||navigator.language||DEFAULT);
const stored=()=>{try{return localStorage.getItem(STORE)}catch{return null}};
const save=v=>{try{localStorage.setItem(STORE,v)}catch{}};
const interpolate=(s,vars={})=>String(s??'').replace(/\{(\w+)\}/g,(_,k)=>vars[k]??`{${k}}`);
function trPattern(text){for(const p of dict.patterns||[]){try{const re=new RegExp(p.regex,p.flags||'');const m=String(text).match(re);if(m){let out=p.replace;for(let i=1;i<m.length;i++)out=out.replaceAll(`$${i}`,m[i]??'');return out}}catch{}}return null}
function translateExact(raw){const text=String(raw??'');if(locale===DEFAULT)return text;return dict.legacy?.[text]??trPattern(text)??text}
function t(key,vars={}){const v=dict.messages?.[key];return interpolate(v??key,vars)}
function baseForText(n){const raw=n.nodeValue||'',prev=textRendered.get(n);if(!textBase.has(n)||(prev!==undefined&&raw!==prev&&!busy))textBase.set(n,raw);return textBase.get(n)||''}
function shouldSkip(node){const el=node.nodeType===1?node:node.parentElement;if(!el)return true;if(el.closest('[data-i18n-skip="true"]'))return true;if(el.closest('script,style,code,pre,textarea'))return true;return false}
function translateTextNode(n){if(!n||n.nodeType!==3||shouldSkip(n))return;const raw=baseForText(n),trimmed=raw.trim();if(!trimmed)return;const out=locale===DEFAULT?trimmed:translateExact(trimmed);const pre=raw.match(/^\s*/)?.[0]||'',post=raw.match(/\s*$/)?.[0]||'',rendered=pre+out+post;if(n.nodeValue!==rendered)n.nodeValue=rendered;textRendered.set(n,rendered)}
function attrMaps(el){let b=attrBase.get(el),r=attrRendered.get(el);if(!b){b={};attrBase.set(el,b)}if(!r){r={};attrRendered.set(el,r)}return [b,r]}
function translateAttr(el,attr){const [base,rendered]=attrMaps(el),raw=el.getAttribute(attr);if(raw==null)return;if(!(attr in base)||(rendered[attr]!==undefined&&raw!==rendered[attr]&&!busy))base[attr]=raw;const src=base[attr],out=locale===DEFAULT?src:(dict.attributes?.[src]??translateExact(src));if(raw!==out)el.setAttribute(attr,out);rendered[attr]=out}
function apply(root=document){if(busy)return;busy=true;try{const r=root.nodeType?root:document;
  const keyed=[];if(r.nodeType===1&&r.matches?.('[data-i18n]'))keyed.push(r);keyed.push(...(r.querySelectorAll?.('[data-i18n]')||[]));keyed.forEach(el=>{const key=el.dataset.i18n;if(dict.messages?.[key]!=null&&el.textContent!==t(key))el.textContent=t(key)});
  const walker=document.createTreeWalker(r,NodeFilter.SHOW_TEXT);let n;while(n=walker.nextNode())translateTextNode(n);
  const attrs=[];if(r.nodeType===1&&r.matches?.('[placeholder],[title],[aria-label]'))attrs.push(r);attrs.push(...(r.querySelectorAll?.('[placeholder],[title],[aria-label]')||[]));attrs.forEach(el=>['placeholder','title','aria-label'].forEach(a=>translateAttr(el,a)));
}catch{}finally{busy=false}}
async function loadDictionary(next){
 const version=window.CC_CONFIG?.version||'restored';
 const r=await fetch(`/locales/${encodeURIComponent(next)}/ui.json?v=${encodeURIComponent(version)}`,{cache:'no-store'});
 if(!r.ok)throw new Error('Não foi possível carregar o idioma. Tente novamente.');
 const data=await r.json();
 if(data.locale!==next||!data.messages||!data.legacy||!Array.isArray(data.patterns))throw new Error('Arquivo de idioma inválido.');
 return data;
}
function selectorHosts(){const q=['.account-header','.topright','#portal > .top .toolbar','#adminApp > .top','.detHead','.head'];const out=[];for(const sel of q){for(const el of document.querySelectorAll(sel)){if(!out.includes(el))out.push(el)}}return out.length?out:[document.body]}
function injectSelector(){const hosts=selectorHosts();hosts.forEach((host,i)=>{if(host.querySelector('.lgc-locale'))return;const wrap=document.createElement('div');wrap.className='lgc-locale';wrap.innerHTML=`<span class="lgc-globe" aria-hidden="true">🌐</span><label class="sr-only">Language</label><select class="lgc-locale-select" aria-label="Language"><option value="pt-BR">PT</option><option value="en-US">EN</option><option value="es-ES">ES</option></select>`;host.appendChild(wrap);wrap.querySelector('select').addEventListener('change',e=>setLocale(e.target.value,{persist:true,sync:true}).catch(error=>{e.target.value=locale;window.alert(error.message)}))})}
function contentPage(){return /\/(stage[123]|detective|onboarding-detective|camp|summit-challenge)\.html$/i.test(location.pathname)}
function updateContentNotice(){let n=document.getElementById('lgcContentLocaleNotice');if(!contentPage()){if(n)n.hidden=true;return}if(!n){n=document.createElement('div');n.id='lgcContentLocaleNotice';n.className='lgc-content-locale-notice';const main=document.querySelector('main,.app');(main?.parentNode||document.body).insertBefore(n,main||document.body.firstChild)}n.hidden=locale===CONTENT;n.textContent=t('content.portuguese_only')}
function updateDocument(){document.documentElement.lang=locale;document.documentElement.dataset.locale=locale;document.querySelectorAll('.lgc-locale-select').forEach(sel=>sel.value=locale);updateContentNotice();document.dispatchEvent(new CustomEvent('lgc:locale-changed',{detail:{locale,contentLocale:CONTENT}}))}
async function syncServer(){const token=sessionStorage.getItem('lgpt');if(!token)return;try{await fetch('/api/profile/locale',{method:'POST',headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({locale})})}catch{}}
async function syncParticipant(participant){if(!participant)return;const pref=participant.preferred_locale;if(pref&&SUPPORTED.includes(pref)){if(pref!==locale)await setLocale(pref,{persist:true,sync:false})}else await syncServer()}
async function syncFromSession(){const token=sessionStorage.getItem('lgpt');if(!token)return;try{const r=await fetch('/api/me',{headers:{'Authorization':'Bearer '+token},cache:'no-store'});if(r.ok){const d=await r.json();await syncParticipant(d.participant)}}catch{}}
let localeRequest=0;
async function setLocale(next,{persist=true,sync=false}={}){
 next=normLocale(next);const request=++localeRequest;
 const loaded=await loadDictionary(next);
 if(request!==localeRequest)return locale;
 dict=loaded;locale=next;if(persist)save(next);
 updateDocument();apply(document);if(sync)await syncServer();return locale;
}
function observe(){if(observer)observer.disconnect();observer=new MutationObserver(ms=>{if(busy)return;for(const m of ms){if(m.type==='characterData')translateTextNode(m.target);for(const n of m.addedNodes||[]){if(n.nodeType===1||n.nodeType===11)apply(n);else if(n.nodeType===3)translateTextNode(n)}if(m.type==='attributes')translateAttr(m.target,m.attributeName)}});observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','title','aria-label']})}
function formatDateTime(value,opts={}){if(!value)return '';try{return new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeStyle:'short',timeZone:'America/Sao_Paulo',...opts}).format(new Date(value))}catch{return String(value)}}
function formatNumber(value,opts={}){try{return new Intl.NumberFormat(locale,opts).format(Number(value||0))}catch{return String(value??0)}}
const nativeAlert=window.alert.bind(window),nativeConfirm=window.confirm.bind(window),nativePrompt=window.prompt.bind(window);window.alert=m=>nativeAlert(translateExact(m));window.confirm=m=>nativeConfirm(translateExact(m));window.prompt=(m,d)=>nativePrompt(translateExact(m),d);
async function init(){injectSelector();const start=normLocale(stored()||browserLocale());await setLocale(start,{persist:false,sync:false});observe();await syncFromSession()}
window.LGCI18N={init,setLocale,get locale(){return locale},get contentLocale(){return CONTENT},t,translate:translateExact,apply,formatDateTime,formatNumber,syncParticipant,syncFromSession,supported:SUPPORTED};window.t=(k,v)=>LGCI18N.t(k,v);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>init().catch(error=>console.error(error.message)),{once:true});else init().catch(error=>console.error(error.message));
})();
