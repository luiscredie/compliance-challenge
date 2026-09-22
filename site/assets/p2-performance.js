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
 function stabilizeWheel(){
   document.querySelectorAll('.wheel').forEach(w=>{
     const obs=new MutationObserver(()=>{const spinning=/spin|rotat/i.test(w.className)||/rotate/i.test(w.style.transform||'');w.classList.toggle('is-spinning',spinning)});
     obs.observe(w,{attributes:true,attributeFilter:['class','style']});
   });
 }
 function apply(root=document){optimizeImages(root);deferSections()}
 let queued=false;
 const observer=new MutationObserver(ms=>{if(queued)return;queued=true;idle(()=>{queued=false;for(const m of ms)for(const n of m.addedNodes||[])if(n.nodeType===1)apply(n)})});
 function init(){apply();stabilizeWheel();observer.observe(document.body,{subtree:true,childList:true})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
