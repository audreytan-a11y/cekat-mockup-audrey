/* ============================================================
   CEKAT UNLIMITED — edit this block. It is the only place
   the launch instant, eligibility, the client count, and the
   post-launch line are defined for the campaign.

   2026-12-01 00:00 WIB is when the offer STARTS. It is not an
   end date. Do not add an end date.

   Do not add a 3-month price, a switcher discount amount,
   an uptime percentage, an ISO claim, or a "bayar dobel" line.

   Pricing pages:
    - Pricing period discounts (5/10/20%) live in pricing.js, not here.
      Business, Enterprise, and Pro: 3-month commitment for Unlimited AI Credits.
      Starter is not included.
   ============================================================ */
(function () {
  var OFFER = {
    /* Launch instant. The countdown reaches zero here, then the offer is live. */
    starts: "2026-12-01T00:00:00+07:00",
    deadlineLabel: {
      id: "Mulai 1 Desember 2026",
      en: "Starts December 1, 2026",
      ko: "2026년 12월 1일 시작",
      ja: "2026年12月1日開始",
      zh: "2026年12月1日开始"
    },
    cdlabel: {
      id: "Dimulai dalam",
      en: "Launches in",
      ko: "시작까지",
      ja: "開始まで",
      zh: "距开始"
    },
    eligibility: {
      id: "minimal paket Business atau Pro 3 bulan",
      en: "Business or Pro for 3 months",
      ko: "Business 또는 Pro 3개월",
      ja: "BusinessまたはProは3か月",
      zh: "Business 或 Pro 均可 3 个月"
    },
    /* Badge on the pricing 3-month toggle. */
    priceBadge: {
      id: "Mulai 1 Desember 2026",
      en: "Starts December 1, 2026",
      ko: "2026년 12월 1일 시작",
      ja: "2026年12月1日開始",
      zh: "2026年12月1日开始"
    },
    /* Sentence under the pricing toggle. */
    priceBanner: {
      id: "Unlimited AI Credits: minimal paket Business atau Pro 3 bulan.",
      en: "Unlimited AI Credits: Business or Pro for 3 months.",
      ko: "Unlimited AI Credits: Business 또는 Pro 3개월.",
      ja: "Unlimited AI Credits: BusinessまたはProは3か月。",
      zh: "Unlimited AI Credits：Business 或 Pro 均可 3 个月。"
    },
    clients: "3.000+",
    /* Shown in place of the countdown once the launch instant has passed. */
    ended: {
      id: "Sudah berlaku",
      en: "Live now",
      ko: "지금 이용 가능",
      ja: "提供中",
      zh: "现已生效"
    }
  };
  window.CEKAT_UNLIMITED = OFFER;

  var lang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
  var L = "en";
  if (lang.indexOf("id") === 0) L = "id";
  else if (lang.indexOf("ko") === 0) L = "ko";
  else if (lang.indexOf("ja") === 0) L = "ja";
  else if (lang.indexOf("zh") === 0) L = "zh";

  function text(key) {
    var v = OFFER[key];
    if (v && typeof v === "object") return v[L] || v.en || "";
    return typeof v === "string" ? v : "";
  }

  document.querySelectorAll("[data-u]").forEach(function (el) {
    var key = el.getAttribute("data-u");
    /* Older markup says data-u="deadline". That string is the launch label. */
    if (key === "deadline") key = "deadlineLabel";
    var v = text(key);
    if (v) el.textContent = v;
  });

  var starts = Date.parse(OFFER.starts);
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function tick() {
    var boxes = document.querySelectorAll("[data-u-countdown]");
    if (!boxes.length || isNaN(starts)) return;
    var diff = starts - Date.now();
    var launchLabel = text("cdlabel");
    var liveLabel = text("ended");
    boxes.forEach(function (box) {
      var parent = box.parentNode;
      var over = parent && parent.querySelector("[data-u-ended]");
      var label = parent && parent.querySelector('[data-u="cdlabel"]');
      if (diff <= 0) {
        box.hidden = true;
        if (label) label.hidden = true;
        if (over) { over.hidden = false; over.textContent = liveLabel; }
        return;
      }
      box.setAttribute("aria-label", launchLabel);
      var s = Math.floor(diff / 1000);
      var d = Math.floor(s / 86400); s -= d * 86400;
      var h = Math.floor(s / 3600); s -= h * 3600;
      var m = Math.floor(s / 60); s -= m * 60;
      var map = { d: d, h: h, m: m, s: s };
      Object.keys(map).forEach(function (k) {
        var el = box.querySelector('[data-cd="' + k + '"]');
        if (el) el.textContent = pad(map[k]);
      });
    });
    if (diff > 0) setTimeout(tick, 1000);
  }
  tick();
})();
