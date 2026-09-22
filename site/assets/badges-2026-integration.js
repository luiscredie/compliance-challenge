(()=>{
  'use strict';
  const ROOT='/assets/badges/2026/';
  const VERSION='?v=20260824';
  const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  const achievements={
    'compliance champion':'31-compliance-champion.png',
    'multiplicador':'30-multiplicador-conquista.png',
    'cume em equipe':'29-cume-em-equipe.png',
    'mestre da investigacao':'28-mestre-da-investigacao.png',
    'julgamento sob pressao':'27-julgamento-sob-pressao.png',
    'cume alcancado':'26-cume-alcancado.png',
    'decisao do cume':'25-decisao-do-cume.png',
    'protecao contra retaliacao':'24-protecao-contra-retaliacao.png',
    'preservacao de evidencias':'23-preservacao-de-evidencias.png',
    'leitura critica':'22-leitura-critica.png',
    'misterio da neblina':'21-misterio-da-neblina.png',
    'guia do acampamento':'20-guia-do-acampamento.png',
    'fogueira afiada':'19-fogueira-afiada.png',
    'trilha das conquistas ouro':'18-trilha-das-conquistas-ouro.png',
    'trilha das conquistas gold':'18-trilha-das-conquistas-ouro.png',
    'trilha das conquistas prata':'17-trilha-das-conquistas-prata.png',
    'trilha das conquistas silver':'17-trilha-das-conquistas-prata.png',
    'trilha das conquistas bronze':'16-trilha-das-conquistas-bronze.png',
    'trilha das conquistas normal':'15-trilha-das-conquistas-normal.png',
    'trilha das conquistas':'15-trilha-das-conquistas-normal.png',
    'olhar de integridade':'14-olhar-de-integridade.png',
    'primeiros passos':'13-primeiros-passos.png',
    'olhar de risco':'12-olhar-de-risco.png',
    'acampamento 2':'11-acampamento-2.png',
    'caixa comercial limpa':'10-caixa-comercial-limpa.png',
    'guardiao das relacoes':'09-guardiao-das-relacoes.png',
    'concorrencia responsavel':'08-concorrencia-responsavel.png',
    'comunicacao confiavel':'07-comunicacao-confiavel.png',
    'precisao de elite':'06-precisao-de-elite.png',
    'primeiro acampamento':'05-primeiro-acampamento.png',
    'comunicacao que engaja':'04-comunicacao-que-engaja.png',
    'caixa limpa':'03-caixa-limpa.png',
    'processo seguro':'02-processo-seguro.png',
    'detetive de integridade':'01-detetive-de-integridade.png'
  };
  const levels={
    'lider da integridade':'34-nivel-lider-da-integridade.png',
    'multiplicador':'33-nivel-multiplicador.png',
    'guardiao':'32-nivel-guardiao.png'
  };
  const ordered=o=>Object.keys(o).sort((a,b)=>b.length-a.length);
  const achievementKeys=ordered(achievements), levelKeys=ordered(levels);
  const find=(text,keys)=>{const t=normalize(text);return keys.find(k=>t.includes(k));};
  const ancestors=(node,max=8)=>{const list=[];let n=node;while(n&&list.length<max){list.push(n);n=n.parentElement;}return list;};
  const setImage=(img,file,label)=>{
    const wanted=ROOT+file+VERSION;
    if(img.getAttribute('src')!==wanted) img.setAttribute('src',wanted);
    img.removeAttribute('srcset');
    img.alt=label;
    img.dataset.badge2026='true';
  };
  function applyAchievementImages(){
    const roots=[...document.querySelectorAll('#badgeCard,#badgesGrid,#badgeGrid,.journeyAchievements,.achievementsSection')];
    const scope=roots.length?roots:[];
    scope.forEach(root=>root.querySelectorAll('img').forEach(img=>{
      for(const n of ancestors(img,8)){
        const key=find(n.textContent,achievementKeys);
        if(key){setImage(img,achievements[key],'Badge '+key);break;}
      }
    }));
  }
  function applyLevelImages(){
    document.querySelectorAll('#progressCard img,#levelBox img,.levelBox img,.levelBadge img,.levelEmblem img,[class*="levelCard"] img').forEach(img=>{
      for(const n of ancestors(img,7)){
        const key=find(n.textContent,levelKeys);
        if(key){setImage(img,levels[key],'Nível '+key);break;}
      }
    });
  }
  let busy=false,queued=false;
  function apply(){if(busy)return;busy=true;try{applyAchievementImages();applyLevelImages();}finally{busy=false;}}
  new MutationObserver(changes=>{
    if(busy||queued)return;
    if(!changes.some(m=>m.type==='childList'||m.attributeName==='src'||m.attributeName==='srcset'))return;
    queued=true;requestAnimationFrame(()=>{queued=false;apply();});
  }).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','srcset']});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
  window.addEventListener('load',apply,{once:true});
})();
