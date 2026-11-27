/* Cekat products menu (v14) — self-contained behaviour for the "Products" mega dropdown.
   Needs: the <li class="dd dd--mega"> markup block + css/products-menu.css.
   Opening/closing is done by the site nav (it toggles .is-open on .dd--mega, click only);
   this file handles: panel switching on hover/focus, one 3s rotation per panel while open,
   and the Top paid ads phone videos in the Marketing panel. */
(function () {
  var root = document.querySelector('.dd--mega'); if (!root) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = [].slice.call(root.querySelectorAll('.mega__item'));
  var views = [].slice.call(root.querySelectorAll('.mv'));
  var cur = null, timer = null, MS = 3000;

  function isOpen() { return root.classList.contains('is-open'); }
  function rotOf(v) { return v && v.querySelector('.rot'); }
  function slides(r) { return [].slice.call(r.querySelectorAll(':scope > .rot__s')); }

  /* ---- Top paid ads phone: ad 1 poster -> play -> ad 2 poster -> play ---- */
  var vt = [], vbox = null;
  function vclear() { vt.forEach(clearTimeout); vt = []; }
  function vstop() {
    vclear();
    root.querySelectorAll('.pc-ads').forEach(function (b) {
      b.classList.remove('is-playing'); b.setAttribute('data-ad', '0');
      b.querySelectorAll('video').forEach(function (v) { try { v.pause(); v.currentTime = 0; } catch (e) {} v.onended = null; });
    });
    vbox = null;
  }
  function vstart(box) {
    vstop(); if (reduce) return; vbox = box;
    var vids = [].slice.call(box.querySelectorAll('video'));
    vids.forEach(function (v) { v.muted = true; if (v.preload !== 'auto') { v.preload = 'auto'; try { v.load(); } catch (e) {} } });
    function show(k) {
      if (vbox !== box) return;
      vclear(); box.classList.remove('is-playing'); box.setAttribute('data-ad', String(k));
      var v = vids[k]; try { v.currentTime = 0; } catch (e) {}
      vt.push(setTimeout(function () {
        if (vbox !== box) return;
        box.classList.add('is-playing');
        var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
        var done = false;
        function next() { if (done || vbox !== box) return; done = true; v.onended = null;
          if (k + 1 < vids.length) show(k + 1); else vt.push(setTimeout(function () { show(0); }, 1000)); }
        v.onended = next;
        vt.push(setTimeout(next, ((v.duration && isFinite(v.duration)) ? v.duration : 4.1) * 1000 + 1500));
      }, 600));
    }
    show(0);
  }

  function onSlide(s) {
    var box = s && s.querySelector('.pc-ads');
    if (box && isOpen()) vstart(box); else vstop();
  }
  function reset(v) {
    var r = rotOf(v); if (!r) { vstop(); return; }
    var ss = slides(r); ss.forEach(function (s, i) { s.classList.toggle('is-on', i === 0); });
    onSlide(ss[0]);
  }
  function schedule() {
    clearTimeout(timer); timer = null;
    if (reduce || !isOpen() || !cur) return;
    var r = rotOf(cur); if (!r) return;
    var ss = slides(r); if (ss.length < 2) return;
    var i = ss.findIndex(function (x) { return x.classList.contains('is-on'); }); if (i < 0) i = 0;
    timer = setTimeout(function () {
      ss[i].classList.remove('is-on');
      var nx = ss[(i + 1) % ss.length]; nx.classList.add('is-on');
      onSlide(nx); schedule();
    }, +(ss[i].getAttribute('data-ms') || MS));
  }
  function show(key) {
    var v = views.filter(function (x) { return x.dataset.panel === key; })[0]; if (!v) return;
    items.forEach(function (i) { i.classList.toggle('is-active', i.dataset.panel === key); });
    views.forEach(function (x) { x.classList.toggle('is-active', x === v); });
    if (v !== cur) { cur = v; reset(v); schedule(); }
  }
  items.forEach(function (i) {
    i.addEventListener('mouseenter', function () { show(i.dataset.panel); });
    i.addEventListener('focus', function () { show(i.dataset.panel); });
  });
  new MutationObserver(function () {
    if (isOpen()) { cur = null; show('chat'); }
    else { clearTimeout(timer); timer = null; vstop(); }
  }).observe(root, { attributes: true, attributeFilter: ['class'] });
  document.addEventListener('visibilitychange', function () { if (document.hidden) { clearTimeout(timer); vstop(); } else if (isOpen() && cur) { reset(cur); schedule(); } });
  cur = views.filter(function (x) { return x.classList.contains('is-active'); })[0] || null;
})();
