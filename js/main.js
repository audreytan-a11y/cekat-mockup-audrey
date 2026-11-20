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
    if (dd.classList.contains('dd--mega')) { megaCycle(open); if (open && typeof showPanel === 'function') showPanel('chat'); }
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

  /* ---------- mega menu panels ---------- */
  var items = $$('.mega__item');
  var panels = $$('.mv');
  function showPanel(key) {
    items.forEach(function (i) { i.classList.toggle('is-active', i.dataset.panel === key); });
    panels.forEach(function (p) { p.classList.toggle('is-active', p.dataset.panel === key); });
  }
  items.forEach(function (i) {
    i.addEventListener('mouseenter', function () { showPanel(i.dataset.panel); });
    i.addEventListener('focus', function () { showPanel(i.dataset.panel); });
  });

  /* mega-anchor: close menu when jumping to an on-page product card */
  $$('.dd a[href^="#"]').forEach(function (i) {
    i.addEventListener('click', function () { setTimeout(closeAll, 0); if (nav.classList.contains('menu-open')) toggle.click(); });
  });

  /* generic rotating scenes (.rot) */
  function tickRot() {
    $$('.rot').forEach(function (r) {
      var mv = r.closest('.mv');
      if (mv && !mv.classList.contains('is-active')) return;
      if (mv && !r.closest('.dd.is-open')) return;
      if (!mv && !r.dataset.vis) return;
      var ss = $$('.rot__s', r), i = ss.findIndex(function (x) { return x.classList.contains('is-on'); });
      var hold = +ss[i].dataset.hold || 1;
      r.__t = (r.__t || 0) + 1;
      if (r.__t < hold) return;
      r.__t = 0;
      ss[i].classList.remove('is-on');
      var nx = ss[(i + 1) % ss.length]; nx.classList.add('is-on');
      var stg = r.closest('.stage') || r.parentNode.querySelector('.chrow'); if (stg && nx.dataset.ch) stg.dataset.ch = nx.dataset.ch;
      $$('[data-seq]', nx).forEach(function (q) { if (q.__reset) q.__reset(); });
    });
  }
  if (!reduce) {
    $$('.rot').forEach(function (r) {
      if (r.closest('.mv')) return;
      if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { r.dataset.vis = en[0].isIntersecting ? '1' : ''; }).observe(r); else r.dataset.vis = '1';
    });
    setInterval(tickRot, 3000);
  }

  var cycleTimer = null;
  var scenes = $$('.mv__scenes .scene');
  var sceneDots = $$('.mv__dots i');
  var sceneIdx = 0;
  function megaCycle(on) {
    clearInterval(cycleTimer); cycleTimer = null;
    if (!on || reduce) return;
    cycleTimer = setInterval(function () {
      sceneIdx = (sceneIdx + 1) % scenes.length;
      scenes.forEach(function (s, i) { s.classList.toggle('is-active', i === sceneIdx); });
      sceneDots.forEach(function (d, i) { d.classList.toggle('is-active', i === sceneIdx); });
    }, 3000);
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
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
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
      countUp(num, 3000, 1600, function () { big.classList.add('done'); setTimeout(showChips, 200); });
      if (ind) countUp(ind, 15, 1400);
    };
    if (reduce) { big.classList.add('done'); chips.forEach(function (li) { li.classList.add('chip-in'); }); }
    else {
      num.textContent = '0';
      if (ind) ind.textContent = '0';
      big.classList.add('anim');
      chips.forEach(function (li) { li.classList.add('chip-pre'); });
    }
    whenVisible(big, start);
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
    var phrases = ['Greater flexibility.', 'Faster replies.', 'Happier customers.'];
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

/* sparse dots on hero net lines */
(function(){
  var net=document.querySelector('.hnet'); if(!net) return;
  var svg=net.querySelector('svg');
  // 4 dots on the left lines, 4 on the right (path id, position along path)
  var L=[[0,.3],[1,.62],[2,.2],[3,.44]], R=[[0,.52],[1,.26],[2,.58],[3,.24]];
  function place(){
    net.querySelectorAll('.hdot').forEach(function(d){d.remove();});
    var r=net.getBoundingClientRect(), vb=svg.viewBox.baseVal;
    var sx=r.width/vb.width, sy=r.height/vb.height;
    [L,R].forEach(function(list,side){
      list.forEach(function(s,i){
        var p=document.getElementById('np'+s[0]); if(!p) return;
        var pt=p.getPointAtLength(p.getTotalLength()*s[1]);
        var x = side ? vb.width-pt.x : pt.x;
        var d=document.createElement('span'); d.className='hdot';
        d.style.left=(x*sx)+'px'; d.style.top=(pt.y*sy)+'px';
        d.style.setProperty('--dl',(-(i*0.9+side*1.7))+'s');
        net.appendChild(d);
      });
    });
  }
  place(); window.addEventListener('resize',place);
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
        line=card.querySelector('.pc-rot'), i=0, paused=false, t=null, MS=3000;
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
      dots.forEach(function(d,j){d.classList.toggle('on',j===k);d.setAttribute('aria-pressed',j===k?'true':'false');});
      if(!instant && prevS && prevS!==sl[k]){prevS.classList.add('is-leaving');setTimeout(function(){prevS.classList.remove('is-leaving');},420);}
      if(!instant && prevT && prevT!==txt[k] && rotW){prevT.classList.add('is-out');setTimeout(function(){prevT.classList.remove('is-out');},350);}
      i=k;
      if(!instant && !reduce) countUp(sl[k]);
      if(line&&txt[k]) line.setAttribute('aria-label',(line.getAttribute('data-pre')||'')+txt[k].textContent);
    }
    function tick(){if(!paused&&!document.hidden) set((i+1)%sl.length);}
    function start(){clearInterval(t);t=setInterval(tick,MS);}
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
