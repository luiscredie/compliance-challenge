(function(){
  const queue=[];let showing=false;
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  function dt(v,approx){if(!v)return '';try{const d=new Date(v);if(Number.isNaN(d.getTime()))return '';const pre=approx?((window.LGCI18N?LGCI18N.translate('aprox.'):'aprox.')+' '):'';return pre+(window.LGCI18N?LGCI18N.formatDateTime(v):d.toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}))}catch(e){return ''}}
  function normalize(x){if(typeof x==='string')return {name:x};return x||{}}
  function seenKey(x){const a=normalize(x),name=String(a.name||'Conquista'),event=String(a.event||'Compliance Day 2026'),when=String(a.earned_at||'');return `lgc-achievement-seen::${event}::${name}::${when}`}
  function markAndFilter(items){return (items||[]).filter(Boolean).filter(raw=>{const k=seenKey(raw);try{if(sessionStorage.getItem(k))return false;sessionStorage.setItem(k,'1')}catch(e){}return true})}
  function showNext(){if(!queue.length){showing=false;return}showing=true;const x=normalize(queue.shift());let layer=document.getElementById('lgcAchievementLayer');if(!layer){layer=document.createElement('div');layer.id='lgcAchievementLayer';layer.className='lgc-achievement-layer';layer.setAttribute('role','status');layer.setAttribute('aria-live','polite');document.body.appendChild(layer)}
    const displayName=window.LGCI18N?LGCI18N.translate(x.name||'Conquista'):(x.name||'Conquista');
    const kicker=window.LGCI18N?LGCI18N.translate('Conquista desbloqueada'):'Conquista desbloqueada';
    const art=x.asset?`<img class="lgc-achievement-art" src="/assets/badges/${esc(x.asset)}" alt="Badge ${esc(displayName)}">`:'';
    const when=dt(x.earned_at,x.timestamp_approximate);layer.innerHTML=`<div class="lgc-achievement-card">${art}<div class="lgc-achievement-kicker">${esc(kicker)}</div><strong class="lgc-achievement-name">${esc(displayName)}</strong><div class="lgc-achievement-meta"><strong>${esc(x.event||'Compliance Day 2026')}</strong>${when?`<br>${esc(when)}`:''}</div><div class="lgc-achievement-progress"><span></span></div></div>`;
    layer.classList.remove('show');void layer.offsetWidth;layer.classList.add('show');
    setTimeout(()=>{layer.classList.remove('show');setTimeout(showNext,240)},3000);
  }
  window.LGCAchievement={show(items,opts){const incoming=opts&&opts.once?markAndFilter(items):(items||[]).filter(Boolean);incoming.forEach(x=>queue.push(x));if(!showing)showNext()},formatDate:dt};
})();
