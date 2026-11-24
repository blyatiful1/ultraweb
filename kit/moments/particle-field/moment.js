// particle-field: curl-noise points that can gather into a word or an SVG path.
const MOUNTED = new WeakMap();
const VS = `attribute vec2 p;attribute vec2 s;uniform vec2 R;uniform float Z;varying float v;
void main(){v=s.x;gl_Position=vec4(p.x/R.x*2.-1.,1.-p.y/R.y*2.,0.,1.);gl_PointSize=Z*(.55+.9*s.y);}`;
const FS = `precision mediump float;uniform vec3 P,A;uniform float O;varying float v;
void main(){float d=length(gl_PointCoord-.5)*2.,a=smoothstep(1.,.25,d)*O;gl_FragColor=vec4(mix(P,A,v)*a,a);}`;
const S2 = .7071, GR = [1, 0, -1, 0, 0, 1, 0, -1, S2, S2, -S2, S2, S2, -S2, -S2, -S2];

function readColors(root, list) {
	const c = Object.assign(document.createElement('canvas'), { width: 1, height: 1 });
	const x = c.getContext('2d', { willReadFrequently: true }), cs = getComputedStyle(root);
	return list.map(([name, fb]) => {
		const v = cs.getPropertyValue(name).trim();
		x.clearRect(0, 0, 1, 1); x.fillStyle = v && CSS.supports('color', v) ? v : fb; x.fillRect(0, 0, 1, 1);
		return [...x.getImageData(0, 0, 1, 1).data.slice(0, 3)].map((e) => e / 255);
	});
}

