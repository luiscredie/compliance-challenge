(()=>{
'use strict';
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
function smallestResult(){
  const candidates=[...document.querySelectorAll('main,section,article,div')].filter(el=>{
    const t=norm(el.textContent);
    return t.includes('conquista desbloqueada');
  });
  return candidates.sort((a,b)=>a.querySelectorAll('*').length-b.querySelectorAll('*').length)[0]||null;
}
function mark(){
  const result=smallestResult();if(!result)return false;
  result.dataset.stage3UnlockResult='true';
  const img=[...result.querySelectorAll('img')].find(img=>/\/assets\/badges\/2026\/|badge/i.test(String(img.getAttribute('src')||'')+' '+String(img.alt||'')))||result.querySelector('img');
  if(img){img.dataset.stage3UnlockBadge='true';const wrap=img.parentElement;if(wrap)wrap.dataset.stage3UnlockBadgeWrap='true';}
  const metricLabels=[...result.querySelectorAll('*')].filter(el=>/^(pontuacao|desempenho|conquistas totais)$/.test(norm(el.textContent)));
  if(metricLabels.length>=3){
    const parents=metricLabels.map(el=>el.parentElement).filter(Boolean);
    const common=parents[0]?.parentElement;
    if(common&&parents.every(p=>p.parentElement===common))common.dataset.stage3ResultMetrics='true';
  }
  return true;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{if(!mark()){const o=new MutationObserver(()=>{if(mark())o.disconnect()});o.observe(document.body,{subtree:true,childList:true});}},{once:true});
else if(!mark()){const o=new MutationObserver(()=>{if(mark())o.disconnect()});o.observe(document.body,{subtree:true,childList:true});}
})();
