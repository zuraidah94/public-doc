/* ===== Edisi Lukisan Tangan HF — 3D people (prototype) =====
   Real rigged 3D bodies with skeletal animation, drawn into the painted isometric house one person at a time,
   in the game's own depth order. The camera matches the game's 2:1 projection (azimuth 45°, elevation 30°),
   so a person stands exactly where the 2D figure stood. Models live in 3d/ (female.glb, male.glb, anims.glb);
   when they are missing the game simply keeps its 2D people. */
import * as THREE from "three";
import { GLTFLoader } from "./vendor/three/jsm/loaders/GLTFLoader.js";
import * as SkeletonUtils from "./vendor/three/jsm/utils/SkeletonUtils.js";

const R = window.RK3D = { ready: false, err: 0, n: 0, why: "" };
const fail = e => { R.err++; R.why = String(e && e.message || e); try { console.warn("RK3D", e) } catch (e2) { } };

/* one small offscreen WebGL canvas, re-used for every person every frame */
const CW = 256, CH = 512, FW = 1.3, FH = FW * CH / CW;
let renderer;
try {
 renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
 renderer.setPixelRatio(1); renderer.setSize(CW, CH, false);
 renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.setClearColor(0x000000, 0);
} catch (e) { fail(e) }
const scene = new THREE.Scene();
scene.add(new THREE.HemisphereLight(0xfff1dc, 0x7a5a3c, 2.1));
const sun = new THREE.DirectionalLight(0xffe0b0, 2.4); sun.position.set(3, 5, 4); scene.add(sun);
const rim = new THREE.DirectionalLight(0xbfd8ff, .8); rim.position.set(-3, 2, -2); scene.add(rim);

/* the game draws ground x to the lower right and ground y to the lower left: game x -> world +X, game y -> world +Z */
const EL = Math.PI / 6, TARGET = new THREE.Vector3(0, .95, 0);
const cam = new THREE.OrthographicCamera(-FW / 2, FW / 2, FH / 2, -FH / 2, .1, 50);
cam.position.set(TARGET.x + 10 * Math.cos(EL) * Math.SQRT1_2, TARGET.y + 10 * Math.sin(EL), TARGET.z + 10 * Math.cos(EL) * Math.SQRT1_2);
cam.lookAt(TARGET); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
const o = new THREE.Vector3(0, 0, 0).project(cam);
const FOOT = [(o.x + 1) / 2 * CW, (1 - o.y) / 2 * CH];        /* where the feet land inside the render */
const PXPM = CW / FW;                                           /* render pixels per metre */
const HUMAN = 1.7;                                              /* every body is normalised to 1.7 m */

const base = {}, clips = {};
function prep(gltf) {
 const root = gltf.scene;
 root.traverse(n => { if (n.isMesh || n.isSkinnedMesh) { n.frustumCulled = false; if (n.material) { n.material.side = THREE.FrontSide } } });
 const box = new THREE.Box3().setFromObject(root), h = box.max.y - box.min.y;
 root.scale.setScalar(HUMAN / Math.max(.01, h));
 return root
}
const meshOf = root => { let m = null; root.traverse(n => { if (!m && n.isSkinnedMesh) m = n }); return m };
/* Bake a clip from the source skeleton onto the target skeleton in world space:
   every joint gets the same world-space change from its rest pose as in the source, converted back to the
   target's local space parent-first. Robust to different rest poses (T vs A) and to rotated / scaled armatures. */
