/* Console pack — pack.js. Three behaviours, all driven by data attributes:
   1. views   [data-views] > [data-view-tabs] > [data-view-tab="id"]  +  [data-view="id" data-label="…"]
   2. dates   [data-since="YYYY-MM-DD"] fills a day count; [data-next] list of [data-date] marks the next one
   3. stepper [data-stepper data-price="12" data-currency="$"] > input, [data-step="-1|1"], [data-total]
   Without JS every view shows, every date shows, the number input still works. No network, no libraries. */
(function () {
  "use strict";
  var d = document;
  d.documentElement.classList.add("js");
  var DAY = 86400000;
  function today() { var n = new Date(); return Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()); }
  function parse(s) { var p = String(s || "").split("-").map(Number); return p.length === 3 ? Date.UTC(p[0], p[1] - 1, p[2]) : NaN; }

  /* 1. views */
  var uid = 0;
  d.querySelectorAll("[data-views]").forEach(function (box) {
    var list = box.querySelector("[data-view-tabs]");
    var tabs = Array.prototype.slice.call(box.querySelectorAll("[data-view-tab]"));
    var panes = Array.prototype.slice.call(box.querySelectorAll("[data-view]"));
    if (!list || !tabs.length) return;
    list.setAttribute("role", "tablist");
    tabs.forEach(function (t) {
      var id = t.getAttribute("data-view-tab");
      var p = box.querySelector('[data-view="' + id + '"]');
      uid++;
      t.id = t.id || "vt" + uid;
      t.setAttribute("role", "tab");
      t.setAttribute("type", "button");
      if (p) { p.id = p.id || "vp" + uid; p.setAttribute("role", "tabpanel"); p.setAttribute("aria-labelledby", t.id); t.setAttribute("aria-controls", p.id); }
    });
    function show(id, focus) {
      tabs.forEach(function (t) {
        var on = t.getAttribute("data-view-tab") === id;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
      });
      panes.forEach(function (p) { p.hidden = p.getAttribute("data-view") !== id; });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { show(t.getAttribute("data-view-tab")); });
      t.addEventListener("keydown", function (e) {
        var k = e.key, j = -1;
        if (k === "ArrowRight") j = (i + 1) % tabs.length;
        else if (k === "ArrowLeft") j = (i - 1 + tabs.length) % tabs.length;
        else if (k === "Home") j = 0;
        else if (k === "End") j = tabs.length - 1;
        if (j > -1) { e.preventDefault(); show(tabs[j].getAttribute("data-view-tab"), true); }
      });
    });
    show(box.getAttribute("data-views") || tabs[0].getAttribute("data-view-tab"));
  });

  /* 2. dates */
  var t0 = today();
  d.querySelectorAll("[data-since]").forEach(function (el) {
    var s = parse(el.getAttribute("data-since"));
    if (!isNaN(s) && s <= t0) el.textContent = String(Math.round((t0 - s) / DAY));
  });
  d.querySelectorAll("[data-next]").forEach(function (list) {
    var items = Array.prototype.slice.call(list.querySelectorAll("[data-date]"));
    var found = false;
    items.forEach(function (it) {
      var v = parse(it.getAttribute("data-date"));
      it.classList.remove("is-next", "is-past");
      if (isNaN(v)) return;
      if (v < t0) { it.classList.add("is-past"); return; }
      if (!found) {
        found = true;
        it.classList.add("is-next");
        var n = Math.round((v - t0) / DAY);
        var out = it.querySelector("[data-countdown]");
        if (out) out.textContent = n === 0 ? "Today" : n === 1 ? "Tomorrow" : "In " + n + " days";
      }
    });
  });

  /* 3. stepper */
  d.querySelectorAll("[data-stepper]").forEach(function (box) {
    var input = box.querySelector("input");
    if (!input) return;
    var price = parseFloat(box.getAttribute("data-price") || "0");
    var cur = box.getAttribute("data-currency") || "$";
    var total = box.querySelector("[data-total]") || (box.parentNode && box.parentNode.querySelector("[data-total]"));
    var min = parseInt(input.min || "1", 10), max = parseInt(input.max || "9999", 10);
    var minus = box.querySelector('[data-step="-1"]'), plus = box.querySelector('[data-step="1"]');
    function upd() {
      var v = parseInt(input.value, 10);
      if (isNaN(v)) v = min;
      v = Math.max(min, Math.min(max, v));
      input.value = v;
      if (minus) minus.disabled = v <= min;
      if (plus) plus.disabled = v >= max;
      if (total && price) total.textContent = cur + (v * price).toLocaleString("en-US", { maximumFractionDigits: 2 });
    }
    box.querySelectorAll("[data-step]").forEach(function (b) {
      b.addEventListener("click", function () { input.value = (parseInt(input.value, 10) || 0) + parseInt(b.getAttribute("data-step"), 10); upd(); });
    });
    input.addEventListener("change", upd);
    input.addEventListener("input", function () { if (input.value !== "") upd(); });
    upd();
  });
})();
