/* Vitrine pack.js: three behaviours, all driven by data attributes.
   1. data-hours="Tue-Sat 10:00-18:00; Sun 12:00-16:00"  -> live open/closed status
   2. data-next-date on a list, data-date="YYYY-MM-DD" (data-end optional) on items -> marks Next / Now on, greys past
      data-next-from="#listId" on any element -> receives the next item's data-label
   3. data-views on a box, data-view="Label" on each panel -> switch between views
   Without JavaScript, the written content stays as it is. No motion is added. */
(function () {
  var DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  var NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function mins(t) { var p = t.split(":"); return (+p[0]) * 60 + (+(p[1] || 0)); }
  function hhmm(m) { var h = Math.floor(m / 60), n = m % 60; return (h < 10 ? "0" : "") + h + ":" + (n < 10 ? "0" : "") + n; }
  function each(sel, fn, root) { Array.prototype.forEach.call((root || document).querySelectorAll(sel), fn); }

  /* 1. Opening hours */
  function parseHours(s) {
    var week = {};
    s.split(";").forEach(function (part) {
      var m = part.trim().match(/^([A-Za-z]{3})[a-z]*(?:\s*[-–]\s*([A-Za-z]{3})[a-z]*)?\s+(\d{1,2}(?::\d{2})?)\s*[-–]\s*(\d{1,2}(?::\d{2})?)$/);
      if (!m) return;
      var a = DAYS.indexOf(m[1].toLowerCase()), b = m[2] ? DAYS.indexOf(m[2].toLowerCase()) : a;
      if (a < 0 || b < 0) return;
      for (var i = a, guard = 0; guard < 7; i = (i + 1) % 7, guard++) {
        (week[i] = week[i] || []).push([mins(m[3]), mins(m[4])]);
        if (i === b) break;
      }
    });
    return week;
  }
  each("[data-hours]", function (el) {
    var week = parseHours(el.getAttribute("data-hours"));
    var now = new Date(), d = now.getDay(), t = now.getHours() * 60 + now.getMinutes();
    var out = el.querySelector("[data-status-text]") || el, open = null, next = null;
    (week[d] || []).forEach(function (r) { if (t >= r[0] && t < r[1]) open = r; });
    el.classList.remove("status--open", "status--closed");
    if (open) { el.classList.add("status--open"); out.textContent = "Open now, until " + hhmm(open[1]); return; }
    for (var k = 0; k < 8 && !next; k++) {
      var day = (d + k) % 7;
      (week[day] || []).slice().sort(function (x, y) { return x[0] - y[0]; }).forEach(function (r) {
        if (!next && (k > 0 || r[0] > t)) next = { k: k, day: day, at: r[0] };
      });
    }
    el.classList.add("status--closed");
    out.textContent = "Closed now" + (next ? ", opens " + (next.k === 0 ? "today" : next.k === 1 ? "tomorrow" : NAMES[next.day]) + " at " + hhmm(next.at) : "");
  });

  /* 2. Next date */
  var today = new Date(); today.setHours(0, 0, 0, 0);
  function toDate(s) { var p = (s || "").split("-"); return new Date(+p[0], (+p[1]) - 1, +p[2]); }
  each("[data-next-date]", function (list) {
    var found = null;
    each("[data-date]", function (it) {
      var start = toDate(it.getAttribute("data-date"));
      var end = it.hasAttribute("data-end") ? toDate(it.getAttribute("data-end")) : start;
      if (isNaN(start)) return;
      if (end < today) { it.classList.add("is-past"); return; }
      if (found) return;
      found = it; it.classList.add("is-next");
      var tag = document.createElement("span");
      tag.className = "tag tag--next";
      tag.textContent = start <= today ? "Now on" : "Next";
      (it.querySelector("[data-next-slot]") || it).appendChild(tag);
    }, list);
    if (found && list.id) {
      each('[data-next-from="#' + list.id + '"]', function (t) {
        t.textContent = found.getAttribute("data-label") || found.textContent.trim();
      });
    }
  });

  /* 3. Views */
  var n = 0;
  each("[data-views]", function (box) {
    var panels = Array.prototype.filter.call(box.children, function (c) { return c.hasAttribute("data-view"); });
    if (panels.length < 2) return;
    var bar = document.createElement("div");
    bar.className = "views__bar";
    bar.setAttribute("role", "tablist");
    bar.setAttribute("aria-label", box.getAttribute("data-views") || "Views");
    var tabs = panels.map(function (p) {
      n += 1;
      var id = p.id || "view-" + n, b = document.createElement("button");
      p.id = id;
      b.type = "button"; b.className = "views__tab"; b.id = id + "-tab";
      b.setAttribute("role", "tab"); b.setAttribute("aria-controls", id);
      b.textContent = p.getAttribute("data-view");
      p.setAttribute("role", "tabpanel"); p.setAttribute("aria-labelledby", b.id); p.tabIndex = 0;
      bar.appendChild(b);
      return b;
    });
    function show(i, focus) {
      tabs.forEach(function (b, j) {
        var on = i === j;
        b.setAttribute("aria-selected", on ? "true" : "false");
        b.tabIndex = on ? 0 : -1;
        panels[j].hidden = !on;
      });
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (b, i) {
      b.addEventListener("click", function () { show(i); });
      b.addEventListener("keydown", function (e) {
        var k = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (k) { e.preventDefault(); show((i + k + tabs.length) % tabs.length, true); }
      });
    });
    box.insertBefore(bar, panels[0]);
    box.classList.add("is-on");
    var start = 0;
    panels.forEach(function (p, i) { if (p.hasAttribute("data-view-default")) start = i; });
    show(start);
  });
})();
