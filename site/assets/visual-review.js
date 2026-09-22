(()=>{
 'use strict';
 const init=()=>{
  const byId=id=>document.getElementById(id),dash=byId('dashView'),grid=byId('expeditionGrid');
  // Keep the existing sections and their behavior, with the next task first.
  if(dash&&grid){const vote=byId('voteLaunch'),activities=byId('activityCard');if(vote)grid.after(vote);if(activities&&vote)vote.after(activities);}
  const participants=byId('adminParticipantsPanel'),add=byId('adminUserAddPanel');if(participants&&add)add.after(participants);
  const controls=byId('adminGlobalControls');if(controls){const critical=Array.from(controls.children).find(s=>s.querySelector('#hardResetMsg'));if(critical){const details=document.createElement('details');details.className='admin-reset-group';const summary=document.createElement('summary');summary.dataset.i18n='visual.resets';summary.textContent='Reiniciar progressos';details.append(summary,critical);controls.append(details);}}
  document.querySelectorAll('[data-badge-filter]').forEach(button=>button.addEventListener('click',()=>{byId('badgesGrid').dataset.filter=button.dataset.badgeFilter;document.querySelectorAll('[data-badge-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)))}));
  // Preserve image URLs. Missing illustrations get an accessible, code-only fallback.
  const fallback=img=>{if(!(img instanceof HTMLImageElement)||img.classList.contains('visual-missing')||!img.matches('.eventMark img,.levelMedal img,.badge img,#voteLaunch > img,.journeyMap'))return;img.classList.add('visual-missing');const mark=document.createElement('span');mark.className='visual-art-fallback';mark.setAttribute('aria-hidden','true');mark.textContent=img.closest('.eventMark')?'LG':img.closest('.badge,.levelMedal')?'☆':'◇';img.after(mark);img.addEventListener('load',()=>{if(img.naturalWidth){img.classList.remove('visual-missing');mark.remove()}},{once:true});};
  document.addEventListener('error',e=>fallback(e.target),true);
  const check=root=>{if(root instanceof HTMLImageElement&&root.complete&&!root.naturalWidth)fallback(root);root.querySelectorAll?.('img').forEach(img=>{if(img.complete&&!img.naturalWidth)fallback(img)})};
  check(document);new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1)check(node)}).observe(document.body,{subtree:true,childList:true});
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
