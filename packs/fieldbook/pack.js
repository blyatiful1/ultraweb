/* Fieldbook pack.js — live figures. No dependencies. Load with <script src="pack.js" defer>.
   1. Timetable  <table class="fb-board" data-fb-board> rows <tr data-when="2026-12-05T10:00">
      marks past rows .is-past, the next row .is-next, and writes a summary into [data-fb-next].
   2. Hours      <div data-fb-hours='{"mon":"","tue":"09:00-17:00",...}'> writes open/closed into
      .fb-hours__now and marks today's row (tr[data-day="tue"]).
   3. Calendar   .fb-cal__day[data-date="2026-12-05"] gets .is-today on today's date.
   4. Colourway  buttons [data-colourway-set="survey"] switch <html data-colourway>. */
(function () {
  var DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  var NAMES = { sun: "Sun", mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat" };
  var now = new Date();
  function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }

  document.querySelectorAll("[data-fb-board]").forEach(function (table) {
    var next = null;
    table.querySelectorAll("tr[data-when]").forEach(function (tr) {
      var t = new Date(tr.getAttribute("data-when"));
      if (isNaN(t)) return;
      if (t < now) tr.classList.add("is-past");
      else if (!next) { next = tr; tr.classList.add("is-next"); }
    });
    var out = document.querySelector("[data-fb-next]");
    if (out && next) {
      var days = Math.round((new Date(next.getAttribute("data-when")).setHours(0,0,0,0) - new Date(now).setHours(0,0,0,0)) / 864e5);
      var what = next.querySelector(".fb-board__what");
      var left = next.querySelector(".fb-board__left");
      out.textContent = "Next: " + (what ? what.textContent.trim() : "") +
        (days === 0 ? ", today" : days === 1 ? ", tomorrow" : ", in " + days + " days") +
        (left ? " · " + left.textContent.trim() : "");
    }
  });

  document.querySelectorAll("[data-fb-hours]").forEach(function (box) {
    var hours; try { hours = JSON.parse(box.getAttribute("data-fb-hours")); } catch (e) { return; }
    var today = DAYS[now.getDay()];
    var row = box.querySelector('tr[data-day~="' + today + '"]');
    if (row) row.classList.add("is-today");
    var out = box.querySelector(".fb-hours__now");
    if (!out) return;
    var mins = now.getHours() * 60 + now.getMinutes();
    function span(day) { var s = hours[day]; if (!s) return null; var p = s.split("-"); return p.length === 2 ? p : null; }
    function m(hhmm) { var p = hhmm.split(":"); return +p[0] * 60 + +p[1]; }
    var s = span(today);
    if (s && mins >= m(s[0]) && mins < m(s[1])) {
      out.textContent = "Open now · closes " + s[1]; out.setAttribute("data-state", "open"); return;
    }
    for (var i = 0; i < 8; i++) {
      var day = DAYS[(now.getDay() + i) % 7], sp = span(day);
      if (sp && (i > 0 || mins < m(sp[0]))) {
        out.textContent = "Closed now · opens " + (i === 0 ? "today" : i === 1 ? "tomorrow" : NAMES[day]) + " " + sp[0];
        out.setAttribute("data-state", "closed"); return;
      }
    }
  });

  var cell = document.querySelector('.fb-cal__day[data-date="' + iso(now) + '"]');
  if (cell) cell.classList.add("is-today");

  document.querySelectorAll("[data-colourway-set]").forEach(function (b) {
    b.addEventListener("click", function () {
      document.documentElement.setAttribute("data-colourway", b.getAttribute("data-colourway-set"));
      document.querySelectorAll("[data-colourway-set]").forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
    });
  });
})();
