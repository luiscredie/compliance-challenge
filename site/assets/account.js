const registerBlock=document.getElementById('registerBlock'),activateBlock=document.getElementById('activateBlock');
const registerForm=document.getElementById('registerForm'),accessForm=document.getElementById('accessForm');
const message=document.getElementById('accessMessage');
const params=new URLSearchParams(location.search);
const startOnRecovery=!!CC.activationToken||params.has('recover');
function showRegister(){registerBlock.classList.remove('hidden');activateBlock.classList.add('hidden');message.textContent=''}
function showActivate(){activateBlock.classList.remove('hidden');registerBlock.classList.add('hidden');message.textContent=''}
if(startOnRecovery){showActivate();if(CC.activationToken)document.getElementById('accessCode').value=CC.activationToken}else showRegister();
document.getElementById('showRecoverToggle').addEventListener('click',e=>{e.preventDefault();showActivate()});
document.getElementById('showRegisterToggle').addEventListener('click',e=>{e.preventDefault();showRegister()});

registerForm.addEventListener('submit',async e=>{
 e.preventDefault();
 const button=registerForm.querySelector('button'),identity=document.getElementById('registerIdentity').value.trim(),password=document.getElementById('registerPassword').value;
 if(password!==document.getElementById('registerConfirm').value){message.textContent='As senhas não coincidem.';return}
 button.disabled=true;message.textContent='Criando acesso…';
 try{
  const result=await CC.selfRegister(identity,password);
  if(result.loggedIn){sessionStorage.setItem('lgpt','1');location.href='index.html';return}
  registerForm.reset();registerForm.hidden=true;
  message.textContent='Senha criada. Volte à jornada e entre com sua matrícula, ID global ou e-mail.';
 }catch(err){
  const map={password_policy:'Use pelo menos 8 caracteres, com letras e números.',not_authorized:'Esta matrícula, ID ou e-mail não está na lista autorizada da sua unidade. Procure o administrador.',already_registered:'Você já tem uma senha cadastrada. Volte e entre normalmente, ou peça um código de recuperação ao administrador.',invalid_request:'Informe sua matrícula, ID global ou e-mail.'};
  message.textContent=map[err.code]||'Não foi possível concluir o cadastro. Tente novamente em instantes.';
 }finally{button.disabled=false}
});

accessForm.addEventListener('submit',async e=>{
 e.preventDefault();
 const button=accessForm.querySelector('button'),password=document.getElementById('accessPassword').value;
 if(password!==document.getElementById('accessConfirm').value){message.textContent='As senhas não coincidem.';return}
 button.disabled=true;message.textContent='Salvando…';
 try{
  CC.activationToken=document.getElementById('accessCode').value.trim();
  await CC.activate(password);
  accessForm.reset();accessForm.hidden=true;
  await CC.logout().catch(()=>{});
  message.textContent='Senha salva. Volte à jornada e entre com seu e-mail corporativo ou matrícula, como sp915634.';
 }catch(err){
  message.textContent=err.message==='password_policy'?'Use pelo menos 8 caracteres, com letras e números.':'Código inválido, expirado ou já utilizado. Solicite um novo código ao administrador.';
 }finally{button.disabled=false}
});
