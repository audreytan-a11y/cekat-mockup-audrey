/* Cekat.AI homepage v1 — vanilla JS, no build */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var isDesktop = function () { return window.matchMedia('(min-width: 1025px)').matches; };

  /* ---------- nav: scrolled state ---------- */
  var nav = $('#nav');
  var onScroll = function () { nav.classList.toggle('is-scrolled', window.scrollY > 8); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- mobile menu ---------- */
  var toggle = $('.nav__toggle');
  toggle.addEventListener('click', function () {
    var open = !nav.classList.contains('menu-open');
    nav.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('.nav__menu a').forEach(function (a) {
    a.addEventListener('click', function () {
      if (nav.classList.contains('menu-open')) toggle.click();
    });
  });

  /* ---------- dropdowns ---------- */
  var dds = $$('.dd');
  function setOpen(dd, open) {
    dd.classList.toggle('is-open', open);
    $('.dd__trigger', dd).setAttribute('aria-expanded', String(open));
  }
  function closeAll(except) { dds.forEach(function (d) { if (d !== except) setOpen(d, false); }); }
  // click-only: no hover listeners anywhere
  dds.forEach(function (dd) {
    $('.dd__trigger', dd).addEventListener('click', function () {
      var isOpen = dd.classList.contains('is-open');
      if (isDesktop()) closeAll(dd);
      setOpen(dd, !isOpen);
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var open = $('.dd.is-open');
    if (open) { setOpen(open, false); $('.dd__trigger', open).focus(); }
    else if (nav.classList.contains('menu-open')) toggle.click();
  });
  document.addEventListener('click', function (e) {
    if (isDesktop() && !e.target.closest('.dd')) closeAll();
  });

  /* products menu panels + rotation: see js/products-menu.js (v14) */

  /* mega-anchor: close menu when jumping to an on-page product card */
  $$('.dd a[href^="#"]').forEach(function (i) {
    i.addEventListener('click', function () { setTimeout(closeAll, 0); if (nav.classList.contains('menu-open')) toggle.click(); });
  });

  /* generic rotating scenes (.rot). A rot with data-ms advances on its own timer. */
  function stepRot(r) {
    var ss = $$('.rot__s', r);
    if (ss.length < 2) return;
    var i = ss.findIndex(function (x) { return x.classList.contains('is-on'); });
    if (i < 0) i = 0;
    var hold = +ss[i].dataset.hold || 1;
    r.__t = (r.__t || 0) + 1;
    if (r.__t < hold) return;
    r.__t = 0;
    ss[i].classList.remove('is-on');
    var nx = ss[(i + 1) % ss.length]; nx.classList.add('is-on');
    var dots = r.parentNode.querySelectorAll('.mini__dots i');
    dots.forEach(function (d, n) { d.classList.toggle('is-on', n === (i + 1) % ss.length); });
    var stg = r.closest('.stage') || r.parentNode.querySelector('.chrow'); if (stg && nx.dataset.ch) stg.dataset.ch = nx.dataset.ch;
    $$('[data-seq]', nx).forEach(function (q) { if (q.__reset) q.__reset(); });
  }
  function tickRot() {
    $$('.rot').forEach(function (r) {
      if (r.closest('.mv')) return; /* menu rotation lives in products-menu.js */
      if (r.dataset.ms) return;
      if (!r.dataset.vis) return;
      stepRot(r);
    });
  }
  if (!reduce) {
    $$('.rot').forEach(function (r) {
      if (r.closest('.mv')) return;
      if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { r.dataset.vis = en[0].isIntersecting ? '1' : ''; }).observe(r); else r.dataset.vis = '1';
      if (r.dataset.ms) setInterval(function () { if (r.dataset.vis) stepRot(r); }, +r.dataset.ms || 3500);
    });
    setInterval(tickRot, 3000);
  }

  /* mini kanban inside the menu: loop always while menu open (cheap) */
  /* ---------- reveal on scroll ---------- */
  var revealEls = $$('.rv, .rv-pop');
  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- visibility helper (only animate what's on screen) ---------- */
  function whenVisible(el, onIn, onOut) {
    if (!('IntersectionObserver' in window)) { onIn(); return; }
    new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) onIn(); else if (onOut) onOut(); });
    }, { threshold: 0.2 }).observe(el);
  }

  /* ---------- step sequencer: [data-seq] > [data-s] ----------
     data-start: step shown immediately on reveal (so nothing looks empty)
     data-hold:  extra ticks the finished state stays on screen
     On loop the whole thread crossfades out, then restarts at data-start. */
  $$('[data-seq]').forEach(function (seq) {
    var steps = $$('[data-s]', seq);
    var max = steps.reduce(function (m, el) { return Math.max(m, +el.dataset.s); }, 0);
    var interval = +seq.dataset.interval || 1000;
    var hold = +seq.dataset.hold || 3;
    var start = Math.min(+seq.dataset.start || 1, max);
    var step = start, timer = null, fading = false;
    function render() {
      seq.setAttribute('data-step', step);
      seq.dispatchEvent(new CustomEvent('seqstep', { detail: step }));
      steps.forEach(function (el) {
        var s = +el.dataset.s, until = el.dataset.until ? +el.dataset.until : Infinity;
        el.classList.toggle('on', step >= s && step < until);
      });
    }
    seq.__reset = function () { step = start; fading = false; seq.classList.remove('seq-fade'); render(); };
    if (reduce) { step = max; render(); return; }
    render();
    function tick() {
      if (fading) return;
      if (step >= max + hold) {
        fading = true;
        seq.classList.add('seq-fade');
        setTimeout(function () {
          step = start; render();
          seq.classList.remove('seq-fade');
          fading = false;
        }, 450);
        return;
      }
      step++;
      render();
    }
    whenVisible(seq, function () {
      if (!timer) timer = setInterval(tick, interval);
    }, function () { clearInterval(timer); timer = null; });
  });

  /* ---------- kanban card mover ---------- */
  $$('[data-loop="kb"]').forEach(function (kb) {
    var c = 0, timer = null;
    function set() { kb.style.setProperty('--c', c); kb.setAttribute('data-step', c); }
    if (reduce) { c = 2; set(); return; }
    set();
    whenVisible(kb, function () {
      if (timer) return;
      timer = setInterval(function () { c = (c + 1) % 4; set(); }, 1500);
    }, function () { clearInterval(timer); timer = null; });
  });

  /* ---------- count-up ---------- */
  function fmt(n) { return n.toLocaleString('en-US'); }
  function countUp(el, target, dur, done) {
    if (reduce) { el.textContent = fmt(target); if (done) done(); return; }
    var t0 = null;
    function frame(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * e));
      if (p < 1) requestAnimationFrame(frame); else if (done) done();
    }
    el.textContent = '0';
    requestAnimationFrame(frame);
  }
  var big = $('.big');
  if (big) {
    var num = $('.big__num', big), ind = $('.trust__ind b');
    var chips = $$('.ind-chips li');
    var started = false;
    // lock the final width so the number never jitters or clips while counting
    num.textContent = fmt(3000);
    num.style.display = 'inline-block';
    num.style.minWidth = Math.ceil(num.getBoundingClientRect().width) + 'px';
    num.style.textAlign = 'center';
    var showChips = function () {
      chips.forEach(function (li, i) { li.style.transitionDelay = (i * 60) + 'ms'; li.classList.add('chip-in'); });
    };
    var start = function () {
      if (started) return; started = true;
      countUp(num, 3000, 1200, function () { big.classList.add('done'); setTimeout(showChips, 200); });
      if (ind) countUp(ind, 15, 1400);
    };
    if (reduce) { big.classList.add('done'); chips.forEach(function (li) { li.classList.add('chip-in'); }); }
    else {
      num.textContent = '0';
      if (ind) ind.textContent = '0';
      big.classList.add('anim');
      chips.forEach(function (li) { li.classList.add('chip-pre'); });
    }
    whenVisible(big, function () { setTimeout(start, 350); });
  }

  /* ---------- marquee: duplicate tracks for seamless loop ---------- */
  $$('.marquee__track').forEach(function (track) {
    $$('.logo', track).forEach(function (logo) {
      var clone = logo.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      $$('img', clone).forEach(function (img) { img.alt = ''; });
      track.appendChild(clone);
    });
  });

  /* ---------- testimonial spotlight ---------- */
  $$('.tc').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- SVG SMIL animations: pause for reduced motion / offscreen ---------- */
  $$('.map__svg, .hub__svg').forEach(function (svg) {
    if (!svg.pauseAnimations) return;
    if (reduce) { svg.pauseAnimations(); return; }
    whenVisible(svg, function () { svg.unpauseAnimations(); }, function () { svg.pauseAnimations(); });
  });

  /* ---------- close mobile menu on resize to desktop ---------- */
  window.addEventListener('resize', function () {
    if (isDesktop() && nav.classList.contains('menu-open')) toggle.click();
  });

  /* ---------- hero tagline: typewriter ---------- */
  (function () {
    var el = $('.tw__t'), tw = $('.tw');
    if (!el || reduce) { if (tw) tw.classList.add('is-static'); return; }
    var phrases = ['Lebih fleksibel.', 'Balas lebih cepat.', 'Pelanggan senang.'];
    var p = 0, n = phrases[0].length, dir = -1; // start by showing first phrase, then delete
    function render() { el.textContent = phrases[p].slice(0, n); }
    function step() {
      var t;
      if (dir === 1) {
        if (n < phrases[p].length) { n++; render(); t = 60 + Math.random() * 20; }
        else { dir = -1; t = 1800; }
      } else {
        if (n > 0) { n--; render(); t = 35; }
        else { dir = 1; p = (p + 1) % phrases.length; t = 350; }
      }
      setTimeout(step, t);
    }
    render();
    setTimeout(step, 2200);
  })();

  /* ---------- chat pill beats (page card, scene 1) ---------- */
  (function () {
    var win = $('.pillar .rot__s .win[data-seq]');
    if (!win) return;
    var ps = $$('.fpills .fpill', win.parentNode);
    if (ps.length < 2) return;
    var t1, t2;
    win.addEventListener('seqstep', function (e) {
      var s = e.detail;
      if (s <= 2) { clearTimeout(t1); clearTimeout(t2); ps[0].classList.remove('show'); ps[1].classList.remove('show'); }
      if (s === 3) { clearTimeout(t1); t1 = setTimeout(function () { ps[0].classList.add('show'); }, 1000); }
      if (s === 5) { clearTimeout(t2); t2 = setTimeout(function () { ps[1].classList.add('show'); }, 1000); }
    });
  })();

})();

