"use client";

// The Compile — R3F scene (loaded only via next/dynamic ssr:false from index.tsx).
// A procedural low-poly bombsite diorama built ONLY from Box/Plane geometries — an
// original composition evocative of a generic A-site, copied from no real map.
// It reads a scroll `progress` (0..1) and cross-fades four stages by progress:
//   (a) wireframe  (b) flat orange dev-grid  (c) directional-lit graphite
//   (d) full light + a cheap additive smoke plume.
// Colors come exclusively from lib/tokens.ts (the sanctioned out-of-cascade source),
// so no literal color lives in this component.

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { MotionValue } from "motion/react";
import { tokens } from "@/lib/tokens";
import { StaticPoster } from "./static-poster";

type SceneProps = {
  progress: number | MotionValue<number>;
  era?: number;
  narrative?: string;
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// Deterministic PRNG (mulberry32) — the smoke particle layout is authored once from a
// fixed seed so it is stable across renders (no impure Math.random in a render body).
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── procedural bombsite: ~49 boxes, authored once at module load ──────────────
type Box = { p: [number, number, number]; s: [number, number, number] };
const BOXES: Box[] = [];
const box = (p: [number, number, number], s: [number, number, number]) =>
  BOXES.push({ p, s });

box([0, -0.15, 0], [13, 0.3, 12]); // ground slab
box([2.2, 0.4, -2], [5, 0.8, 4.2]); // site platform
box([2.2, 0.85, -0.1], [5, 0.14, 0.3]); // platform front lip
for (let i = 0; i < 4; i++) box([-1.4 + i * 0.9, 0.12 + i * 0.16, -2], [0.9, 0.24 + i * 0.32, 3.8]); // approach steps
for (let i = 0; i < 5; i++) box([-4.8 + i * 2.4, 1.2, -5.2], [2.3, 2.4, 0.3]); // back wall panels
for (let i = 0; i < 5; i++) box([-4.8 + i * 2.4, 2.55, -5.2], [2.3, 0.3, 0.5]); // back wall cap
for (let i = 0; i < 4; i++) box([-6.1, 1.1, -3.6 + i * 2.4], [0.3, 2.2, 2.3]); // left side wall
for (let i = 0; i < 3; i++) box([5.3, 0.7, -3.4 + i * 2.2], [0.3, 1.4, 2.1]); // right low wall
box([-0.9, 1.0, -4.4], [0.35, 2.0, 0.35]); // doorway post L
box([0.9, 1.0, -4.4], [0.35, 2.0, 0.35]); // doorway post R
box([0, 2.1, -4.4], [2.1, 0.4, 0.35]); // doorway lintel
box([-3.4, 1.1, -1.0], [0.4, 2.2, 0.4]); // catwalk pillar
box([-3.4, 1.1, 1.6], [0.4, 2.2, 0.4]); // catwalk pillar
box([-3.4, 2.35, 0.3], [1.2, 0.25, 3.6]); // catwalk deck
box([-3.4, 2.7, 0.3], [1.2, 0.12, 3.6]); // catwalk rail
box([1.0, 1.05, -2.4], [0.9, 0.9, 0.9]); // site crates
box([2.0, 1.05, -2.7], [0.9, 0.9, 0.9]);
box([2.0, 1.95, -2.7], [0.8, 0.8, 0.8]);
box([3.1, 1.05, -2.2], [0.9, 0.9, 0.9]);
box([1.5, 1.05, -1.3], [0.8, 0.8, 0.8]);
box([3.0, 1.05, -1.4], [0.8, 0.8, 0.8]);
box([-1.8, 0.55, 1.4], [1.1, 1.1, 1.1]); // mid cover
box([-1.8, 1.5, 1.4], [0.9, 0.8, 0.9]);
box([-0.6, 0.5, 2.2], [1.0, 1.0, 1.0]);
box([3.6, 0.5, 2.0], [0.7, 1.0, 0.7]); // front cover
box([4.4, 0.5, 1.6], [0.7, 1.0, 0.7]);
box([2.9, 0.45, 2.6], [0.6, 0.9, 0.6]);
box([-4.6, 0.35, 2.8], [0.7, 0.7, 0.7]); // scattered blocks
box([0.4, 0.35, 3.4], [0.7, 0.7, 0.7]);
box([5.0, 0.35, -1.0], [0.7, 0.7, 0.7]);
box([-5.0, 0.5, -1.0], [0.8, 1.0, 0.8]);
box([-4.2, 0.4, -2.2], [0.7, 0.8, 0.7]);
box([-2.6, 0.5, 3.2], [0.9, 0.9, 0.9]);

const SMOKE_ORIGIN: [number, number, number] = [2.2, 0.95, -2];
const SMOKE_COUNT = 54;

// ── runtime canvas textures (no downloaded assets) ────────────────────────────
function makeGridTexture(): THREE.CanvasTexture {
  const size = 64;
  const cvs = document.createElement("canvas");
  cvs.width = cvs.height = size;
  const ctx = cvs.getContext("2d")!;
  const base = new THREE.Color(tokens.dark.primary);
  const line = base.clone().lerp(new THREE.Color(tokens.dark.foreground), 0.42);
  ctx.fillStyle = `#${base.getHexString()}`;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = `#${line.getHexString()}`;
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, size, size);
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.55;
  for (let g = 16; g < size; g += 16) {
    ctx.beginPath();
    ctx.moveTo(g + 0.5, 0);
    ctx.lineTo(g + 0.5, size);
    ctx.moveTo(0, g + 0.5);
    ctx.lineTo(size, g + 0.5);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(cvs);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 2;
  return tex;
}

function makeSmokeTexture(): THREE.CanvasTexture {
  const size = 64;
  const cvs = document.createElement("canvas");
  cvs.width = cvs.height = size;
  const ctx = cvs.getContext("2d")!;
  ctx.fillStyle = `#${new THREE.Color(tokens.dark.foreground).getHexString()}`;
  for (let i = 0; i < 12; i++) {
    const r = 30 * (1 - i / 12);
    ctx.globalAlpha = 0.05 + i * 0.028;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2);
    ctx.fill();
  }
  return new THREE.CanvasTexture(cvs);
}

