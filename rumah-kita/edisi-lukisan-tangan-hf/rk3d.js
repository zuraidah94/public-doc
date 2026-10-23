/* ===== Edisi Lukisan Tangan HF — 3D people =====
   Rigged 3D bodies with skeletal animation, drawn into the painted isometric house one person at a time, in the
   game's own depth order. The camera matches the game's 2:1 projection (azimuth 45°, elevation 30°), so a person
   stands exactly where the 2D figure stood. Files are listed in 3d/models.json (Quaternius Universal Base
   Characters + Universal Animation Library, CC0). Without them the game keeps its 2D people. */
import * as THREE from "three";
import { GLTFLoader } from "./vendor/three/jsm/loaders/GLTFLoader.js";
import * as SkeletonUtils from "./vendor/three/jsm/utils/SkeletonUtils.js";
import { analyse, dress, soften } from "./rk3d-wear.js";

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

const base = {}, clips = {}, hairs = {}, A = {};
let M = null;

/* Bake a clip from the source skeleton onto the target skeleton in world space: every joint gets the same
   world-space change from its rest pose as in the source, converted back to the target's local space,
   parents first. The pelvis keeps its height change, so sitting really lowers the body. */
function bake(clip, srcRoot, tgtRoot, fps = 30) {
 const sB = {}, tB = {}, order = [];
 srcRoot.traverse(n => { if (n.isBone) sB[n.name] = n });
 tgtRoot.traverse(n => { if (n.isBone) { tB[n.name] = n; order.push(n.name) } });   /* pre-order: parents first */
 srcRoot.updateMatrixWorld(true); tgtRoot.updateMatrixWorld(true);
 const wq = o2 => o2.getWorldQuaternion(new THREE.Quaternion());
 const s0 = {}, t0 = {}, tp0 = {};
 for (const k of order) { t0[k] = wq(tB[k]); if (sB[k]) s0[k] = wq(sB[k]); tp0[k] = tB[k].parent ? wq(tB[k].parent) : new THREE.Quaternion() }
 const hip = "pelvis", sp0 = sB[hip] && sB[hip].position.clone(), tpos0 = tB[hip] && tB[hip].position.clone();
 const mixer = new THREE.AnimationMixer(srcRoot), action = mixer.clipAction(clip); action.play();
 const n = Math.max(2, Math.round(clip.duration * fps) + 1), times = new Float32Array(n), vals = {}, hipv = new Float32Array(n * 3);
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
  if (sp0 && tpos0) { const d = sB[hip].position.clone().sub(sp0); tpos0.clone().add(d).toArray(hipv, i * 3) }
 }
 action.stop(); mixer.uncacheRoot(srcRoot);
 srcRoot.traverse(n2 => { if (n2.isSkinnedMesh) n2.skeleton.pose() });
 const tracks = order.map(k => new THREE.QuaternionKeyframeTrack(k + ".quaternion", times, vals[k]));
 if (sp0 && tpos0) tracks.push(new THREE.VectorKeyframeTrack(hip + ".position", times, hipv));
 return new THREE.AnimationClip(clip.name, clip.duration, tracks)
}

/* hair pieces are rigid: remember each one's transform relative to the head bone of each body */
function hairFor(key, g) {
 for (const k of ["f", "m"]) {
  let head = null; base[k].traverse(n => { if (n.isBone && /^head$/i.test(n.name)) head = n });
  base[k].updateMatrixWorld(true); g.scene.updateMatrixWorld(true);
  const parts = [];
  g.scene.traverse(n => { if (n.isMesh) parts.push({ geo: n.geometry, mat: n.material, local: new THREE.Matrix4().copy(head.matrixWorld).invert().multiply(n.matrixWorld) }) });
  (hairs[k] = hairs[k] || {})[key] = parts
 }
}

async function load() {
 try {
  if (!renderer) return;
  M = await fetch("3d/models.json").then(r => r.ok ? r.json() : null).catch(() => null);
  if (!M || !M.female || !M.male || !M.anims) { R.why = "3d/models.json: models or animations not added yet"; return }
  const L = new GLTFLoader();
  const [fem, mal, anim] = await Promise.all([M.female, M.male, M.anims].map(u => L.loadAsync("3d/" + u)));
  base.f = fem.scene; base.m = mal.scene;
  for (const k of ["f", "m"]) {
   base[k].traverse(n => { if (n.isMesh || n.isSkinnedMesh) n.frustumCulled = false });
   soften(base[k], k === "f");
   A[k] = analyse(base[k])                                  /* body shape, in its own units, before scaling */
  }
  for (const [key, file] of Object.entries(M.hair || {})) { try { hairFor(key, await L.loadAsync("3d/" + file)) } catch (e) { fail(e) } }
  for (const k of ["f", "m"]) {
   clips[k] = {};
   for (const [name, src] of Object.entries(M.clips || {})) {
    const c = anim.animations.find(a => a.name === src); if (!c) continue;
    try { clips[k][name] = bake(c, anim.scene, base[k]) } catch (e) { fail(e) }
   }
   const box = new THREE.Box3().setFromObject(base[k]), h = box.max.y - box.min.y;
   base[k].scale.setScalar(HUMAN / Math.max(.01, h))
  }
  R.clips = Object.keys(clips.f); R.ready = !!(clips.f.idle && clips.f.walk);
  if (!R.ready) R.why = "the animation file needs Idle_Loop and Walk_Loop"
 } catch (e) { fail(e) }
}

