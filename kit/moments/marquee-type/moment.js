// marquee-type: oversized line travelling sideways. Base speed + scroll-velocity nudge. Seamless loop.
const KEY = '__momentMarqueeType';
const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };

export default function mount(root, options = {}) {
  if (!root) return () => {};
  if (root[KEY]) return root[KEY];
  const win = root.ownerDocument.defaultView;
  const doc = root.ownerDocument;
  if (win.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};

  const ds = root.dataset;
  const speed = Math.abs(num(options.speed ?? ds.speed, 60)); // px per second
  const gap = options.gap ?? ds.gap; // any CSS length, default 0.6em
  const baseSign = String(options.direction ?? ds.direction ?? 'left') === 'right' ? 1 : -1;
  const influence = Math.max(0, num(options.scrollInfluence ?? ds.scrollInfluence, 1));
  const labelPause = options.labelPause ?? ds.labelPause ?? 'Pause';
  const labelPlay = options.labelPlay ?? ds.labelPlay ?? 'Play';

  const orig = Array.from(root.childNodes);
  const dir = win.getComputedStyle(root).direction;
  const track = doc.createElement('span');
  track.className = 'mq-track';
  const group = doc.createElement('span');
  group.className = 'mq-group';
  group.style.direction = dir;
  orig.forEach((n) => group.appendChild(n));
  track.appendChild(group);
  root.appendChild(track);
  if (gap != null && gap !== '') root.style.setProperty('--mq-gap', String(gap));

  const btn = doc.createElement('button');
  btn.type = 'button';
  btn.className = 'mq-pause';
  btn.textContent = labelPause;
  root.appendChild(btn);
  root.setAttribute('data-moment-ready', '');

  const clones = [];
  let W = 0;
  let x = 0;
  let wanted = 1;
  let userPaused = false;
  let hold = false; // hover or focus
  let visible = false;
  let running = false;
  let raf = 0;
  let last = 0;
  let lastY = 0;
  let sv = 0; // smoothed scroll velocity px/s
  let d = 1; // direction multiplier following scroll direction
  let pm = 1; // pause multiplier (eased)
  let dead = false;

  const sync = () => {
    const rw = root.getBoundingClientRect().width;
    const gw = group.getBoundingClientRect().width;
    if (!gw) return;
    W = gw;
    wanted = Math.max(1, Math.ceil(rw / gw) + 1);
    while (clones.length < wanted - 1) {
      const c = group.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      c.setAttribute('inert', '');
      c.querySelectorAll('[id]').forEach((e) => e.removeAttribute('id'));
      track.appendChild(c);
      clones.push(c);
    }
    while (clones.length > wanted - 1) clones.pop().remove();
    paint();
  };
  const paint = () => {
    if (W) x = ((x % W) - W) % W;
    track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
  };
  const shouldRun = () => visible && !doc.hidden && (!(userPaused || hold) || pm > 0.002);
  const frame = (t) => {
    raf = 0;
    if (dead) return;
    const dt = Math.min(0.05, Math.max(0, (t - last) / 1000));
    last = t;
    const y = win.scrollY;
    const inst = dt > 0 ? Math.max(-3000, Math.min(3000, (y - lastY) / dt)) : 0;
    lastY = y;
    sv += (inst - sv) * Math.min(1, dt * 8);
    if (influence && Math.abs(sv) > 25) d += (Math.sign(sv) - d) * Math.min(1, dt * 6);
    pm += ((userPaused || hold ? 0 : 1) - pm) * Math.min(1, dt * 7);
    if (pm < 0.002) pm = 0;
    x += baseSign * (speed * d + influence * 0.25 * sv) * dt * pm;
    paint();
    if (shouldRun()) raf = win.requestAnimationFrame(frame);
    else running = false;
  };
  const kick = () => {
    if (running || dead || !shouldRun()) return;
    running = true;
    last = win.performance.now();
    lastY = win.scrollY;
    sv = 0;
    raf = win.requestAnimationFrame(frame);
  };

  const ro = new win.ResizeObserver(sync);
  ro.observe(root);
  ro.observe(group);
  const io = new win.IntersectionObserver((e) => { visible = e[0].isIntersecting; if (visible) kick(); }, { rootMargin: '10% 0px' });
  io.observe(root);

  const setHold = (v) => () => { hold = v; kick(); };
  const enter = setHold(true);
  const leave = setHold(false);
  root.addEventListener('mouseenter', enter);
  root.addEventListener('mouseleave', leave);
  root.addEventListener('focusin', enter);
  root.addEventListener('focusout', leave);
  const onBtn = () => {
    userPaused = !userPaused;
    btn.textContent = userPaused ? labelPlay : labelPause;
    btn.setAttribute('data-paused', userPaused ? 'true' : 'false');
    kick();
  };
  btn.addEventListener('click', onBtn);
  const onVis = () => kick();
  doc.addEventListener('visibilitychange', onVis);
  doc.fonts && doc.fonts.ready && doc.fonts.ready.then(() => !dead && sync());
  sync();

  const cleanup = () => {
    if (dead) return;
    dead = true;
    win.cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    root.removeEventListener('mouseenter', enter);
    root.removeEventListener('mouseleave', leave);
    root.removeEventListener('focusin', enter);
    root.removeEventListener('focusout', leave);
    doc.removeEventListener('visibilitychange', onVis);
    orig.forEach((n) => root.appendChild(n));
    track.remove();
    btn.remove();
    root.removeAttribute('data-moment-ready');
    root.style.removeProperty('--mq-gap');
    if (!root.getAttribute('style')) root.removeAttribute('style');
    delete root[KEY];
  };
  root[KEY] = cleanup;
  return cleanup;
}