/* v14: hero line fans — symmetric, converging exactly beside the headline's centre (between its two lines) */
(function(){
  var net=document.querySelector('.hnet'); if(!net) return;
  var svg=net.querySelector('svg'), hero=net.parentNode, h1=hero.querySelector('.hero__h'); if(!h1) return;
  var paths=[].slice.call(svg.querySelectorAll('.hnet__l path')), mirror=svg.querySelectorAll('use')[1];
  var DOTS=[[0,.3],[2,.55],[5,.4],[7,.25]]; /* same spots on both sides */
  function lastText(el){ for(var n=el.lastChild;n;n=n.previousSibling){ if(n.nodeType===3&&n.textContent.trim()) return n; } return null; }
  function build(){
    var r=net.getBoundingClientRect(), W=r.width, H=r.height; if(!W||!H) return;
    var tn=lastText(h1); if(!tn) return;
    var rg=document.createRange(); rg.selectNodeContents(tn); var tr=rg.getBoundingClientRect(), hr=h1.getBoundingClientRect();
    var gap=Math.max(12,tr.height*.22);
    var ax=Math.min(tr.left-r.left, r.right-tr.right)-gap, ay=(hr.top+hr.height/2)-r.top;
    net.classList.toggle('hnet--off', ax<40);
    svg.setAttribute('viewBox','0 0 '+W+' '+H);
    var n=paths.length, top=H*.04, span=H*.9;
    paths.forEach(function(p,i){
      var y=top+span*i/(n-1);
      p.setAttribute('d','M0 '+y.toFixed(1)+' C '+(ax*.5).toFixed(1)+' '+y.toFixed(1)+', '+(ax*.62).toFixed(1)+' '+ay.toFixed(1)+', '+ax.toFixed(1)+' '+ay.toFixed(1));
    });
    if(mirror) mirror.setAttribute('transform','translate('+W+' 0) scale(-1 1)');
    net.querySelectorAll('.hdot').forEach(function(d){d.remove();});
    if(ax<40) return;
    [0,1].forEach(function(side){
      DOTS.forEach(function(s,i){
        var p=paths[s[0]]; if(!p) return;
        var pt=p.getPointAtLength(p.getTotalLength()*s[1]);
        var d=document.createElement('span'); d.className='hdot';
        d.style.left=(side?W-pt.x:pt.x)+'px'; d.style.top=pt.y+'px';
        d.style.setProperty('--dl',(-(i*0.9))+'s');
        net.appendChild(d);
      });
    });
  }
  build();
  var t; window.addEventListener('resize',function(){clearTimeout(t);t=setTimeout(build,80);});
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(build);
  window.addEventListener('load',build);
})();

