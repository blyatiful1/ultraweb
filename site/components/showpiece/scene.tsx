"use client";

// The Compile — R3F scene (loaded only via next/dynamic ssr:false from index.tsx).
// A procedural low-poly bombsite diorama built ONLY from Box/Plane geometries — an
// original composition evocative of a generic A-site, copied from no real map.
// It reads a scroll `progress` (0..1) and cross-fades four stages by progress:
//   (a) wireframe  (b) flat orange dev-grid  (c) directional-lit graphite
//   (d) full light + a cheap additive smoke plume.
// Colors come exclusively from lib/tokens.ts (the sanctioned out-of-cascade source),
// so no literal color lives in this component.

import { Canvas, useFrame } from "@react-three/fiber";
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
function Diorama({ progressRef }: { progressRef: React.RefObject<number> }) {
  const wireRef = useRef<THREE.Group>(null);
  const blockRef = useRef<THREE.Group>(null);
  const solidRef = useRef<THREE.Group>(null);
  const orbitRef = useRef<THREE.Group>(null);
  const dirRef = useRef<THREE.DirectionalLight>(null);
  const ambRef = useRef<THREE.AmbientLight>(null);
  const smokeRef = useRef<THREE.Points>(null);

  const gridTex = useMemo(makeGridTexture, []);
  const smokeTex = useMemo(makeSmokeTexture, []);

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
  const solidMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(tokens.dark.card),
        roughness: 0.92,
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

  // pre-allocated smoke buffers — zero per-frame allocation
  const smoke = useMemo(() => {
    const pos = new Float32Array(SMOKE_COUNT * 3);
    const seed = new Float32Array(SMOKE_COUNT * 4); // radius, angle, speed, phase
    for (let i = 0; i < SMOKE_COUNT; i++) {
      seed[i * 4] = 0.15 + Math.random() * 0.9;
      seed[i * 4 + 1] = Math.random() * Math.PI * 2;
      seed[i * 4 + 2] = 0.25 + Math.random() * 0.5;
      seed[i * 4 + 3] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return { geo, pos, seed };
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

  useFrame((state) => {
    const p = clamp(progressRef.current ?? 0, 0, 1);
    const span = 1 / 3;
    const w0 = clamp(1 - Math.abs(p - 0) / span, 0, 1);
    const w1 = clamp(1 - Math.abs(p - 1 / 3) / span, 0, 1);
    const w2 = clamp(1 - Math.abs(p - 2 / 3) / span, 0, 1);
    const w3 = clamp(1 - Math.abs(p - 1) / span, 0, 1);
    const solid = Math.min(1, w2 + w3);

    wireMat.opacity = w0;
    blockMat.opacity = w1;
    solidMat.opacity = solid;
    if (wireRef.current) wireRef.current.visible = w0 > 0.01;
    if (blockRef.current) blockRef.current.visible = w1 > 0.01;
    if (solidRef.current) solidRef.current.visible = solid > 0.01;

    if (ambRef.current) ambRef.current.intensity = 0.12 + solid * 0.4;
    if (dirRef.current) dirRef.current.intensity = w2 * 0.9 + w3 * 1.6;

    // slow orbit, ≤30° total, driven only by progress (never hijacks scroll)
    if (orbitRef.current) orbitRef.current.rotation.y = (p - 0.5) * 0.52;

    // smoke plume — stage (d) only
    if (smokeRef.current) {
      const on = w3 > 0.01;
      smokeRef.current.visible = on;
      if (on) {
        smokeMat.opacity = w3 * 0.9;
        const t = state.clock.elapsedTime;
        const pos = smoke.pos;
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
        smoke.geo.attributes.position.needsUpdate = true;
      }
    }
  });

  return (
    <>
      <ambientLight ref={ambRef} intensity={0.12} />
      <directionalLight ref={dirRef} position={[6, 9, 4]} intensity={0} color={new THREE.Color(tokens.dark.foreground)} />
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
export default function Scene({ progress, era = 0, narrative }: SceneProps) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [inView, setInView] = useState(true);
  const [hidden, setHidden] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(typeof progress === "number" ? progress : progress.get());

  // keep progress mirror live (MotionValue subscription or number sync)
  useEffect(() => {
    if (typeof progress === "number") {
      progressRef.current = progress;
      return;
    }
    progressRef.current = progress.get();
    return progress.on("change", (v) => {
      progressRef.current = v;
    });
  }, [progress]);

  // WebGL feature detection (exit → poster)
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      setSupported(!!gl);
    } catch {
      setSupported(false);
    }
  }, []);

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
          frameloop={paused ? "never" : "always"}
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
          <Diorama progressRef={progressRef} />
        </Canvas>
      )}
    </div>
  );
}
