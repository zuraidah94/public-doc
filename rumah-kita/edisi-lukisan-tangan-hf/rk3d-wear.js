/* ===== Edisi Lukisan Tangan HF — modest clothing for the 3D people, made from the body itself =====
   The free base bodies come in underwear only. Fitted parts (baju, sleeves, seluar, tudung, hair cap) are shells
   copied from the body's own surface and pushed out along the normals, so they bend with every animation.
   Flowing parts (kain, the lower half of baju kurung, sampin, the bawal drape) are cones whose skin weights are
   borrowed from the nearest body vertices. Colours come from the character's own appearance (ap). */
import * as THREE from "three";

const RX = {
 torso: /^(pelvis|spine_0\d|clavicle_[lr])$/i,
 neck: /^neck/i, head: /^head$/i,
 upper: /^upperarm/i, lower: /^lowerarm/i, hand: /^(hand|index|middle|ring|pinky|thumb)/i,
 thigh: /^thigh/i, calf: /^calf/i, foot: /^(foot|ball)/i
};
const col = c => new THREE.Color(c || "#888888");   /* hex strings are sRGB; three converts them */

/* one-time analysis of a base body: world positions in bind pose, dominant bone per vertex, key heights */
export function analyse(root) {
 root.updateMatrixWorld(true);
 let body = null; root.traverse(n => { if (n.isSkinnedMesh && (!body || n.geometry.attributes.position.count > body.geometry.attributes.position.count)) body = n });
 const g = body.geometry, P = g.attributes.position, N = g.attributes.normal, SI = g.attributes.skinIndex, SW = g.attributes.skinWeight;
 const bones = body.skeleton.bones.map(b => b.name), n = P.count;
 const W = body.matrixWorld, NW = new THREE.Matrix3().getNormalMatrix(W), Wi = new THREE.Matrix4().copy(W).invert(), NWi = new THREE.Matrix3().getNormalMatrix(Wi);
 const wp = new Float32Array(n * 3), wn = new Float32Array(n * 3), dom = new Array(n), v = new THREE.Vector3();
 for (let i = 0; i < n; i++) {
  v.fromBufferAttribute(P, i).applyMatrix4(W); v.toArray(wp, i * 3);
  v.fromBufferAttribute(N, i).applyMatrix3(NW).normalize(); v.toArray(wn, i * 3);
  let bi = 0, bw = -1; for (let k = 0; k < 4; k++) { const w = SW.getComponent(i, k); if (w > bw) { bw = w; bi = SI.getComponent(i, k) } }
  dom[i] = bones[bi] || ""
 }
 const of = re => { const a = []; for (let i = 0; i < n; i++) if (re.test(dom[i])) a.push(i); return a };
 const ys = idx => idx.map(i => wp[i * 3 + 1]);
 const head = of(RX.head), thigh = of(RX.thigh), calf = of(RX.calf), torso = of(RX.torso), foot = of(RX.foot);
 const hy = ys(head), A = {
  body, bones, wp, wn, dom, n, W, Wi, NWi,
  headTop: Math.max(...hy), chin: Math.min(...hy),
  hipY: Math.max(...ys(thigh)), kneeY: Math.min(...ys(thigh)), ankleY: Math.min(...ys(calf)), footY: Math.min(...ys(foot)),
  chestY: Math.max(...ys(torso)) - .2, waistY: 0
 };
 A.waistY = A.hipY + (A.chestY - A.hipY) * .35;
 /* head centre and face window (the body faces +Z in its bind pose) */
 let cx = 0, cz = 0; for (const i of head) { cx += wp[i * 3]; cz += wp[i * 3 + 2] } cx /= head.length; cz /= head.length;
 A.hc = [cx, (A.headTop + A.chin) / 2, cz];
 A.faceZ = Math.max(...head.map(i => wp[i * 3 + 2]));
 return A
}

/* The free bodies are "superhero" builds. Make them ordinary people once, in bind pose, before anything else:
   limbs pulled toward their bone lines, chest and shoulders eased in. Every clone shares this geometry. */