/* map headline: staggered word reveal, once */
(function(){
  var h=document.getElementById('mapline'); if(!h) return;
  if(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  h.querySelectorAll('.ww').forEach(function(w,i){w.style.setProperty('--i',i);});
  h.classList.add('wa');
  if(!('IntersectionObserver' in window)){h.classList.add('in');return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){h.classList.add('in');io.disconnect();}});},{threshold:.4});
  io.observe(h);
})();

/* v11: wide product cards, one shared timer per card (text + illustration + dots in sync) */
(function(){
  var reduce=window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-sync]').forEach(function(card,n){
    var sl=[].slice.call(card.querySelectorAll('.wv-s')),
        dots=[].slice.call(card.querySelectorAll('.wv-dots button')),
        rotW=card.querySelector('.pc-rot__w'),
        txt=[].slice.call(card.querySelectorAll(rotW?'.pc-rot__w>span':'.wide__sub>span')),
        subs=rotW?[].slice.call(card.querySelectorAll('.wide__sub>span')):[], line=card.querySelector('.pc-rot'), i=0, paused=false, t=null, MS=3000;
    if(sl.length<2) return;
    function countUp(slide){
      var lk=slide.querySelector('.lk-n[data-to]');
      if(lk){ var to=+lk.getAttribute('data-to'), pf=lk.getAttribute('data-pre')||'', t1=null; if(lk._raf) cancelAnimationFrame(lk._raf); lk.textContent=pf+'0';
        (function g(ts){ if(t1===null) t1=ts; var q=Math.min(1,Math.max(0,(ts-t1-350)/1000)), e1=1-Math.pow(1-q,3); lk.textContent=pf+Math.round(to*e1).toLocaleString('en-US'); if(q<1) lk._raf=requestAnimationFrame(g); })(performance.now()); }
      var src=slide.querySelector('.pc-src'); if(!src) return;
      var bs=[].slice.call(src.querySelectorAll('li b')), vals=bs.map(function(b){return b.getAttribute('data-v')||(b.setAttribute('data-v',b.textContent.replace(/[^0-9]/g,'')),b.getAttribute('data-v'));}).map(Number);
      var t0=null, D=1000; if(src._raf) cancelAnimationFrame(src._raf);
      src.style.setProperty('--k',0); bs.forEach(function(b){b.textContent='0';});
      function f(ts){ if(t0===null) t0=ts; var p=Math.min(1,(ts-t0-300)/D); if(p<0) p=0; var e=1-Math.pow(1-p,3);
        src.style.setProperty('--k',e); bs.forEach(function(b,j){b.textContent=Math.round(vals[j]*e).toLocaleString('en-US');});
        if(p<1) src._raf=requestAnimationFrame(f); }
      src._raf=requestAnimationFrame(f);
    }
    function set(k,instant){
      var prevS=sl[i], prevT=txt[i];
      sl.forEach(function(s,j){s.classList.toggle('is-on',j===k);});
      txt.forEach(function(s,j){s.classList.toggle('is-on',j===k);s.classList.remove('is-out');});
      subs.forEach(function(s,j){s.classList.toggle('is-on',j===k);});
      dots.forEach(function(d,j){d.classList.toggle('on',j===k);d.setAttribute('aria-pressed',j===k?'true':'false');});
      if(!instant && prevS && prevS!==sl[k]){prevS.classList.add('is-leaving');setTimeout(function(){prevS.classList.remove('is-leaving');},420);}
      if(!instant && prevT && prevT!==txt[k] && rotW){prevT.classList.add('is-out');setTimeout(function(){prevT.classList.remove('is-out');},350);}
      i=k;
      if(!instant && !reduce) countUp(sl[k]);
      if(line&&txt[k]) line.setAttribute('aria-label',(line.getAttribute('data-pre')||'')+txt[k].textContent);
    }
    function tick(){if(!paused&&!document.hidden) set((i+1)%sl.length);}
    function start(){clearTimeout(t);t=setTimeout(function(){tick();start();},+(sl[i].getAttribute('data-ms')||MS));}
    set(0,true);
    dots.forEach(function(d,j){d.addEventListener('click',function(){if(j!==i) set(j);if(!reduce) start();});});
    if(reduce) return;
    /* pause only while a mouse is over the card or keyboard focus is inside; always resume */
    var hover=false, kfocus=false, seen=true;
    function upd(){paused=hover||kfocus||!seen;}
    card.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse'){hover=true;upd();}});
    card.addEventListener('pointerleave',function(){hover=false;upd();});
    card.addEventListener('focusin',function(e){kfocus=!!(e.target.matches&&e.target.matches(':focus-visible'));upd();});
    card.addEventListener('focusout',function(){kfocus=false;upd();});
    dots.forEach(function(d){d.addEventListener('pointerup',function(){d.blur();kfocus=false;upd();});});
    if('IntersectionObserver' in window){new IntersectionObserver(function(es){es.forEach(function(e){seen=e.isIntersecting;upd();if(seen)start();});},{threshold:.15}).observe(card);}
    document.addEventListener('visibilitychange',function(){if(!document.hidden)start();});
    setTimeout(start,n*500);
  });
})();

