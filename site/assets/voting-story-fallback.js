(()=>{
'use strict';
function mark(img){
 const src=String(img.getAttribute('src')||'');
 if(!/\/assets\/voting\/story-\d+\.(jpg|jpeg|png|webp)(\?|$)/i.test(src))return;
 img.addEventListener('error',()=>{
  img.hidden=true;
  const host=img.parentElement;if(!host)return;
  host.classList.add('storyImageUnavailable');
  if(!host.querySelector('.storyImageFallback')){
   const box=document.createElement('div');box.className='storyImageFallback';box.setAttribute('role','img');box.setAttribute('aria-label','Imagem da história de compliance indisponível');box.innerHTML='<span>História de Compliance</span>';
   host.appendChild(box);
  }
 },{once:true});
}
function apply(root=document){if(root instanceof HTMLImageElement)mark(root);if(root.querySelectorAll)root.querySelectorAll('img').forEach(mark)}
new MutationObserver(rs=>rs.forEach(r=>r.addedNodes.forEach(apply))).observe(document.documentElement,{subtree:true,childList:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>apply(),{once:true});else apply();
})();
