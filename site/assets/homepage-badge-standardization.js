(()=>{
 'use strict';
 const ASSETS={
  multiplier:'/assets/badges/badge-multiplicador-round.png',
  fog:'/assets/badges/badge-misterio-neblina-round.png',
  critical:'/assets/badges/badge-leitura-critica-round.png'
 };
 const txt=e=>String(e?.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
 function normalizeBadges(root=document){
   root.querySelectorAll('.badgeTile,.badgeCard,[class*="badgeItem"],[class*="achievement"]').forEach(card=>{
     const t=txt(card),img=card.querySelector('img');if(!img)return;
     if(t.includes('multiplicador')){img.src=ASSETS.multiplier;img.alt='Badge Multiplicador'}
     else if(t.includes('mistério da neblina')||t.includes('misterio da neblina')){img.src=ASSETS.fog;img.alt='Badge Mistério da Neblina'}
     else if(t.includes('leitura crítica')||t.includes('leitura critica')){img.src=ASSETS.critical;img.alt='Badge Leitura Crítica'}
   });
   document.querySelectorAll('#levelBox,.levelBox,.levelBadge,.levelEmblem').forEach(box=>{if(txt(box).includes('multiplicador')){const img=box.querySelector('img');if(img){img.src=ASSETS.multiplier;img.alt='Nível Multiplicador'}}});
 }
 function apply(){normalizeBadges()}
 let q=false;new MutationObserver(()=>{if(q)return;q=true;requestAnimationFrame(()=>{q=false;apply()})}).observe(document.documentElement,{subtree:true,childList:true});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();
