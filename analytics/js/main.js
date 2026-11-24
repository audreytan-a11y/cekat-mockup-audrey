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

  /* products menu panels + rotation: see js/products-menu.js (s46) */

  /* generic rotating scenes (.rot) */
  function tickRot() {
    $$('.rot').forEach(function (r) {
      var mv = r.closest('.mv');
      if (mv) return; /* menu rotation lives in products-menu.js */
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
      var e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(Math.round(target * e));
      if (p < 1) requestAnimationFrame(frame); else if (done) done();
    }
    el.textContent = '0';
    requestAnimationFrame(frame);
  }
  var big = $('.big');
  if (big) {
    var num = $('.big__num', big), ind = $('.trust__ind b');
    var started = false;
    var start = function () {
      if (started) return; started = true;
      countUp(num, 3000, 1800, function () { big.classList.add('done'); });
      if (ind) countUp(ind, 15, 1600);
    };
    if (reduce) { big.classList.add('done'); }
    else {
      num.textContent = '0';
      if (ind) ind.textContent = '0';
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

  /* ---------- HERO (crm4) — homepage "[data-sync]" pattern ----------
     NOTE: the crm2 3-tab hero card (Kanban / List / Activity, #hero-scenes, .hs__dot step tabs,
     .vseg toggle, 3.5s timer) and its JS were removed in crm4.
     Now ONE shared timer drives H1 line 2 + illustration slide + dots (MS = 3000), looping forever.
     Pauses while a mouse is over the card or headline, or keyboard focus is inside; resumes on leave.
     Dot click jumps + restarts the timer. Paused while the hero is off-screen (IntersectionObserver).
     Reduced motion: first pair static, dots still switch. */
  (function () {
    var hero = $('#top'), vis = hero && $('.chv', hero), title = hero && $('.chero__title', hero);
    if (!vis || !title) return;
    var sl = $$('.wv-s', vis), dots = $$('.wv-dots button', vis),
        rotW = $('.pc-rot__w', title), txt = rotW ? $$(':scope > span', rotW) : [],
        i = 0, paused = false, t = null, MS = 3000;
    if (sl.length < 2) return;
    function set(k, instant) {
      var prevS = sl[i], prevT = txt[i];
      sl.forEach(function (s, j) { s.classList.toggle('is-on', j === k); });
      txt.forEach(function (s, j) { s.classList.toggle('is-on', j === k); s.classList.remove('is-out'); });
      dots.forEach(function (d, j) { d.classList.toggle('on', j === k); d.setAttribute('aria-pressed', j === k ? 'true' : 'false'); });
      if (!instant && prevS && prevS !== sl[k]) { prevS.classList.add('is-leaving'); setTimeout(function () { prevS.classList.remove('is-leaving'); }, 420); }
      if (!instant && prevT && prevT !== txt[k]) { prevT.classList.add('is-out'); setTimeout(function () { prevT.classList.remove('is-out'); }, 350); }
      i = k;
      if (txt[k]) title.setAttribute('aria-label', (title.getAttribute('data-pre') || '') + txt[k].textContent);
    }
    function tick() { if (!paused && !document.hidden) set((i + 1) % sl.length); }
    function start() { clearInterval(t); t = setInterval(tick, MS); }
    set(0, true);
    dots.forEach(function (d, j) { d.addEventListener('click', function () { if (j !== i) set(j); if (!reduce) start(); }); });
    if (reduce) return;
    var hover = 0, kfocus = false, seen = true;
    function upd() { var was = paused; paused = hover > 0 || kfocus || !seen; if (was && !paused) start(); }
    [vis, title].forEach(function (el) {
      el.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { hover++; upd(); } });
      el.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { hover = Math.max(0, hover - 1); upd(); } });
    });
    vis.addEventListener('focusin', function (e) { kfocus = !!(e.target.matches && e.target.matches(':focus-visible')); upd(); });
    vis.addEventListener('focusout', function () { kfocus = false; upd(); });
    dots.forEach(function (d) { d.addEventListener('pointerup', function () { d.blur(); kfocus = false; upd(); }); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { seen = e.isIntersecting; upd(); }); }, { threshold: 0.15 }).observe(hero);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) start(); });
    start();
  })();

  /* ---------- #capture loop: runs only while in view (default = every lead shown saved) ---------- */
  (function () {
    var sv = $('.sv'); if (!sv || reduce) return;
    whenVisible(sv, function () { sv.classList.add('is-run'); }, function () { sv.classList.remove('is-run'); });
  })();

  /* ---------- SCROLL CUE (hero → next section) ---------- */
  (function () {
    var cue = $('.scroll-cue'); if (!cue) return;
    var target = $(cue.getAttribute('href'));
    function upd() { cue.classList.toggle('is-hidden', window.scrollY > 40); }
    window.addEventListener('scroll', upd, { passive: true }); upd();
    cue.addEventListener('click', function (e) {
      if (!target) return; e.preventDefault();
      var navH = nav ? nav.offsetHeight : 0;
      var y = target.getBoundingClientRect().top + window.scrollY - navH + 8;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  })();


  /* ---------- crm8: feature cards animate only on hover (touch: while in view) ---------- */
  (function () {
    var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var cards = $$('.cbento .bt');
    if (!canHover && !reduce && 'IntersectionObserver' in window) {
      var pio = new IntersectionObserver(function (en) {
        en.forEach(function (e) { e.target.classList.toggle('is-play', e.isIntersecting); });
      }, { threshold: 0.55 });
      cards.forEach(function (c) { pio.observe(c); });
    }
    /* Customizable View: tabs + auto-alternate while hovered / in view */
    var kb = $('.bt--kb'); if (!kb) return;
    var stage = $('.bkb__stage', kb), tabs = $$('.bkb__tabs button', kb);
    var timer = null, userSet = false;
    function setView(v) {
      stage.setAttribute('data-view', v);
      tabs.forEach(function (t) { var on = t.dataset.view === v; t.classList.toggle('is-on', on); t.setAttribute('aria-selected', String(on)); });
    }
    function stop() { clearInterval(timer); timer = null; }
    function start() {
      if (reduce || timer || userSet) return;
      timer = setInterval(function () { setView(stage.getAttribute('data-view') === 'kanban' ? 'list' : 'kanban'); }, 3000);
    }
    function rest() { stop(); userSet = false; setView('kanban'); }
    tabs.forEach(function (t) {
      t.addEventListener('click', function () { userSet = true; stop(); setView(t.dataset.view); });
    });
    if (canHover) {
      kb.addEventListener('mouseenter', start);
      kb.addEventListener('mouseleave', rest);
    } else if (!reduce && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { if (en[0].isIntersecting) start(); else rest(); }, { threshold: 0.55 }).observe(kb);
    }
  })();

  /* ---------- crm8: story rows — play on a 3s loop while in view; dotted connector ---------- */
  (function () {
    var wrap = document.querySelector('#how > .wrap'); if (!wrap) return;
    var stages = $$('[data-fplay]', wrap);
    if (!reduce) document.documentElement.classList.add('js-fb');
    if (!reduce && 'IntersectionObserver' in window) {
      var timers = new Map();
      var replay = function (el) { el.classList.remove('is-fp'); void el.offsetWidth; el.classList.add('is-fp'); };
      var io2 = new IntersectionObserver(function (en) {
        en.forEach(function (e) {
          var el = e.target;
          if (e.isIntersecting) { if (timers.has(el)) return; replay(el); timers.set(el, 1); io2.unobserve(el); }
          else if (timers.has(el)) { clearInterval(timers.get(el)); timers.delete(el); }
        });
      }, { threshold: 0.55 });
      stages.forEach(function (s) { io2.observe(s); });
    }
    var NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'cflow'); svg.setAttribute('aria-hidden', 'true'); wrap.insertBefore(svg, wrap.firstChild);
    var segs = [];
    function cfPos(el) { var r = el.getBoundingClientRect(), w = wrap.getBoundingClientRect(), tx = 0, ty = 0, n = el;
      while (n && n !== wrap) { var t = getComputedStyle(n).transform; if (t && t !== 'none') { var m = t.match(/matrix\(([^)]+)\)/); if (m) { var v = m[1].split(','); tx += parseFloat(v[4]) || 0; ty += parseFloat(v[5]) || 0; } } n = n.parentElement; }
      return { x: r.left - w.left - tx, y: r.top - w.top - ty, w: r.width, h: r.height }; }
    function layout() {
      var wr = wrap.getBoundingClientRect();
      svg.setAttribute('width', wr.width); svg.setAttribute('height', wr.height); svg.setAttribute('viewBox', '0 0 ' + wr.width + ' ' + wr.height);
      if (getComputedStyle(svg).display === 'none' || stages.length < 2) { segs = []; return; }
      var defs = '', body = '', dots = '';
      for (var i = 0; i < stages.length - 1; i++) {
        var a = cfPos(stages[i]), b = cfPos(stages[i + 1]);
        var sx = a.x + a.w / 2, sy = a.y + a.h - 0.5, ex = b.x + b.w / 2, ey = b.y + 0.5, k = (ey - sy) * 0.75;
        var d = 'M' + sx + ' ' + sy + ' C' + sx + ' ' + (sy + k) + ' ' + ex + ' ' + (ey - k) + ' ' + ex + ' ' + ey;
        defs += '<mask id="cflowM' + i + '" maskUnits="userSpaceOnUse"><path class="cflow__mask" d="' + d + '"/></mask>';
        body += '<path class="cflow__line" d="' + d + '" mask="url(#cflowM' + i + ')"/>';
        dots += '<circle cx="' + sx + '" cy="' + sy + '" r="4.5"/><circle cx="' + ex + '" cy="' + ey + '" r="4.5"/>';
      }
      svg.innerHTML = '<defs>' + defs + '</defs>' + body + '<g class="cflow__nodes">' + dots + '</g>';
      segs = $$('.cflow__mask', svg).map(function (m) { var l = m.getTotalLength(); m.style.strokeDasharray = l + ' ' + l; return { el: m, len: l }; });
      draw();
    }
    function draw() {
      if (!segs.length) return;
      var p = 1;
      if (false) { var r = wrap.getBoundingClientRect(); p = Math.max(0, Math.min(1, ((window.innerHeight * 0.62 - r.top) / r.height) * 1.08)); }
      var n = segs.length;
      segs.forEach(function (s, i) { var q = Math.max(0, Math.min(1, p * (n + 1) - (i + 0.5))); s.el.style.strokeDashoffset = (s.len * (1 - q)).toFixed(1); });
    }
    var raf = 0;
    window.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; draw(); }); }, { passive: true });
    window.addEventListener('resize', function () { clearTimeout(layout._t); layout._t = setTimeout(layout, 120); });
    window.addEventListener('load', layout);
    if (window.ResizeObserver) { var ro = new ResizeObserver(function () { clearTimeout(layout._t2); layout._t2 = setTimeout(layout, 30); }); ro.observe(wrap); stages.forEach(function (s) { ro.observe(s); }); }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
    layout();
  })();
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
