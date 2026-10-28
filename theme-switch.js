'use strict';
(function(){
  const KEY='zeeroo-theme';
  const root=document.documentElement;
  const system=window.matchMedia('(prefers-color-scheme: dark)');
  let preference='system';
  try { const saved=localStorage.getItem(KEY); if(saved==='light'||saved==='dark')preference=saved; } catch {}
  function apply(){
    const dark=preference==='dark'||(preference==='system'&&system.matches);
    root.dataset.theme=dark?'dark':'light';
    root.style.colorScheme=dark?'dark':'light';
    const button=document.getElementById('theme-switch');
    if(button){button.textContent=preference==='system'?'◐ Auto':preference==='dark'?'☾ Sombre':'☀ Clair';button.setAttribute('aria-label','Thème actuel : '+preference+'. Changer de thème');}
    document.querySelectorAll('iframe[src*="/demo/"]').forEach(function(frame){try{frame.contentWindow.postMessage({type:'zeeroo-theme',theme:dark?'dark':'light'},location.origin)}catch{}});
  }
  function mount(){
    const button=document.createElement('button');button.id='theme-switch';button.type='button';button.className='zeeroo-theme-switch';button.title='Changer de thème : automatique, clair, sombre';button.addEventListener('click',function(){
      preference=preference==='system'?'light':preference==='light'?'dark':'system';
      try{if(preference==='system')localStorage.removeItem(KEY);else localStorage.setItem(KEY,preference)}catch{}
      apply();
    });document.body.appendChild(button);apply();
  }
  if(system.addEventListener)system.addEventListener('change',function(){if(preference==='system')apply()});
  window.addEventListener('message',function(event){if(event.origin!==location.origin||!event.data||event.data.type!=='zeeroo-theme')return;if(window.parent!==window){root.dataset.theme=event.data.theme==='dark'?'dark':'light';root.style.colorScheme=root.dataset.theme;}});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
  apply();
})();