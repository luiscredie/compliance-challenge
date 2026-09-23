(()=>{"use strict";
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
let activeDialog=null,lastFocus=null;

function labelButtons(){
 qa("button").forEach(b=>{
  if(!b.getAttribute("aria-label")&&!b.textContent.trim()){
   const img=q("img[alt]",b);
   if(img?.alt)b.setAttribute("aria-label",img.alt);
  }
 });
 qa(".switch").forEach(b=>{
  b.setAttribute("role","switch");
  b.setAttribute("aria-checked",b.classList.contains("on")?"true":"false");
  if(!b.getAttribute("aria-label")){
   const row=b.closest(".toggle"),txt=row?.textContent.replace(b.textContent,"").trim();
   if(txt)b.setAttribute("aria-label",txt);
  }
 });
}

function landmarks(){
 let main=q("main")||q('[role="main"]')||q(".app,.shell,.detShell,.account-wrap");
 if(main&&!q("main")&&!main.getAttribute("role"))main.setAttribute("role","main");
 if(main&&!main.id)main.id="a11y-main";
}

function tables(){
 qa("table").forEach(t=>{
  if(!q("caption",t)){
   const c=document.createElement("caption");c.className="sr-only";
   c.textContent=t.getAttribute("aria-label")||"Tabela de dados";t.prepend(c);
  }
  qa("th",t).forEach(th=>{if(!th.hasAttribute("scope"))th.setAttribute("scope","col")});
 });
 qa(".tableWrap").forEach(w=>{
  w.tabIndex=0;w.setAttribute("role","region");
  w.setAttribute("aria-label",w.getAttribute("aria-label")||"Tabela rolável");
 });
}

function progress(){
 qa(".progress,.bar,.goalBar,.riskbar,.risk,.meter").forEach(p=>{
  if(p.getAttribute("role"))return;
  const fill=q("span",p);if(!fill)return;
  const raw=fill.style.width||"";
  const m=String(raw).match(/([\d.]+)%/);
  if(m){
   p.setAttribute("role","progressbar");p.setAttribute("aria-valuemin","0");
   p.setAttribute("aria-valuemax","100");p.setAttribute("aria-valuenow",String(Math.round(+m[1])));
  }
 });
}

function live(){
 ["inlineMsg","introError","finishError","accessMessage","feedback","result","challenge","solveResult","votingMsg"].forEach(id=>{
  const e=document.getElementById(id);
  if(e&&!e.getAttribute("aria-live")){e.setAttribute("role","status");e.setAttribute("aria-live","polite");e.setAttribute("aria-atomic","true")}
 });
}

function alerts(){["loginErr","adminErr"].forEach(id=>{const e=document.getElementById(id);if(e){e.setAttribute("role","alert");e.setAttribute("aria-live","assertive");e.setAttribute("aria-atomic","true")}})}

function dialogCard(o){
 return q(".modalCard,.feedback,[class*=Card]",o)||o.firstElementChild||o;
}
function dialogs(){
 qa(".modal,.overlay,.countdown,.visualLightbox").forEach(o=>{
  if(o.classList.contains("hidden"))return;
  const card=dialogCard(o);
  card.setAttribute("role","dialog");card.setAttribute("aria-modal","true");
  const h=q("h1,h2,h3",card);
  if(h){
   if(!h.id)h.id="a11y-dialog-"+Math.random().toString(36).slice(2,8);
   if(!card.getAttribute("aria-label"))card.setAttribute("aria-labelledby",h.id);
  }
 });
 const visible=qa('[role="dialog"][aria-modal="true"]').filter(x=>x.offsetParent!==null).pop()||null;
 if(visible!==activeDialog){
  if(visible){
   lastFocus=document.activeElement;
   activeDialog=visible;
   if(!visible.hasAttribute("tabindex"))visible.tabIndex=-1;
   requestAnimationFrame(()=>{
    const target=q('[data-autofocus],button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled])',visible)||visible;
    target.focus({preventScroll:true});
   });
  }else if(activeDialog){
   const restore=lastFocus;activeDialog=null;lastFocus=null;
   if(restore&&document.contains(restore)&&typeof restore.focus==="function")requestAnimationFrame(()=>restore.focus({preventScroll:true}));
  }
 }
}

function skip(){
 if(q(".skip-link"))return;
 const a=document.createElement("a");a.className="skip-link";a.href="#a11y-main";
 a.textContent="Pular para o conteúdo principal";document.body.prepend(a);
 const main=q("main")||q('[role="main"]')||q(".shell,.app,.detShell,.account-wrap");
 if(main&&!main.id)main.id="a11y-main";
 if(main&&!main.hasAttribute("tabindex"))main.tabIndex=-1;
}

function images(){
 qa("img:not([alt])").forEach(img=>{img.alt="";if(!img.closest("button,a"))img.setAttribute("aria-hidden","true")});
}

function statefulControls(){
 qa(".tab,.campTab,.caseBtn").forEach(b=>{
  if(b.classList.contains("active"))b.setAttribute("aria-current","true");
  else b.removeAttribute("aria-current");
 });
 qa("[aria-pressed]").forEach(b=>b.setAttribute("aria-pressed",(b.classList.contains("active")||b.classList.contains("selected"))?"true":"false"));
}

function sync(){landmarks();labelButtons();tables();progress();live();alerts();dialogs();images();statefulControls()}

function modalKeyboard(e){
 if(e.key!=="Tab"&&e.key!=="Escape")return;
 const d=qa('[role="dialog"][aria-modal="true"]').filter(x=>x.offsetParent!==null).pop();if(!d)return;
 if(e.key==="Escape"){
  const close=q('[data-close],.modalClose,.close,[aria-label*="Fechar" i]',d);
  if(close){e.preventDefault();close.click()}return;
 }
 const f=qa('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',d).filter(x=>x.offsetParent!==null);
 if(!f.length){e.preventDefault();d.focus();return}
 if(e.shiftKey&&document.activeElement===f[0]){e.preventDefault();f.at(-1).focus()}
 else if(!e.shiftKey&&document.activeElement===f.at(-1)){e.preventDefault();f[0].focus()}
}

document.addEventListener("keydown",e=>{
 modalKeyboard(e);
 const el=e.target.closest?.('[role="button"]');
 if(el&&(e.key==="Enter"||e.key===" ")){
  e.preventDefault();el.click();
 }
});
document.addEventListener("click",e=>{
 const b=e.target.closest(".switch");
 if(b)setTimeout(()=>b.setAttribute("aria-checked",b.classList.contains("on")?"true":"false"),0);
});
const mo=new MutationObserver(()=>sync());
function init(){
 landmarks();skip();sync();
 mo.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:["class","style","disabled","aria-pressed"]});
}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init();
})();