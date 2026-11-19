/* ==========================================================================
   Cekat.AI — product landing page (v2) · vanilla JS, no dependencies
   1. Nav            2. Reveal on scroll     3. Marquee
   4. Step player    (shared by .scene in the USP stage and every .anim)
   5. USP showcase   (list ↔ stage, autoplay, keyboard, mobile caption)
   6. Inline .anim   (hero chat + feature illustrations, play in view)
   7. Count-up
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var RM = reduce.matches;
  var hasIO = 'IntersectionObserver' in window;
  var START_DELAY = 900;
  var ALL = [];        // every Player, so capture mode can freeze them
  var CAPTURE = false; // true when the viewport is stretched to the whole page (full-page screenshot tools)
  function checkCapture() {
    var tall = window.innerHeight > 2400 && window.innerHeight >= document.documentElement.scrollHeight * 0.9;
    if (tall && !CAPTURE) {
      CAPTURE = true;
      document.documentElement.classList.add('is-capture');
      document.querySelectorAll('.rv').forEach(function (el) { el.classList.add('in'); });
      ALL.forEach(function (p) { p.stop(); });
      document.querySelectorAll('[data-count]').forEach(function (el) { el.textContent = el.getAttribute('data-count'); });
    }
  }
  window.addEventListener('resize', checkCapture);

  /* ---------- 1. Nav ---------- */
  var nav = document.getElementById('nav');
  var toggle = nav && nav.querySelector('.nav__toggle');
  var isMobileNav = function () { return window.matchMedia('(max-width:1024px)').matches; };

  function onScroll() { if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    nav.querySelectorAll('.nav__menu a').forEach(function (a) {
      a.addEventListener('click', function () {
        if (!nav.classList.contains('menu-open')) return;
        nav.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* dropdowns: click-only (same as homepage-v1); no hover listeners anywhere */
  var dds = Array.prototype.slice.call(document.querySelectorAll('.dd'));
  function setOpen(dd, open) {
    dd.classList.toggle('is-open', open);
    dd.querySelector('.dd__trigger').setAttribute('aria-expanded', String(open));
  }
  function closeAll(except) { dds.forEach(function (d) { if (d !== except) setOpen(d, false); }); }
  dds.forEach(function (dd) {
    dd.querySelector('.dd__trigger').addEventListener('click', function () {
      var isOpen = dd.classList.contains('is-open');
      if (!isMobileNav()) closeAll(dd);
      setOpen(dd, !isOpen);
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var open = document.querySelector('.dd.is-open');
    if (open) { setOpen(open, false); open.querySelector('.dd__trigger').focus(); }
    else if (nav && nav.classList.contains('menu-open') && toggle) toggle.click();
  });
  document.addEventListener('click', function (e) {
    if (!isMobileNav() && !e.target.closest('.dd')) closeAll();
  });

  /* ---------- 2. Reveal on scroll ---------- */
  var rvs = document.querySelectorAll('.rv');
  if (hasIO && !RM) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); rio.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    rvs.forEach(function (el) { rio.observe(el); });
  } else {
    rvs.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- 3. Marquee: duplicate list for a seamless loop ---------- */
  document.querySelectorAll('.marquee__track').forEach(function (track) {
    var list = track.querySelector('.marquee__list');
    if (!list) return;
    var clone = list.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('img').forEach(function (img) { img.alt = ''; });
    track.appendChild(clone);
  });

  /* ---------- 4. Step player ----------
     root: a .scene or .anim element. Children with:
       data-step="n"  → hidden until step n (gets .on)
       data-act="n"   → state change at step n (gets .on, never hidden)
       data-until="n" → gets .off at step n (e.g. typing dots)
     Optional direct .frame children alternate (each frame runs its own steps).
     Options on root: data-gap (ms between steps, default 850), data-hold (ms after last step). */
  function Player(root, opts) {
    opts = opts || {};
    var self = this;
    this.root = root;
    this.frames = Array.prototype.slice.call(root.querySelectorAll(':scope > .frame'));
    this.multi = this.frames.length > 1;
    if (!this.frames.length) this.frames = [root];
    this.gap = +root.getAttribute('data-gap') || 850;
    this.hold = +root.getAttribute('data-hold') || 2400;
    this.loop = opts.loop === 'multi' ? this.multi : opts.loop !== false;
    this.onFrame = opts.onFrame || function () {};
    this.timers = [];
    this.idx = 0;
    ALL.push(this);
    this.frameInfo = this.frames.map(function (f) {
      var els = Array.prototype.slice.call(f.querySelectorAll('[data-step],[data-act],[data-until]'));
      var max = 0;
      els.forEach(function (el) {
        ['data-step', 'data-act', 'data-until'].forEach(function (a) {
          var v = +el.getAttribute(a); if (v > max) max = v;
        });
      });
      return { el: f, els: els, max: max, dur: Math.max(0, max - 1) * self.gap + self.hold };
    });
    // Resting state = finished conversation. Animation only replays while visible.
    this.finish();
  }
  Player.prototype.finish = function () {
    var self = this;
    this.frameInfo.forEach(function (fi) {
      fi.els.forEach(function (el) { el.classList.remove('on', 'off'); });
      for (var s = 1; s <= fi.max; s++) self.apply(fi, s, true);
    });
  };
  Player.prototype.cycle = function () {
    return this.frameInfo.reduce(function (s, f) { return s + f.dur; }, 0);
  };
  Player.prototype.clear = function () { this.timers.forEach(clearTimeout); this.timers = []; };
  Player.prototype.later = function (fn, ms) { this.timers.push(setTimeout(fn, ms)); };
  Player.prototype.reset = function (fi) {
    fi.els.forEach(function (el) { el.classList.remove('on', 'off'); });
    fi.el.querySelectorAll('[data-alloc-to]').forEach(function (bar) { setAlloc(bar, +bar.getAttribute('data-alloc-from') || 50, false); });
  };
  Player.prototype.apply = function (fi, n, instant) {
    fi.els.forEach(function (el) {
      if (+el.getAttribute('data-step') === n || +el.getAttribute('data-act') === n) {
        el.classList.add('on');
        if (el.hasAttribute('data-alloc-to')) setAlloc(el, +el.getAttribute('data-alloc-to'), !instant);
      }
      if (+el.getAttribute('data-until') === n) el.classList.add('off');
    });
  };
  Player.prototype.showFrame = function (i) {
    var self = this;
    this.frameInfo.forEach(function (fi, k) {
      if (!self.multi) return;
      var was = fi.el.classList.contains('is-active');
      fi.el.classList.toggle('is-active', k === i);
      if (was && k !== i) {
        fi.el.classList.add('is-leaving');
        setTimeout(function () { fi.el.classList.remove('is-leaving'); }, 600);
      }
    });
    this.idx = i;
    this.onFrame(i);
  };
  Player.prototype.play = function (i) {
    var self = this;
    this.clear();
    i = i || 0;
    var fi = this.frameInfo[i];
    this.showFrame(i);
    if (RM || CAPTURE) { this.finish(); return; }
    this.root.classList.add('is-playing');
    this.reset(fi);
    this.apply(fi, 1);                   // first beat shows at once: a card is never empty
    for (var n = 2; n <= fi.max; n++) {
      (function (n) { self.later(function () { self.apply(fi, n); }, (n - 1) * self.gap); })(n);
    }
    this.later(function () {
      var next = i + 1;
      if (next >= self.frameInfo.length) {
        if (!self.loop) { self.root.classList.remove('is-playing'); return; }
        next = 0;
        if (!self.multi) {               // single frame: soft fade, then replay
          self.root.classList.add('is-fading');
          self.later(function () { self.root.classList.remove('is-fading'); self.play(0); }, 500);
          return;
        }
      }
      self.play(next);
    }, fi.dur);
  };
  Player.prototype.stop = function () {
    this.clear();
    this.root.classList.remove('is-playing', 'is-fading');
    this.finish();                       // never leave a half-built (empty) scene behind
  };

  function setAlloc(bar, to, animate) {
    var box = bar.closest('.alloc') || bar.parentNode;
    var ai = box.querySelector('.js-alloc-ai');
    var hu = box.querySelector('.js-alloc-hu');
    var parts = bar.querySelectorAll('.alloc__ai,.alloc__knob');
    if (!animate || RM) {
      parts.forEach(function (p) { p.style.transition = 'none'; });
      bar.style.setProperty('--p', to + '%');
      if (ai) ai.textContent = to; if (hu) hu.textContent = 100 - to;
      void bar.offsetWidth;
      parts.forEach(function (p) { p.style.transition = ''; });
      return;
    }
    var from = parseFloat(bar.style.getPropertyValue('--p')) || 50;
    bar.style.setProperty('--p', to + '%');
    tween(from, to, 1600, function (v) {
      v = Math.round(v);
      if (ai) ai.textContent = v; if (hu) hu.textContent = 100 - v;
    });
  }

  function tween(from, to, ms, cb) {
    var t0 = null;
    function f(t) {
      if (CAPTURE) { cb(to); return; }
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / ms);
      var e = 1 - Math.pow(1 - p, 3);
      cb(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(f);
    }
    requestAnimationFrame(f);
  }

  /* ---------- 5. USP showcase ---------- */
  document.querySelectorAll('.usp-showcase').forEach(function (sec) {
    var list = sec.querySelector('.usp-list');
    var items = Array.prototype.slice.call(sec.querySelectorAll('.usp-item'));
    var stage = sec.querySelector('.usp-stage');
    var dotsBox = sec.querySelector('.usp-stage__dots');
    var caption = sec.querySelector('.usp-caption');
    var players = {};
    var current = -1, timer = null, startedAt = 0, dwell = 0, remaining = 0;
    var inView = false, interacted = false, hovering = false;
    var MIN_DWELL = 5200, startT;

    sec.querySelectorAll('.scene').forEach(function (sc) {
      var id = sc.getAttribute('data-scene');
      players[id] = new Player(sc, { loop: 'multi', onFrame: function (i) { updateDots(id, i); } });
    });

    function updateDots(id, i) {
      if (items[current] && items[current].getAttribute('data-scene') !== id) return;
      var btns = dotsBox.querySelectorAll('button');
      btns.forEach(function (b, k) { b.classList.toggle('is-on', k === i); });
    }
    function buildDots(id) {
      var p = players[id];
      dotsBox.innerHTML = '';
      if (!p.multi) { dotsBox.setAttribute('aria-hidden', 'true'); return; }
      p.frames.forEach(function (f, k) {
        var b = document.createElement('button');
        b.type = 'button';
        b.tabIndex = -1;
        b.innerHTML = '<i></i>' + (f.getAttribute('data-label') || 'Part ' + (k + 1));
        b.addEventListener('click', function () { stopAuto(); p.play(k); });
        dotsBox.appendChild(b);
      });
      dotsBox.removeAttribute('aria-hidden');
    }

    function activate(i, opts) {
      opts = opts || {};
      if (i === current && !opts.force) return;
      var prev = items[current];
      if (prev) players[prev.getAttribute('data-scene')].stop();
      current = i;
      items.forEach(function (it, k) {
        var on = k === i;
        it.classList.toggle('is-active', on);
        it.classList.remove('is-timing');
        it.setAttribute('aria-selected', String(on));
        it.tabIndex = on ? 0 : -1;
        var sc = document.getElementById(it.getAttribute('aria-controls'));
        if (sc) { sc.classList.toggle('is-active', on); sc.setAttribute('aria-hidden', String(!on)); }
      });
      var id = items[i].getAttribute('data-scene');
      buildDots(id);
      if (inView || opts.force) players[id].play(0);
      if (caption) {
        var t = items[i].querySelector('b'), d = items[i].querySelector('small');
        caption.innerHTML = '<b>' + t.innerHTML + '</b>' + d.innerHTML;
      }
      centerChip(items[i]);
      schedule();
    }

    function centerChip(it) {
      if (list.scrollWidth <= list.clientWidth + 2) return;
      var left = it.offsetLeft - (list.clientWidth - it.offsetWidth) / 2;
      list.scrollTo({ left: Math.max(0, left), behavior: RM ? 'auto' : 'smooth' });
    }

    function schedule() {
      clearTimeout(timer);
      if (interacted || RM || !inView) return;
      var it = items[current];
      dwell = Math.max(MIN_DWELL, players[it.getAttribute('data-scene')].cycle());
      remaining = dwell;
      it.style.setProperty('--dur', dwell + 'ms');
      it.classList.remove('is-timing');
      void it.offsetWidth;
      it.classList.add('is-timing');
      if (!hovering) run();
    }
    function run() {
      startedAt = Date.now();
      timer = setTimeout(function () { activate((current + 1) % items.length); }, remaining);
    }
    function pause() {
      if (interacted || RM) return;
      sec.classList.add('is-paused');
      clearTimeout(timer);
      remaining = Math.max(400, remaining - (Date.now() - startedAt));
    }
    function resume() {
      sec.classList.remove('is-paused');
      if (interacted || RM || !inView) return;
      run();
    }
    function stopAuto() {
      interacted = true;
      clearTimeout(timer);
      sec.classList.remove('is-paused');
      items.forEach(function (it) { it.classList.remove('is-timing'); });
    }

    // hovering only counts as intent when the page isn't scrolling under a resting cursor
    var lastScroll = 0, lastX = -1, lastY = -1;
    window.addEventListener('scroll', function () { lastScroll = Date.now(); }, { passive: true });
    document.addEventListener('mousemove', function (e) { lastX = e.clientX; lastY = e.clientY; }, { passive: true });
    items.forEach(function (it, i) {
      var hoverT;
      it.addEventListener('click', function () { stopAuto(); activate(i); });
      it.addEventListener('mouseenter', function (e) {
        if (window.matchMedia('(hover: none)').matches || isMobileNav()) return;
        // synthetic hover after a scroll: pointer hasn't moved
        var still = e.clientX === lastX && e.clientY === lastY;
        if (still || Date.now() - lastScroll < 300) return;
        hoverT = setTimeout(function () { stopAuto(); activate(i); }, 140);
      });
      it.addEventListener('mouseleave', function () { clearTimeout(hoverT); });
      it.addEventListener('keydown', function (e) {
        var k = e.key, n = null;
        if (k === 'ArrowDown' || k === 'ArrowRight') n = (i + 1) % items.length;
        else if (k === 'ArrowUp' || k === 'ArrowLeft') n = (i - 1 + items.length) % items.length;
        else if (k === 'Home') n = 0;
        else if (k === 'End') n = items.length - 1;
        if (n === null) return;
        e.preventDefault();
        stopAuto();
        activate(n);
        items[n].focus();
      });
    });

    // gentle mouse parallax on the stage (desktop, motion allowed)
    if (!RM && window.matchMedia('(hover: hover)').matches) {
      var raf = 0;
      stage.addEventListener('mousemove', function (e) {
        if (raf) return;
        raf = requestAnimationFrame(function () {
          raf = 0;
          var r = stage.getBoundingClientRect();
          stage.style.setProperty('--px', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
          stage.style.setProperty('--py', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
        });
      });
      stage.addEventListener('mouseleave', function () { stage.style.setProperty('--px', 0); stage.style.setProperty('--py', 0); });
    }

    var grid = sec.querySelector('.usp-showcase__grid');
    grid.addEventListener('mouseenter', function () { hovering = true; pause(); });
    grid.addEventListener('mouseleave', function () { hovering = false; resume(); });
    stage.addEventListener('focusin', pause);

    activate(0, { force: true });
    players[items[0].getAttribute('data-scene')].stop();

    if (hasIO) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var was = inView;
          inView = en.isIntersecting;
          var p = players[items[current].getAttribute('data-scene')];
          if (inView && !was) {
            clearTimeout(startT);
            startT = setTimeout(function () { if (inView) { players[items[current].getAttribute('data-scene')].play(0); schedule(); } }, START_DELAY);
          }
          if (!inView && was) { clearTimeout(startT); p.stop(); clearTimeout(timer); items[current].classList.remove('is-timing'); }
        });
      }, { threshold: 0.3 }).observe(stage);
    } else {
      inView = true; activate(0, { force: true });
    }
  });

  /* ---------- 6. Inline animations (.anim): play while in view ---------- */
  document.querySelectorAll('.anim').forEach(function (el) {
    var p = new Player(el, { loop: el.hasAttribute('data-loop') });
    if (!hasIO) { p.play(0); return; }
    var playing = false, wait;
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        // finished state first; replay only after it has been on screen for a moment
        if (en.isIntersecting && !playing) { playing = true; wait = setTimeout(function () { p.play(0); }, +el.getAttribute('data-start') || START_DELAY); }
        else if (!en.isIntersecting && playing) { playing = false; clearTimeout(wait); p.stop(); }
      });
    }, { threshold: 0.35 }).observe(el);
  });

  /* ---------- 7. Count-up ---------- */
  var counters = document.querySelectorAll('[data-count]');
  function countUp(el) {
    var to = +el.getAttribute('data-count');
    if (RM) { el.textContent = to; return; }
    tween(0, to, 1600, function (v) { el.textContent = Math.round(v); });
  }
  if (hasIO) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { countUp(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { if (!RM) el.textContent = '0'; cio.observe(el); });
  }
})();
