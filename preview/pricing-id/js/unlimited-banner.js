/* Unlimited launch announcement. Dismissed state is localStorage "cekat-uab". */
(function () {
  try { if (localStorage.getItem("cekat-uab") === "1") return; } catch (e) {}
  if (document.getElementById("uab")) return;
  var lang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
  var copy = {
    id: { label: "Cekat Unlimited AI Credits - Mulai 1 Desember", href: "/cekat-mockup-audrey/preview/unlimited-id/", region: "Pengumuman", close: "Tutup pengumuman" },
    ko: { label: "Cekat Unlimited AI Credits - 12월 1일 시작", href: "/cekat-mockup-audrey/preview/unlimited/", region: "공지", close: "공지 닫기" },
    ja: { label: "Cekat Unlimited AI Credits - 12月1日開始", href: "/cekat-mockup-audrey/preview/unlimited/", region: "お知らせ", close: "お知らせを閉じる" },
    zh: { label: "Cekat Unlimited AI Credits - 12月1日开始", href: "/cekat-mockup-audrey/preview/unlimited/", region: "公告", close: "关闭公告" },
    en: { label: "Cekat Unlimited AI Credits - Starts December 1", href: "/cekat-mockup-audrey/preview/unlimited/", region: "Announcement", close: "Dismiss announcement" }
  };
  var key = "en";
  if (lang.indexOf("id") === 0) key = "id";
  else if (lang.indexOf("ko") === 0) key = "ko";
  else if (lang.indexOf("ja") === 0) key = "ja";
  else if (lang.indexOf("zh") === 0) key = "zh";
  var chosen = copy[key];
  var href = chosen.href;
  try {
    var q = new URLSearchParams(location.search);
    var extra = [];
    q.forEach(function (value, name) {
      if (name.indexOf("utm_") === 0 && value) extra.push(encodeURIComponent(name) + "=" + encodeURIComponent(value));
    });
    if (extra.length) href += (href.indexOf("?") === -1 ? "?" : "&") + extra.join("&");
  } catch (e2) {}

  document.documentElement.classList.add("uab-on");
  var bar = document.createElement("div");
  bar.id = "uab";
  bar.className = "uab";
  bar.setAttribute("role", "region");
  bar.setAttribute("aria-label", chosen.region);
  var link = document.createElement("a");
  link.className = "uab__a";
  link.href = href;
  link.textContent = chosen.label;
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "uab__x";
  btn.setAttribute("aria-label", chosen.close);
  btn.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15"/></svg>';
  bar.appendChild(link);
  bar.appendChild(btn);
  document.body.insertBefore(bar, document.body.firstChild);
  function fit() {
    var h = bar.offsetHeight;
    if (h) document.documentElement.style.setProperty("--uab-h", h + "px");
  }
  fit();
  window.addEventListener("resize", fit);
  btn.addEventListener("click", function () {
    try { localStorage.setItem("cekat-uab", "1"); } catch (e3) {}
    bar.remove();
    document.documentElement.classList.remove("uab-on");
    document.documentElement.style.removeProperty("--uab-h");
  });
})();
