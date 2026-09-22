import assert from 'node:assert/strict';
import fs from 'node:fs';
import jsdom from 'jsdom';
const {JSDOM}=jsdom;
const dictionaries=Object.fromEntries(['pt-BR','en-US','es-ES'].map(locale=>[locale,JSON.parse(fs.readFileSync(`site/locales/${locale}/ui.json`,'utf8'))]));
for(const [locale,d] of Object.entries(dictionaries)){
 assert.equal(d.locale,locale);assert.equal(d.content_locale,'pt-BR');
 assert.deepEqual(Object.keys(d.messages).sort(),Object.keys(dictionaries['pt-BR'].messages).sort());
}
const dom=new JSDOM('<main><h1 data-i18n="onboarding.roulette.title"></h1><span data-i18n-skip="true">Conteúdo original da missão</span></main>',{url:'https://example.test/compliance-challenge/index.html',runScripts:'outside-only'});
const w=dom.window;w.localStorage.setItem('lg_compliance_locale','pt-BR');
const requests=[];
w.fetch=async url=>{requests.push(String(url));const locale=String(url).match(/locales\/([^/]+)\//)?.[1];return {ok:!!dictionaries[locale],json:async()=>dictionaries[locale]};};
w.eval(fs.readFileSync('site/assets/i18n.js','utf8'));
await new Promise(resolve=>setTimeout(resolve,20));
for(const [locale,label] of [['en-US','Welcome Roulette'],['es-ES','Ruleta de Bienvenida'],['pt-BR','Roleta de Boas-vindas']]){
 const select=w.document.querySelector('.lgc-locale-select');assert.ok(select);select.value=locale;select.dispatchEvent(new w.Event('change'));
 await new Promise(resolve=>setTimeout(resolve,20));
 assert.equal(w.document.documentElement.lang,locale);assert.equal(w.document.querySelector('h1').textContent,label);
 assert.equal(w.localStorage.getItem('lg_compliance_locale'),locale);
 assert.equal(w.document.querySelector('[data-i18n-skip]').textContent,'Conteúdo original da missão');
}
assert.ok(requests.every(url=>url.startsWith('/locales/')&&url.includes('?v=')));
w.fetch=async()=>({ok:false});await assert.rejects(w.LGCI18N.setLocale('es-ES'));
assert.equal(w.LGCI18N.locale,'pt-BR');assert.equal(w.localStorage.getItem('lg_compliance_locale'),'pt-BR');
w.close();console.log('PASS PT/EN/ES dictionary parity, selector changes, persistence, unchanged mission content and failed-load recovery.');
