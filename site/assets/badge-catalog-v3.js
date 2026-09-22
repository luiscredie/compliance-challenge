(()=>{'use strict';
const BASE='/assets/badges/final/';const V='?v=3';
const aliases={
'detetive de integridade':'detetive-de-integridade.png','processo seguro':'processo-seguro.png','caixa comercial limpa':'caixa-comercial-limpa.png','caixa limpa':'caixa-limpa.png','canal limpo':'caixa-limpa.png','comunicação que engaja':'comunicacao-que-engaja.png','primeiro acampamento':'primeiro-acampamento.png','precisão de elite':'precisao-de-elite.png','precisão do relato':'precisao-de-elite.png','comunicação confiável':'comunicacao-confiavel.png','concorrência responsável':'concorrencia-responsavel.png','guardião das relações':'guardiao-das-relacoes.png','acampamento 2':'acampamento-2.png','olhar de risco':'olhar-de-risco.png','primeiros passos':'primeiros-passos.png','olhar de integridade':'olhar-de-integridade.png','trilha das conquistas':'trilha-das-conquistas.png','fogueira afiada':'fogueira-afiada.png','guia do acampamento':'guia-do-acampamento.png','mistério da neblina':'misterio-da-neblina.png','leitura crítica':'leitura-critica.png','preservação de evidências':'preservacao-de-evidencias.png','proteção contra retaliação':'protecao-contra-retaliacao.png','decisão do cume':'decisao-do-cume.png','cume alcançado':'cume-alcancado.png','julgamento sob pressão':'julgamento-sob-pressao.png','mestre da investigação':'mestre-da-investigacao.png','cume em equipe':'cume-em-equipe.png','multiplicador':'multiplicador.png','compliance champion':'compliance-champion.png'};
const levels={'líder da integridade':'lider-da-integridade.png','multiplicador':'multiplicador-nivel.png','guardião':'guardiao.png'};
const norm=s=>String(s||'').normalize('NFC').toLowerCase().replace(/\s+/g,' ').trim();const ordered=o=>Object.keys(o).sort((a,b)=>b.length-a.length);const match=(t,o)=>ordered(o).find(k=>norm(t).includes(k));
function ancestors(img,max=8){const a=[];let n=img;while(n&&a.length<max){a.push(n);n=n.parentElement}return a}
function set(img,file,label){const wanted=BASE+file+V;if(img.getAttribute('src')!==wanted)img.setAttribute('src',wanted);img.removeAttribute('srcset');img.alt=label}
let busy=false;
function apply(){if(busy)return;busy=true;try{
 const root=document.querySelector('#badgeCard,#badgesGrid,#badgeGrid,.journeyAchievements,.achievementsSection')||document;
 root.querySelectorAll('img').forEach(img=>{for(const n of ancestors(img)){const k=match(n.textContent,aliases);if(k){set(img,aliases[k],'Badge '+k);break}}});
 document.querySelectorAll('#levelBox img,.levelBox img,.levelBadge img,.levelEmblem img,[class*="levelCard"] img').forEach(img=>{for(const n of ancestors(img,6)){const k=match(n.textContent,levels);if(k){set(img,levels[k],'Nível '+k);break}}});
}finally{busy=false}}
let q=false;new MutationObserver(changes=>{if(busy||q)return;if(!changes.some(m=>m.type==='childList'||m.attributeName==='src'||m.attributeName==='srcset'))return;q=true;requestAnimationFrame(()=>{q=false;apply()})}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','srcset']});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();window.addEventListener('load',apply,{once:true});
})();
