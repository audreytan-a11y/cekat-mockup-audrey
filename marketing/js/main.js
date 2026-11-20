/* Cekat.AI — product landing page (Marketing v1) — vanilla JS, no build.
   Modules: nav · reveal · metric tiles · hero sync (mk5) · flow rail (mk2) · players (hover/focus/in-view animations) · count-up */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var isDesktop = function () { return window.matchMedia('(min-width: 1025px)').matches; };

  /* ---------- NAV ---------- */
  var nav = $('#nav');
  var onScroll = function () { nav.classList.toggle('is-scrolled', window.scrollY > 8); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var toggle = $('.nav__toggle');
  toggle.addEventListener('click', function () {
    var open = !nav.classList.contains('menu-open');
    nav.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('.nav__menu a').forEach(function (a) {
    a.addEventListener('click', function () { if (nav.classList.contains('menu-open')) toggle.click(); });
  });
  window.addEventListener('resize', function () {
    if (isDesktop() && nav.classList.contains('menu-open')) toggle.click();
  });

  /* dropdowns: click-only (same as homepage-v1) — no hover listeners anywhere */
  var dds = $$('.dd');
  function setOpen(dd, open) {
    dd.classList.toggle('is-open', open);
    $('.dd__trigger', dd).setAttribute('aria-expanded', String(open));
  }
  function closeAll(except) { dds.forEach(function (d) { if (d !== except) setOpen(d, false); }); }
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

  /* ---------- REVEAL ON SCROLL ---------- */
  var revealEls = $$('.rv');
  if (reduce || !hasIO) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); rio.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { rio.observe(el); });
  }


  /* ---------- HERO SCENES (mk2/mk4) — removed in mk5 ----------
     The 4-scene hero card (Connect · Compare · Watch · Teach Meta) and its watch-clip module live in
     ../backups/marketing-v1-pre-mk5-hero. Their CSS (.hs*, .hw*, .clip*) is left dormant in styles.css. */

  /* ---------- METRIC TILE (mk4 → mk5: every [data-metric] root) ----------
     CTR · Conversion · Sales tabs, clickable. Values match the All sources table (conversion = booked ÷ clicks).
     Sales are demo USD. Top source = --c1 (#1A56DB), others --c2 (#93B4F5).
     data-auto="0": no own cycling (the hero instance is driven by HERO SYNC); default: auto-cycle 3s, pause on hover. */
  var METRICS = [
    { v: ['2.25%', '4.00%', '2.60%', '6.00%'], n: [2.25, 4, 2.6, 6] },
    { v: ['2.0%', '1.9%', '1.3%', '2.4%'], n: [2.0, 1.9, 1.3, 2.4] },
    { v: ['$18,600', '$7,400', '$5,200', '$3,100'], n: [18600, 7400, 5200, 3100] }
  ];
  var SRC_NAMES = ['Paid Ads', 'Organic', 'Creators', 'Links'];
  $$('[data-metric]').forEach(function (root) {
    var tabs = $$('.mx__tab', root), bars = $$('.hbar', root), top = $('.mx__top b', root);
    var auto = root.getAttribute('data-auto') !== '0';
    var cur = 0, tm = null, hover = false;
    function set(m) {
      cur = m; var d = METRICS[m], max = Math.max.apply(null, d.n), ti = d.n.indexOf(max);
      bars.forEach(function (b, k) {
        $('i', b).style.setProperty('--w', (d.n[k] / max * 100).toFixed(1) + '%');
        $('b', b).textContent = d.v[k];
        b.classList.toggle('is-top', k === ti);
      });
      if (top) top.textContent = SRC_NAMES[ti];
      tabs.forEach(function (t, k) { t.classList.toggle('is-on', k === m); t.setAttribute('aria-pressed', String(k === m)); });
    }
    function loop() { clearTimeout(tm); if (!auto || reduce || hover) return; tm = setTimeout(function () { set((cur + 1) % 3); loop(); }, 3000); }
    tabs.forEach(function (t, k) { t.addEventListener('click', function () { set(k); loop(); }); });
    if (auto) {
      var card = root.closest('.usp-card') || root;
      card.addEventListener('mouseenter', function () { hover = true; clearTimeout(tm); });
      card.addEventListener('mouseleave', function () { hover = false; loop(); });
    }
    root.mxSet = set; // HERO SYNC resets the hero instance to CTR each time slide 2 comes in
    set(0); loop();
  });

  /* ---------- HERO SYNC (mk5) ----------
     Same pattern as homepage-v1 "[data-sync]" (v11): ONE shared timer (MS=3000) drives H1 line 2,
     the illustration slide and the dots. Loops forever. Pauses while the mouse is over the card or the
     headline, or keyboard focus is inside the card, and while the hero is out of view; resumes after.
     A dot click jumps and restarts the timer. Reduced motion: first pair static, dots still switch. */
  (function () {
    var vis = $('#hero-sync'), h1 = $('.hero__title'); if (!vis || !h1) return;
    var sl = $$('.hx__s', vis), dots = $$('.hx__dots button', vis), txt = $$('.hero__rot > span', h1);
    var hero = vis.closest('.hero') || vis, i = 0, t = null, MS = 3000;
    var hover = { card: false, h1: false }, kfocus = false, seen = true;
    if (sl.length < 2) return;
    function set(k, instant) {
      var prevS = sl[i], prevT = txt[i];
      sl.forEach(function (s, j) {
        s.classList.toggle('is-on', j === k);
        // decorative slides stay hidden from AT; the metric slide (real buttons) is exposed while shown
        s.setAttribute('aria-hidden', String(j !== k || !$('[data-metric]', s)));
      });
      txt.forEach(function (s, j) { s.classList.toggle('is-on', j === k); s.classList.remove('is-out'); });
      dots.forEach(function (d, j) { d.classList.toggle('on', j === k); d.setAttribute('aria-pressed', String(j === k)); });
      if (!instant && prevT && prevT !== txt[k]) { prevT.classList.add('is-out'); setTimeout(function () { prevT.classList.remove('is-out'); }, 400); }
      if (!instant && prevS && prevS !== sl[k]) { prevS.classList.add('is-leaving'); setTimeout(function () { prevS.classList.remove('is-leaving'); }, 450); }
      var mx = $('[data-metric]', sl[k]); if (mx && mx.mxSet) mx.mxSet(0);
      i = k;
      if (txt[k]) h1.setAttribute('aria-label', (h1.getAttribute('data-pre') || '') + txt[k].textContent);
    }
    function paused() { return hover.card || hover.h1 || kfocus || !seen || document.hidden; }
    function start() {
      clearInterval(t); t = null;
      if (reduce || paused()) return;
      t = setInterval(function () { if (!paused()) set((i + 1) % sl.length); }, MS);
    }
    set(0, true);
    dots.forEach(function (d, j) { d.addEventListener('click', function () { if (j !== i) set(j); start(); }); });
    if (reduce) return;
    [['card', vis], ['h1', h1]].forEach(function (p) {
      p[1].addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { hover[p[0]] = true; start(); } });
      p[1].addEventListener('pointerleave', function () { if (hover[p[0]]) { hover[p[0]] = false; start(); } });
    });
    vis.addEventListener('focusin', function (e) { kfocus = !!(e.target.matches && e.target.matches(':focus-visible')); start(); });
    vis.addEventListener('focusout', function () { kfocus = false; start(); });
    dots.forEach(function (d) { d.addEventListener('pointerup', function () { d.blur(); kfocus = false; start(); }); });
    if (hasIO) new IntersectionObserver(function (es) { es.forEach(function (e) { seen = e.isIntersecting; start(); }); }, { threshold: 0.15 }).observe(hero);
    document.addEventListener('visibilitychange', start);
    start();
  })();

  /* ---------- FLOW RAIL (mk2) ----------
     The thin line beside Unify · Analyze · Act fills with scroll; each step dot turns blue once reached. */
  (function () {
    var flow = $('#flow'); if (!flow) return;
    var grps = $$('.grp', flow), ticking = false;
    function upd() {
      ticking = false;
      var r = flow.getBoundingClientRect(), mark = window.innerHeight * 0.6;
      var p = Math.min(1, Math.max(0, (mark - r.top) / r.height));
      flow.style.setProperty('--p', p.toFixed(4));
      grps.forEach(function (g) { g.classList.toggle('is-reached', g.getBoundingClientRect().top < mark); });
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    window.addEventListener('resize', upd);
    upd();
  })();

  /* ---------- SCROLL CUE ---------- */
  (function(){
    var cue=document.querySelector('.scroll-cue'); if(!cue) return;
    var target=document.querySelector(cue.getAttribute('href'));
    function upd(){ cue.classList.toggle('is-hidden', window.scrollY>40); }
    window.addEventListener('scroll',upd,{passive:true}); upd();
    cue.addEventListener('click',function(e){
      if(!target) return; e.preventDefault();
      var navH=(document.querySelector('.nav')||{offsetHeight:0}).offsetHeight||0;
      var y=target.getBoundingClientRect().top+window.scrollY-navH+8;
      window.scrollTo({top:y,behavior:reduce?'auto':'smooth'});
    });
  })();

  /* ---------- PLAYERS ----------
     [data-player]            element that animates
     data-scenes="n"          number of .scene children to cycle (default 1)
     data-scene-ms / data-loop  ms per scene (multi) / ms before replaying (single)
     data-mode="state"        no .scene children: sets data-state="i" for CSS
     data-trigger="view"      play while in view (default: hover/focus; touch = in view)
  */
  function Player(el) {
    var scenes = $$('.scene', el);
    var n = parseInt(el.getAttribute('data-scenes') || '1', 10);
    var stateMode = el.getAttribute('data-mode') === 'state';
    var stepMs = parseInt(el.getAttribute(n > 1 ? 'data-scene-ms' : 'data-loop') || '5000', 10);
    var idx = 0, timer = null, active = false;
    var numEl = $('.scene-num', el);

    function show(i) {
      idx = i;
      el.setAttribute('data-scene', i);
      if (stateMode) el.setAttribute('data-state', i);
      scenes.forEach(function (s, k) {
        s.classList.toggle('is-on', k === i);
        if (k !== i) s.classList.remove('play');
      });
      if (numEl) numEl.textContent = String(i + 1);
      var target = scenes.length ? scenes[i] : el;
      target.classList.remove('play');
      void target.offsetWidth; // restart CSS animations
      target.classList.add('play');
    }
    function start() {
      if (active || reduce) return;
      active = true;
      el.classList.add('is-active');
      show(0);
      timer = setInterval(function () { show((idx + 1) % n); }, stepMs);
    }
    function stop() {
      if (!active) return;
      active = false;
      clearInterval(timer);
      el.classList.remove('is-active', 'play');
      scenes.forEach(function (s, k) { s.classList.remove('play'); s.classList.toggle('is-on', k === 0); });
      el.setAttribute('data-scene', 0);
      if (stateMode) el.setAttribute('data-state', 0);
      if (numEl) numEl.textContent = '1';
      idx = 0;
    }
    el.setAttribute('data-scene', 0);
    if (stateMode) el.setAttribute('data-state', 0);
    return { el: el, start: start, stop: stop };
  }

  var players = $$('[data-player]').map(Player);
  if (!reduce) {
    var viewPlayers = [];
    players.forEach(function (p) {
      var byView = p.el.getAttribute('data-trigger') === 'view' || !canHover;
      if (byView) { viewPlayers.push(p); }
      else {
        var hovered = false, focused = false;
        var sync = function () { (hovered || focused) ? p.start() : p.stop(); };
        p.el.addEventListener('mouseenter', function () { hovered = true; sync(); });
        p.el.addEventListener('mouseleave', function () { hovered = false; sync(); });
      }
      // keyboard focus always animates
      if (p.el.hasAttribute('tabindex')) {
        p.el.addEventListener('focus', function () { p.start(); });
        p.el.addEventListener('blur', function () { if (!p.el.matches(':hover')) p.stop(); });
      }
    });
    if (hasIO && viewPlayers.length) {
      var map = new Map();
      var pio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var p = map.get(en.target);
          if (en.isIntersecting) p.start(); else p.stop();
        });
      }, { threshold: 0.55 });
      viewPlayers.forEach(function (p) { map.set(p.el, p); pio.observe(p.el); });
    }
  }

  /* ---------- COUNT-UP ---------- */
  var counters = $$('[data-count]');
  if (!reduce && hasIO && counters.length) {
    var fmt = function (v, dec) { return v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
    counters.forEach(function (c) { c.textContent = fmt(0, parseInt(c.getAttribute('data-dec') || '0', 10)); });
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        var el = en.target, to = parseFloat(el.getAttribute('data-count')), dec = parseInt(el.getAttribute('data-dec') || '0', 10), dur = 1600, t0 = null;
        var step = function (ts) {
          if (!t0) t0 = ts;
          var k = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - k, 3);
          el.textContent = fmt(dec ? to * e : Math.round(to * e), dec);
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  }
})();

