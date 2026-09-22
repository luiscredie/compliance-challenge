(()=>{
  'use strict';
  const MAP=new Map([
    ['/assets/badges/meta-trilha-bronze.webp','/assets/badges/2026/16-trilha-das-conquistas-bronze.png?v=20260825d'],
    ['/assets/badges/bonus-olhar-integridade.webp','/assets/badges/2026/14-olhar-de-integridade.png?v=20260825d'],
    ['/assets/badges/bonus-primeiros-passos.webp','/assets/badges/2026/13-primeiros-passos.png?v=20260825d']
  ]);
  const rewrite=value=>{
    const s=String(value||'');
    for(const [oldPath,newPath] of MAP){
      if(s===oldPath||s.endsWith(oldPath))return newPath;
    }
    return value;
  };

  // Intercept legacy image assignment before the browser starts the old request.
  const descriptor=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');
  if(descriptor&&descriptor.set&&descriptor.get){
    Object.defineProperty(HTMLImageElement.prototype,'src',{
      configurable:descriptor.configurable,
      enumerable:descriptor.enumerable,
      get:descriptor.get,
      set(value){descriptor.set.call(this,rewrite(value));}
    });
  }
  const originalSetAttribute=Element.prototype.setAttribute;
  Element.prototype.setAttribute=function(name,value){
    if(this instanceof HTMLImageElement&&String(name).toLowerCase()==='src')value=rewrite(value);
    return originalSetAttribute.call(this,name,value);
  };

  // Correct any modal image already present or changed by another renderer.
  let busy=false;
  const repair=root=>{
    if(busy)return;busy=true;
    try{
      const imgs=[];
      if(root instanceof HTMLImageElement)imgs.push(root);
      if(root&&root.querySelectorAll)imgs.push(...root.querySelectorAll('img'));
      for(const img of imgs){
        const current=img.getAttribute('src');
        const wanted=rewrite(current);
        if(wanted!==current){
          originalSetAttribute.call(img,'src',wanted);
          img.removeAttribute('srcset');
        }
      }
    }finally{busy=false;}
  };
  new MutationObserver(records=>{
    if(busy)return;
    for(const record of records){
      if(record.type==='attributes')repair(record.target);
      else for(const node of record.addedNodes)repair(node);
    }
  }).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','srcset']});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>repair(document),{once:true});else repair(document);
})();
