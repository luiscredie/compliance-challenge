import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import jsdom from 'jsdom';const {JSDOM,VirtualConsole}=jsdom;
const root=path.resolve('dist'),html=fs.readFileSync(root+'/index.html','utf8'),errors=[];
const me=JSON.parse(fs.readFileSync('tests/fixtures/participant.json','utf8'));
const vc=new VirtualConsole();vc.on('jsdomError',e=>{if(!e.message.includes('CSS'))errors.push(e.message);});
const dom=new JSDOM(html,{url:'https://luiscredie.github.io/compliance-challenge/',runScripts:'outside-only',virtualConsole:vc,pretendToBeVisual:true,beforeParse(w){w.performance.getEntriesByType=()=>[{type:'reload'}];w.sessionStorage.setItem('lgpt','synthetic-session');w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){},addListener(){}});w.IntersectionObserver=class{observe(){}disconnect(){}};w.fetch=async(url,opts)=>{const raw=String(url);if(raw.includes('/locales/')){const p=raw.split('/locales/')[1].split('?')[0];return {ok:true,json:async()=>JSON.parse(fs.readFileSync(root+'/locales/'+p))};}return {ok:true,status:200,json:async()=>raw.startsWith('/api/voting')?{open:true,stories:[],total_votes:0}:me};};}});
dom.window.CC={logout:async()=>{}};
for(const script of dom.window.document.querySelectorAll('script')){
 const src=script.getAttribute('src');if(src?.includes('cloud.js'))continue;
 let code=script.textContent;if(src){const rel=new URL(src,dom.window.location.href).pathname.replace('/compliance-challenge/','');const file=path.join(root,rel);assert.ok(fs.existsSync(file),'Missing script '+rel);code=fs.readFileSync(file,'utf8');}
 try{dom.window.eval(code);}catch(e){errors.push(e.message);}
}
await new Promise(r=>setTimeout(r,500));
assert.deepEqual(errors,[]);const d=dom.window.document;
const i18n=dom.window.LGCI18N;
for(const [locale,label] of [['en-US','Welcome Roulette'],['es-ES','Ruleta de Bienvenida'],['pt-BR','Roleta de Boas-vindas']]){
 await i18n.setLocale(locale,{persist:true,sync:false});
 assert.equal(d.documentElement.lang,locale);assert.equal(i18n.t('onboarding.roulette.title'),label);
 assert.equal(dom.window.localStorage.getItem('lg_compliance_locale'),locale);
 assert.equal(i18n.contentLocale,'pt-BR');
}
const nativeFetch=dom.window.fetch;dom.window.fetch=async()=>({ok:false});
await assert.rejects(i18n.setLocale('es-ES'));assert.equal(i18n.locale,'pt-BR');assert.equal(dom.window.localStorage.getItem('lg_compliance_locale'),'pt-BR');
dom.window.fetch=nativeFetch;
assert.ok(!d.getElementById('dashView').classList.contains('hidden'));assert.match(d.getElementById('activityGrid').textContent,/Roleta de Boas-vindas/);assert.match(d.getElementById('activityGrid').textContent,/Mini Detetive/);assert.ok(d.getElementById('journeyCanvas'));assert.ok(d.getElementById('adminApp'));assert.ok(d.querySelector('a[href="account.html?activate=1"]'));
for(const p of ['stage1','stage2','stage3','camp','detective','onboarding-detective','summit-challenge','account'])assert.ok(fs.existsSync(root+'/'+p+'.html'));
for(const file of fs.readdirSync(root).filter(x=>x.endsWith('.html'))){const s=fs.readFileSync(root+'/'+file,'utf8');assert.ok(s.includes('assets/cloud.js'));assert.ok(!s.includes('src="/assets/'));assert.ok(!/location.href=['"]\//.test(s.replaceAll('/compliance-challenge/','relative/')));}
assert.ok(!html.includes('portal.js'));assert.ok(!fs.existsSync(root+'/supabase'));dom.window.close();console.log('PASS original dashboard DOM, activities, navigation, account access, local assets and deployment paths.');
