(() => {
  'use strict';
  const scene = document.getElementById('cosmos');
  const canvas = document.getElementById('cosmos-stars');
  if (!scene || !canvas) return;
  const ctx = canvas.getContext('2d', {alpha:true});
  if (!ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)');
  let width=0, height=0, focal=0, stars=[], raf=0, previous=0, elapsed=0;
  let cameraX=0, cameraY=0, targetX=0, targetY=0, scroll=0, scrollTarget=0;
  let paused=true;
  const sprites = ['#dce6f5','#f1d1a3','#abbede'].map(color => {
    const sprite = document.createElement('canvas'); sprite.width=sprite.height=40;
    const paint=sprite.getContext('2d');
    const glow=paint.createRadialGradient(20,20,0,20,20,20);
    glow.addColorStop(0,'#fff');glow.addColorStop(.075,color);
    glow.addColorStop(.22,color+'85');glow.addColorStop(1,color+'00');
    paint.fillStyle=glow;paint.fillRect(0,0,40,40);return sprite;
  });
  function seedStar(far=false) {
    return {x:(Math.random()-.5)*width*4,y:(Math.random()-.5)*height*4,
      z:far?2.8:Math.random()*2.5+.3,size:.45+Math.random()*.8,
      phase:Math.random()*Math.PI*2,color:Math.floor(Math.random()*sprites.length)};
  }
  function size() {
    width=innerWidth;height=innerHeight;focal=Math.max(width,height)*.5;
    const dpr=Math.min(devicePixelRatio||1,coarse.matches?1.25:1.5);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    stars=Array.from({length:coarse.matches?70:Math.min(220,Math.round(width*height/6500))},()=>seedStar());
    updateScroll();if(paused)render(0);
  }
  function updateScroll() {
    scrollTarget=Math.min(1,Math.max(0,window.scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)));
  }
  function render(dt) {
    elapsed+=dt;const smooth=1-Math.exp(-dt*3.2);
    cameraX+=(targetX-cameraX)*smooth;cameraY+=(targetY-cameraY)*smooth;
    scroll+=(scrollTarget-scroll)*smooth;
    ctx.clearRect(0,0,width,height);
    ctx.globalCompositeOperation='lighter';
    const centerX=width*.61,centerY=height*.44;
    for(let i=0;i<stars.length;i++){
      let star=stars[i];star.z-=dt*.018;
      if(star.z<.22){stars[i]=star=seedStar(true);}
      const scale=focal/(star.z*focal*.75+focal*.25);
      const x=centerX+(star.x-cameraX*60)*scale;
      const y=centerY+(star.y-cameraY*40-scroll*50)*scale;
      if(x< -30||x>width+30||y< -30||y>height+30)continue;
      const twinkle=.78+Math.sin(elapsed*.7+star.phase)*.22;
      const radius=Math.min(7,(star.size*scale+1.1)*1.6);
      ctx.globalAlpha=Math.min(.85,(.18+.4/star.z)*twinkle);
      ctx.drawImage(sprites[star.color],x-radius,y-radius,radius*2,radius*2);
    }
    ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  }
  function frame(now) {
    raf=0;if(paused)return;
    // Render at 30fps and keep real-time motion stable when the device slows down.
    if(!previous)previous=now;
    if(now-previous>=1000/30){const dt=Math.min((now-previous)/1000,.065);previous=now;render(dt);}
    raf=requestAnimationFrame(frame);
  }
  function sync() {
    const shouldPause=reduced.matches||document.hidden||document.body.classList.contains('intro-playing')||document.body.classList.contains('project-window-open');
    paused=shouldPause;scene.classList.toggle('is-paused',paused);
    if(raf){cancelAnimationFrame(raf);raf=0;}previous=0;
    if(!paused)raf=requestAnimationFrame(frame);
    else if(reduced.matches)render(0);
  }
  document.addEventListener('pointermove',event=>{
    if(event.pointerType==='touch'||coarse.matches||reduced.matches)return;
    targetX=(event.clientX/width-.5)*1.4;targetY=(event.clientY/height-.5)*1.1;
  },{passive:true});
  window.addEventListener('scroll',updateScroll,{passive:true});
  let resizeTimer;
  window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(size,140);});
  document.addEventListener('visibilitychange',sync);
  reduced.addEventListener('change',sync);
  coarse.addEventListener('change',size);
  new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
  size();sync();
})();
