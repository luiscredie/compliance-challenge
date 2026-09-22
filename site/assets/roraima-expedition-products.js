(()=>{
'use strict';
const SRC='/assets/campaign/roraima-expedition-products-2026.png?v=20260911a';
function apply(){
 const section=document.querySelector('#journeyComingSoon');
 if(!section)return;
 const imgs=[...section.querySelectorAll('img')];
 const target=imgs.find(img=>/roraima|expedition|journey|mountain|cume|neblina/i.test(String(img.getAttribute('src')||'')+' '+String(img.alt||'')));
 if(target){target.src=SRC;target.removeAttribute('srcset');target.dataset.roraimaProductsHero='true';return;}
 const picture=section.querySelector('picture');
 if(picture){const img=picture.querySelector('img');if(img){img.src=SRC;img.removeAttribute('srcset');picture.dataset.roraimaProductsHero='true';return;}}
 section.dataset.roraimaProductsHero='true';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();
