/* Important announcement pop-up (Unlimited AI Credits). Shows once after a short delay; dismissal remembered in localStorage. */
(function () {
  var KEY = 'cekat-uc-popup-dismissed-v1', DELAY = 300;
  var m = document.getElementById('ucPopup'); if (!m) return;
  var store = { get: function () { try { return localStorage.getItem(KEY); } catch (e) { return null; } },
                set: function () { try { localStorage.setItem(KEY, '1'); } catch (e) {} } };
  var force = /[?&]announcement=1\b/.test(location.search);
  if (store.get() && !force) return;
  var last = null;
  function open() {
    last = document.activeElement;
    m.hidden = false; document.documentElement.classList.add('ucp-lock');
    requestAnimationFrame(function () { requestAnimationFrame(function () { m.classList.add('is-open'); }); });
    m.querySelector('.ucp__card').focus({ preventScroll: true });
    document.addEventListener('keydown', onKey);
  }
  function close() {
    store.set(); m.classList.remove('is-open'); document.removeEventListener('keydown', onKey);
    document.documentElement.classList.remove('ucp-lock');
    setTimeout(function () { m.hidden = true; }, 260);
    if (last && last.focus) last.focus({ preventScroll: true });
  }
  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key === 'Tab') {
      var f = m.querySelectorAll('button, a[href]'), a = f[0], z = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  }
  m.addEventListener('click', function (e) { if (e.target.closest('[data-ucp-close]')) close(); });
  m.querySelector('.ucp__cta').addEventListener('click', store.set);
  setTimeout(open, DELAY);
})();
