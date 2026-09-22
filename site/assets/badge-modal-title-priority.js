(()=>{
'use strict';
const ROOT='/assets/badges/2026/', V='?v=20260825f';
const MAP={
 'compliance champion':'31-compliance-champion.png','multiplicador':'30-multiplicador-conquista.png','cume em equipe':'29-cume-em-equipe.png','mestre da investigacao':'28-mestre-da-investigacao.png','julgamento sob pressao':'27-julgamento-sob-pressao.png','cume alcancado':'26-cume-alcancado.png','decisao do cume':'25-decisao-do-cume.png','protecao contra retaliacao':'24-protecao-contra-retaliacao.png','preservacao de evidencias':'23-preservacao-de-evidencias.png','leitura critica':'22-leitura-critica.png','misterio da neblina':'21-misterio-da-neblina.png','guia do acampamento':'20-guia-do-acampamento.png','fogueira afiada':'19-fogueira-afiada.png','trilha das conquistas ouro':'18-trilha-das-conquistas-ouro.png','trilha das conquistas prata':'17-trilha-das-conquistas-prata.png','trilha das conquistas bronze':'16-trilha-das-conquistas-bronze.png','trilha das conquistas':'15-trilha-das-conquistas-normal.png','olhar de integridade':'14-olhar-de-integridade.png','primeiros passos':'13-primeiros-passos.png','olhar de risco':'12-olhar-de-risco.png','acampamento 2':'11-acampamento-2.png','caixa comercial limpa':'10-caixa-comercial-limpa.png','guardiao das relacoes':'09-guardiao-das-relacoes.png','concorrencia responsavel':'08-concorrencia-responsavel.png','comunicacao confiavel':'07-comunicacao-confiavel.png','precisao de elite':'06-precisao-de-elite.png','primeiro acampamento':'05-primeiro-acampamento.png','comunicacao que engaja':'04-comunicacao-que-engaja.png','caixa limpa':'03-caixa-limpa.png','processo seguro':'02-processo-seguro.png','detetive de integridade':'01-detetive-de-integridade.png'};
const LEVELS={'lider da integridade':'34-nivel-lider-da-integridade.png','multiplicador':'33-nivel-multiplicador.png','guardiao':'32-nivel-guardiao.png'};
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const keys=o=>Object.keys(o).sort((a,b)=>b.length-a.length);
const modalFor=img=>img.closest('[role="dialog"],dialog,.modal,[class*="modal"],[class*="dialog"],.overlay,[class*="overlay"]');
function wanted(img){
 const modal=modalFor(img);if(!modal)return null;
 const text=norm(modal.textContent);
 const isLevel=/nivel|faltam .* para|progresso da jornada/.test(text);
 const source=isLevel?LEVELS:MAP;
 const key=keys(source).find(k=>text.includes(k));
 return key?ROOT+source[key]+V:null;
}
const nativeSet=Element.prototype.setAttribute;
let busy=false;
function repair(root){
 if(busy)return;busy=true;
 try{
  const imgs=[];if(root instanceof HTMLImageElement)imgs.push(root);if(root&&root.querySelectorAll)imgs.push(...root.querySelectorAll('img'));
  for(const img of imgs){const src=wanted(img);if(src&&img.getAttribute('src')!==src){nativeSet.call(img,'src',src);img.removeAttribute('srcset');img.dataset.badgeModal2026='true';}}
 }finally{busy=false;}
}
new MutationObserver(rs=>{if(busy)return;for(const r of rs){if(r.type==='childList'){for(const n of r.addedNodes)repair(n)}else repair(r.target.parentElement||r.target)}}).observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['src','srcset','class','open']});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>repair(document),{once:true});else repair(document);
})();