/* v8: stories carousel arrows */
(function(){
  var track=document.querySelector('.bento--car'); if(!track) return;
  var prev=document.querySelector('.st-arr--prev'), next=document.querySelector('.st-arr--next'); if(!prev||!next) return;
  function step(){var c=track.querySelector('.tc'); if(!c) return track.clientWidth; var g=parseFloat(getComputedStyle(track).columnGap)||20; return c.getBoundingClientRect().width+g;}
  function upd(){var max=track.scrollWidth-track.clientWidth-2; prev.disabled=track.scrollLeft<=2; next.disabled=track.scrollLeft>=max;}
  prev.addEventListener('click',function(){track.scrollBy({left:-step(),behavior:'smooth'});});
  next.addEventListener('click',function(){track.scrollBy({left:step(),behavior:'smooth'});});
  track.addEventListener('scroll',function(){window.requestAnimationFrame(upd);},{passive:true});
  track.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();next.click();}if(e.key==='ArrowLeft'){e.preventDefault();prev.click();}});
  window.addEventListener('resize',upd); upd();
})();

/* v13d: map plays once when ~25% visible */
(function(){
  var m=document.getElementById('map'); if(!m) return;
  if(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches){m.classList.add('go');return;}
  if(!('IntersectionObserver' in window)){m.classList.add('go');return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){m.classList.add('in','go');io.disconnect();}});},{threshold:.25});
  io.observe(m);
})();

