/* Consult buttons go to the contact form. Trial buttons in the header go to
   app.cekat.ai/register. Both keep the current query string (utm, gclid,
   fbclid, ttclid, and anything else on the page).
   A click still reports oaiq("measure","lead_created") without waiting.
   GTM-5CWCQNBX loads the Cekat tracker; this file does not. */
(function () {
  var REGISTER = "https://app.cekat.ai/register";

  function query() {
    return location.search && location.search.charAt(0) === "?" ? location.search.slice(1) : "";
  }

  function withQuery(url) {
    var q = query();
    if (!q) return url;
    return url + (url.indexOf("?") === -1 ? "?" : "&") + q;
  }

  function contactPath() {
    var seg = (location.pathname.split("/")[1] || "").toLowerCase();
    if (seg === "en" || seg === "kr" || seg === "jp" || seg === "cn") return "/" + seg + "/contact-us";
    var lang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
    if (lang.indexOf("en") === 0) return "/en/contact-us";
    if (lang.indexOf("ja") === 0 || lang.indexOf("jp") === 0) return "/jp/contact-us";
    if (lang.indexOf("ko") === 0 || lang.indexOf("kr") === 0) return "/kr/contact-us";
    if (lang.indexOf("zh") === 0 || lang.indexOf("cn") === 0) return "/cn/contact-us";
    return "/hubungi-kami";
  }

  function consultUrl(a) {
    if (a && a.hasAttribute("data-wa-message")) return withQuery("https://cekat.ai/hubungi-kami");
    var p = contactPath();
    if (p.charAt(0) === "/") p = "https://cekat.ai" + p;
    return withQuery(p);
  }

  function lead() {
    try {
      if (typeof window.oaiq === "function") {
        window.oaiq("measure", "lead_created", { type: "customer_action" });
      }
    } catch (e) {}
  }

  function paintConsult(a) {
    a.setAttribute("data-track-lead", "");
    a.classList.add("consult-cta");
    a.removeAttribute("target");
    a.setAttribute("href", consultUrl(a));
    var icon = a.querySelector(".consult-cta__ic");
    if (icon) icon.parentNode.removeChild(icon);
  }

  function paintTrial(a) {
    a.classList.add("trial-cta");
    a.setAttribute("href", withQuery(REGISTER));
  }

  function plainClick(event) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    return true;
  }

  document.addEventListener("click", function (event) {
    var t = event.target;
    if (!t || !t.closest) return;
    var consult = t.closest("a.consult-cta, a[data-wa-message]");
    if (consult && plainClick(event)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      var url = consultUrl(consult);
      consult.setAttribute("href", url);
      lead();
      window.location.assign(url);
      return;
    }
    var trial = t.closest("a.trial-cta");
    if (trial && plainClick(event)) trial.setAttribute("href", withQuery(REGISTER));
  }, true);

  function boot() {
    var nodes = document.querySelectorAll("a.consult-cta, a[data-wa-message]");
    for (var i = 0; i < nodes.length; i++) paintConsult(nodes[i]);
    var trials = document.querySelectorAll("a.trial-cta");
    for (var j = 0; j < trials.length; j++) paintTrial(trials[j]);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
