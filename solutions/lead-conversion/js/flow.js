/* Cekat.AI — Lead conversion flow page. Vanilla JS: nav · reveal · hero rotation (3.0s) · looping stage illustrations · stepper */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var isDesktop = function () { return window.matchMedia('(min-width: 1025px)').matches; };

  /* ---------- NAV (same as chat-v1; dropdowns open on click only) ---------- */
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
  window.addEventListener('resize', function () { if (isDesktop() && nav.classList.contains('menu-open')) toggle.click(); });
  var dds = $$('.dd');
  function setOpen(dd, open) { dd.classList.toggle('is-open', open); $('.dd__trigger', dd).setAttribute('aria-expanded', String(open)); }
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
  document.addEventListener('click', function (e) { if (isDesktop() && !e.target.closest('.dd')) closeAll(); });

  /* ---------- REVEAL ON SCROLL ---------- */
  var revealEls = $$('.rv');
  if (reduce || !hasIO) {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); rio.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { rio.observe(el); });
  }

  /* ---------- HERO: 4 stages, 3.0s each, endless ---------- */
  (function () {
    var vis = $('.hero__vis[data-hsync]');
    if (!vis) return;
    var sl = $$('.hv-s', vis), dots = $$('.hv-dots button', vis);
    var n = sl.length, i = 0, t = null, MS = 3000;
    var hover = false, kfocus = false, seen = true;
    function set(k) {
      sl.forEach(function (s, j) { s.classList.toggle('is-on', j === k); });
      dots.forEach(function (d, j) { d.classList.toggle('on', j === k); d.setAttribute('aria-pressed', j === k ? 'true' : 'false'); });
      i = k;
    }
    function paused() { return hover || kfocus || !seen || document.hidden; }
    function tick() { if (!paused()) set((i + 1) % n); }
    function start() { clearInterval(t); if (!reduce) t = setInterval(tick, MS); }
    set(0);
    if (reduce) return; // reduced motion: stage 1 only, static
    dots.forEach(function (d, j) {
      d.addEventListener('click', function () { if (j !== i) set(j); start(); });
      d.addEventListener('pointerup', function () { d.blur(); kfocus = false; });
    });
    vis.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hover = true; });
    vis.addEventListener('pointerleave', function () { if (hover) { hover = false; start(); } });
    vis.addEventListener('focusin', function (e) { kfocus = !!(e.target.matches && e.target.matches(':focus-visible')); });
    vis.addEventListener('focusout', function () { kfocus = false; start(); });
    if (hasIO) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { var was = seen; seen = e.isIntersecting; if (seen && !was) { set(i); start(); } });
      }, { threshold: 0.15 }).observe(vis);
    }
    document.addEventListener('visibilitychange', function () { if (!document.hidden) start(); });
    window.cekatHero = { get: function () { return i; }, n: n, ms: MS };
    start();
  })();

  /* ---------- STAGE ILLUSTRATIONS: play when in view, loop, pause offscreen ---------- */
  $$('[data-pl]').forEach(function (pl) {
    var loop = parseInt(pl.getAttribute('data-loop'), 10) || 6000, timer = null, to = null, vis = false;
    function play() { pl.classList.remove('go', 'out'); void pl.offsetWidth; pl.classList.add('go'); }
    function cycle() {
      if (!vis || document.hidden) return;
      pl.classList.add('out');
      to = setTimeout(play, 450);
    }
    function start() { stop(); play(); if (!reduce) timer = setInterval(cycle, loop); }
    function stop() { clearInterval(timer); clearTimeout(to); }
    if (reduce || !hasIO) { pl.classList.add('go'); return; }
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var was = vis; vis = e.isIntersecting;
        if (vis && !was) start(); else if (!vis && was) stop();
      });
    }, { threshold: 0.35 }).observe(pl);
  });

  /* ---------- STEPPER: light up in sequence on scroll ---------- */
  (function () {
    var wrap = $('[data-steps]');
    if (!wrap) return;
    var steps = $$('.step', wrap), lit = -1, queue = Promise.resolve();
    function light(k) {
      steps[k].classList.add('is-lit');
      if (k > 0) steps[k - 1].classList.add('link-next');
      lit = Math.max(lit, k);
    }
    if (reduce || !hasIO) { steps.forEach(function (_, k) { light(k); }); return; }
    var queued = -1;
    function enqueue(k) {
      for (var j = queued + 1; j <= k; j++) {
        (function (j) { queue = queue.then(function () { return new Promise(function (r) { setTimeout(function () { light(j); r(); }, 520); }); }); })(j);
      }
      queued = Math.max(queued, k);
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { enqueue(steps.indexOf(e.target)); io.unobserve(e.target); } });
    }, { threshold: 0.55, rootMargin: '0px 0px -8% 0px' });
    steps.forEach(function (s) { io.observe(s); });
  })();
})();
