/* hc3 — hero WhatsApp scenes (whole-unit swap every 3s) */
(function(){
  var box=document.querySelector('[data-hc-scenes]'); if(!box) return;
  var ss=[].slice.call(box.querySelectorAll('.ph__s')); if(ss.length<2) return;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  box.dataset.scene=ss[0].dataset.scene;
  if(reduce){ box.classList.add('is-static'); return; }
  var i=0, t=null, seen=true;
  function show(k){ ss.forEach(function(s,j){ s.classList.remove('is-play'); s.classList.toggle('is-on',j===k); }); box.dataset.scene=''; void box.offsetWidth; box.dataset.scene=ss[k].dataset.scene; ss[k].classList.add('is-play'); i=k; }
  function run(){ clearInterval(t); t=setInterval(function(){ if(seen&&!document.hidden) show((i+1)%ss.length); },3000); }
  if('IntersectionObserver' in window) new IntersectionObserver(function(es){ seen=es[0].isIntersecting; if(seen){ show(0); run(); } else clearInterval(t); },{threshold:.2}).observe(box);
  else { show(0); run(); }
})();

/* hc3 — How Cekat helps: dotted connector between step visuals (ported from Chat page rev24), desktop only */
(function(){
  var wrap=document.querySelector('#how .ih-steps'); if(!wrap) return;
  var NS='http://www.w3.org/2000/svg';
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var svg=document.createElementNS(NS,'svg'); svg.setAttribute('class','ih-flow'); svg.setAttribute('aria-hidden','true');
  wrap.insertBefore(svg,wrap.firstChild);
  var segs=[], forced=null;
  /* hc11 — positions come from layout offsets (immune to the .rv reveal transform), measured relative to the steps wrapper.
     Each connector = ONE path from the exact centre of the circle on the bottom edge of box k to the exact centre of the circle
     on the top-centre edge of box k+1; circles are centred on the 1px box border (edge ±.5px). Desktop = S-curve; mobile = same
     path bowed through the left gutter so it never crosses the copy. */
  function pos(el){ /* exact (sub-pixel) rect relative to the wrapper, minus any in-flight .rv reveal translate */
    var r=el.getBoundingClientRect(), w=wrap.getBoundingClientRect(), tx=0, ty=0, n=el;
    while(n&&n!==wrap){ var t=getComputedStyle(n).transform; if(t&&t!=='none'){ var m=t.match(/matrix\(([^)]+)\)/); if(m){ var v=m[1].split(','); tx+=parseFloat(v[4])||0; ty+=parseFloat(v[5])||0; } } n=n.parentElement; }
    return {x:r.left-w.left-tx,y:r.top-w.top-ty,w:r.width,h:r.height}; }
  function layout(){
    var st=[].slice.call(wrap.querySelectorAll('.ih-stage')), W=wrap.getBoundingClientRect().width, H=wrap.getBoundingClientRect().height;
    svg.setAttribute('width',W); svg.setAttribute('height',H); svg.setAttribute('viewBox','0 0 '+W+' '+H);
    if(st.length<2){ segs=[]; svg.innerHTML=''; return; }
    var mob=window.matchMedia&&matchMedia('(max-width:900px)').matches;
    var defs='',body='',dots='';
    for(var k=0;k<st.length-1;k++){
      var a=pos(st[k]), b=pos(st[k+1]);
      var sx=a.x+a.w/2, sy=a.y+a.h-.5, ex=b.x+b.w/2, ey=b.y+.5, c=(ey-sy)*.75, d;
      if(mob){ var gx=12; d='M'+sx+' '+sy+' C'+sx+' '+(sy+30)+' '+gx+' '+(sy+16)+' '+gx+' '+(sy+56)+' L'+gx+' '+(ey-26)+' C'+gx+' '+(ey-2)+' '+(ex-80)+' '+ey+' '+ex+' '+ey; }
      else d='M'+sx+' '+sy+' C'+sx+' '+(sy+c)+' '+ex+' '+(ey-c)+' '+ex+' '+ey;
      defs+='<mask id="ihM'+k+'" maskUnits="userSpaceOnUse"><path class="ih-flow__mask" d="'+d+'"/></mask>';
      body+='<path class="ih-flow__line" d="'+d+'" mask="url(#ihM'+k+')"/>';
      dots+='<circle cx="'+sx+'" cy="'+sy+'" r="4.5"/><circle cx="'+ex+'" cy="'+ey+'" r="4.5"/>';
    }
    svg.innerHTML='<defs>'+defs+'</defs>'+body+'<g class="ih-flow__nodes">'+dots+'</g>';
    segs=[].slice.call(svg.querySelectorAll('.ih-flow__mask')).map(function(m){ var l=m.getTotalLength(); m.style.strokeDasharray=l+' '+l; return {el:m,len:l}; });
    draw();
  }
  function draw(){
    if(!segs.length) return;
    var p;
    if(forced!=null) p=forced; else if(reduce) p=1;
    else { var r=wrap.getBoundingClientRect(); p=Math.max(0,Math.min(1,((innerHeight*.62-r.top)/r.height)*1.08)); }
    var n=segs.length;
    segs.forEach(function(s,k){ var q=Math.max(0,Math.min(1,p*(n+1)-(k+.5))); s.el.style.strokeDashoffset=(s.len*(1-q)).toFixed(1); });
  }
  window.ihFlow={set:function(p){forced=p;draw();},layout:layout};
  var raf=0;
  addEventListener('scroll',function(){ if(!raf) raf=requestAnimationFrame(function(){ raf=0; draw(); }); },{passive:true});
  addEventListener('resize',function(){ clearTimeout(layout._t); layout._t=setTimeout(layout,120); });
  addEventListener('load',layout);
  if(window.ResizeObserver){ var ro=new ResizeObserver(function(){ clearTimeout(layout._t2); layout._t2=setTimeout(layout,30); }); ro.observe(wrap); [].forEach.call(wrap.querySelectorAll('.ih-stage'),function(s){ ro.observe(s); }); }
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(layout);
  layout();
})();

/* hc5 — Key results count-up (once, on view; final values shown for reduced motion / no IO) */
(function(){
  var els=[].slice.call(document.querySelectorAll('[data-count]')); if(!els.length) return;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce||!('IntersectionObserver' in window)) return;
  function fmt(tpl,p){ return tpl.replace(/\d+/g,function(d){ return String(Math.round(+d*p)); }); }
  els.forEach(function(el){ el.textContent=fmt(el.dataset.count,0); });
  var box=els[0].closest('.ih-res')||els[0];
  var io=new IntersectionObserver(function(es){
    if(!es[0].isIntersecting) return; io.disconnect();
    var t0=null, D=1300;
    function step(ts){ if(t0==null) t0=ts; var k=Math.min(1,(ts-t0)/D), e=1-Math.pow(1-k,3);
      els.forEach(function(el){ el.textContent=k<1?fmt(el.dataset.count,e):el.dataset.count; });
      if(k<1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  },{threshold:.35});
  io.observe(box);
})();