/* v13g: Top paid ads phone, real videos: ad 1 poster → play → ad 2 poster → play → loop */
(function(){
  var reduce=window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-sync] .pc-ads').forEach(function(box){
    var vids=[].slice.call(box.querySelectorAll('.ta-v video')); if(!vids.length) return;
    box.setAttribute('data-ad','0');
    if(reduce) return;                       /* poster + row 1, static */
    var slide=box.closest('.wv-s'), seen=false, active=false, ad=0, tm=[], cur=null;
    vids.forEach(function(v){v.muted=true;v.preload='auto';try{v.load();}catch(e){}});
    function clr(){tm.forEach(clearTimeout);tm=[];if(cur){cur.onended=null;}}
    function stopAll(){clr();box.classList.remove('is-playing');vids.forEach(function(v){try{v.pause();v.currentTime=0;}catch(e){}});}
    function show(k){
      clr(); ad=k; box.classList.remove('is-playing'); box.setAttribute('data-ad',String(k));
      vids.forEach(function(v,j){if(j!==k){try{v.pause();v.currentTime=0;}catch(e){}}});
      var v=vids[k]; cur=v; try{v.currentTime=0;}catch(e){}
      tm.push(setTimeout(function(){
        if(!active) return;
        box.classList.add('is-playing');
        var p=v.play(); if(p&&p.catch) p.catch(function(){});
        var done=false; function next(){if(done||!active) return; done=true; clr();
          if(k+1<vids.length) show(k+1); else tm.push(setTimeout(function(){if(active) show(0);},1000));}
        v.onended=next;
        tm.push(setTimeout(next,((v.duration&&isFinite(v.duration))?v.duration:4.1)*1000+1500)); /* fallback if 'ended' never fires */
      },600));
    }
    function upd(){
      var on=seen && !document.hidden && (!slide || slide.classList.contains('is-on'));
      if(on===active) return; active=on;
      if(on) show(0); else stopAll();
    }
    if(slide) new MutationObserver(upd).observe(slide,{attributes:true,attributeFilter:['class']});
    if('IntersectionObserver' in window) new IntersectionObserver(function(es){es.forEach(function(e){seen=e.isIntersecting;upd();});},{threshold:.15}).observe(box.closest('[data-sync]')||box);
    else { seen=true; upd(); }
    document.addEventListener('visibilitychange',upd);
  });
})();