// ── the diorama (runs inside the Canvas) ──────────────────────────────────────
function Diorama({ progress, active }: { progress: number | MotionValue<number>; active: boolean }) {
  const wireRef = useRef<THREE.Group>(null);
  const blockRef = useRef<THREE.Group>(null);
  const solidRef = useRef<THREE.Group>(null);
  const orbitRef = useRef<THREE.Group>(null);
  const dirRef = useRef<THREE.DirectionalLight>(null);
  const rimRef = useRef<THREE.DirectionalLight>(null);
  const ambRef = useRef<THREE.AmbientLight>(null);
  const smokeRef = useRef<THREE.Points>(null);

  // Under frameloop="demand" (see <Scene>), a MotionValue change must force a frame,
  // so we drive R3F's invalidate() from the scroll subscription and from the smoke loop.
  const invalidate = useThree((s) => s.invalidate);
  const progressRef = useRef(typeof progress === "number" ? progress : progress.get());

  const gridTex = useMemo(() => makeGridTexture(), []);
  const smokeTex = useMemo(() => makeSmokeTexture(), []);

  const wireMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(tokens.dark.foreground),
        wireframe: true,
        transparent: true,
        depthWrite: false,
      }),
    [],
  );
  const blockMat = useMemo(
    () => new THREE.MeshBasicMaterial({ map: gridTex, transparent: true, depthWrite: false }),
    [gridTex],
  );
  // Stage (c)/(d) solid: base luminance lifted off near-black `card` toward the neutral
  // `mutedForeground`, plus a faint emissive floor so the diorama never reads as a black
  // void even before the key/rim lights ramp in. All channels derived from lib/tokens.ts.
  const solidMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(tokens.dark.card).lerp(new THREE.Color(tokens.dark.mutedForeground), 0.5),
        emissive: new THREE.Color(tokens.dark.mutedForeground),
        emissiveIntensity: 0.16,
        roughness: 0.85,
        metalness: 0.02,
        transparent: true,
      }),
    [],
  );
  const smokeMat = useMemo(
    () =>
      new THREE.PointsMaterial({
        map: smokeTex,
        color: new THREE.Color(tokens.dark.worldCs2),
        size: 1.7,
        sizeAttenuation: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0,
      }),
    [smokeTex],
  );

  // pre-allocated smoke buffers — zero per-frame allocation, deterministic layout
  const smoke = useMemo(() => {
    const pos = new Float32Array(SMOKE_COUNT * 3);
    const seed = new Float32Array(SMOKE_COUNT * 4); // radius, angle, speed, phase
    const rand = mulberry32(0x5eed1234);
    for (let i = 0; i < SMOKE_COUNT; i++) {
      seed[i * 4] = 0.15 + rand() * 0.9;
      seed[i * 4 + 1] = rand() * Math.PI * 2;
      seed[i * 4 + 2] = 0.25 + rand() * 0.5;
      seed[i * 4 + 3] = rand();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return { geo, seed };
  }, []);

  useEffect(() => {
    return () => {
      wireMat.dispose();
      blockMat.dispose();
      solidMat.dispose();
      smokeMat.dispose();
      gridTex.dispose();
      smokeTex.dispose();
      smoke.geo.dispose();
    };
  }, [wireMat, blockMat, solidMat, smokeMat, gridTex, smokeTex, smoke]);

  // Mirror scroll progress into a ref AND invalidate a frame on every change, so ANY
  // scroll arrival (wheel, hash-link jump, restored position, programmatic scrollTo)
  // repaints — not just continuous wheel deltas. While offscreen the loop is "never",
  // where invalidate() is a no-op, so the pause is preserved.
  useEffect(() => {
    if (typeof progress === "number") {
      progressRef.current = progress;
      invalidate();
      return;
    }
    progressRef.current = progress.get();
    invalidate();
    return progress.on("change", (v) => {
      progressRef.current = v;
      invalidate();
    });
  }, [progress, invalidate]);

  // Resuming from the offscreen/hidden pause (frameloop "never" → "demand") does not by
  // itself schedule a frame; force one so the diorama repaints at the current scroll
  // position the moment it becomes visible again.
  useEffect(() => {
    if (active) invalidate();
  }, [active, invalidate]);

  useFrame((state) => {
    const p = clamp(progressRef.current ?? 0, 0, 1);
    const span = 1 / 3;
    const w0 = clamp(1 - Math.abs(p - 0) / span, 0, 1);
    const w1 = clamp(1 - Math.abs(p - 1 / 3) / span, 0, 1);
    const w2 = clamp(1 - Math.abs(p - 2 / 3) / span, 0, 1);
    const w3 = clamp(1 - Math.abs(p - 1) / span, 0, 1);
    const solid = Math.min(1, w2 + w3);

    // Stage cross-fade weights — materials are shared per stage and reached through the
    // group refs (mutating ref.current is the sanctioned R3F pattern; no hook value is
    // mutated directly). children[0] is always the first box mesh of the group.
    if (wireRef.current) {
      (((wireRef.current.children[0] as THREE.Mesh).material) as THREE.Material).opacity = w0;
      wireRef.current.visible = w0 > 0.01;
    }
    if (blockRef.current) {
      (((blockRef.current.children[0] as THREE.Mesh).material) as THREE.Material).opacity = w1;
      blockRef.current.visible = w1 > 0.01;
    }
    if (solidRef.current) {
      (((solidRef.current.children[0] as THREE.Mesh).material) as THREE.Material).opacity = solid;
      solidRef.current.visible = solid > 0.01;
    }

    // Lighting: ambient floor + key light lift stages (c)/(d) off black; a rim/key light
    // ramps in across those stages so the mid-journey diorama stays legible, never a void.
    if (ambRef.current) ambRef.current.intensity = 0.25 + solid * 0.55;
    if (dirRef.current) dirRef.current.intensity = w2 * 1.1 + w3 * 1.6;
    if (rimRef.current) rimRef.current.intensity = solid * 0.75;

    // slow orbit, ≤30° total, driven only by progress (never hijacks scroll)
    if (orbitRef.current) orbitRef.current.rotation.y = (p - 0.5) * 0.52;

    // smoke plume — stage (d) only
    if (smokeRef.current) {
      const on = w3 > 0.01;
      smokeRef.current.visible = on;
      if (on) {
        (smokeRef.current.material as THREE.PointsMaterial).opacity = w3 * 0.9;
        const t = state.clock.elapsedTime;
        const posAttr = smokeRef.current.geometry.attributes.position;
        const pos = posAttr.array as Float32Array;
        const seed = smoke.seed;
        for (let i = 0; i < SMOKE_COUNT; i++) {
          const r = seed[i * 4];
          const ang = seed[i * 4 + 1];
          const speed = seed[i * 4 + 2];
          let ph = seed[i * 4 + 3] + t * speed * 0.11;
          ph -= Math.floor(ph); // wrap 0..1
          const h = ph * 4.6;
          const spread = 0.4 + ph * 1.5;
          pos[i * 3] = SMOKE_ORIGIN[0] + Math.cos(ang) * r * spread;
          pos[i * 3 + 1] = SMOKE_ORIGIN[1] + h;
          pos[i * 3 + 2] = SMOKE_ORIGIN[2] + Math.sin(ang) * r * spread;
        }
        posAttr.needsUpdate = true;
        // the plume is a living, continuous animation: keep the demand loop alive while
        // it is visible (self-sustaining), then idle again once we scroll off stage (d).
        invalidate();
      }
    }
  });

  return (
    <>
      <ambientLight ref={ambRef} intensity={0.25} />
      <directionalLight ref={dirRef} position={[6, 9, 4]} intensity={0} color={new THREE.Color(tokens.dark.foreground)} />
      <directionalLight ref={rimRef} position={[-7, 5, -4]} intensity={0} color={new THREE.Color(tokens.dark.foreground)} />
      <group ref={orbitRef}>
        <group ref={wireRef}>
          {BOXES.map((b, i) => (
            <mesh key={`w${i}`} position={b.p} material={wireMat}>
              <boxGeometry args={b.s} />
            </mesh>
          ))}
        </group>
        <group ref={blockRef} visible={false}>
          {BOXES.map((b, i) => (
            <mesh key={`b${i}`} position={b.p} material={blockMat}>
              <boxGeometry args={b.s} />
            </mesh>
          ))}
        </group>
        <group ref={solidRef} visible={false}>
          {BOXES.map((b, i) => (
            <mesh key={`s${i}`} position={b.p} material={solidMat}>
              <boxGeometry args={b.s} />
            </mesh>
          ))}
        </group>
        <points ref={smokeRef} visible={false}>
          <primitive object={smoke.geo} attach="geometry" />
          <primitive object={smokeMat} attach="material" />
        </points>
      </group>
    </>
  );
}