export function soften(root, fem) {
 root.updateMatrixWorld(true);
 let body = null; root.traverse(n => { if (n.isSkinnedMesh && (!body || n.geometry.attributes.position.count > body.geometry.attributes.position.count)) body = n });
 const g = body.geometry, P = g.attributes.position, SI = g.attributes.skinIndex, SW = g.attributes.skinWeight, bones = body.skeleton.bones;
 const W = body.matrixWorld, Wi = new THREE.Matrix4().copy(W).invert(), wpos = b => new THREE.Vector3().setFromMatrixPosition(b.matrixWorld);
 const K = fem ? { upperarm: .12, lowerarm: .08, thigh: .06, calf: .05 } : { upperarm: .2, lowerarm: .14, thigh: .1, calf: .08 };
 const seg = bones.map(b => {
  const key = Object.keys(K).find(k => new RegExp("^" + k + "_[lr]$", "i").test(b.name)); if (!key) return null;
  const kids = b.children.filter(c => c.isBone), c = kids.find(c2 => !/twist/i.test(c2.name)) || kids[0]; if (!c) return null;
  return { a: wpos(b), b: wpos(c), k: K[key] }
 });
 const torso = /^(spine_0[23]|clavicle_[lr])$/i, v = new THREE.Vector3(), q = new THREE.Vector3(), ab = new THREE.Vector3();
 /* torso centre and height range, for easing the chest */
 let ty0 = 1e9, ty1 = -1e9, tz = 0, tn = 0;
 for (let i = 0; i < P.count; i++) {
  let bi = 0, bw = -1; for (let k = 0; k < 4; k++) { const w = SW.getComponent(i, k); if (w > bw) { bw = w; bi = SI.getComponent(i, k) } }
  if (!torso.test(bones[bi].name)) continue; v.fromBufferAttribute(P, i).applyMatrix4(W); ty0 = Math.min(ty0, v.y); ty1 = Math.max(ty1, v.y); tz += v.z; tn++
 }
 tz /= tn || 1; const band = ty0 + (ty1 - ty0) * .45, half = (ty1 - ty0) * .3;
 for (let i = 0; i < P.count; i++) {
  v.fromBufferAttribute(P, i).applyMatrix4(W);
  /* limbs: blend each weighted bone's pull */
  const pull = new THREE.Vector3();
  for (let k = 0; k < 4; k++) {
   const w = SW.getComponent(i, k), sg = seg[SI.getComponent(i, k)]; if (!w || !sg) continue;
   ab.subVectors(sg.b, sg.a); const t = Math.max(0, Math.min(1, q.subVectors(v, sg.a).dot(ab) / ab.lengthSq()));
   q.copy(sg.a).addScaledVector(ab, t); pull.addScaledVector(q.sub(v), sg.k * w)
  }
  v.add(pull);
  /* chest: ease the front in, strongest at chest height */
  const d = Math.abs(v.y - band) / half;
  if (d < 1 && v.z > tz) { const s2 = (1 - d * d) * (fem ? .32 : .18); v.z = tz + (v.z - tz) * (1 - s2) }
  if (!fem && d < 1.4) v.x *= 1 - .06 * Math.max(0, 1 - d / 1.4);
  v.applyMatrix4(Wi); P.setXYZ(i, v.x, v.y, v.z)
 }
 P.needsUpdate = true; g.computeBoundingBox(); g.computeBoundingSphere()
}

/* a shell over the vertices of the chosen regions, lifted off the skin by `off` metres */
function shell(A, keep, off, mat) {
 const g = A.body.geometry, idx = g.index ? g.index.array : null, tri = idx ? idx.length / 3 : A.n / 3;
 const ok = new Uint8Array(A.n); for (let i = 0; i < A.n; i++) ok[i] = keep(i) ? 1 : 0;
 const out = [];
 for (let t = 0; t < tri; t++) { const a = idx ? idx[t * 3] : t * 3, b = idx ? idx[t * 3 + 1] : t * 3 + 1, c = idx ? idx[t * 3 + 2] : t * 3 + 2; if (ok[a] && ok[b] && ok[c]) out.push(a, b, c) }
 if (!out.length) return null;
 const geo = g.clone(); geo.setIndex(out);
 /* push out along the normal, in the mesh's own space */
 const P = geo.attributes.position, N = geo.attributes.normal, v = new THREE.Vector3(), nn = new THREE.Vector3();
 const pos = new Float32Array(P.array.length);
 for (let i = 0; i < P.count; i++) {
  v.set(A.wp[i * 3], A.wp[i * 3 + 1], A.wp[i * 3 + 2]); nn.set(A.wn[i * 3], A.wn[i * 3 + 1], A.wn[i * 3 + 2]);
  v.addScaledVector(nn, off).applyMatrix4(A.Wi); v.toArray(pos, i * 3)
 }
 geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.computeVertexNormals();
 return skinned(A, geo, mat)
}

