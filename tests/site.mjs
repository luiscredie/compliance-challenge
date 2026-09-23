import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
const pages=fs.readdirSync('site').filter(f=>f.endsWith('.html'));
for(const file of pages){const html=fs.readFileSync('site/'+file,'utf8');assert(!/\b(?:src|href)=["']\//.test(html),file+' root-relative path');assert(!/on(?:click|load|error)=/i.test(html),file+' inline event');for(const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)){const ref=match[1].split('?')[0];if(/^(https?:|#|data:)/.test(ref)||ref==='assets/cloud.js')continue;assert(fs.existsSync(path.resolve('site',ref)),file+' missing '+ref);}}
for(const f of ['site/assets/game.js','site/assets/achievement-toast.js','source/cloud.js','scripts/build.mjs'])execFileSync(process.execPath,['--check',f]);
const locales=['pt-BR','en-US','es-ES'].map(x=>JSON.parse(fs.readFileSync(`site/locales/${x}/ui.json`)));for(const loc of locales)assert.deepEqual(Object.keys(loc).sort(),Object.keys(locales[0]).sort());
const html=fs.readFileSync('site/index.html','utf8');for(const m of html.matchAll(/data-t="([^"]+)"/g))for(const l of locales)assert(l[m[1]],'missing translation '+m[1]);
function walk(p){return fs.readdirSync(p,{withFileTypes:true}).flatMap(d=>d.isDirectory()?walk(path.join(p,d.name)):[path.join(p,d.name)]);}
for(const f of walk('site')){assert(!/\.(sql|py|zip|env)$/i.test(f),'private extension in site: '+f);if(/\.(json|js|html|css)$/i.test(f)){const text=fs.readFileSync(f,'utf8');assert(!/sb_secret_[A-Za-z0-9_-]{10,}|"service_role"\s*:|scrypt\$16384\$/.test(text),'secret in '+f);assert(!/"useful_evidence"\s*:|"state_impact"\s*:|"risk_delta_correct"\s*:/.test(text),'answer material in '+f);}}
console.log('PASS static package: paths, JavaScript, locale coverage and private-data exclusion.');
// Test actual bundled SDK startup, not a mock: catches initialization-order regressions.
const {JSDOM}=await import('jsdom');const {build}=await import('esbuild');
const bundle=await build({entryPoints:['source/cloud.js'],bundle:true,format:'iife',write:false,target:'es2022'});
const dom=new JSDOM('<!doctype html><html></html>',{url:'https://example.github.io/compliance/index.html',runScripts:'outside-only'});
dom.window.fetch=fetch;dom.window.WebSocket=WebSocket;dom.window.CC_CONFIG={supabaseUrl:'https://example.supabase.co',publishableKey:'sb_publishable_TEST_ONLY'};
dom.window.eval(bundle.outputFiles[0].text);await dom.window.CC.ready;assert(dom.window.CC.client);dom.window.CC.client.auth.stopAutoRefresh();dom.window.close();console.log('PASS bundled Supabase SDK initializes with empty session storage.');