// ── Canvas wrapper: WebGL detection, offscreen/hidden pause, three exits ───────
function detectWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    return !!gl;
  } catch {
    return false;
  }
}

export default function Scene({ progress, era = 0, narrative }: SceneProps) {
  // This module is loaded only via next/dynamic ssr:false, so it always runs on the
  // client — WebGL support can be detected synchronously in a lazy initializer (no
  // setState-in-effect). Context loss later flips this to false (event handler → poster).
  const [supported, setSupported] = useState<boolean | null>(() => detectWebGL());
  const [inView, setInView] = useState(true);
  const [hidden, setHidden] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // pause the loop when offscreen or tab hidden
  useEffect(() => {
    const el = containerRef.current;
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    let io: IntersectionObserver | undefined;
    if (el) {
      io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.01 });
      io.observe(el);
    }
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      io?.disconnect();
    };
  }, [supported]);

  const currentEra = clamp(Math.round(era), 0, 3);
  const paused = hidden || !inView;

  return (
    <div ref={containerRef} className="h-full w-full">
      {supported !== true ? (
        <StaticPoster era={currentEra} narrative={narrative} />
      ) : (
        <Canvas
          className="h-full w-full"
          dpr={[1, 2]}
          // Demand-driven: the diorama repaints on every scroll change (via invalidate in
          // Diorama) and self-sustains only while the smoke plume is live; "never" fully
          // pauses it offscreen/hidden. Any scroll arrival while visible forces a frame.
          frameloop={paused ? "never" : "demand"}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          camera={{ position: [10, 7.5, 10], fov: 32 }}
          onCreated={({ camera, gl }) => {
            camera.lookAt(1, 0.7, -1.2);
            gl.domElement.addEventListener(
              "webglcontextlost",
              (ev) => {
                ev.preventDefault();
                setSupported(false);
              },
              { once: true },
            );
          }}
        >
          <Diorama progress={progress} active={!paused} />
        </Canvas>
      )}
    </div>
  );
}