/* a flared tube (skirt / tunic / drape) around the body between two heights; weights from the nearest body vertices */
function cone(A, y0, y1, fit, flare, mat, opt = {}) {
 const seg = 28, rows = 10, pos = [], ind = [], si = [], sw = [];
 const near = (x, y, z, k = 8) => {
  const best = []; for (let i = 0; i < A.n; i++) {
   if (opt.only && !opt.only.test(A.dom[i])) continue;
   const dx = A.wp[i * 3] - x, dy = A.wp[i * 3 + 1] - y, dz = A.wp[i * 3 + 2] - z, d = dx * dx + dy * dy * 4 + dz * dz;
   if (best.length < k) { best.push([d, i]); best.sort((p, q) => p[0] - q[0]) } else if (d < best[k - 1][0]) { best[k - 1] = [d, i]; best.sort((p, q) => p[0] - q[0]) }
  } return best.map(b => b[1])
 };
 const SI = A.body.geometry.attributes.skinIndex, SW = A.body.geometry.attributes.skinWeight;
 for (let r = 0; r <= rows; r++) {
  const t = r / rows, y = y0 + (y1 - y0) * t;
  /* body cross-section at this height (legs + hips), so the cloth hugs the top and flares toward the hem */
  let minx = 1e9, maxx = -1e9, minz = 1e9, maxz = -1e9;
  const yc = opt.at ?? y;
  for (let i = 0; i < A.n; i++) { const vy = A.wp[i * 3 + 1]; if (Math.abs(vy - yc) > .03 || !fit.test(A.dom[i])) continue; const x = A.wp[i * 3], z = A.wp[i * 3 + 2]; if (x < minx) minx = x; if (x > maxx) maxx = x; if (z < minz) minz = z; if (z > maxz) maxz = z }
  if (minx > maxx) { minx = -.15; maxx = .15; minz = -.12; maxz = .12 }
  const cx = (minx + maxx) / 2, cz = (minz + maxz) / 2, f = 1 + flare * t;
  const rx = ((maxx - minx) / 2 + .025) * f, rz = ((maxz - minz) / 2 + .03) * f;
  for (let s = 0; s < seg; s++) {
   const a = s / seg * Math.PI * 2, x = cx + Math.sin(a) * rx, z = cz + Math.cos(a) * rz;
   pos.push(x, y, z);
   const nb = near(x, y, z); const acc = new Map();
   for (const i of nb) for (let k = 0; k < 4; k++) { const b = SI.getComponent(i, k), w = SW.getComponent(i, k); if (w > 0) acc.set(b, (acc.get(b) || 0) + w) }
   const top = [...acc.entries()].sort((p, q) => q[1] - p[1]).slice(0, 4), tot = top.reduce((s2, e) => s2 + e[1], 0) || 1;
   for (let k = 0; k < 4; k++) { si.push(top[k] ? top[k][0] : 0); sw.push(top[k] ? top[k][1] / tot : 0) }
  }
 }
 for (let r = 0; r < rows; r++) for (let s = 0; s < seg; s++) { const a = r * seg + s, b = r * seg + (s + 1) % seg, c = a + seg, d = b + seg; ind.push(a, c, b, b, c, d) }
 if (opt.cap) {   /* close the top end (songkok crown) */
  const r0 = rows * seg, c0 = pos.length / 3; let x = 0, z = 0; for (let s = 0; s < seg; s++) { x += pos[(r0 + s) * 3]; z += pos[(r0 + s) * 3 + 2] }
  pos.push(x / seg, y1, z / seg); for (let k = 0; k < 4; k++) { si.push(si[r0 * 4 + k]); sw.push(sw[r0 * 4 + k]) }
  for (let s = 0; s < seg; s++) ind.push(r0 + s, c0, r0 + (s + 1) % seg)
 }
 const geo = new THREE.BufferGeometry(), v = new THREE.Vector3(), lp = new Float32Array(pos.length);
 for (let i = 0; i < pos.length; i += 3) { v.fromArray(pos, i).applyMatrix4(A.Wi); v.toArray(lp, i) }
 geo.setAttribute("position", new THREE.BufferAttribute(lp, 3)); geo.setIndex(ind);
 geo.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(si, 4)); geo.setAttribute("skinWeight", new THREE.Float32BufferAttribute(sw, 4));
 geo.computeVertexNormals();
 return skinned(A, geo, mat)
}
let TB = null;   /* the person's own (cloned) body: clothes bind to its skeleton */
function skinned(A, geo, mat) {
 const B = TB || A.body, m = new THREE.SkinnedMesh(geo, mat); m.frustumCulled = false;
 m.bind(B.skeleton, B.bindMatrix); m.bindMode = B.bindMode;
 m.position.copy(B.position); m.quaternion.copy(B.quaternion); m.scale.copy(B.scale);
 m.userData.wear = 1; return m
}
const cloth = (c, rough = .85) => new THREE.MeshStandardMaterial({ color: col(c), roughness: rough, metalness: 0, side: THREE.DoubleSide });

