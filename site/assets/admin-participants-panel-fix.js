(()=>{
'use strict';
function mark(){
 const panel=document.getElementById('adminParticipantsPanel');
 if(!panel)return;
 const set=(node,key)=>{if(node&&node.dataset[key]!=='true')node.dataset[key]='true';};
 set(panel,'adminParticipantsPanel');
 const table=panel.querySelector('table');if(!table)return;
 set(table,'adminParticipantsTable');set(table.parentElement,'adminParticipantsViewport');
 table.querySelectorAll('tbody tr').forEach(row=>{
  set(row,'adminParticipantRow');
  set(row.lastElementChild,'adminParticipantActions');
 });
 // Keep the existing details menu and handlers intact. Never wrap buttons repeatedly.
}
function init(){
 const panel=document.getElementById('adminParticipantsPanel');if(!panel)return;
 let queued=false;
 new MutationObserver(()=>{
  if(queued)return;queued=true;
  requestAnimationFrame(()=>{queued=false;mark();});
 }).observe(panel,{subtree:true,childList:true});
 mark();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();