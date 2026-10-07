/* MP4 playback with an animated-image fallback for every trailer scene. */
(()=>{
 const video=$('sceneVideo'),fallback=$('sceneFallback'),score=$('scoreAudio'),status=$('filmStatus'),pause=$('filmPause'),leave=$('leaveIsland');
 const retry=document.createElement('button');
 retry.type='button';
 retry.textContent='호환 영상으로 재생';
 retry.hidden=true;
 pause.after(retry);
 const sources=['media/island-0.mp4','media/island-1.mp4','media/island-2.mp4','media/scene-4.mp4','media/scene-5.mp4','media/scene-6-ithaca.mp4'];
 const fallbackSources=['media/fallback-1.webp','media/fallback-2.webp','media/fallback-3.webp','media/fallback-4.webp','media/fallback-5.webp','media/fallback-6.webp'];
 const posters=['','','','media/scene-4-poster.jpg','media/scene-5-poster.jpg','media/scene-6-poster.jpg'];
 let active=false,index=-1,generation=0,loadTimer=0,switchTimer=0,music=false,mode='mp4',lastSource='',lastFallback='',lastEnd=leaveIsland,fallbackDuration=8000;

 function clearHandlers(){video.onended=video.onerror=video.onloadeddata=video.oncanplay=video.ontimeupdate=null;fallback.onload=fallback.onerror=null;}
 function stop(){active=false;generation++;clearTimeout(loadTimer);clearTimeout(switchTimer);clearHandlers();video.pause();video.removeAttribute('src');video.load();fallback.removeAttribute('src');fallback.hidden=true;video.hidden=false;}
 function complete(){if(!active)return;const cb=lastEnd;stop();cb();}
 function offerFallback(message){
  if(!active)return;
  clearTimeout(loadTimer);
  status.textContent=message+' 호환 방식으로 전환합니다…';
  retry.textContent='호환 영상으로 재생';
  retry.hidden=false;
  retry.disabled=false;
  pause.textContent='▶';
  clearTimeout(switchTimer);
  switchTimer=setTimeout(playFallback,700);
 }
 function beginPlayback(ticket){
  if(!active||ticket!==generation)return;
  clearTimeout(loadTimer);
  video.play().then(()=>{if(!active||ticket!==generation)return;pause.disabled=false;pause.textContent='Ⅱ';retry.hidden=true;}).catch(()=>offerFallback('MP4 재생이 멈췄어요.'));
 }
 function playMp4(){
  mode='mp4';
  const ticket=++generation;
  clearTimeout(loadTimer);
  clearTimeout(switchTimer);
  clearHandlers();
  fallback.hidden=true;
  fallback.removeAttribute('src');
  video.hidden=false;
  pause.disabled=false;
  retry.hidden=true;
  status.textContent='영상 불러오는 중…';
  $('filmProgress').style.transition='none';
  $('filmProgress').style.width='0%';
  video.onloadeddata=()=>beginPlayback(ticket);
  video.oncanplay=()=>{if(video.paused)beginPlayback(ticket);};
  video.ontimeupdate=()=>{
   if(!active||ticket!==generation)return;
   const duration=Number.isFinite(video.duration)?video.duration:8;
   $('filmProgress').style.width=Math.min(100,video.currentTime/duration*100)+'%';
   if(!video.paused)status.textContent=Math.max(0,Math.ceil(duration-video.currentTime))+'초 후 '+(index===5?'포스터 엔딩':'항해');
   if(video.currentTime>=duration-.12)complete();
  };
  video.onended=complete;
  video.onerror=()=>{if(active&&ticket===generation)offerFallback('MP4 영상을 불러오지 못했어요.');};
  video.src=lastSource;
  video.load();
  loadTimer=setTimeout(()=>{if(active&&ticket===generation)offerFallback('MP4 로딩이 지연되고 있어요.');},7000);
 }
 function playFallback(){
  if(!active)return;
  mode='fallback';
  const ticket=++generation;
  clearTimeout(loadTimer);
  clearTimeout(switchTimer);
  clearHandlers();
  video.pause();
  video.removeAttribute('src');
  video.load();
  video.hidden=true;
  fallback.hidden=false;
  pause.disabled=true;
  retry.hidden=true;
  status.textContent='호환 영상 불러오는 중…';
  $('filmProgress').style.transition='none';
  $('filmProgress').style.width='0%';
  fallback.onload=()=>{
   if(!active||ticket!==generation)return;
   status.textContent=(index===5?'이타카 호환 영상 재생 중 · 포스터 엔딩으로 이어집니다':'호환 영상 재생 중');
   void $('filmProgress').offsetWidth;
   $('filmProgress').style.transition=`width ${fallbackDuration}ms linear`;
   requestAnimationFrame(()=>{$('filmProgress').style.width='100%';});
   loadTimer=setTimeout(complete,fallbackDuration);
  };
  fallback.onerror=()=>{
   if(!active||ticket!==generation)return;
   clearTimeout(loadTimer);
   status.textContent='호환 영상 로딩에 실패했어요. 장면 다시 불러오기를 눌러주세요.';
   retry.textContent='장면 다시 불러오기';
   retry.hidden=false;
   retry.disabled=false;
  };
  fallback.src=lastFallback;
  loadTimer=setTimeout(()=>{
   if(!active||ticket!==generation)return;
   fallback.onerror();
  },10000);
 }
 function start(selected,options={}){
  stop();
  active=true;
  index=selected;
  lastSource=options.source||sources[selected];
  lastFallback=options.fallback||fallbackSources[selected];
  lastEnd=options.onEnd||leaveIsland;
  fallbackDuration=options.duration||8000;
  video.muted=true;
  video.loop=false;
  video.playsInline=true;
  video.style.objectFit=selected===5?'contain':'cover';
  video.style.objectPosition=['50% 40%','50% 25%','50% 30%','50% 25%','50% 40%','50% 45%'][selected]||'50% 50%';
  video.poster=options.poster||posters[selected]||'';
  fallback.style.objectFit=selected===5?'contain':'cover';
  fallback.style.objectPosition=video.style.objectPosition;
  leave.disabled=selected===5;
  playMp4();
  if(music){score.volume=.58;score.play().catch(()=>{});}
 }
 function togglePause(){if(!active||mode==='fallback')return;if(video.paused)video.play().catch(()=>offerFallback('MP4 재생이 멈췄어요.'));else{video.pause();pause.textContent='▶';status.textContent='일시정지';}}
 function toggleMusic(){music=!music;[$('musicToggle'),$('filmMusic')].forEach(b=>{b.textContent=music?'♫ 음악 끄기':'♫ 음악 켜기';b.setAttribute('aria-pressed',String(music));});if(music){score.volume=active?.58:.34;score.play().catch(()=>{});}else score.pause();}
 retry.onclick=()=>{retry.disabled=true;playFallback();};
 pause.onclick=togglePause;
 $('musicToggle').onclick=$('filmMusic').onclick=toggleMusic;
 window.cinema={start,stop,togglePause};
})();