/* v14: story video cards — play embeds the real YouTube video in place */
(function(){
  document.querySelectorAll('.vc__media[data-yt]').forEach(function(a){
    a.addEventListener('click',function(e){
      if(e.metaKey||e.ctrlKey||e.shiftKey) return;
      if(a.closest('.sg-track')) return; /* v14h: in the pager, open the video on YouTube (no inline player inside the swipe area) */
      e.preventDefault();
      var id=a.getAttribute('data-yt'), f=document.createElement('iframe');
      f.src='https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0&modestbranding=1&playsinline=1';
      f.title=a.getAttribute('aria-label')||'Customer story video';
      f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen=true;
      f.className='vc__frame';
      var box=document.createElement('div'); box.className='vc__media vc__media--on'; box.appendChild(f);
      a.replaceWith(box); f.focus();
    });
  });
})();

/* v14h: testimonials pager — arrows, dots, keyboard, mouse drag; native swipe / trackpad via scroll-snap */
(function(){
  var track=document.querySelector('.sg-track'); if(!track) return;
  var wrap=track.closest('.sgc'), dotsBox=wrap&&wrap.querySelector('.sg-dots');
  var prev=document.querySelector('.sg-prev'), next=document.querySelector('.sg-next');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function units(){ // snap targets: pages on desktop, cards below
    var pages=[].slice.call(track.querySelectorAll('.sgp'));
    if(pages.length&&getComputedStyle(pages[0]).display!=='contents') return pages;
    return [].slice.call(track.querySelectorAll('.sgp>.tc'));
  }
  function starts(){
    var u=units(); if(!u.length) return [0];
    var gap=parseFloat(getComputedStyle(track).columnGap)||0, w=u[0].getBoundingClientRect().width;
    var per=Math.max(1,Math.floor((track.clientWidth+gap+1)/(w+gap)));
    var max=track.scrollWidth-track.clientWidth, base=track.getBoundingClientRect().left-track.scrollLeft, out=[];
    for(var i=0;i<u.length;i+=per){ var x=Math.min(max,Math.round(u[i].getBoundingClientRect().left-base)); if(!out.length||x-out[out.length-1]>2) out.push(x); }
    return out;
  }
  var S=[0];
  function cur(){ var x=track.scrollLeft,b=0,d=1e9; S.forEach(function(s,i){var e=Math.abs(s-x); if(e<d){d=e;b=i;}}); return b; }
  function go(i){ i=Math.max(0,Math.min(S.length-1,i)); track.scrollTo({left:S[i],behavior:reduce?'auto':'smooth'}); }
  function build(){
    S=starts(); if(!dotsBox) return; dotsBox.innerHTML='';
    S.forEach(function(_,i){ var b=document.createElement('button'); b.type='button'; b.setAttribute('role','tab'); b.setAttribute('aria-label','Go to page '+(i+1)+' of '+S.length); b.addEventListener('click',function(){go(i);}); dotsBox.appendChild(b); });
    dotsBox.hidden=S.length<2; sync();
  }
  function sync(){
    var c=cur();
    if(dotsBox) [].forEach.call(dotsBox.children,function(b,i){ b.setAttribute('aria-selected',i===c?'true':'false'); b.tabIndex=i===c?0:-1; });
    if(prev) prev.disabled=track.scrollLeft<=2;
    if(next) next.disabled=track.scrollLeft>=track.scrollWidth-track.clientWidth-2;
  }
  var raf=0; track.addEventListener('scroll',function(){ if(!raf) raf=requestAnimationFrame(function(){raf=0;sync();}); },{passive:true});
  if(prev) prev.addEventListener('click',function(){go(cur()-1);});
  if(next) next.addEventListener('click',function(){go(cur()+1);});
  track.addEventListener('keydown',function(e){
    if(e.target!==track) return;
    if(e.key==='ArrowRight'){e.preventDefault();go(cur()+1);} else if(e.key==='ArrowLeft'){e.preventDefault();go(cur()-1);}
    else if(e.key==='Home'){e.preventDefault();go(0);} else if(e.key==='End'){e.preventDefault();go(S.length-1);}
  });
  // mouse drag (touch & trackpad use native scrolling)
  var down=false,moved=false,sx=0,sl=0;
  track.addEventListener('pointerdown',function(e){ if(e.pointerType!=='mouse'||e.button!==0) return; down=true;moved=false;sx=e.clientX;sl=track.scrollLeft; });
  window.addEventListener('pointermove',function(e){ if(!down) return; var dx=e.clientX-sx; if(!moved&&Math.abs(dx)>6){moved=true;track.classList.add('is-drag');} if(moved){track.scrollLeft=sl-dx;} });
  window.addEventListener('pointerup',function(){ if(!down) return; down=false; if(moved){ track.classList.remove('is-drag'); var x=track.scrollLeft, dir=x>sl?1:-1, c=cur(); if(Math.abs(S[c]-x)>2) c=Math.max(0,Math.min(S.length-1, dir>0?S.filter(function(s){return s<x+2;}).length: S.filter(function(s){return s<x-2;}).length-1)); go(Math.abs(x-sl)>40?c:cur()); } });
  track.addEventListener('click',function(e){ if(moved){e.preventDefault();e.stopPropagation();moved=false;} },true);
  track.addEventListener('dragstart',function(e){e.preventDefault();});
  var t; window.addEventListener('resize',function(){clearTimeout(t);t=setTimeout(build,150);});
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(build);
  window.addEventListener('load',build); build();
})();

