import fs from 'node:fs';import path from 'node:path';import {build} from 'esbuild';
const version=process.env.GITHUB_SHA||String(Date.now());
const stored=fs.existsSync('public-config.json')?JSON.parse(fs.readFileSync('public-config.json','utf8')):{};
const url=process.env.SUPABASE_URL||stored.supabaseUrl||'',key=process.env.SUPABASE_PUBLISHABLE_KEY||stored.publishableKey||'';
if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url))throw new Error('Set SUPABASE_URL to your https://PROJECT.supabase.co URL.');
// Only the modern public key is accepted: legacy service-role JWTs cannot be pasted by mistake.
if(!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key))throw new Error('Use a Supabase publishable key (sb_publishable_...), never a secret/service_role key.');
fs.rmSync('dist',{recursive:true,force:true});fs.cpSync('site','dist',{recursive:true});
await build({entryPoints:['source/cloud.js'],outfile:'dist/assets/cloud.js',bundle:true,format:'iife',target:['es2022'],minify:true,legalComments:'eof'});
fs.writeFileSync('dist/config.js','window.CC_CONFIG='+JSON.stringify({supabaseUrl:url,publishableKey:key,version,emailAuthEnabled:stored.emailAuthEnabled===true})+';\n');fs.writeFileSync('dist/.nojekyll','');
const csp=`default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' ${url} ${url.replace('https:','wss:')}; base-uri 'self'; object-src 'none'; form-action 'self'`;
const publicBase='/compliance-challenge/';
// Original files retain their structure. Only deployment-relative paths change.
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
for(const p of walk('dist').filter(f=>!f.endsWith('/cloud.js')&&/\.(html|css|js|json)$/.test(f))){let s=fs.readFileSync(p,'utf8');
 s=s.replaceAll('/assets/',publicBase+'assets/').replaceAll('/locales/',publicBase+'locales/');
 if(p.endsWith('.html')||p.endsWith('.js')){
  s=s.replace(/(["'`])\/(stage[123]|camp|detective|onboarding-detective|summit-challenge|index)\.html/g,(_,q,n)=>q+publicBase+n+'.html');
  s=s.replaceAll('`/stage${','`'+publicBase+'stage${');
  s=s.replace(/(location\.(?:href|assign|replace)\s*(?:=|\()\s*)(["'])\/\2/g,(_,pre,q)=>pre+q+publicBase+q);
  s=s.replace(/href=(["'])\/\1/g,(_,q)=>'href='+q+publicBase+q);
 }
 if(p.endsWith('.html')){s=s.replace('<head>','<head><meta http-equiv="Content-Security-Policy" content="'+csp+'"><meta name="referrer" content="no-referrer">');s=s.replace(/(src|href)="([^"?]+\.(?:js|css))(?:\?[^" ]*)?"/g,(_,attr,file)=>attr+'="'+file+'?v='+version+'"');}
 fs.writeFileSync(p,s);
}
console.log('Built original screens for GitHub Pages. Private keys and records are excluded.');
