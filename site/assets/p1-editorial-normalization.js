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