/* mk5 — feature-flow connector for #stories (ported from chat-v1 rev24): dotted line weaving
   from one block's stage to the next; SVG over #stories .wrap (desktop only), drawn with scroll progress. */
(function () {
  var wrap = document.querySelector('#stories > .wrap');
  if (!wrap) return;
  var NS = 'http://www.w3.org/2000/svg';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'flow');
  svg.setAttribute('aria-hidden', 'true');
  wrap.insertBefore(svg, wrap.firstChild);
  var segs = [], total = 0, forced = null;

  function layout() {
    var stages = [].slice.call(wrap.querySelectorAll('.feature-block__visual .stage'));
    var wr = wrap.getBoundingClientRect();
    svg.setAttribute('width', wr.width); svg.setAttribute('height', wr.height);
    svg.setAttribute('viewBox', '0 0 ' + wr.width + ' ' + wr.height);
    if (getComputedStyle(svg).display === 'none' || stages.length < 2) { segs = []; return; }
    var defs = '', body = '', dots = '';
    var ds = [];
    for (var i = 0; i < stages.length - 1; i++) {
      var a = stages[i].getBoundingClientRect(), b = stages[i + 1].getBoundingClientRect();
      var sx = a.left + a.width / 2 - wr.left, sy = a.bottom - wr.top;
      var ex = b.left + b.width / 2 - wr.left, ey = b.top - wr.top;
      var k = (ey - sy) * 0.75;
      var d = 'M' + sx + ' ' + sy + ' C' + sx + ' ' + (sy + k) + ' ' + ex + ' ' + (ey - k) + ' ' + ex + ' ' + ey;
      ds.push(d);
      defs += '<mask id="flowM' + i + '" maskUnits="userSpaceOnUse"><path class="flow__mask" d="' + d + '"/></mask>';
      body += '<path class="flow__line" d="' + d + '" mask="url(#flowM' + i + ')"/>';
      dots += '<circle cx="' + sx + '" cy="' + sy + '" r="4.5"/><circle cx="' + ex + '" cy="' + ey + '" r="4.5"/>';
    }
    svg.innerHTML = '<defs>' + defs + '</defs>' + body + '<g class="flow__nodes">' + dots + '</g>';
    segs = [].slice.call(svg.querySelectorAll('.flow__mask')).map(function (m) {
      var l = m.getTotalLength(); m.style.strokeDasharray = l + ' ' + l; return { el: m, len: l };
    });
    total = segs.reduce(function (t, s) { return t + s.len; }, 0);
    draw();
  }
  function draw() {
    if (!segs.length) return;
    var p;
    if (forced != null) p = forced;
    else if (reduce) p = 1;
    else {
      var r = wrap.getBoundingClientRect(), vh = window.innerHeight;
      p = Math.max(0, Math.min(1, ((vh * 0.62 - r.top) / r.height) * 1.08));
    }
    // each segment draws while the viewport travels its own stretch of the section
    var n = segs.length;
    segs.forEach(function (s, i) {
      var q = Math.max(0, Math.min(1, p * (n + 1) - (i + 0.5)));
      s.el.style.strokeDashoffset = (s.len * (1 - q)).toFixed(1);
    });
  }
  window.cekatFlow = { set: function (p) { forced = p; draw(); }, layout: layout };
  var raf = 0;
  window.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; draw(); }); }, { passive: true });
  window.addEventListener('resize', function () { clearTimeout(layout._t); layout._t = setTimeout(layout, 120); });
  window.addEventListener('load', layout);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  layout();
})();
