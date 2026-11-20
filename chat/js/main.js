/* Cekat.AI — product landing page (Chat v1) — vanilla JS, no build.
   Modules: nav · reveal · players (hover/focus/in-view animations) · hero chat loop · count-up */
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

  /* ---------- HERO CHAT LOOP ----------
     Resting state = every bubble before the first typing indicator (3 bubbles),
     so the window is never empty. The loop continues the thread; older bubbles
     scroll off the top, then the window fades back to the resting state. */
  var chat = $('#hero-chat');
  if (chat) {
    var body = $('.hchat__body', chat);
    var steps = $$('[data-step]', chat);
    var firstTyping = steps.findIndex(function (s) { return s.hasAttribute('data-typing'); });
    var rest = function () {
      body.classList.add('is-rest');
      steps.forEach(function (s, k) { s.classList.toggle('on', k < firstTyping); });
    };
    rest();
    if (!reduce) {
      var i = firstTyping, t = null, visible = true;
      var gap = function (el) {
        if (el.hasAttribute('data-typing')) return 1300;
        return el.classList.contains('bubble--ai') ? 1900 : 900;
      };
      var tick = function () {
        t = null;
        if (!visible) return;
        if (i >= steps.length) {
          body.classList.add('is-fading');
          t = setTimeout(function () {
            rest(); i = firstTyping;
            body.classList.remove('is-fading');
            t = setTimeout(tick, 1600);
          }, 450);
          return;
        }
        body.classList.remove('is-rest');
        var prev = steps[i - 1];
        if (prev && prev.hasAttribute('data-typing')) prev.classList.remove('on');
        var cur = steps[i];
        cur.classList.add('on');
        // keep at most 5 visible items; older ones have scrolled out anyway
        var shown = steps.filter(function (s) { return s.classList.contains('on'); });
        if (shown.length > 5) shown[0].classList.remove('on');
        i++;
        t = setTimeout(tick, i >= steps.length ? 3600 : gap(cur));
      };
      t = setTimeout(tick, 1400);
      if (hasIO) {
        new IntersectionObserver(function (en) {
          visible = en[0].isIntersecting;
          if (visible && !t) t = setTimeout(tick, 600);
        }).observe(chat);
      }
    }
  }

  /* ---------- COUNT-UP ---------- */
  var counters = $$('[data-count]');
  if (!reduce && hasIO && counters.length) {
    counters.forEach(function (c) { c.textContent = '0'; });
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        cio.unobserve(en.target);
        var el = en.target, to = parseFloat(el.getAttribute('data-count')), dur = 1600, t0 = null;
        var step = function (ts) {
          if (!t0) t0 = ts;
          var k = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - k, 3);
          el.textContent = String(Math.round(to * e));
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  }
})();

/* rev24 — feature-flow connector: a dotted line weaving from one block's visual to the next.
   Drawn in SVG over #features .wrap (desktop only), revealed with scroll progress. */
(function () {
  var wrap = document.querySelector('#features > .wrap');
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

/* rev28 — hero: one shared timer for the illustration slides + dots (headline is static).
   Loops forever (i+1 mod n); pauses only while a mouse is over the hero visual/title or keyboard focus is inside;
   always resumes on leave, after a dot click, when the hero scrolls back into view and when the tab is shown again. */
(function () {
  var vis = document.querySelector('.hero__vis[data-hsync]');
  if (!vis) return;
  var hero = vis.closest('.hero') || vis;
  var title = null;
  var sl = [].slice.call(vis.querySelectorAll('.hv-s')), 
      dots = [].slice.call(vis.querySelectorAll('.hv-dots button'));
  var n = sl.length, i = 0, t = null, MS = 3000;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hover = false, kfocus = false, seen = true;
  function set(k, instant) {
    sl.forEach(function (s, j) { s.classList.toggle('is-on', j === k); });
    dots.forEach(function (d, j) { d.classList.toggle('on', j === k); d.setAttribute('aria-pressed', j === k ? 'true' : 'false'); });
    i = k;
    hero.setAttribute('data-slide', String(k));
  }
  function paused() { return hover || kfocus || !seen || document.hidden; }
  function tick() { if (!paused()) set((i + 1) % n); }
  function start() { clearInterval(t); if (!reduce) t = setInterval(tick, MS); }
  set(0, true);
  dots.forEach(function (d, j) {
    d.addEventListener('click', function () { if (j !== i) set(j); start(); });
    d.addEventListener('pointerup', function () { d.blur(); kfocus = false; });
  });
  if (reduce) return;
  [vis, title].forEach(function (el) {
    if (!el) return;
    el.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hover = true; });
    el.addEventListener('pointerleave', function () { if (hover) { hover = false; start(); } });
  });
  vis.addEventListener('focusin', function (e) { kfocus = !!(e.target.matches && e.target.matches(':focus-visible')); });
  vis.addEventListener('focusout', function () { kfocus = false; start(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { es.forEach(function (e) { var was = seen; seen = e.isIntersecting; if (seen && !was) start(); }); }, { threshold: 0.15 }).observe(vis);
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) start(); });
  window.cekatHero = { get: function () { return i; }, n: n, ms: MS };
  start();
})();
