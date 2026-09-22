(()=>{
'use strict';
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const ROOT='/assets/badges/2026/';
const pageBadgeMap={
 'mestre da investigacao':'28-mestre-da-investigacao.png',
 'cume em equipe':'29-cume-em-equipe.png',
 'compliance champion':'31-compliance-champion.png'
};
function modalish(el){return el.closest('[role="dialog"],dialog,.modal,[class*="modal"],[class*="dialog"],.overlay,[class*="overlay"],.toast,[class*="toast"],[class*="celebr"]');}
function fixAwardImages(root=document){
 const imgs=[];if(root instanceof HTMLImageElement)imgs.push(root);if(root.querySelectorAll)imgs.push(...root.querySelectorAll('img'));
 for(const img of imgs){
  const host=modalish(img)||img.closest('main,section,article');if(!host)continue;
  const text=norm(host.textContent);const key=Object.keys(pageBadgeMap).find(k=>text.includes(k));
  if(!key)continue;
  const src=ROOT+pageBadgeMap[key]+'?v=20260825g';
  if(img.getAttribute('src')!==src){img.src=src;img.removeAttribute('srcset');img.dataset.award2026='true';}
 }
}
function fixFog(){
 const modal=document.querySelector('#easterEggModal');if(!modal)return;
 const img=modal.querySelector('.easterVisual,img');
 if(img&&!img.dataset.fogNarrative){img.src='/assets/easter-neblina.webp?v=20260825g';img.removeAttribute('srcset');img.dataset.fogNarrative='true';}
 const buttons=[...modal.querySelectorAll('button')];
 const continueBtn=buttons.find(b=>/continuar/.test(norm(b.textContent)))||buttons.find(b=>/voltar.*expedicao/.test(norm(b.textContent)));
 buttons.forEach(b=>{if(b!==continueBtn&&!/fechar/.test(norm(b.getAttribute('aria-label'))))b.hidden=true;});
 if(continueBtn){continueBtn.hidden=false;continueBtn.textContent='CONTINUAR A EXPEDIÇÃO';}
}
function storyButtons(){
 document.addEventListener('click',e=>{
  const b=e.target.closest('button,a');if(!b||!/^ler historia$/.test(norm(b.textContent)))return;
  const card=b.closest('.storyCard,.voteCard,[class*="story"],[class*="vote"]');if(!card)return;
  const alternate=card.querySelector('a[href]:not([href="#"]),[data-story-id],[data-story],[onclick]');
  if(alternate&&alternate!==b){e.preventDefault();alternate.click();}
 },true);
}
function collectiveButton(){
 document.addEventListener('click',async e=>{
  const b=e.target.closest('button,a');if(!b||!norm(b.textContent).includes('atualizar resultado coletivo'))return;
  if(b.dataset.refreshBound==='busy')return;
  b.dataset.refreshBound='busy';const old=b.textContent;b.textContent='ATUALIZANDO...';b.setAttribute('aria-busy','true');
  try{await fetch(location.href,{cache:'no-store',credentials:'same-origin'});location.reload();}
  catch(err){b.textContent='NÃO FOI POSSÍVEL ATUALIZAR';setTimeout(()=>{b.textContent=old;b.removeAttribute('aria-busy');b.dataset.refreshBound='';},1800);}
 },true);
}
let q=false;function apply(root=document){fixAwardImages(root);fixFog();}
new MutationObserver(rs=>{if(q)return;q=true;requestAnimationFrame(()=>{q=false;rs.forEach(r=>r.addedNodes.forEach(n=>apply(n)));apply(document);});}).observe(document.documentElement,{subtree:true,childList:true,characterData:true});
storyButtons();collectiveButton();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>apply(),{once:true});else apply();
})();
