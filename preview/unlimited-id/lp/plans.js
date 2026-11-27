/* Plan-duration toggle on /unlimited and /en/unlimited.
   Prices: deck monthly base minus the selected discount, rounded to the nearest Rp1,000. */
(function () {
  var DISCOUNT = { "3": 0.05, "6": 0.1, "12": 0.2 };
  var TERM = {
    en: { "3": "3-month subscription", "6": "6-month subscription", "12": "12-month subscription" },
    id: { "3": "Langganan 3 bulan", "6": "Langganan 6 bulan", "12": "Langganan 12 bulan" }
  };

  function roundRp(n) { return Math.round(n / 1000) * 1000; }
  function formatRp(n) { return "Rp" + n.toLocaleString("en-US"); }

  function langOf(root) {
    return (root.getAttribute("data-lang") || document.documentElement.lang || "en").slice(0, 2);
  }

  function select(months, root) {
    months = String(months);
    if (!DISCOUNT[months]) months = "3";
    root.querySelectorAll(".ul-bill__opt").forEach(function (btn) {
      var on = btn.getAttribute("data-term") === months;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var lang = langOf(root);
    var label = (TERM[lang] || TERM.en)[months];
    root.querySelectorAll(".ul-plan__term").forEach(function (el) { el.textContent = label; });
    var off = DISCOUNT[months];
    root.querySelectorAll("[data-monthly]").forEach(function (el) {
      var base = Number(el.getAttribute("data-monthly"));
      if (!isFinite(base)) return;
      var out = el.querySelector("[data-price]") || el;
      out.textContent = formatRp(roundRp(base * (1 - off)));
    });
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest(".ul-bill__opt");
    if (!btn) return;
    var root = btn.closest("#plans") || document.getElementById("plans");
    if (root) select(btn.getAttribute("data-term"), root);
  });
})();
