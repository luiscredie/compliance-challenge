(()=>{
 'use strict';
 const token=()=>sessionStorage.getItem('lgpt')||'';
 const closeFog=()=>{const m=document.getElementById('easterEggModal')||document.querySelector('.fogEasterModal');if(!m)return;m.classList.add('hidden');m.setAttribute('hidden','');m.setAttribute('aria-hidden','true');document.body.style.overflow=''};
 async function earnFog(){
   if(!token())return;
   try{const r=await fetch('/api/easter/fog/complete',{method:'POST',headers:{Authorization:'Bearer '+token(),'Content-Type':'application/json'},cache:'no-store'});if(!r.ok)return;const d=await r.json();if(d.unlocked&&window.LGCAchievement?.show)window.LGCAchievement.show({name:'Mistério da Neblina',asset:'misterio-neblina-roraima.png'});}catch(_){ }
 }
 function fixFog(){
   const m=document.getElementById('easterEggModal')||document.querySelector('.fogEasterModal');if(!m||m.dataset.round5)return;m.dataset.round5='1';
   const card=m.querySelector('.modalCard')||m.firstElementChild||m;
   const old=card.querySelector('img');if(old){old.src='/assets/campaign/roraima-expedition-products-2026.png?v=20260911e';old.alt='Geladeira LG no topo do Monte Roraima em meio à neblina';old.classList.add('fogVisual')}
   card.querySelectorAll('p').forEach(p=>{if(/geladeira|neblina/i.test(p.textContent||''))p.textContent='Uma geladeira LG no topo do Monte Roraima revelou a origem da neblina. Mistério resolvido com atenção aos detalhes.'});
   const x=document.createElement('button');x.type='button';x.className='round5Close';x.setAttribute('aria-label','Fechar');x.textContent='×';x.addEventListener('click',closeFog);card.prepend(x);
   const b=document.createElement('button');b.type='button';b.className='round5Continue';b.textContent='CONTINUAR';b.addEventListener('click',closeFog);card.append(b);
   m.addEventListener('click',e=>{if(e.target===m)closeFog()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeFog()},{once:true});earnFog();
 }
 function guardian(){document.querySelectorAll('img').forEach(i=>{if(/guardiao|guardian/i.test(i.getAttribute('src')||''))i.classList.add('round5-guardian')})}
 function stats(){
   const candidates=[...document.querySelectorAll('.stats,.summaryStats,.dashboardStats,.metricGrid,.kpiGrid')];
   for(const g of candidates){const kids=[...g.children];const t=(g.textContent||'').toLowerCase();if(kids.length===4&&['pontos','missões','etapas','badges'].every(x=>t.includes(x))){g.classList.add('round5Stats2x2');break}}
 }
 function apply(){fixFog();guardian();stats()}
 let q=false;new MutationObserver(()=>{if(q)return;q=true;requestAnimationFrame(()=>{q=false;apply()})}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class','src']});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();
