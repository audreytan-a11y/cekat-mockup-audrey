/* Language switcher.
   A compact globe button in the header, and a plain list inside the mobile menu.
   Sets cekat_lang before navigation so the choice beats geo on the next request.
   Rewrites links for the page the visitor is actually on. */
(function () {
  var COOKIE = "cekat_lang";
  var LANGS = [
    { id: "en", code: "EN", name: "English" },
    { id: "id", code: "ID", name: "Bahasa Indonesia" },
    { id: "ko", code: "KO", name: "한국어" },
    { id: "ja", code: "JA", name: "日本語" },
    { id: "zh", code: "ZH", name: "中文" },
  ];
  var PREFIX = { en: "", id: "/id", ko: "/kr", ja: "/jp", zh: "/cn" };
  var PAGES = ["", "/pricing", "/chat", "/crm", "/marketing"];
  var GLOBE =
    '<svg class="langtog__ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/><path fill="none" stroke="currentColor" stroke-width="1.7" d="M3 12h18M12 3c2.5 2.8 3.8 5.8 3.8 9s-1.3 6.2-3.8 9c-2.5-2.8-3.8-5.8-3.8-9S9.5 5.8 12 3z"/></svg>';
  var CHEV =
    '<svg class="langtog__chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CHECK =
    '<svg class="langtog__mark" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.2 6.4 11 12.5 4.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function currentLang(path) {
    if (path === "/id" || path.indexOf("/id/") === 0) return "id";
    if (path === "/kr" || path.indexOf("/kr/") === 0) return "ko";
    if (path === "/jp" || path.indexOf("/jp/") === 0) return "ja";
    if (path === "/cn" || path.indexOf("/cn/") === 0) return "zh";
    if (path === "/en" || path.indexOf("/en/") === 0) return "en";
    if (path === "/unlimited" || path.indexOf("/unlimited/") === 0) return "id";
    if (path === "/hubungi-kami") return "id";
    return "en";
  }

  function stripLocale(path) {
    var prefixes = ["/id", "/kr", "/jp", "/cn", "/en"];
    for (var i = 0; i < prefixes.length; i++) {
      var p = prefixes[i];
      if (path === p) return "/";
      if (path.indexOf(p + "/") === 0) return path.slice(p.length) || "/";
    }
    return path;
  }

  function hrefForLocal(lang, path) {
    var bare = stripLocale(path);
    if (bare.length > 1 && bare.charAt(bare.length - 1) === "/") bare = bare.slice(0, -1);
    if (
      bare === "/contact" ||
      bare === "/contact-us" ||
      bare === "/hubungi-kami" ||
      path === "/hubungi-kami" ||
      path === "/en/contact-us"
    ) {
      if (lang === "id") return "/hubungi-kami";
      if (lang === "en") return "/en/contact-us";
      if (lang === "ko") return "/kr/contact-us";
      if (lang === "ja") return "/jp/contact-us";
      return "/cn/contact-us";
    }
    if (bare === "/unlimited") {
      if (lang === "id") return "/unlimited";
      if (lang === "ko") return "/kr/unlimited";
      if (lang === "ja") return "/jp/unlimited";
      if (lang === "zh") return "/cn/unlimited";
      return "/en/unlimited";
    }
    var page = PAGES.indexOf(bare) !== -1 ? bare : "";
    var prefix = PREFIX[lang] || "";
    if (!page) return prefix || "/";
    return prefix + page;
  }

  
  function hrefFor(lang, path) {
    var out = hrefForLocal(lang, path);
    if (out && out.charAt(0) === "/") return "https://cekat.ai" + out;
    return out;
  }

  function setCookie(lang) {
    document.cookie =
      COOKIE + "=" + encodeURIComponent(lang) + "; Path=/; Max-Age=31536000; SameSite=Lax";
  }

  function byId(id) {
    for (var i = 0; i < LANGS.length; i++) if (LANGS[i].id === id) return LANGS[i];
    return LANGS[0];
  }

  function linkHtml(lang, path, active, search) {
    var current = lang.id === active ? ' aria-current="page"' : "";
    var mark = lang.id === active ? CHECK : '<span class="langtog__mark" aria-hidden="true"></span>';
    return (
      '<a href="' +
      hrefFor(lang.id, path) +
      search +
      '" data-lang="' +
      lang.id +
      '" role="menuitem"' +
      current +
      "><span>" +
      lang.name +
      "</span>" +
      mark +
      "</a>"
    );
  }

  function close(root) {
    var btn = root.querySelector(".langtog__btn");
    var menu = root.querySelector(".langtog__menu");
    root.classList.remove("is-open");
    if (btn) btn.setAttribute("aria-expanded", "false");
    if (menu) menu.hidden = true;
  }

  function open(root) {
    var nodes = document.querySelectorAll(".langtog.is-open");
    for (var i = 0; i < nodes.length; i++) if (nodes[i] !== root) close(nodes[i]);
    var btn = root.querySelector(".langtog__btn");
    var menu = root.querySelector(".langtog__menu");
    root.classList.add("is-open");
    if (btn) btn.setAttribute("aria-expanded", "true");
    if (menu) menu.hidden = false;
  }

  function render(root, index) {
    var path = location.pathname || "/";
    var search = location.search || "";
    var active = currentLang(path);
    var current = byId(active);
    var menuId = "lang-menu-" + index;
    var items = "";
    for (var i = 0; i < LANGS.length; i++) items += "<li>" + linkHtml(LANGS[i], path, active, search) + "</li>";
    root.innerHTML =
      '<button type="button" class="langtog__btn" aria-expanded="false" aria-haspopup="menu" aria-controls="' +
      menuId +
      '" aria-label="Language: ' +
      current.name +
      '">' +
      GLOBE +
      "<span>" +
      current.code +
      "</span>" +
      CHEV +
      "</button>" +
      '<ul class="langtog__menu" id="' +
      menuId +
      '" role="menu" hidden>' +
      items +
      "</ul>";

    var btn = root.querySelector(".langtog__btn");
    btn.addEventListener("click", function (event) {
      event.stopPropagation();
      if (root.classList.contains("is-open")) close(root);
      else open(root);
    });
    root.addEventListener("keydown", function (event) {
      var list = [].slice.call(root.querySelectorAll(".langtog__menu a"));
      if (!list.length) return;
      var key = event.key;
      if (key === "ArrowDown" || key === "ArrowUp" || key === "Home" || key === "End") {
        event.preventDefault();
        if (!root.classList.contains("is-open")) open(root);
        var at = list.indexOf(document.activeElement);
        var next = 0;
        if (key === "End") next = list.length - 1;
        else if (key === "ArrowDown") next = at < 0 ? 0 : (at + 1) % list.length;
        else if (key === "ArrowUp") next = at < 0 ? list.length - 1 : (at - 1 + list.length) % list.length;
        list[next].focus();
      } else if (key === "Escape" && root.classList.contains("is-open")) {
        event.preventDefault();
        close(root);
        btn.focus();
      }
    });
    root.addEventListener("focusout", function (event) {
      if (!root.contains(event.relatedTarget)) close(root);
    });
  }

  function mountMobile(path, active, search) {
    var menu = document.querySelector(".nav__menu");
    if (!menu || menu.querySelector(".langtog-m")) return;
    var box = document.createElement("div");
    box.className = "langtog-m";
    var links = "";
    for (var i = 0; i < LANGS.length; i++) {
      var lang = LANGS[i];
      var current = lang.id === active ? ' aria-current="page"' : "";
      links +=
        '<a href="' +
        hrefFor(lang.id, path) +
        search +
        '" data-lang="' +
        lang.id +
        '"' +
        current +
        ">" +
        lang.name +
        (lang.id === active ? CHECK : "") +
        "</a>";
    }
    box.innerHTML = '<p class="langtog-m__h">Language</p>' + links;
    menu.insertBefore(box, menu.firstChild);
  }

  function paint() {
    if (!document.getElementById("langtog-style")) {
      var style = document.createElement("style");
      style.id = "langtog-style";
      style.textContent =
        ".langtog{position:relative;display:inline-flex;align-items:center;flex:none;z-index:60}" +
        ".langtog__btn{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 10px 0 9px;border:1px solid #e4e7ec;border-radius:999px;background:#fff;color:#101828;font:700 12px/1 inherit;letter-spacing:.04em;cursor:pointer}" +
        ".langtog__btn:focus-visible{outline:2px solid #1352bf;outline-offset:2px}" +
        ".langtog__ico,.langtog__chev,.langtog__mark{width:16px;height:16px;flex:none;display:block}" +
        ".langtog.is-open .langtog__chev{transform:rotate(180deg)}" +
        ".langtog__menu{position:absolute;top:calc(100% + 8px);left:0;z-index:80;min-width:210px;margin:0;padding:6px;list-style:none;background:#fff;border:1px solid #e4e7ec;border-radius:14px;box-shadow:0 18px 40px -18px rgba(8,33,76,.35)}" +
        ".langtog__menu[hidden]{display:none!important}" +
        ".langtog__menu a{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 10px;border-radius:10px;color:#101828;text-decoration:none;font-weight:600;font-size:14px;letter-spacing:0}" +
        ".langtog__menu a[aria-current=page]{color:#1352bf}" +
        ".langtog-m{display:none}" +
        "@media (max-width:1024px){.langtog{margin-left:auto;margin-right:6px}.langtog__menu{left:auto;right:0}.langtog-m{display:block;padding:4px 4px 12px;margin:0 0 8px;border-bottom:1px solid #eef2f8}.langtog-m__h{margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#98a2b3}.langtog-m a{display:flex;align-items:center;justify-content:space-between;min-height:44px;color:#101828;font-weight:600;font-size:16px;text-decoration:none}.langtog-m a[aria-current=page]{color:#1352bf}}";
      document.head.appendChild(style);
    }
    var path = location.pathname || "/";
    var search = location.search || "";
    var active = currentLang(path);
    var nodes = document.querySelectorAll(".langtog");
    for (var i = 0; i < nodes.length; i++) render(nodes[i], i);
    mountMobile(path, active, search);
  }

  document.addEventListener(
    "click",
    function (event) {
      var t = event.target;
      var a = t && t.closest ? t.closest("[data-lang]") : null;
      if (a) setCookie(a.getAttribute("data-lang") || "");
      var open = document.querySelectorAll(".langtog.is-open");
      for (var i = 0; i < open.length; i++) {
        if (!open[i].contains(t)) close(open[i]);
      }
    },
    true
  );

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", paint);
  else paint();
})();