/* Mid-voyage visual choice. */
(()=>{
 const d=document.createElement('section');
 d.className='strait-choice';
 d.hidden=true;
 d.innerHTML='<div><p>귀향의 해협</p><h2>두려움의 어느 쪽으로?</h2><p>소용돌이를 선택하면 바다가 배를 삼키고, 괴물을 선택하면 절벽에서 스킬라가 솟아오릅니다.</p><button data-choice="charybdis">카리브디스 · 소용돌이</button><button data-choice="scylla">스킬라 · 괴물</button></div>';
 document.body.append(d);
 let triggered=false,open=false;
 window.strait={reset(){triggered=false;open=false;d.hidden=true},get active(){return open},show(){if(triggered)return false;triggered=true;open=true;paused=true;ship.v=0;Object.keys(keys).forEach(k=>keys[k]=false);d.hidden=false;d.querySelector('button').focus();return true}};
 d.querySelectorAll('button').forEach(b=>b.onclick=()=>{
  const k=b.dataset.choice;
  d.hidden=true;
  open=false;
  sceneIndex=6;
  paused=true;
  $('islandScene').hidden=false;
  document.body.classList.add('ashore');
  $('sceneTitle').textContent=k==='scylla'?'절벽에서 깨어난 스킬라':'바다를 삼키는 카리브디스';
  $('sceneEyebrow').textContent='귀향의 해협 · 선택한 항로';
  $('sceneCount').textContent='해협 통과';
  $('leaveIsland').disabled=false;
  $('leaveIsland').textContent='항해로 돌아가기';
  window.cinema.start(6,{source:`media/${k}.mp4`,fallback:`media/fallback-${k}.webp`,duration:6000,onEnd:leaveIsland});
  $('leaveIsland').focus();
 });
})();
