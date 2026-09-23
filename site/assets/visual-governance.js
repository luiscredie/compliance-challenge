// Consolidated from p0-design-governance.js + p1-editorial-normalization.js + p2-performance.js (2026-09-23).
// Concatenated in original load order; each block is an independent IIFE, so behavior is unchanged.

(()=>{
  'use strict';
  const norm=s=>String(s||'').replace(/\s+/g,' ').trim();
  function canonicalAchievement(name,asset,meta){
    if(window.LGCAchievement?.show){
      try{window.LGCAchievement.show({name:name||'Conquista desbloqueada',asset:asset||'',event:'journey',earned_at:new Date().toISOString(),meta:meta||''});return true}catch(_){ }
    }
    return false;
  }
  function mirrorLegacy(){
    document.querySelectorAll('.achievementToast.show:not(.p0-mirrored)').forEach(t=>{
      const name=norm(t.querySelector('strong,.achievementName,[data-name]')?.textContent)||'Conquista desbloqueada';
      const img=t.querySelector('img');
      const meta=norm(t.querySelector('span,.achievementMeta')?.textContent);
      if(canonicalAchievement(name,img?.getAttribute('src')||'',meta))t.classList.add('p0-mirrored');
    });
  }
  function normalizePracticeFinish(){
    document.querySelectorAll('.finish:not(.p0-checked),main:not(.p0-checked),section:not(.p0-checked)').forEach(el=>{
      el.classList.add('p0-checked');
      const text=norm(el.textContent).toLowerCase();
      if(!text.includes('conquista desbloqueada')||!text.includes('ranking preservado'))return;
      el.classList.add('p0-practice-achievement');
      const name=norm(el.querySelector('h2,.achievementName')?.textContent)||norm(el.textContent.match(/conquista desbloqueada!?\s*([^0-9]+)/i)?.[1]);
      const img=el.querySelector('img[src*="/assets/badges/"],img[src*="/assets/levels/"]');
      canonicalAchievement(name||'Conquista desbloqueada',img?.getAttribute('src')||'','Modo conquista · ranking preservado');
    });
  }
  function normalizeDialogs(){
    document.querySelectorAll('.overlay,.modal').forEach(layer=>{
      const dialog=layer.querySelector('.feedback,.modalCard,.feedbackModal');if(!dialog)return;
      dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');
      if(!dialog.hasAttribute('tabindex'))dialog.tabIndex=-1;
    });
  }
  function normalizeAdmin(){
    if(document.body.classList.contains('admin-active')||document.querySelector('#adminApp,.adminShell'))document.documentElement.classList.add('p0-admin');
  }
  function apply(){mirrorLegacy();normalizePracticeFinish();normalizeDialogs();normalizeAdmin()}
  let queued=false;
  new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;const layer=[...document.querySelectorAll('.overlay:not(.hidden),.modal:not(.hidden),.lgc-achievement-layer.show')].pop();const close=layer?.querySelector('[aria-label="Fechar"],.close,[data-close]');if(close)close.click()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();

(()=>{
 'use strict';
 const replacements=new Map([
   ['Project Aurora','Projeto Aurora'],['PROJECT AURORA','PROJETO AURORA'],
   ['Camp Roulette','Roleta do Acampamento'],['CAMP ROULETTE','ROLETA DO ACAMPAMENTO'],
   ['Journey','Jornada'],['JOURNEY','JORNADA'],
   ['Achievement unlocked','Conquista desbloqueada'],['ACHIEVEMENT UNLOCKED','CONQUISTA DESBLOQUEADA'],
   ['Badge desbloqueada','Conquista desbloqueada'],['BADGE DESBLOQUEADA','CONQUISTA DESBLOQUEADA'],
   ['Summit Challenge','Desafio do Cume'],['SUMMIT CHALLENGE','DESAFIO DO CUME']
 ]);
 function skip(n){const e=n.parentElement;return !e||e.closest('script,style,code,pre,textarea,[data-i18n],[data-i18n-skip="true"]')}
 function normalizeText(root=document){
   const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];while(w.nextNode())nodes.push(w.currentNode);
   for(const n of nodes){if(skip(n))continue;let v=n.nodeValue;for(const [a,b] of replacements)if(v.includes(a))v=v.replaceAll(a,b);if(v!==n.nodeValue)n.nodeValue=v}
 }
 function semanticClasses(root=document){
   root.querySelectorAll('.answer,.storyOption,.routeChoice,.packItem,.matchItem,.processCard,.evidenceCard,.simEvent,.sceneCard,.commMsg,.profile,.detectRow').forEach(e=>e.classList.add('missionChoice'));
   root.querySelectorAll('.stat,.metric,.kpi,.summaryMetric').forEach(e=>e.classList.add('dsMetric'));
 }
 function enforcePrimary(root=document){
   root.querySelectorAll('main,section,.modalCard,.feedback,.gamebody').forEach(region=>{
     const visible=[...region.querySelectorAll('.primary:not([hidden]):not(.hidden)')].filter(x=>x.offsetParent!==null);
     visible.slice(1).forEach(x=>x.classList.add('p1-secondary-primary'));
   });
 }
 function apply(root=document){normalizeText(root);semanticClasses(root);enforcePrimary(root)}
 let q=false;new MutationObserver(ms=>{if(q)return;q=true;requestAnimationFrame(()=>{q=false;for(const m of ms)for(const n of m.addedNodes||[])if(n.nodeType===1)apply(n)})}).observe(document.documentElement,{subtree:true,childList:true});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>apply(),{once:true});else apply();
})();

(()=>{
 'use strict';
 const idle=window.requestIdleCallback||((fn)=>setTimeout(()=>fn({didTimeout:false,timeRemaining:()=>8}),1));
 const isCriticalImage=img=>Boolean(img.closest('header,.top,.brand,.introvisual,.hero,.wheelCenter,.feedback,.lgc-achievement-card')||img.matches('[fetchpriority="high"],.logo,.eventMark img'));
 function optimizeImages(root=document){
   root.querySelectorAll('img:not([data-p2-reviewed])').forEach(img=>{
     img.dataset.p2Reviewed='1';img.decoding='async';
     if(!isCriticalImage(img)){img.loading='lazy';img.dataset.p2Lazy='true'}
     else if(!img.hasAttribute('fetchpriority'))img.setAttribute('fetchpriority','high');
   });
 }
 function deferSections(){
   const selectors=['#badgesSection','#activitiesSection','#rankingSection','.badgeCatalog','.activitiesExtra','.leaderboardSection','.adminSection'];
   document.querySelectorAll(selectors.join(',')).forEach((el,i)=>{if(i>0||el.getBoundingClientRect().top>innerHeight*1.5)el.classList.add('p2-deferred-section')});
 }
 // The roulette owns its animation state; never observe and mutate the same class.
 function apply(root=document){optimizeImages(root);deferSections()}
 let queued=false;
 const observer=new MutationObserver(ms=>{if(queued)return;queued=true;idle(()=>{queued=false;for(const m of ms)for(const n of m.addedNodes||[])if(n.nodeType===1)apply(n)})});
 function init(){apply();observer.observe(document.body,{subtree:true,childList:true})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
