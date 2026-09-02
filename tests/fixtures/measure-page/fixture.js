// fixture.js — the fixture's one external script, so cold-load-js has a real script resource
// to weigh. It also drives the role="dialog": Tab inside it CYCLES through the three buttons
// and wraps to the first, which is what keyboard-walk reports as cycledWithin (a correct modal),
// as opposed to trap:true, which is focus pinned on one element.
(function () {
  var dialog = document.getElementById('dialog');
  var opener = document.getElementById('open-dialog');
  if (!dialog || !opener) return;
  var focusables = function () {
    return Array.prototype.slice.call(dialog.querySelectorAll('button, [href], input, select, textarea'));
  };
  opener.addEventListener('click', function () {
    dialog.hidden = false;
    var f = focusables();
    if (f.length) f[0].focus();
  });
  document.addEventListener('keydown', function (e) {
    if (dialog.hidden) return;
    if (e.key === 'Escape') {
      dialog.hidden = true;
      opener.focus();
      return;
    }
    if (e.key !== 'Tab') return;
    var f = focusables();
    if (!f.length) return;
    var i = f.indexOf(document.activeElement);
    var next = e.shiftKey ? (i <= 0 ? f.length - 1 : i - 1) : i === -1 || i === f.length - 1 ? 0 : i + 1;
    e.preventDefault();
    f[next].focus();
  });
})();