export default function mount(root, options = {}) {
	if (!root) return () => {};
	if (MOUNTED.has(root)) return MOUNTED.get(root);
	const ds = root.dataset, mm = (q) => matchMedia(q);
	const opt = (k, d) => { const v = options[k] ?? ds[k]; return v == null || v === '' ? d : v; };
	const cl = (v, a, b) => Math.min(b, Math.max(a, v)), num = (k, d, a, b) => { const v = parseFloat(opt(k, d)); return cl(isNaN(v) ? d : v, a, b); };
	const speed = num('speed', 1, 0, 4), density = num('density', 1, 0.1, 3), psize = num('size', 3.5, 1, 12), radius = num('radius', 120, 0, 600);
	const wordEl = root.querySelector('[data-particle-word]');
	const path = String(opt('path', ''));
	const vb = String(opt('viewbox', '0 0 100 100')).split(/[\s,]+/).map(Number);
	const mode = wordEl || path ? String(opt('gather', 'scroll')) : 'off';
	const rmq = mm('(prefers-reduced-motion: reduce)'), dark = mm('(prefers-color-scheme: dark)'), coarse = mm('(pointer: coarse)').matches;
	const pm = mm('(pointer: fine)').matches ? String(opt('pointer', 'repel')) : 'off';

	let cv, gl, pr, pb, sb, U, col, add, btn, raf = 0, vis = false, paused = false, lost = false, reduced = rmq.matches;
	let t = 0, last = 0, w = 0, h = 0, dpr = 1, ft = 16, fc = 0, nx = 0, ny = 0;
	let n = 0, active = 0, pos, vel, seed, tgt, gather = mode === 'always' ? 1 : 0;
	let secTop = 0, secH = 1, vh = 800, sy = 0, token = 0;
	const ptr = { x: 0, y: 0, on: 0 };

	root.setAttribute('data-moment-ready', '');

	// noise(): adds the gradient-noise derivative to nx, ny
	const hash = (i, j) => { let k = Math.imul(i, 374761393) + Math.imul(j, 668265263) | 0; k = Math.imul(k ^ (k >>> 13), 1274126177); return ((k ^ (k >>> 16)) & 7) * 2; };
	function noise(x, y, s) {
		const i = Math.floor(x), j = Math.floor(y), X = x - i, Y = y - j;
		const u = X * X * X * (X * (X * 6 - 15) + 10), v = Y * Y * Y * (Y * (Y * 6 - 15) + 10);
		const a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1);
		const ax = GR[a], ay = GR[a + 1], bx = GR[b], by = GR[b + 1], cx = GR[c], cy = GR[c + 1], dx = GR[d], dy = GR[d + 1];
		const va = ax * X + ay * Y, vb = bx * (X - 1) + by * Y, vc = cx * X + cy * (Y - 1), k = va - vb - vc + dx * (X - 1) + dy * (Y - 1);
		nx += s * (ax + u * (bx - ax) + v * (cx - ax) + u * v * (ax - bx - cx + dx) + 30 * X * X * (X * (X - 2) + 1) * (v * k + vb - va));
		ny += s * (ay + u * (by - ay) + v * (cy - ay) + u * v * (ay - by - cy + dy) + 30 * Y * Y * (Y * (Y - 2) + 1) * (u * k + vc - va));
	}

	function alloc() {
		const want = Math.round(cl((w * h) / 230 * density * (coarse ? 0.5 : 1), 600, coarse ? 3000 : 7000));
		if (want === n) return;
		const old = pos, on = n;
		n = active = want;
		pos = new Float32Array(n * 2); vel = new Float32Array(n * 2); seed = new Float32Array(n * 2); tgt = new Float32Array(n * 2).fill(-1);
		let r = 1234567;
		const rnd = () => ((r = Math.imul(r, 1664525) + 1013904223 | 0) >>> 0) / 4294967296;
		for (let i = 0; i < n * 2; i += 2) {
			pos[i] = old && i < on * 2 ? old[i] : rnd() * w; pos[i + 1] = old && i < on * 2 ? old[i + 1] : rnd() * h;
			seed[i] = rnd() ** 1.6; seed[i + 1] = rnd();
		}
		if (pb) upload(true);
		sample();
	}

	// targets: SVG path, or the word element's text in its own box and font
	async function sample() {
		if (mode === 'off' || !w) return;
		const my = ++token;
		if (!path) await document.fonts?.ready;
		if (my !== token || !pos) return;
		const k = 0.5, W = Math.ceil(w * k), H = Math.ceil(h * k), c = document.createElement('canvas');
		c.width = W; c.height = H;
		const x = c.getContext('2d', { willReadFrequently: true });
		x.scale(k, k);
		if (path) {
			const [vx = 0, vy = 0, vw = 100, vh2 = 100] = vb, s = Math.min((w * 0.8) / vw, (h * 0.7) / vh2), p2 = new Path2D(path);
			x.translate((w - vw * s) / 2 - vx * s, (h - vh2 * s) / 2 - vy * s);
			x.scale(s, s);
			x.lineWidth = Math.max(vw, vh2) * 0.025;
			x.fill(p2); x.stroke(p2);
		} else {
			const rr = root.getBoundingClientRect(), er = wordEl.getBoundingClientRect(), cs = getComputedStyle(wordEl);
			x.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
			if (cs.letterSpacing !== 'normal') x.letterSpacing = cs.letterSpacing;
			x.textAlign = 'center'; x.textBaseline = 'middle';
			x.fillText(wordEl.textContent.trim(), er.left - rr.left + er.width / 2, er.top - rr.top + er.height / 2);
		}
		const d = x.getImageData(0, 0, W, H).data, pts = [];
		for (let i = 0; i < W * H; i++) if (d[i * 4 + 3] > 128) pts.push(i);
		const m = pts.length, free = Math.floor(n * 0.82);
		if (!m) return;
		let r = 98765;
		for (let i = m - 1; i > 0; i--) { r = Math.imul(r, 1664525) + 1013904223 | 0; const j = (r >>> 0) % (i + 1), v = pts[i]; pts[i] = pts[j]; pts[j] = v; }
		for (let i = 0; i < n; i++) {
			const q = pts[i % m];
			tgt[i * 2] = i < free ? (q % W) / k + (seed[i * 2 + 1] - 0.5) * 2.5 : -1;
			tgt[i * 2 + 1] = Math.floor(q / W) / k + (seed[i * 2] - 0.5) * 2.5;
		}
		if (!raf) draw();
	}

	function step(dt) {
		const fs = .0021, tt = t * .06, flow = 34 * speed, rr = radius * radius, sgn = pm === 'attract' ? -1 : 1;
		const pon = pm !== 'off' && ptr.on, damp = Math.exp(-dt * 2.6), gd = Math.exp(-dt * (2.6 + 5 * gather));
		for (let i = 0; i < active * 2; i += 2) {
			let px = pos[i], py = pos[i + 1], ax = 0, ay = 0;
			nx = ny = 0;
			noise(px * fs + tt, py * fs - tt * 0.7, 1);
			noise(px * fs * 2.3 - 11.3 - tt, py * fs * 2.3 + 7.1, 0.45);
			if (pon) {
				const dx = px - ptr.x, dy = py - ptr.y, d2 = dx * dx + dy * dy;
				if (d2 < rr && d2 > 1) { const d = Math.sqrt(d2), f = ((1 - d / radius) ** 2 * 2600 * sgn) / d; ax += dx * f; ay += dy * f; }
			}
			const g = tgt[i] >= 0 ? gather : 0, fl = (1 - g * 0.92) * flow;
			if (g > 0) { ax += (tgt[i] - px) * 14 * g; ay += (tgt[i + 1] - py) * 14 * g; }
			vel[i] = (vel[i] + ax * dt) * (g > 0 ? gd : damp);
			vel[i + 1] = (vel[i + 1] + ay * dt) * (g > 0 ? gd : damp);
			px += (ny * fl + vel[i]) * dt; py += (-nx * fl + vel[i + 1]) * dt;
			if (g < 0.5) {
				if (px < -8) px += w + 16; else if (px > w + 8) px -= w + 16;
				if (py < -8) py += h + 16; else if (py > h + 8) py -= h + 16;
			}
			pos[i] = px; pos[i + 1] = py;
		}
	}

	function build() {
		pr = gl.createProgram();
		for (const [type, src] of [[gl.VERTEX_SHADER, VS], [gl.FRAGMENT_SHADER, FS]]) {
			const s = gl.createShader(type);
			gl.shaderSource(s, src); gl.compileShader(s);
			if (!gl.getShaderParameter(s, gl.COMPILE_STATUS) && !gl.isContextLost()) throw 0;
			gl.attachShader(pr, s); gl.deleteShader(s);
		}
		gl.bindAttribLocation(pr, 0, 'p'); gl.bindAttribLocation(pr, 1, 's');
		gl.linkProgram(pr);
		if (!gl.getProgramParameter(pr, gl.LINK_STATUS) && !gl.isContextLost()) throw 0;
		gl.useProgram(pr);
		pb = gl.createBuffer(); sb = gl.createBuffer(); U = {};
		for (const k of ['R', 'Z', 'P', 'A', 'O']) U[k] = gl.getUniformLocation(pr, k);
		gl.enable(gl.BLEND);
		upload(true);
	}
	function upload(all) {
		gl.bindBuffer(gl.ARRAY_BUFFER, pb);
		if (all) gl.bufferData(gl.ARRAY_BUFFER, pos, gl.DYNAMIC_DRAW); else gl.bufferSubData(gl.ARRAY_BUFFER, 0, pos.subarray(0, active * 2));
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
		if (!all) return;
		gl.bindBuffer(gl.ARRAY_BUFFER, sb);
		gl.bufferData(gl.ARRAY_BUFFER, seed, gl.STATIC_DRAW);
		gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(0); gl.enableVertexAttribArray(1);
	}

	function colors() {
		const [B, P, A] = readColors(root, [['--background', '#f6f4f0'], ['--primary', '#4f5bd5'], ['--accent', '#e0703a']]);
		add = 0.2126 * B[0] + 0.7152 * B[1] + 0.0722 * B[2] < 0.4; // dark ground: additive glow; light ground: normal blending
		col = { P, A };
	}
	function size() {
		if (!cv) return;
		dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
		const W = Math.max(1, Math.round(w * dpr)), H = Math.max(1, Math.round(h * dpr));
		if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
	}
	function measure() {
		const r = root.getBoundingClientRect();
		sy = window.scrollY; secTop = r.top + sy; secH = Math.max(1, r.height); vh = window.innerHeight;
	}
	function draw() {
		if (!gl || lost || !col || !pos) return;
		gl.viewport(0, 0, cv.width, cv.height);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.blendFunc(gl.ONE, add ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA);
		gl.uniform2f(U.R, w, h); gl.uniform1f(U.Z, psize * dpr);
		gl.uniform3fv(U.P, col.P); gl.uniform3fv(U.A, col.A);
		gl.uniform1f(U.O, add ? 0.7 : 0.9);
		upload(false);
		gl.drawArrays(gl.POINTS, 0, active);
	}

	const running = () => gl && !lost && vis && !document.hidden && !paused && !reduced;
	const stop = () => { cancelAnimationFrame(raf); raf = 0; };
	function schedule() { if (!raf && running()) { last = performance.now(); raf = requestAnimationFrame(frame); } }
	function frame(now) {
		raf = 0;
		const dt = cl(now - last, 0, 33) / 1000;
		last = now;
		t = (t + dt * speed) % 10000;
		if (mode === 'scroll') {
			const c = Math.abs(cl((sy + vh - secTop) / (vh + secH), 0, 1) - 0.5) * 2;
			gather += (1 - cl((c - 0.3) / 0.4, 0, 1) - gather) * (1 - Math.exp(-dt * 3));
		}
		step(dt);
		ft = ft * 0.9 + dt * 100;
		if (++fc % 60 === 0) {
			if (ft > 20 && active > 600) active = Math.max(600, Math.floor(active * 0.8));
			else if (ft < 13 && active < n) active = Math.min(n, Math.ceil(active * 1.1));
		}
		draw();
		if (running()) raf = requestAnimationFrame(frame);
	}

	function onLost(e) { e.preventDefault(); lost = true; stop(); root.setAttribute('data-gl', 'lost'); }
	function onRestored() {
		lost = false;
		try { build(); } catch (_) { kill(); return; }
		root.setAttribute('data-gl', 'on');
		draw(); schedule();
	}
	function setup() {
		cv = Object.assign(document.createElement('canvas'), { className: 'pf-canvas' });
		cv.setAttribute('aria-hidden', 'true');
		gl = cv.getContext('webgl2', { antialias: false, depth: false, stencil: false }) || cv.getContext('webgl', { antialias: false, depth: false });
		if (!gl) { cv = null; return; }
		if (!pos) alloc();
		try { build(); } catch (_) { kill(); return; }
		cv.addEventListener('webglcontextlost', onLost); cv.addEventListener('webglcontextrestored', onRestored);
		root.prepend(cv);
		colors(); size(); draw();
		root.setAttribute('data-gl', 'on');
	}
	function kill() {
		stop();
		if (gl) {
			if (!gl.isContextLost()) { gl.deleteProgram(pr); gl.deleteBuffer(pb); gl.deleteBuffer(sb); }
			gl.getExtension('WEBGL_lose_context')?.loseContext();
		}
		if (cv) { cv.removeEventListener('webglcontextlost', onLost); cv.removeEventListener('webglcontextrestored', onRestored); cv.remove(); }
		cv = gl = pr = pb = sb = null; lost = false;
		root.removeAttribute('data-gl');
	}
	function setPaused(v) {
		paused = v; v ? stop() : schedule();
		if (btn) btn.setAttribute('aria-pressed', v), btn.textContent = v ? 'Play motion' : 'Pause motion';
	}
	const onBtn = () => setPaused(!paused);
	function apply() {
		reduced = rmq.matches;
		if (reduced) kill(); else if (!gl) setup();
		if (gl && !reduced && !btn) {
			btn = Object.assign(document.createElement('button'), { type: 'button', className: 'pf-pause' });
			btn.addEventListener('click', onBtn);
			root.append(btn);
			setPaused(paused);
		} else if ((!gl || reduced) && btn) { btn.remove(); btn = null; }
		if (gl) { draw(); schedule(); }
	}

	const ro = new ResizeObserver(() => {
		if (w === root.clientWidth && h === root.clientHeight) return;
		w = root.clientWidth; h = root.clientHeight;
		measure(); size();
		if (pos) alloc(), sample();
		if (!raf) draw();
	});
	const io = new IntersectionObserver((en) => {
		vis = en[en.length - 1].isIntersecting;
		if (vis) { measure(); schedule(); } else stop();
	}, { rootMargin: '64px' });
	const mo = new MutationObserver(() => { colors(); if (!raf) draw(); });
	const L = [
		[dark, 'change', () => { colors(); if (!raf) draw(); }],
		[rmq, 'change', apply],
		[document, 'visibilitychange', () => { if (document.hidden) stop(); else schedule(); }],
		[window, 'scroll', () => { sy = window.scrollY; }],
		[window, 'resize', measure],
	];
	if (pm !== 'off') L.push(
		[root, 'pointermove', (e) => { const r = root.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; ptr.on = 1; }],
		[root, 'pointerleave', () => { ptr.on = 0; }],
	);

	w = root.clientWidth; h = root.clientHeight;
	apply();
	ro.observe(root); io.observe(root);
	mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme', 'style'] });
	for (const [o, ty, f] of L) o.addEventListener(ty, f, { passive: true });

	const cleanup = () => {
		token++;
		ro.disconnect(); io.disconnect(); mo.disconnect();
		for (const [o, ty, f] of L) o.removeEventListener(ty, f, { passive: true });
		kill();
		if (btn) { btn.remove(); btn = null; }
		root.removeAttribute('data-moment-ready');
		pos = vel = seed = tgt = null;
		MOUNTED.delete(root);
	};
	MOUNTED.set(root, cleanup);
	return cleanup;
}
