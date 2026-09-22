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
