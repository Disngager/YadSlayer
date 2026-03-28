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

  const SKIP_SEL=[
    '.ytp-ad-skip-button',
    '.ytp-ad-skip-button-modern',
    '.ytp-skip-ad-button',
    'button[class*="skip"]',
    'div[class*="skip"]',
  ];

  function adPresent(){
    const p=document.querySelector('.html5-video-player');
    if(p&&(p.classList.contains('ad-showing')||p.classList.contains('ad-interrupting')))return true;
    return AD_SEL.some(s=>!!document.querySelector(s));
  }

  // ── Try clicking the skip button directly ───────────────────────────────
  function clickSkipBtn(){
    for(const sel of SKIP_SEL){
      const btn=document.querySelector(sel);
      if(btn&&btn.offsetParent!==null&&btn.offsetWidth>0){
        btn.click();
        console.log('[YAdSlayer] SKIP BTN CLICKED via '+sel);
        return true;
      }
    }
    return false;
  }

  // ── After seek lands, hammer the skip button for 3 seconds ─────────────
  function huntSkipButton(attempts){
    if(attempts<=0)return;
    if(clickSkipBtn()){
      skipCount++;
      lastSkip=Date.now();
      skipInProgress=false;
      updateHUD();flashHUD();
      console.log('[YAdSlayer] SLAIN #'+skipCount);
      // Immediately re-arm for next ad
      setTimeout(trySkip,300);
      setTimeout(trySkip,600);
      setTimeout(trySkip,1200);
      return;
    }
    setTimeout(()=>huntSkipButton(attempts-1), 120);
  }

  function onSkipped(method){
    // Don't increment here — huntSkipButton handles it
    // Just trigger the hunt for the skip button that appears after seek
    skipInProgress=false;
    console.log('[YAdSlayer] Seek done via '+method+' — hunting skip btn...');
    huntSkipButton(25); // 25 attempts x 120ms = 3 seconds of hunting
  }

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
    },350);
    return true;
  }

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
        skipCount++;
        lastSkip=Date.now();
        skipInProgress=false;
        updateHUD();flashHUD();
        setTimeout(trySkip,300);
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

    // Always try clicking skip button first — fastest path
    if(clickSkipBtn()){
      skipCount++;
      lastSkip=Date.now();
      updateHUD();flashHUD();
      setTimeout(trySkip,400);
      return;
    }

    // No skip button visible — seek to end
    skipInProgress=true;
    if(trySeekSkip())return;
    trySpeedBlast();
  }

  // Observer
  let dbnc=null;
  new MutationObserver(()=>{
    clearTimeout(dbnc);
    dbnc=setTimeout(trySkip,100);
  }).observe(document.body,{
    childList:true,subtree:true,
    attributes:true,attributeFilter:['class'],
  });

  // Tick — faster during ads
  function tick(){
    trySkip();
    setTimeout(tick,adPresent()?300:2000);
  }
  tick();

  // HUD
  function buildHUD(){
    if(document.getElementById('yad-hud'))return;
    const d=document.createElement('div');
    d.id='yad-hud';
    d.style.cssText='position:fixed;top:12px;right:12px;z-index:2147483647;background:rgba(0,0,0,.92);color:#00ff88;font-family:Courier New,monospace;font-size:11px;padding:7px 13px;border-radius:4px;border:1px solid rgba(0,255,136,.2);pointer-events:none;letter-spacing:.04em;transition:all .3s;';
    d.innerHTML='<span style="color:#444">YAD</span><span style="color:#555">SLAYER</span> <span style="color:#2a2a2a">·</span> <span id="yad-n" style="color:#00ff88;font-weight:bold">0</span><span style="color:#2a2a2a"> slain</span>';
    document.body.appendChild(d);
  }
  function updateHUD(){const e=document.getElementById('yad-n');if(e)e.textContent=skipCount;}
  function flashHUD(){
    const h=document.getElementById('yad-hud');if(!h)return;
    h.style.borderColor='rgba(0,255,136,.9)';h.style.boxShadow='0 0 14px rgba(0,255,136,.5)';
    setTimeout(()=>{h.style.borderColor='rgba(0,255,136,.2)';h.style.boxShadow='none';},700);
  }

  document.readyState==='loading'
    ?document.addEventListener('DOMContentLoaded',()=>setTimeout(buildHUD,500))
    :setTimeout(buildHUD,500);
})();
