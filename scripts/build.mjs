import fs from 'node:fs';import path from 'node:path';import {build} from 'esbuild';
const version=process.env.GITHUB_SHA||String(Date.now());
const stored=fs.existsSync('public-config.json')?JSON.parse(fs.readFileSync('public-config.json','utf8')):{};
const url=process.env.SUPABASE_URL||stored.supabaseUrl||'',key=process.env.SUPABASE_PUBLISHABLE_KEY||stored.publishableKey||'';
if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(url))throw new Error('Set SUPABASE_URL to your https://PROJECT.supabase.co URL.');
// Only the modern public key is accepted: legacy service-role JWTs cannot be pasted by mistake.
if(!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key))throw new Error('Use a Supabase publishable key (sb_publishable_...), never a secret/service_role key.');
fs.rmSync('dist',{recursive:true,force:true});fs.cpSync('site','dist',{recursive:true});
await build({entryPoints:['source/cloud.js'],outfile:'dist/assets/cloud.js',bundle:true,format:'iife',target:['es2022'],minify:true,legalComments:'eof'});
fs.writeFileSync('dist/config.js','window.CC_CONFIG='+JSON.stringify({supabaseUrl:url,publishableKey:key,version})+';\n');fs.writeFileSync('dist/.nojekyll','');
const csp=`default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' ${url} ${url.replace('https:','wss:')}; base-uri 'self'; object-src 'none'; form-action 'self'`;
for(const f of fs.readdirSync('dist').filter(f=>f.endsWith('.html'))){const p=path.join('dist',f);let s=fs.readFileSync(p,'utf8');s=s.replace('<head>','<head><meta http-equiv="Content-Security-Policy" content="'+csp+'"><meta name="referrer" content="no-referrer">');s=s.replace(/(src|href)="([^"?]+\.(?:js|css))"/g,(_,attr,file)=>attr+'="'+file+'?v='+version+'"');fs.writeFileSync(p,s);}
console.log('Built dist/: public screens/assets only. SQL, answer keys and user lists are excluded.');
