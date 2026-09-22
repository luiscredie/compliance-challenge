(()=>{
  'use strict';
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  function apply(){
    const root=document.querySelector('#badgeCard,#badgesGrid,#badgeGrid,.journeyAchievements,.achievementsSection');
    if(!root)return;
    root.querySelectorAll('article,li,.badgeTile,[class*="badgeCard"],[class*="badgeItem"],div').forEach(card=>{
      const text=norm(card.textContent);
      if(!text.includes('nivel explorador')||!text.includes('conquistada'))return;
      // Select the smallest matching card, not the whole achievements container.
      if([...card.children].some(child=>norm(child.textContent).includes('nivel explorador')&&norm(child.textContent).includes('conquistada')))return;
      card.dataset.explorerLevelCard='true';
      const candidates=[...card.querySelectorAll('h2,h3,h4,strong,.badgeName,[class*="title"],[class*="name"]')];
      candidates.forEach(el=>{
        const t=norm(el.textContent);
        if(t==='nivel explorador'||t==='explorador'){
          el.dataset.explorerLevelTitle='true';
          el.textContent=t==='nivel explorador'?'Nível Explorador':'Explorador';
        }
      });
      [...card.querySelectorAll('small,span,p,.badgeStatus,[class*="status"],[class*="state"]')].forEach(el=>{
        if(norm(el.textContent)==='explorador'&& !el.dataset.explorerLevelTitle){el.dataset.explorerLevelLabel='true';el.textContent='Explorador';}
      });
    });
  }
  let queued=false;
  new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply();});}).observe(document.documentElement,{subtree:true,childList:true,characterData:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();
