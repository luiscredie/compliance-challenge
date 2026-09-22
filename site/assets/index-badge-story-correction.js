(()=>{
'use strict';
const ROOT='/assets/badges/2026/',V='?v=20260825h';
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const CATALOG={
 'compliance champion':'31-compliance-champion.png','multiplicador':'30-multiplicador-conquista.png','cume em equipe':'29-cume-em-equipe.png','mestre da investigacao':'28-mestre-da-investigacao.png','julgamento sob pressao':'27-julgamento-sob-pressao.png','cume alcancado':'26-cume-alcancado.png','decisao do cume':'25-decisao-do-cume.png','protecao contra retaliacao':'24-protecao-contra-retaliacao.png','preservacao de evidencias':'23-preservacao-de-evidencias.png','leitura critica':'22-leitura-critica.png','misterio da neblina':'21-misterio-da-neblina.png','guia do acampamento':'20-guia-do-acampamento.png','fogueira afiada':'19-fogueira-afiada.png','trilha das conquistas ouro':'18-trilha-das-conquistas-ouro.png','trilha das conquistas prata':'17-trilha-das-conquistas-prata.png','trilha das conquistas bronze':'16-trilha-das-conquistas-bronze.png','trilha das conquistas':'15-trilha-das-conquistas-normal.png','olhar de integridade':'14-olhar-de-integridade.png','primeiros passos':'13-primeiros-passos.png','olhar de risco':'12-olhar-de-risco.png','acampamento 2':'11-acampamento-2.png','caixa comercial limpa':'10-caixa-comercial-limpa.png','guardiao das relacoes':'09-guardiao-das-relacoes.png','concorrencia responsavel':'08-concorrencia-responsavel.png','comunicacao confiavel':'07-comunicacao-confiavel.png','precisao de elite':'06-precisao-de-elite.png','primeiro acampamento':'05-primeiro-acampamento.png','comunicacao que engaja':'04-comunicacao-que-engaja.png','caixa limpa':'03-caixa-limpa.png','processo seguro':'02-processo-seguro.png','detetive de integridade':'01-detetive-de-integridade.png'};
const KEYS=Object.keys(CATALOG).sort((a,b)=>b.length-a.length);
function exactCard(img){
 let n=img.parentElement,best=null;
 for(let i=0;i<8&&n;i++,n=n.parentElement){
  const text=norm(n.textContent),matches=KEYS.filter(k=>text.includes(k));
  if(matches.length===1){best={node:n,key:matches[0]};break;}
 }
 return best;
}
function set(img,file,label){const src=ROOT+file+V;if(img.getAttribute('src')!==src)img.setAttribute('src',src);img.removeAttribute('srcset');img.alt='Badge '+label;img.dataset.catalog2026='true';}
function fixGrid(){
 const roots=[...document.querySelectorAll('#badgeCard,#badgesGrid,#badgeGrid,.journeyAchievements,.achievementsSection')];
 roots.forEach(root=>root.querySelectorAll('img').forEach(img=>{const hit=exactCard(img);if(hit)set(img,CATALOG[hit.key],hit.key);}));
}
function fixActivityBadge(){
 document.querySelectorAll('#activityCard,[class*="activityCard"],section').forEach(card=>{
  const t=norm(card.textContent);
  if(!t.includes('primeira atividade')||!t.includes('votacao popular'))return;
  const img=card.querySelector('img');if(img)set(img,CATALOG['comunicacao que engaja'],'comunicacao que engaja');
 });
}
function fixStoryText(root=document){
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 nodes.forEach(n=>{if(/voltar\s+à\s+s\s+histórias/i.test(n.nodeValue))n.nodeValue=n.nodeValue.replace(/voltar\s+à\s+s\s+histórias/ig,'Voltar às histórias');});
}
function storyImageError(img){
 const src=String(img.getAttribute('src')||'');if(!/\/assets\/voting\/story-\d+/i.test(src)||img.dataset.storyFixed)return;
 img.dataset.storyFixed='true';
 img.addEventListener('error',()=>{
  img.hidden=true;const host=img.parentElement;if(!host)return;host.classList.add('storyPhotoMissing');
  let p=host.querySelector('.storyPhotoPlaceholder');if(!p){p=document.createElement('div');p.className='storyPhotoPlaceholder';p.setAttribute('role','img');p.setAttribute('aria-label','Foto da história indisponível');p.textContent='História de Compliance';host.appendChild(p);}
 },{once:true});
}
function fixStoryImages(root=document){if(root instanceof HTMLImageElement)storyImageError(root);if(root.querySelectorAll)root.querySelectorAll('img').forEach(storyImageError);}
let q=false;function apply(root=document){fixGrid();fixActivityBadge();fixStoryText(root);fixStoryImages(root);}
new MutationObserver(rs=>{if(q)return;q=true;requestAnimationFrame(()=>{q=false;rs.forEach(r=>r.addedNodes.forEach(n=>{if(n.nodeType===1)apply(n)}));apply(document);});}).observe(document.documentElement,{subtree:true,childList:true,characterData:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>apply(),{once:true});else apply();
})();
