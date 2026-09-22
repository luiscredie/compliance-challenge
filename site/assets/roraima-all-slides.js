(()=>{
'use strict';
const SRC='/assets/campaign/roraima-expedition-products-2026.png?v=20260911b';
const ROOTS=['#journeyComingSoon','#campaignBanner','#campaignHero','#expeditionGrid','.campaignSlide','.journeySlide','.expeditionSlide','.heroSlide','[data-campaign-slide]','[data-journey-slide]','[class*="campaign-carousel"]','[class*="journey-carousel"]','[class*="expedition-carousel"]'];
const LEGACY=/roraima|tepui|expedition|expedicao|mountain|montanha|cume|neblina|journey|jornada|hero/i;
function updateImage(img){
 const descriptor=[img.getAttribute('src'),img.getAttribute('alt'),img.id,img.className].join(' ');
 if(LEGACY.test(descriptor)||img.closest(ROOTS.join(','))){img.src=SRC;img.removeAttribute('srcset');img.dataset.roraimaCampaignImage='true';return true;}
 return false;
}
function updateRoot(root){
 const imgs=[...root.querySelectorAll('img')];
 if(imgs.length){let changed=false;imgs.forEach(img=>{changed=updateImage(img)||changed;});if(changed)return;}
 root.dataset.roraimaCampaignFrame='true';
}
function apply(){
 const seen=new Set();
 ROOTS.forEach(selector=>document.querySelectorAll(selector).forEach(root=>{if(!seen.has(root)){seen.add(root);updateRoot(root);}}));
 // Replace remaining active legacy hero images, but never badges, products, avatars or story photos.
 document.querySelectorAll('img').forEach(img=>{
  const src=String(img.getAttribute('src')||'');
  if(!LEGACY.test(src)||/\/badges\/|\/products?\/|\/voting\/|avatar|logo|icon/i.test(src))return;
  updateImage(img);
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
window.addEventListener('load',apply,{once:true});
})();
