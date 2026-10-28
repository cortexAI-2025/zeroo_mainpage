'use strict';
(function(){
  const link=document.createElement('a');
  link.className='zeeroo-whatsapp';
  link.href='https://wa.me/33602405147?text='+encodeURIComponent('Bonjour AiWorkPay, je vous contacte au sujet de ZeeROO.');
  link.target='_blank';link.rel='noopener noreferrer';
  link.setAttribute('aria-label','Contacter AiWorkPay sur WhatsApp (ouvre une nouvelle fenêtre)');
  link.textContent='✆ WhatsApp · AiWorkPay';
  document.body.appendChild(link);
  const form=document.getElementById('contact-form');
  if(!form)return;
  form.addEventListener('submit',function(event){
    event.preventDefault();if(!form.reportValidity())return;
    const fields=new FormData(form);
    const body='Nom : '+fields.get('name')+'\nE-mail : '+fields.get('email')+'\nProfil : '+fields.get('profile')+'\n\n'+fields.get('message');
    const url='mailto:contact@aiworkpay.fr?subject='+encodeURIComponent('ZeeROO - contact '+fields.get('profile'))+'&body='+encodeURIComponent(body);
    document.getElementById('contact-form-status').textContent='Votre messagerie va s’ouvrir. Vérifiez le message puis cliquez sur Envoyer. Si rien ne s’ouvre, utilisez WhatsApp ou écrivez à contact@aiworkpay.fr.';
    window.location.href=url;
  });
})();