function bake(clip, srcRoot, tgtRoot, fps = 30) {
 const sB = {}, tB = {}, order = [];
 srcRoot.traverse(n => { if (n.isBone) sB[n.name] = n });
 tgtRoot.traverse(n => { if (n.isBone) { tB[n.name] = n; order.push(n.name) } });   /* pre-order: parents first */
 srcRoot.updateMatrixWorld(true); tgtRoot.updateMatrixWorld(true);
 const wq = o => o.getWorldQuaternion(new THREE.Quaternion());
 const s0 = {}, t0 = {}, tp0 = {};
 for (const k of order) { t0[k] = wq(tB[k]); if (sB[k]) s0[k] = wq(sB[k]); tp0[k] = tB[k].parent ? wq(tB[k].parent) : new THREE.Quaternion() }
 const mixer = new THREE.AnimationMixer(srcRoot), action = mixer.clipAction(clip); action.play();
 const n = Math.max(2, Math.round(clip.duration * fps) + 1), times = new Float32Array(n), vals = {};
 for (const k of order) vals[k] = new Float32Array(n * 4);
 const tw = {}, qi = new THREE.Quaternion(), q = new THREE.Quaternion();
 for (let i = 0; i < n; i++) {
  const t = Math.min(clip.duration, i / fps); times[i] = t;
  mixer.setTime(t); srcRoot.updateMatrixWorld(true);
  for (const k of order) {
   const b = tB[k], pw = b.parent && b.parent.isBone && tw[b.parent.name] ? tw[b.parent.name] : tp0[k];
   const w = sB[k] ? wq(sB[k]).multiply(qi.copy(s0[k]).invert()).multiply(t0[k]) : pw.clone().multiply(b.quaternion);
   tw[k] = w; q.copy(pw).invert().multiply(w); q.toArray(vals[k], i * 4)
  }
 }
 action.stop(); mixer.uncacheRoot(srcRoot);
 srcRoot.traverse(n => { if (n.isSkinnedMesh) n.skeleton.pose() });
 return new THREE.AnimationClip(clip.name, clip.duration, order.map(k => new THREE.QuaternionKeyframeTrack(k + ".quaternion", times, vals[k])))
}
async function load() {
 try {
  if (!renderer) return;
  const L = new GLTFLoader();
  const [fem, mal, anim] = await Promise.all(["3d/female.glb", "3d/male.glb", "3d/anims.glb"].map(u => L.loadAsync(u)));
  base.f = prep(fem); base.m = prep(mal);
  /* world-space retarget: each clip is baked onto each body's own skeleton */
  for (const k of ["f", "m"]) {
   clips[k] = {};
   for (const c of anim.animations) { try { clips[k][c.name.toLowerCase()] = bake(c, anim.scene, base[k]) } catch (e) { fail(e) } }
  }
  R.clips = Object.keys(clips.f); R.ready = !!(clips.f.idle && clips.f.walk);
  if (!R.ready) R.why = "anims.glb needs idle + walk clips"
 } catch (e) { fail(e) }
}

const P = new Map();   /* per person: model, mixer, actions, state */
function person(id, fem) {
 let p = P.get(id);
 if (p && p.fem === fem) return p;
 const model = SkeletonUtils.clone(fem ? base.f : base.m);
 const mixer = new THREE.AnimationMixer(model);
 const C = clips[fem ? "f" : "m"], act = {}; for (const k in C) { act[k] = mixer.clipAction(C[k]) }
 const bones = {}; model.traverse(n => { if (n.isBone) bones[n.name.replace(/^mixamorig:?/, "")] = n });
 p = { model, mixer, act, bones, fem, state: "", t: 0, dir: Math.PI * .25 };
 act.idle.play(); p.state = "idle";
 P.set(id, p); return p
}
function setState(p, st) {
 const want = st === "walk" ? "walk" : "idle";
 if (p.state === want) return;
 const a = p.act[want], b = p.act[p.state];
 if (a) { a.reset().play(); if (b) a.crossFadeFrom(b, .25, false) }
 p.state = want
}
/* seated: bend the hips and knees on top of the idle breathing, and lower the body onto the seat */
R.sit = { thigh: 1.55, knee: -1.6 };   /* measured: knees 0.36 m in front of the hips, feet hanging */
function sitBones(p, floor) {
 const B = p.bones, q = new THREE.Quaternion(), ax = new THREE.Vector3(1, 0, 0);
 const bend = (n, ang) => { const b = B[n]; if (!b) return; q.setFromAxisAngle(ax, ang); b.quaternion.multiply(q) };
 const th = R.sit.thigh * (floor ? 1.12 : 1), kn = R.sit.knee * (floor ? 1.45 : 1);
 bend("LeftUpLeg", th); bend("RightUpLeg", th); bend("LeftLeg", kn); bend("RightLeg", kn)
}

/* draw one person into the 2D context: feet at (sx, sy), on-screen height ht px, facing angle dir, state walk/idle/sit */
R.draw = function (ctx, id, fem, sx, sy, ht, dir, state, ts, tint) {
 if (!R.ready) return false;
 try {
  const p = person(id, fem);
  const dt = p.t ? Math.min(.1, (ts - p.t) / 1000) : 0; p.t = ts;
  setState(p, state);
  p.mixer.update(dt);
  const sit = state === "sit" || state === "floor";
  if (sit) sitBones(p, state === "floor");
  p.model.position.set(0, sit ? (state === "floor" ? -.82 : -.47) : 0, 0);
  p.model.rotation.y = dir;
  scene.add(p.model);
  renderer.render(scene, cam);
  scene.remove(p.model);
  const s = ht / (HUMAN * Math.cos(EL) * PXPM);
  /* a soft contact shadow, then the body */
  ctx.save();
  ctx.fillStyle = "rgba(40,25,15,.28)"; ctx.beginPath(); ctx.ellipse(sx, sy, ht * .2, ht * .1, 0, 0, Math.PI * 2); ctx.fill();
  ctx.drawImage(renderer.domElement, 0, 0, CW, CH, sx - FOOT[0] * s, sy - FOOT[1] * s, CW * s, CH * s);
  ctx.restore();
  R.n++;
  return true
 } catch (e) { fail(e); return false }
};
R.forget = id => P.delete(id);
R._dbg = () => ({ THREE, renderer, scene, cam, base, P, FOOT, PXPM, clips });
load();
