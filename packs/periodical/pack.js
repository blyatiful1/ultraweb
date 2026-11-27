/* Quarterly pack.js: three behaviours, all driven by data attributes. No libraries, no network.
   1. data-hours     opening status worked out from the hours, in the visitor's clock
   2. data-dates     marks past dates and the next one in a list
   3. data-stepper   plus and minus buttons for a number input
   Without JavaScript each element keeps the text the builder wrote. Nothing animates. */
(function () {
  "use strict";
  var DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  var NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function clock(m) { return pad(Math.floor(m / 60) % 24) + ":" + pad(m % 60); }

  /* "mon closed; tue-sat 12:00-15:00 18:00-23:00; sun 12:00-17:00" -> [[ [start,end], … ] × 7] */
  function parseHours(text) {
    var week = [[], [], [], [], [], [], []];
    text.toLowerCase().split(";").forEach(function (part) {
      var m = part.trim().match(/^([a-z]{3})[a-z]*(?:\s*[-–]\s*([a-z]{3})[a-z]*)?\s*:?\s*(.*)$/);
      if (!m) return;
      var a = DAYS.indexOf(m[1]), b = m[2] ? DAYS.indexOf(m[2]) : a;
      if (a < 0 || b < 0) return;
      var spans = [], re = /(\d{1,2})[:.](\d{2})\s*[-–]\s*(\d{1,2})[:.](\d{2})/g, s;
      while ((s = re.exec(m[3]))) {
        var start = +s[1] * 60 + +s[2], end = +s[3] * 60 + +s[4];
        if (end <= start) end += 1440; /* runs past midnight */
        spans.push([start, end]);
      }
      spans.sort(function (x, y) { return x[0] - y[0]; });
      for (var i = a; ; i = (i + 1) % 7) { week[i] = spans; if (i === b) break; }
    });
    return week;
  }

  function hours(el) {
    var week = parseHours(el.getAttribute("data-hours") || "");
    var now = new Date(), d = now.getDay(), t = now.getHours() * 60 + now.getMinutes();
    var until = null, i, k;
    week[d].forEach(function (s) { if (t >= s[0] && t < s[1]) until = s[1]; });
    week[(d + 6) % 7].forEach(function (s) { if (s[1] > 1440 && t < s[1] - 1440) until = s[1]; });
    var text;
    if (until !== null) {
      text = (el.getAttribute("data-open-text") || "Open now") + " · until " + clock(until);
    } else {
      var next = null;
      for (k = 0; k < 8 && !next; k++) {
        var day = (d + k) % 7;
        for (i = 0; i < week[day].length; i++) {
          if (k > 0 || week[day][i][0] > t) { next = { k: k, day: day, at: week[day][i][0] }; break; }
        }
      }
      text = (el.getAttribute("data-closed-text") || "Closed now");
      if (next) text += " · opens " + (next.k === 0 ? "today" : next.k === 1 ? "tomorrow" : NAMES[next.day]) + " " + clock(next.at);
    }
    el.setAttribute("data-state", until !== null ? "open" : "closed");
    var out = el.querySelector("[data-hours-text]") || el;
    out.textContent = text;
  }

  function dates(list) {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var best = null, bestTime = Infinity;
    list.querySelectorAll("[data-date]").forEach(function (item) {
      var start = new Date(item.getAttribute("data-date") + "T00:00:00");
      var end = new Date((item.getAttribute("data-date-end") || item.getAttribute("data-date")) + "T23:59:59");
      item.classList.remove("is-next", "is-past");
      item.removeAttribute("aria-current");
      if (isNaN(start)) return;
      if (end < today) {
        item.classList.add("is-past");
        if (list.getAttribute("data-dates") === "hide-past") item.hidden = true;
      } else if (start.getTime() < bestTime) { best = item; bestTime = start.getTime(); }
    });
    if (best) { best.classList.add("is-next"); best.setAttribute("aria-current", "date"); }
    if (list.id) {
      document.querySelectorAll('[data-next-for="' + list.id + '"]').forEach(function (out) {
        if (best) out.textContent = best.getAttribute("data-label") || out.textContent;
      });
    }
  }

  function stepper(box) {
    var input = box.querySelector("input");
    if (!input) return;
    var buttons = box.querySelectorAll("[data-step]");
    function bound(v) {
      if (input.min !== "") v = Math.max(v, +input.min);
      if (input.max !== "") v = Math.min(v, +input.max);
      return v;
    }
    function sync() {
      var v = +input.value || 0;
      buttons.forEach(function (b) {
        var dir = +b.getAttribute("data-step");
        b.disabled = input.disabled || (dir < 0 && input.min !== "" && v <= +input.min) || (dir > 0 && input.max !== "" && v >= +input.max);
      });
    }
    buttons.forEach(function (b) {
      b.hidden = false;
      b.addEventListener("click", function () {
        var step = (+input.step || 1) * +b.getAttribute("data-step");
        input.value = bound((+input.value || 0) + step);
        input.dispatchEvent(new Event("change", { bubbles: true }));
        sync();
      });
    });
    input.addEventListener("input", sync);
    sync();
  }

  function run() {
    document.querySelectorAll("[data-hours]").forEach(hours);
    document.querySelectorAll("[data-dates]").forEach(dates);
    document.querySelectorAll("[data-stepper]").forEach(stepper);
    setInterval(function () { document.querySelectorAll("[data-hours]").forEach(hours); }, 60000);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run); else run();
})();