/* dress one person; returns the meshes it added (removed again on re-dress) */
export function dress(root, A, ap, fem, body) {
 const old = []; root.traverse(n => { if (n.userData.wear) old.push(n) }); old.forEach(n => n.parent && n.parent.remove(n));
 TB = body || A.body;
 const parent = TB.parent, add = m => { if (m) parent.add(m) };
 let W2 = ap && ap.wear || "casual"; if (W2 === "raya") W2 = "trad";
 const C = (ap && ap[W2]) || {}, cas = (ap && ap.casual) || {};
 const hij = ap && ap.hijab && ap.hijab !== "none", trad = W2 === "trad", sleep = W2 === "sleep";
 const top = W2 === "work" ? "#e8e4dc" : (W2 === "casual" ? cas.topC : C.c) || (sleep ? "#7aa6c9" : "#3a6ea5");
 const bot = W2 === "work" ? (C.c || "#2b2f38") : (W2 === "casual" ? cas.botC : C.c) || "#2e3a4f";
 const longSleeve = fem ? (hij || trad || W2 === "work") : (trad || W2 === "work");
 const skirt = fem && (trad || /skirt|kain|maxi|dress/i.test(cas.bottom || "") || hij);
 const has = re => i => re.test(A.dom[i]);
 /* skin tone from the character creator, keeping the body's normal and roughness detail */
 TB.material = TB.material.clone(); TB.material.map = null; TB.material.color = col(ap && ap.skin || "#c48d68");
 /* baju / shirt */
 add(shell(A, i => RX.torso.test(A.dom[i]) || RX.upper.test(A.dom[i]) || (longSleeve && RX.lower.test(A.dom[i])) || (RX.neck.test(A.dom[i]) && A.wp[i * 3 + 1] < A.chin + .02), .012, cloth(top)));
 /* a loose hem over the hips, so tops read as shirts rather than bodysuits */
 if (!trad) add(cone(A, A.waistY, A.hipY - .07, /^(pelvis|spine_01|thigh)/i, .12, cloth(top)));
 /* bottoms: kain (long skirt) or seluar (trousers) */
 if (skirt) add(cone(A, A.hipY + .02, A.ankleY - .02, /^(pelvis|thigh|calf)/i, .18, cloth(trad && C.c2 && !fem ? C.c2 : bot)));
 else add(shell(A, i => /^(pelvis|thigh|calf)/i.test(A.dom[i]) && A.wp[i * 3 + 1] > A.footY + .07, .008, cloth(bot)));
 /* baju kurung's long tunic, or a sampin for baju Melayu */
 if (trad && fem) add(cone(A, A.waistY, A.kneeY - .03, /^(pelvis|spine_01|thigh)/i, .15, cloth(C.c)));
 if (trad && !fem) add(cone(A, A.waistY - .02, A.kneeY + .1, /^(pelvis|thigh)/i, .2, cloth(C.c2 || "#c9a14a", .6)));
 /* tudung (face left open) with a bawal drape; hair itself comes from the Quaternius hair pieces */
 const [hx, hy2, hz] = A.hc, face = i => { const x = A.wp[i * 3], y = A.wp[i * 3 + 1], z = A.wp[i * 3 + 2]; return z > hz + .02 && y < A.headTop - .045 && y > A.chin + .015 && Math.abs(x - hx) < .065 };
 if (hij) {
  add(shell(A, i => (RX.head.test(A.dom[i]) || RX.neck.test(A.dom[i])) && !face(i), .016, cloth(ap.hijabColor || "#8a5cc0", .9)));
  add(cone(A, A.chin + .01, A.chin - (A.chin - A.chestY) * .75, /^(neck|spine_03|clavicle)/i, .12, cloth(ap.hijabColor || "#8a5cc0", .9), { only: /^(neck|spine_0[23]|clavicle|head)/i }))
 }
 if (trad && !fem) add(cone(A, A.headTop - .085, A.headTop + .015, /^head$/i, -.04, cloth("#1d1a1a", .5), { at: A.headTop - .07, cap: 1 }));   /* songkok */
 TB = null
}
