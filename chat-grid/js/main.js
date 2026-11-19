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