/* which hair piece suits the character's own hair style */
function hairKeys(ap, fem) {
 const h = String(ap && ap.hair || ""), out = [];
 if (ap && ap.hijab && ap.hijab !== "none") return out;              /* the tudung covers the hair */
 if (h !== "bald") {
  if (fem) out.push(/bun|braid|curly|pony|tie/i.test(h) ? "buns" : /pixie|short|buzz|crop/i.test(h) ? "buzzedF" : "long");
  else out.push(/buzz|undercut|crew|fade|shav/i.test(h) ? "buzzed" : "parted");
 }
 if (!fem && ap && ap.facial && ap.facial !== "none") out.push("beard");
 return out
}

const P = new Map();   /* per person: model, mixer, actions, state */
const sig = (ap, fem) => JSON.stringify([fem, ap && [ap.skin, ap.hair, ap.hairColor, ap.hijab, ap.hijabColor, ap.facial, ap.wear, ap.casual, ap.trad, ap.work, ap.sleep]]);
function person(id, fem, ap) {
 const s = sig(ap, fem);
 let p = P.get(id);
 if (p && p.sig === s) return p;
 const k = fem ? "f" : "m";
 const model = SkeletonUtils.clone(base[k]);
 /* clothes, skin and hair for this character */
 let body = null; model.traverse(n => { if (n.isSkinnedMesh && n.name === A[k].body.name) body = n });
 try { dress(model, A[k], ap || {}, fem, body) } catch (e) { fail(e) }
 let head = null; model.traverse(n => { if (n.isBone && /^head$/i.test(n.name)) head = n });
 for (const hk of hairKeys(ap, fem)) for (const part of (hairs[k] && hairs[k][hk]) || []) {
  const mat = part.mat.clone(); mat.color = new THREE.Color(ap && ap.hairColor || "#2a1a12"); mat.side = THREE.DoubleSide;
  const m = new THREE.Mesh(part.geo, mat); m.matrixAutoUpdate = false; m.matrix.copy(part.local); m.frustumCulled = false; head && head.add(m)
 }
 const mixer = new THREE.AnimationMixer(model);
 const act = {}; for (const c in clips[k]) act[c] = mixer.clipAction(clips[k][c]);
 p = { model, mixer, act, fem, sig: s, state: "", t: 0 };
 act.idle.play(); p.state = "idle";
 P.set(id, p); return p
}
const CLIP = { walk: "walk", idle: "idle", talk: "talk", sit: "sit", sittalk: "sittalk", floor: "sit", use: "use", dance: "dance" };
function setState(p, st) {
 let want = CLIP[st] || "idle"; if (!p.act[want]) want = st === "sittalk" || st === "floor" ? "sit" : "idle"; if (!p.act[want]) want = "idle";
 if (p.state === want) return;
 const a = p.act[want], b = p.act[p.state];
 if (a) { a.reset().play(); if (b) a.crossFadeFrom(b, .3, false) }
 p.state = want
}

/* draw one person into the 2D context: feet at (sx, sy), on-screen height ht px, facing dir, state */
R.draw = function (ctx, id, fem, sx, sy, ht, dir, state, ts, ap) {
 if (!R.ready) return false;
 try {
  const p = person(id, fem, ap);
  const dt = p.t ? Math.min(.1, (ts - p.t) / 1000) : 0; p.t = ts;
  setState(p, state);
  p.mixer.update(dt);
  /* seated on the floor (bersila): the chair-sitting clip, lowered to the ground */
  p.model.position.set(0, state === "floor" ? -.42 : 0, 0);
  p.model.rotation.y = dir;
  scene.add(p.model);
  renderer.render(scene, cam);
  scene.remove(p.model);
  const s = ht / (HUMAN * Math.cos(EL) * PXPM);
  ctx.save();
  ctx.fillStyle = "rgba(40,25,15,.28)"; ctx.beginPath(); ctx.ellipse(sx, sy, ht * .2, ht * .1, 0, 0, Math.PI * 2); ctx.fill();
  ctx.drawImage(renderer.domElement, 0, 0, CW, CH, sx - FOOT[0] * s, sy - FOOT[1] * s, CW * s, CH * s);
  ctx.restore();
  R.n++;
  return true
 } catch (e) { fail(e); return false }
};
R.forget = id => P.delete(id);
R._dbg = () => ({ THREE, renderer, scene, cam, base, P, FOOT, PXPM, clips, A, hairs });
load();
