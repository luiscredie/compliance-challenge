(()=>{
  'use strict';
  const ROOT='/assets/badges/2026/';
  const VERSION='?v=20260824b';
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  const trail={
    ouro:'18-trilha-das-conquistas-ouro.png',
    gold:'18-trilha-das-conquistas-ouro.png',
    prata:'17-trilha-das-conquistas-prata.png',
    silver:'17-trilha-das-conquistas-prata.png',
    bronze:'16-trilha-das-conquistas-bronze.png',
    normal:'15-trilha-das-conquistas-normal.png'
  };
  function cardFor(img){
    let n=img;
    for(let i=0;i<8&&n;i++,n=n.parentElement){
      const t=norm(n.textContent);
      if(t.includes('trilha das conquistas')||/conquistad[ao]|como conquistar|conquista extra/.test(t)) return n;
    }
    return img.parentElement;
  }
  function markAndFix(){
    const root=document.querySelector('#badgeCard,#badgesGrid,#badgeGrid,.journeyAchievements,.achievementsSection');
    if(!root)return;
    root.querySelectorAll('img').forEach(img=>{
      const card=cardFor(img);if(!card)return;
      card.dataset.badge2026Card='true';
      img.dataset.badge2026Image='true';
      const text=norm(card.textContent);
      if(!text.includes('trilha das conquistas'))return;
      let variant='normal';
      if(text.includes('bronze'))variant='bronze';
      else if(text.includes('prata')||text.includes('silver'))variant=text.includes('prata')?'prata':'silver';
      else if(text.includes('ouro')||text.includes('gold'))variant=text.includes('ouro')?'ouro':'gold';
      const wanted=ROOT+trail[variant]+VERSION;
      if(img.getAttribute('src')!==wanted)img.setAttribute('src',wanted);
      img.removeAttribute('srcset');
      img.alt='Trilha das Conquistas - '+variant;
    });
  }
  let busy=false,queued=false;
  function apply(){if(busy)return;busy=true;try{markAndFix();}finally{busy=false}}
  new MutationObserver(changes=>{
    if(busy||queued)return;
    if(!changes.some(m=>m.type==='childList'||m.attributeName==='src'||m.attributeName==='srcset'))return;
    queued=true;requestAnimationFrame(()=>{queued=false;apply()});
  }).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','srcset']});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  window.addEventListener('load',apply,{once:true});
})();
