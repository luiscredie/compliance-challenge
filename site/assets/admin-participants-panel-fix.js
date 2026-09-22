(()=>{
'use strict';
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
function findPanel(){
 const headings=[...document.querySelectorAll('h1,h2,h3,h4,strong')].filter(el=>norm(el.textContent)==='participantes');
 for(const heading of headings){
  let node=heading;
  for(let i=0;i<7&&node;i++,node=node.parentElement){
   if(node.querySelector('table')&&/nome/.test(norm(node.textContent))&&/acoes/.test(norm(node.textContent)))return node;
  }
 }
 return null;
}
function mark(){
 const panel=findPanel();if(!panel)return false;
 panel.dataset.adminParticipantsPanel='true';
 const table=panel.querySelector('table');if(!table)return false;
 table.dataset.adminParticipantsTable='true';
 const viewport=table.parentElement;if(viewport)viewport.dataset.adminParticipantsViewport='true';
 table.querySelectorAll('tbody tr').forEach(row=>{
  row.dataset.adminParticipantRow='true';
  const cells=[...row.children];
  const actionCell=cells[cells.length-1];
  if(actionCell){actionCell.dataset.adminParticipantActions='true';
   const buttons=[...actionCell.querySelectorAll('button,a')];
   if(buttons.length){const wrap=document.createElement('div');wrap.className='adminParticipantActionGrid';buttons[0].parentNode.insertBefore(wrap,buttons[0]);buttons.forEach(b=>wrap.appendChild(b));}
  }
 });
 return true;
}
let q=false;
new MutationObserver(()=>{if(q)return;q=true;requestAnimationFrame(()=>{q=false;mark();});}).observe(document.documentElement,{subtree:true,childList:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mark,{once:true});else mark();
})();