/* v14m — footer "Our Office" tabs */
(function(){
  var box=document.querySelector('[data-office-tabs]'); if(!box) return;
  var tabs=[].slice.call(box.querySelectorAll('[role="tab"]'));
  function pick(t,focus){tabs.forEach(function(x){var on=x===t;x.classList.toggle('is-on',on);x.setAttribute('aria-selected',on?'true':'false');x.tabIndex=on?0:-1;document.getElementById(x.getAttribute('aria-controls')).hidden=!on;});if(focus)t.focus();}
  tabs.forEach(function(t,i){
    t.addEventListener('click',function(){pick(t);});
    t.addEventListener('keydown',function(e){var k=e.key,j=k==='ArrowRight'?i+1:k==='ArrowLeft'?i-1:k==='Home'?0:k==='End'?tabs.length-1:-9;if(j===-9)return;e.preventDefault();pick(tabs[(j+tabs.length)%tabs.length],true);});
  });
})();

/* TS-V2 JS START (v14s): story video cards open the real YouTube video in a lightbox */
(function(){
  var cards=document.querySelectorAll('.ts-v__a[data-yt]'); if(!cards.length) return;
  var lb=document.createElement('div'); lb.className='ts-lb'; lb.hidden=true; lb.setAttribute('role','dialog'); lb.setAttribute('aria-modal','true'); lb.setAttribute('aria-label','Customer story video');
  lb.innerHTML='<div class="ts-lb__box"><button class="ts-lb__x" type="button" aria-label="Close video">&times;</button></div>';
  document.body.appendChild(lb); var box=lb.firstChild, last=null;
  function close(){ var f=box.querySelector('iframe'); if(f) f.remove(); lb.hidden=true; document.documentElement.style.overflow=''; if(last) last.focus(); }
  cards.forEach(function(a){ a.addEventListener('click',function(e){
    if(e.metaKey||e.ctrlKey||e.shiftKey) return; e.preventDefault(); last=a;
    var f=document.createElement('iframe'); f.src='https://www.youtube-nocookie.com/embed/'+a.getAttribute('data-yt')+'?autoplay=1&rel=0&modestbranding=1&playsinline=1';
    f.title=a.getAttribute('aria-label')||'Customer story video'; f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen=true;
    box.appendChild(f); lb.hidden=false; document.documentElement.style.overflow='hidden'; lb.querySelector('.ts-lb__x').focus();
  }); });
  lb.addEventListener('click',function(e){ if(e.target===lb||e.target.classList.contains('ts-lb__x')) close(); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&!lb.hidden) close(); });
})();
(function(){
  var wrap=document.querySelector('.ts-wrap'); if(!wrap) return;
  var bs=document.querySelectorAll('.ts-toggle');
  function set(o){ wrap.classList.toggle('is-open',o); bs.forEach(function(b){ b.setAttribute('aria-expanded',o?'true':'false'); var l=b.querySelector('b'); if(l) l.textContent=o?'Lebih sedikit testimoni':'Lebih banyak testimoni'; }); }
  bs.forEach(function(b){ b.addEventListener('click',function(){ var o=!wrap.classList.contains('is-open'); set(o); if(!o){ var h=document.getElementById('stories'); if(h) h.scrollIntoView({block:'start',behavior:'smooth'}); } }); });
})();
/* TS-V2 JS END */
