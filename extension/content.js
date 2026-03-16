(function(){
  'use strict';
  if(window.__yadslayer__)return;
  window.__yadslayer__=true;

  let skipCount=0,lastSkip=0,skipInProgress=false;

  const AD_SEL=[
    '.ytp-ad-player-overlay',
    '.ytp-ad-progress',
    '.ytp-ad-simple-ad-badge',
    '.ytp-ad-preview-container',
  ];

  function adPresent(){
    const p=document.querySelector('.html5-video-player');
    if(p&&(p.classList.contains('ad-showing')||p.classList.contains('ad-interrupting')))return true;
    return AD_SEL.some(s=>!!document.querySelector(s));
  }

  function onSkipped(method){
    skipCount++;
    lastSkip=Date.now();
    skipInProgress=false;
    updateHUD();flashHUD();
    console.log('[YAdSlayer] SLAIN #'+skipCount+' via '+method);
    // Re-arm immediately for back-to-back ads
    setTimeout(trySkip,300);
    setTimeout(trySkip,800);
    setTimeout(trySkip,1500);
  }

  // PRIMARY: Seek to end — jumps ad timeline instantly
  function trySeekSkip(){
    const v=document.querySelector('video');
    if(!v)return false;
    const dur=v.duration;
    if(!dur||!isFinite(dur)||dur<=0)return false;
    v.currentTime=dur-0.01;
    v.muted=true;
    v.playbackRate=16;
    setTimeout(()=>{
      v.playbackRate=1;
      v.muted=false;
      onSkipped('seekToEnd');
    },400);
    return true;
  }

  // FALLBACK: 16x speed blast for non-skippable ads
  function trySpeedBlast(){
    const v=document.querySelector('video');
    if(!v||v.playbackRate>=16)return false;
    v.muted=true;
    v.playbackRate=16;
    const t=setInterval(()=>{
      if(!adPresent()){
        clearInterval(t);
        v.playbackRate=1;
        v.muted=false;
        onSkipped('speedBlast');
      }
    },300);
    setTimeout(()=>{
      clearInterval(t);
      if(v.playbackRate===16){v.playbackRate=1;v.muted=false;}
      skipInProgress=false;
    },30000);
    return true;
  }

  function trySkip(){
    if(skipInProgress)return;
    if(!adPresent())return;
    const now=Date.now();
    if(now-lastSkip<500)return;
    skipInProgress=true;
    if(trySeekSkip())return;
    trySpeedBlast();
  }

  // Observer — watch for ad class changes
  let dbnc=null;
  new MutationObserver(()=>{
    clearTimeout(dbnc);
    dbnc=setTimeout(trySkip,150);
  }).observe(document.body,{
    childList:true,subtree:true,
    attributes:true,attributeFilter:['class'],
  });

  // Adaptive tick
  function tick(){trySkip();setTimeout(tick,adPresent()?400:2500);}
  tick();

  // HUD
  function buildHUD(){
    if(document.getElementById('yad-hud'))return;
    const d=document.createElement('div');
    d.id='yad-hud';
    d.style.cssText='position:fixed;top:12px;right:12px;z-index:2147483647;background:rgba(0,0,0,.92);color:#00ff88;font-family:Courier New,monospace;font-size:11px;padding:7px 13px;border-radius:4px;border:1px solid rgba(0,255,136,.2);pointer-events:none;letter-spacing:.04em;transition:all .3s;';
    d.innerHTML='<span style="color:#444">YAD</span><span style="color:#555">SLAYER</span> <span style="color:#2a2a2a">·</span> <span id="yad-n" style="color:#00ff88;font-weight:bold">0</span><span style="color:#2a2a2a"> slain</span>';
    document.body.appendChild(d);
    console.log('[YAdSlayer] Armed on '+location.hostname);
  }
  function updateHUD(){const e=document.getElementById('yad-n');if(e)e.textContent=skipCount;}
  function flashHUD(){
    const h=document.getElementById('yad-hud');if(!h)return;
    h.style.borderColor='rgba(0,255,136,.9)';
    h.style.boxShadow='0 0 14px rgba(0,255,136,.5)';
    setTimeout(()=>{h.style.borderColor='rgba(0,255,136,.2)';h.style.boxShadow='none';},700);
  }

  document.readyState==='loading'
    ?document.addEventListener('DOMContentLoaded',()=>setTimeout(buildHUD,500))
    :setTimeout(buildHUD,500);
})();
