// window.storage for the Apps Script web app. Shared keys are saved in the Google Sheet
// through Code.gs; personal keys (the inspection in progress) stay in this browser.
//
// The app re-saves every list every few seconds, so this only sends records that changed
// since they were last loaded or saved, and only deletes records this browser has seen.
// A phone holding older data therefore can't overwrite records others saved since.
// Photos and signatures go up once each, as files, and travel as "file:<sha256>".
(() => {
  const REF = 'file:';
  const call = (fn, ...args) => new Promise((resolve, reject) =>
    google.script.run.withSuccessHandler(resolve).withFailureHandler(reject)[fn](...args));

  const synced = {};          // key -> Map(id -> record JSON with photo refs), as the server has it
  const lastValue = {};       // key -> the exact value string last loaded or saved
  const queue = {};           // key -> promise chain, so saves to one key run in order
  const onServer = new Set(); // photo hashes the server already has
  const photoOf = new Map(), hashOf = new Map();

  const isPhoto = (v) => typeof v === 'string' && v.startsWith('data:') && v.length > 100;
  const sha256 = async (s) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))]
    .map((b) => b.toString(16).padStart(2, '0')).join('');

  // Photos never change once saved (the name is their hash), so keep them in IndexedDB between visits.
  const db = new Promise((resolve) => {
    try {
      const req = indexedDB.open('irapp-photos', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('p');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch { resolve(null); }
  });
  const cacheOp = async (mode, fn) => {
    const d = await db;
    if (!d) return null;
    return new Promise((resolve) => {
      try {
        const r = fn(d.transaction('p', mode).objectStore('p'));
        r.onsuccess = () => resolve(r.result ?? null);
        r.onerror = () => resolve(null);
      } catch { resolve(null); }
    });
  };
  const remember = (hash, photo) => {
    photoOf.set(hash, photo); hashOf.set(photo, hash);
    cacheOp('readwrite', (s) => s.put(photo, hash));
  };

  const mapStrings = async (v, fn) => {
    if (typeof v === 'string') return fn(v);
    if (Array.isArray(v)) return Promise.all(v.map((x) => mapStrings(x, fn)));
    if (v && typeof v === 'object') {
      const out = {};
      for (const [k, x] of Object.entries(v)) out[k] = await mapStrings(x, fn);
      return out;
    }
    return v;
  };

  async function toRefs(value) {
    const uploads = {};
    const refd = await mapStrings(value, async (s) => {
      if (!isPhoto(s)) return s;
      let h = hashOf.get(s);
      if (!h) { h = await sha256(s); remember(h, s); }
      if (!onServer.has(h)) uploads[h] = s;
      return REF + h;
    });
    return { refd, uploads };
  }

  async function fromRefs(value) {
    const wanted = new Set();
    await mapStrings(value, (s) => { if (s.startsWith(REF)) wanted.add(s.slice(REF.length)); return s; });
    wanted.forEach((h) => onServer.add(h));
    let missing = [...wanted].filter((h) => !photoOf.has(h));
    for (const h of missing) {
      const cached = await cacheOp('readonly', (s) => s.get(h));
      if (cached) { photoOf.set(h, cached); hashOf.set(cached, h); }
    }
    missing = missing.filter((h) => !photoOf.has(h));
    for (let i = 0; i < missing.length; i += 20) {
      const got = JSON.parse(await call('apiFiles', JSON.stringify(missing.slice(i, i + 20))));
      Object.entries(got).forEach(([h, photo]) => remember(h, photo));
    }
    return mapStrings(value, (s) => (s.startsWith(REF) && photoOf.has(s.slice(REF.length)) ? photoOf.get(s.slice(REF.length)) : s));
  }

  const local = (key) => `irapp:personal:${key}`;
  const ls = () => { try { return window.localStorage; } catch { return null; } };
  const isRecordList = (v) => Array.isArray(v) && v.every((x) => x && typeof x === 'object' && x.id != null);
  const inOrder = (key, fn) => (queue[key] = (queue[key] || Promise.resolve()).catch(() => {}).then(fn));

  window.storage = {
    async get(key, shared = false) {
      if (!shared) {
        const value = ls()?.getItem(local(key));
        return value == null ? null : { key, value, shared };
      }
      return inOrder(key, async () => {
        const res = JSON.parse(await call('apiGet', key));
        if (!res) return null;
        let value;
        if ('value' in res) {
          synced[key] = null;
          value = await fromRefs(JSON.parse(res.value));
        } else {
          synced[key] = new Map(res.records.map((r) => [String(r.id), JSON.stringify(r)]));
          value = await fromRefs(res.records);
        }
        lastValue[key] = JSON.stringify(value);
        return { key, value: lastValue[key], shared };
      });
    },

    async set(key, value, shared = false) {
      if (!shared) {
        const s = ls();
        if (!s) throw new Error('Browser storage is not available');
        s.setItem(local(key), value);
        return { key, value, shared };
      }
      return inOrder(key, async () => {
        if (lastValue[key] === value) return { key, value, shared };
        const parsed = JSON.parse(value);
        const { refd, uploads } = await toRefs(parsed);
        let payload, apply;
        if (!isRecordList(refd)) {
          payload = { replace: JSON.stringify(refd), uploads };
          apply = () => { synced[key] = null; };
        } else {
          const known = synced[key] || new Map();
          const now = new Map(refd.map((r) => [String(r.id), JSON.stringify(r)]));
          const upserts = [...now].filter(([id, j]) => known.get(id) !== j).map(([, j]) => j);
          const deletes = [...known.keys()].filter((id) => !now.has(id));
          if (!upserts.length && !deletes.length) { lastValue[key] = value; return { key, value, shared }; }
          payload = { upserts, deletes, uploads };
          apply = () => {
            const m = synced[key] || (synced[key] = new Map());
            upserts.forEach((j) => { const r = JSON.parse(j); m.set(String(r.id), j); });
            deletes.forEach((id) => m.delete(id));
          };
        }
        await call('apiSave', key, JSON.stringify(payload));
        apply();
        Object.keys(uploads).forEach((h) => onServer.add(h));
        lastValue[key] = value;
        return { key, value, shared };
      });
    },

    async delete(key, shared = false) {
      if (!shared) { ls()?.removeItem(local(key)); return { key, deleted: true, shared }; }
      return inOrder(key, async () => {
        await call('apiDelete', key);
        delete synced[key]; delete lastValue[key];
        return { key, deleted: true, shared };
      });
    },

    async list(prefix = '', shared = false) {
      const s = ls(), keys = [], p = local(prefix);
      if (!shared && s) for (let i = 0; i < s.length; i++) if (s.key(i).startsWith(p)) keys.push(s.key(i).slice(local('').length));
      return { keys, prefix, shared };
    },
  };
})();
