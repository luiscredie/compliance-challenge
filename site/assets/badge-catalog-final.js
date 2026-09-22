(()=>{'use strict';
const BASE='/assets/badges/final/';
const aliases={
'detetive de integridade':'detetive-de-integridade.png','processo seguro':'processo-seguro.png','caixa limpa':'canal-limpo.png','canal limpo':'canal-limpo.png','comunicação que engaja':'comunicacao-que-engaja.png','primeiro acampamento':'primeiro-acampamento.png','precisão de elite':'precisao-do-relato.png','precisão do relato':'precisao-do-relato.png','caixa comercial limpa':'caixa-comercial-limpa.png','comunicação confiável':'comunicacao-confiavel.png','concorrência responsável':'concorrencia-responsavel.png','guardião das relações':'guardiao-das-relacoes.png','acampamento 2':'acampamento-2.png','olhar de risco':'olhar-de-risco.png','primeiros passos':'primeiros-passos.png','olhar de integridade':'olhar-de-integridade.png','trilha das conquistas':'trilha-das-conquistas.png','fogueira afiada':'fogueira-afiada.png','guia do acampamento':'guia-do-acampamento.png','mistério da neblina':'misterio-da-neblina.png','leitura crítica':'leitura-critica.png','preservação de evidências':'preservacao-de-evidencias.png','proteção contra retaliação':'protecao-contra-retaliacao.png','decisão do cume':'decisao-do-cume.png','cume alcançado':'cume-alcancado.png','julgamento sob pressão':'julgamento-sob-pressao.png','mestre da investigação':'mestre-da-investigacao.png','cume em equipe':'cume-em-equipe.png','multiplicador':'multiplicador.png','compliance champion':'compliance-champion.png'};
const levels={'líder da integridade':'lider-da-integridade.png','multiplicador':'multiplicador-nivel.png','guardião':'guardiao.png'};
const norm=s=>String(s||'').normalize('NFC').toLowerCase().replace(/\s+/g,' ').trim();
const keys=o=>Object.keys(o).sort((a,b)=>b.length-a.length);
function find(text,o){text=norm(text);return keys(o).find(k=>text.includes(k));}
function cardText(img){let n=img;for(let i=0;i<7&&n;i++,n=n.parentElement){const t=norm(n.textContent);if(find(t,aliases))return t}return norm(img.alt)}
let applying=false;
function setImage(img,file,alt){const src=BASE+file;if(img.getAttribute('src')!==src)img.setAttribute('src',src);img.removeAttribute('srcset');img.setAttribute('alt',alt);img.style.objectFit='contain';img.style.objectPosition='center';img.style.background='transparent'}
function apply(){if(applying)return;applying=true;try{
 const scope=document.querySelector('#badgeCard,#badgesGrid,#badgeGrid,.journeyAchievements,.achievementsSection')||document;
 scope.querySelectorAll('img').forEach(img=>{const t=cardText(img),k=find(t,aliases);if(k)setImage(img,aliases[k],'Badge '+k)});
 document.querySelectorAll('#levelBox img,.levelBox img,.levelBadge img,.levelEmblem img,[class*="levelCard"] img').forEach(img=>{let n=img.parentElement,t='';for(let i=0;i<5&&n;i++,n=n.parentElement)t+=' '+norm(n.textContent);const k=find(t,levels);if(k)setImage(img,levels[k],'Nível '+k)});
}finally{applying=false}}
let queued=false;new MutationObserver(m=>{if(applying||queued)return;if(!m.some(x=>x.type==='childList'||x.attributeName==='src'||x.attributeName==='srcset'))return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','srcset']});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
window.addEventListener('load',apply,{once:true});
})();
