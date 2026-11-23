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

})();
