/* Nocturne pack.js: stars, the tonight line, the stepper. No libraries, no network. */
(function () {
  'use strict';
  var d = document, NS = 'http://www.w3.org/2000/svg',
    calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function each(s, f) { [].forEach.call(d.querySelectorAll(s), f); }
  /* 1. Stars: <g data-nc-stars="140" data-seed="3" data-area="x y w h"> in svg units. */
  each('[data-nc-stars]', function (g) {
    var n = Math.min(+g.getAttribute('data-nc-stars') || 120, 400),
      s = (+g.getAttribute('data-seed') || 7) % 2147483646 + 1,
      a = (g.getAttribute('data-area') || '0 0 1600 600').split(/[\s,]+/).map(Number),
      f = d.createDocumentFragment(), i, c, z;
    function r() { s = s * 16807 % 2147483647; return (s - 1) / 2147483646; }
    for (i = 0; i < n; i++) {
      c = d.createElementNS(NS, 'circle'); z = r();
      c.setAttribute('cx', (a[0] + r() * a[2]).toFixed(1));
      c.setAttribute('cy', (a[1] + Math.pow(r(), 1.5) * a[3]).toFixed(1));
      c.setAttribute('r', (z < .9 ? .7 + z * 1.1 : 2 + r() * 1.3).toFixed(2));
      c.setAttribute('opacity', (.3 + r() * .7).toFixed(2));
      if (z > .93 && !calm) { c.setAttribute('class', 'nc-tw'); c.style.animationDelay = (r() * 5).toFixed(1) + 's'; }
      f.appendChild(c);
    }
    g.appendChild(f);
  });
  /* 2. Tonight: data-nc-tonight data-dates data-time data-decide data-ends data-off data-tz data-say-*. See PACK.md. */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function nowIn(tz) {
    var p = {}, t = new Date();
    try {
      var o = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' };
      if (tz) o.timeZone = tz;
      new Intl.DateTimeFormat('en-GB', o).formatToParts(t).forEach(function (x) { p[x.type] = x.value; });
    } catch (e) { p = { year: t.getFullYear(), month: pad(t.getMonth() + 1), day: pad(t.getDate()), hour: t.getHours(), minute: t.getMinutes() }; }
    return { day: p.year + '-' + p.month + '-' + p.day, min: (+p.hour % 24) * 60 + +p.minute };
  }
  function mins(t) { t = (t || '').split(':'); return t.length < 2 ? null : +t[0] * 60 + +t[1]; }
  function fmt(day, o) {
    var q = day.split('-'); o.timeZone = 'UTC';
    return new Intl.DateTimeFormat('en-GB', o).format(new Date(Date.UTC(+q[0], q[1] - 1, +q[2])));
  }
  var SAY = {
    on: 'Tonight: going ahead. Doors at {time}.',
    pending: 'Tonight at {time}, if the sky is clear. We decide at {decide}.',
    off: 'Tonight is called off. Next night: {next}.',
    next: 'Next night: {date}, {time}.'
  };
  each('[data-nc-tonight]', function (el) {
    function A(k, v) { return el.getAttribute('data-' + k) || v; }
    var off = ' ' + A('off', '').replace(/,/g, ' ') + ' ', now = nowIn(A('tz')),
      dec = mins(A('decide')), end = mins(A('ends', '23:59')), today = null, next = null, state = 'none',
      list = A('dates', '').split(/[\s,]+/).filter(Boolean).map(function (x) {
        x = x.split('T'); return { day: x[0], time: x[1] || A('time', '') };
      }).sort(function (a, b) { return a.day < b.day ? -1 : 1; });
    function isOff(k) { return off.indexOf(' ' + k + ' ') > -1; }
    list.forEach(function (e) {
      if (e.day === now.day) { if (now.min <= end) today = e; }
      else if (e.day > now.day && !next && !isOff(e.day)) next = e;
    });
    if (today) state = isOff(today.day) ? 'off' : (dec !== null && now.min < dec ? 'pending' : 'on');
    else if (next) state = 'next';
    if (state === 'none') { el.setAttribute('data-state', 'none'); return; }
    var show = state === 'off' ? next : (today || next), lit = today && state !== 'off',
      long = { weekday: 'long', day: 'numeric', month: 'long' },
      v = {
        time: show ? show.time : '', decide: A('decide', ''),
        date: show ? fmt(show.day, long) : '',
        day: lit ? 'Tonight' : (show ? fmt(show.day, { weekday: 'long' }) : ''),
        next: next ? fmt(next.day, long) + (next.time ? ', ' + next.time : '') : 'to be announced'
      };
    v.line = A('say-' + state, SAY[state]).replace(/\{(\w+)\}/g, function (m, k) { return v[k] || ''; });
    el.setAttribute('data-state', state);
    v.state = A('word-' + state, { on: 'Going ahead', pending: 'Waiting on the sky', off: 'Called off', next: 'Next night' }[state]);
    [].forEach.call(el.querySelectorAll('[data-nc-t]'), function (s) {
      s.getAttribute('data-nc-t').split(' ').forEach(function (k) {
        if (k === 'mark') s.setAttribute('data-state', state); else if (v[k]) s.textContent = v[k];
      });
    });
    each('[data-nc-date]', function (x) {
      var k = x.getAttribute('data-nc-date');
      x.classList.toggle('is-past', k < now.day || (k === now.day && !today));
      x.classList.toggle('is-tonight', !!lit && k === today.day);
      x.classList.toggle('is-next', !lit && !!next && k === next.day);
      x.classList.toggle('is-off', isOff(k));
    });
  });
  /* 3. Stepper: data-nc-stepper around [data-step="-1"] input[type=number] [data-step="1"]; buttons start hidden. */
  each('[data-nc-stepper]', function (w) {
    var i = w.querySelector('input'), b = w.querySelectorAll('[data-step]');
    if (!i) return;
    function lim(k, x) { var n = parseFloat(i[k]); return isNaN(n) ? x : n; }
    function upd() {
      var n = parseFloat(i.value) || 0;
      [].forEach.call(b, function (x) { x.disabled = +x.getAttribute('data-step') < 0 ? n <= lim('min', -1e9) : n >= lim('max', 1e9); });
    }
    [].forEach.call(b, function (x) {
      x.hidden = false;
      x.addEventListener('click', function () {
        var n = (parseFloat(i.value) || 0) + +x.getAttribute('data-step');
        i.value = Math.max(lim('min', -1e9), Math.min(lim('max', 1e9), n));
        i.dispatchEvent(new Event('input', { bubbles: true }));
        i.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });
    i.addEventListener('input', upd); upd();
  });
})();
