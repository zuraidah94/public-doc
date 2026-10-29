// window.storage for the Apps Script web app. Shared keys are saved in the Google Sheet
// through Code.gs; personal keys (the inspection in progress) stay in this browser.
//
// The app re-saves every list every few seconds, so this only sends records the app changed since
// it last handed the list over, and only deletes records the app had in that list and then removed.
// A phone holding older data therefore can't overwrite or remove records others saved since, even
// when it has fetched them but not shown them yet.
// Photos and signatures go up once each, as files, and travel as "file:<sha256>".
//
// Every change goes into an outbox in this browser before it is sent, and leaves it only once
// Google has it. A refresh, a closed tab or no signal therefore loses nothing: the outbox is sent
// again every 15 seconds, when the connection comes back, and the next time the app opens, and
// a badge says how many changes are still waiting.
(() => {
  const REF = 'file:';
  const call = (fn, ...args) => new Promise((resolve, reject) =>
    google.script.run.withSuccessHandler(resolve).withFailureHandler(reject)[fn](...args));

  const synced = {};          // key -> Map(id -> record JSON with photo refs), as the server has it
  const lastValue = {};       // key -> the exact value string last loaded or saved
  const lastList = {};        // key -> Map(id -> record JSON with photo refs) of the list the app last handed over
  const fetched = {};         // key -> the same for the list last loaded; it counts once the app hands it back
  const queue = {};           // key -> promise chain, so loads, saves and resends of one key run in order
  const onServer = new Set(); // photo hashes the server already has
  const photoOf = new Map(), hashOf = new Map();

  const isPhoto = (v) => typeof v === 'string' && v.startsWith('data:') && v.length > 100;
  const sha256 = async (s) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))]
    .map((b) => b.toString(16).padStart(2, '0')).join('');

  // IndexedDB: photos by hash ('p'; they never change once saved) and the personal keys ('kv').
  // It holds far more than localStorage, so an inspection in progress with many photos still fits.
  const db = new Promise((resolve) => {
    try {
      const req = indexedDB.open('irapp-photos', 2);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains('p')) req.result.createObjectStore('p');
        if (!req.result.objectStoreNames.contains('kv')) req.result.createObjectStore('kv');
      };
      req.onsuccess = () => { req.result.onversionchange = () => req.result.close(); resolve(req.result); };
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);   // another tab holds an older version open: carry on without it
    } catch { resolve(null); }
  });
  const idb = async (store, mode, fn) => {
    const d = await db;
    if (!d) return null;
    return new Promise((resolve) => {
      try {
        const tx = d.transaction(store, mode), r = fn(tx.objectStore(store));
        if (mode === 'readwrite') { tx.oncomplete = () => resolve(true); tx.onerror = tx.onabort = () => resolve(null); }
        else { r.onsuccess = () => resolve(r.result ?? null); r.onerror = () => resolve(null); }
      } catch { resolve(null); }
    });
  };
  const remember = (hash, photo) => {
    photoOf.set(hash, photo); hashOf.set(photo, hash);
    return idb('p', 'readwrite', (s) => s.put(photo, hash));
  };
  const photo = async (h) => photoOf.get(h) || await idb('p', 'readonly', (s) => s.get(h));

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
  // Photo hashes referenced in a JSON text (also inside JSON nested as a string, where quotes are escaped).
  const refsIn = (json) => [...String(json).matchAll(/file:([0-9a-f]{64})/g)].map((m) => m[1]);

  // Replace photos with refs. New photos are stored in IndexedDB before the record goes in the
  // outbox, so a resend after a refresh can still upload them.
  async function toRefs(value) {
    const stored = [];
    const refd = await mapStrings(value, async (s) => {
      if (!isPhoto(s)) return s;
      let h = hashOf.get(s);
      if (!h) { h = await sha256(s); stored.push(remember(h, s)); }
      return REF + h;
    });
    await Promise.all(stored);
    return refd;
  }

  async function fromRefs(value) {
    const wanted = new Set();
    await mapStrings(value, (s) => { if (s.startsWith(REF)) wanted.add(s.slice(REF.length)); return s; });
    let missing = [...wanted].filter((h) => !photoOf.has(h));
    for (const h of missing) {
      const cached = await idb('p', 'readonly', (s) => s.get(h));
      if (cached) { photoOf.set(h, cached); hashOf.set(cached, h); }
    }
    missing = missing.filter((h) => !photoOf.has(h));
    for (let i = 0; i < missing.length; i += 20) {
      const got = JSON.parse(await call('apiFiles', JSON.stringify(missing.slice(i, i + 20))));
      Object.entries(got).forEach(([h, p]) => { onServer.add(h); remember(h, p); });
    }
    return mapStrings(value, (s) => (s.startsWith(REF) && photoOf.has(s.slice(REF.length)) ? photoOf.get(s.slice(REF.length)) : s));
  }

  const local = (key) => `irapp:personal:${key}`;   // localStorage fallback for the personal keys
  const ls = () => { try { return window.localStorage; } catch { return null; } };
  const isRecordList = (v) => Array.isArray(v) && v.every((x) => x && typeof x === 'object' && x.id != null);
  const inOrder = (key, fn) => (queue[key] = (queue[key] || Promise.resolve()).catch(() => {}).then(fn));

  // ── Outbox: key -> {upserts: {id: json}, deletes: [id], replace?: json, blindIds?: [id], blind?: true} ──
  // "blindIds" are records added without a successful load of that key, and "blind" marks a replace
  // made that way; when they are sent, data that already exists on the server is left alone, so it
  // can't be overwritten (for example the default user list over changed passwords). Changes made
  // with the data loaded stay real edits even if more are added later without a load.
  const OUTBOX = 'irapp:outbox:v1';
  const readOutbox = () => { try { return JSON.parse(ls()?.getItem(OUTBOX) || '{}'); } catch { return {}; } };
  const writeOutbox = (box) => {
    const s = ls();
    if (!s) throw new Error('Browser storage is not available, so changes cannot be kept until they upload');
    Object.keys(box).length ? s.setItem(OUTBOX, JSON.stringify(box)) : s.removeItem(OUTBOX);
    badge(box);
  };
  const pending = (box) => Object.values(box).reduce((n, e) => n + Object.keys(e.upserts || {}).length + (e.deletes || []).length + (e.replace != null ? 1 : 0), 0);
  const loaded = {};          // key -> true once a load from the server has succeeded
  let lastError = '';         // why Google refused the last save, when it wasn't just a lost connection
  const isNetworkError = (e) => /network|connection|http 0|failed to fetch|timed? ?out|offline/i.test(String(e?.message || e));
  const failed = (e) => { if (!isNetworkError(e)) { lastError = String(e?.message || e); badge(); } };

  function badge(box = readOutbox()) {
    const n = pending(box);
    let el = document.getElementById('irapp-outbox');
    if (!n) { if (el) el.remove(); return; }
    if (!document.body) return;
    if (!el) {
      el = document.body.appendChild(document.createElement('div'));
      el.id = 'irapp-outbox';
      el.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:9999;max-width:calc(100% - 16px);background:#fef3c7;color:#92400e;' +
        'border:1px solid #f59e0b;border-radius:999px;padding:6px 12px;font:600 12px sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.15)';
    }
    if (lastError) {
      el.style.background = '#fee2e2'; el.style.color = '#991b1b'; el.style.borderColor = '#ef4444';
      el.textContent = `⚠️ ${n} change${n === 1 ? '' : 's'} saved on this device but Google refused them: ${lastError}`;
    } else {
      el.style.background = '#fef3c7'; el.style.color = '#92400e'; el.style.borderColor = '#f59e0b';
      el.textContent = `⏳ ${n} change${n === 1 ? '' : 's'} saved on this device, waiting to upload. They upload by themselves when there is internet.`;
    }
  }

  // Send one key's outbox entry. Runs inside inOrder(key). Throws if Google can't be reached.
  async function send(key) {
    const box = readOutbox(), entry = box[key];
    if (!entry) return;
    // An outbox written by the previous version marks a whole record list "blind".
    const blindIds = entry.blind && entry.replace == null ? Object.keys(entry.upserts || {}) : (entry.blindIds || []);
    if (entry.blind || blindIds.length) {
      const raw = await call('apiGet', key), res = JSON.parse(raw);
      refsIn(raw).forEach((h) => onServer.add(h));
      const there = new Set((res?.records || []).map((r) => String(r.id)));
      blindIds.forEach((id) => { if (there.has(id)) delete entry.upserts[id]; });
      if (entry.blind && entry.replace != null && res && ('value' in res || res.records?.length)) delete entry.replace;
      if (entry.blind) entry.deletes = [];
      if (res?.records) { synced[key] = new Map(res.records.map((r) => [String(r.id), JSON.stringify(r)])); loaded[key] = true; }
      delete entry.blind; delete entry.blindIds;
    }
    const jsons = entry.replace != null ? [entry.replace] : Object.values(entry.upserts || {});
    const uploads = {};
    for (const h of new Set(jsons.flatMap(refsIn))) {
      if (onServer.has(h)) continue;
      const p = await photo(h);
      if (p) uploads[h] = p;
    }
    const payload = entry.replace != null ? { replace: entry.replace, uploads } : { upserts: jsons, deletes: entry.deletes || [], uploads };
    if (payload.replace == null && !payload.upserts.length && !payload.deletes.length) {
      const now = readOutbox(); delete now[key]; writeOutbox(now);   // re-read: other keys may have changed meanwhile
      return;
    }
    await call('apiSave', key, JSON.stringify(payload));
    if (entry.replace != null) synced[key] = null;
    else {
      const m = synced[key] || (synced[key] = new Map());
      jsons.forEach((j) => m.set(String(JSON.parse(j).id), j));
      (entry.deletes || []).forEach((id) => m.delete(id));
    }
    Object.keys(uploads).forEach((h) => onServer.add(h));
    // Remove exactly what was sent: another tab may have queued more changes to this key meanwhile.
    const now = readOutbox(), cur = now[key];
    if (cur) {
      if (entry.replace != null) { if (cur.replace === entry.replace) delete now[key]; }
      else {
        jsons.forEach((j) => { const id = String(JSON.parse(j).id); if (cur.upserts?.[id] === j) delete cur.upserts[id]; });
        cur.deletes = (cur.deletes || []).filter((id) => !(entry.deletes || []).includes(id));
        if (cur.blindIds) cur.blindIds = cur.blindIds.filter((id) => id in (cur.upserts || {}));
        if (cur.replace == null && !Object.keys(cur.upserts || {}).length && !cur.deletes.length) delete now[key];
      }
    }
    lastError = '';
    writeOutbox(now);
  }
  const sendAll = () => Object.keys(readOutbox()).forEach((key) => inOrder(key, () => send(key)).catch(failed));
  setInterval(() => { if (pending(readOutbox())) sendAll(); }, 15000);
  window.addEventListener('online', sendAll);
  document.addEventListener('DOMContentLoaded', () => badge());

  // Put the outbox's not-yet-sent changes on top of what the server returned, so the app shows them.
  const withOutbox = (key, records) => {
    const entry = readOutbox()[key];
    if (!entry) return records;
    if (entry.replace != null) return JSON.parse(entry.replace);
    const byId = new Map((records || []).map((r) => [String(r.id), r]));
    (entry.deletes || []).forEach((id) => byId.delete(id));
    Object.entries(entry.upserts || {}).forEach(([id, j]) => byId.set(id, JSON.parse(j)));
    return [...byId.values()];
  };

  window.storage = {
    async get(key, shared = false) {
      if (!shared) {
        const value = (await idb('kv', 'readonly', (s) => s.get(key))) ?? ls()?.getItem(local(key));
        return value == null ? null : { key, value, shared };
      }
      return inOrder(key, async () => {
        try { await send(key); } catch (e) { failed(e); /* shown from the outbox below */ }
        let res;
        let raw;
        try { raw = await call('apiGet', key); res = JSON.parse(raw); } catch (e) {
          const entry = readOutbox()[key];
          if (!entry) throw e;
          const list = withOutbox(key, []);
          const value = await fromRefs(list);
          lastValue[key] = JSON.stringify(value);
          fetched[key] = isRecordList(list) ? new Map(list.map((r) => [String(r.id), JSON.stringify(r)])) : null;
          return { key, value: lastValue[key], shared };
        }
        loaded[key] = true;
        refsIn(raw).forEach((h) => onServer.add(h));   // photos in the server's records are already there
        let value;
        if (res && 'value' in res) {
          synced[key] = null;
          value = withOutbox(key, JSON.parse(res.value));
        } else {
          synced[key] = new Map((res?.records || []).map((r) => [String(r.id), JSON.stringify(r)]));
          if (!res && !readOutbox()[key]) return null;
          value = withOutbox(key, res?.records || []);
        }
        const list = value;
        value = await fromRefs(value);
        lastValue[key] = JSON.stringify(value);
        fetched[key] = isRecordList(list) ? new Map(list.map((r) => [String(r.id), JSON.stringify(r)])) : null;
        return { key, value: lastValue[key], shared };
      });
    },

    async set(key, value, shared = false) {
      if (!shared) {
        if (await idb('kv', 'readwrite', (s) => s.put(value, key))) { ls()?.removeItem(local(key)); return { key, value, shared }; }
        const s = ls();
        if (!s) throw new Error('Browser storage is not available');
        s.setItem(local(key), value);
        return { key, value, shared };
      }
      return inOrder(key, async () => {
        if (lastValue[key] === value) {
          // The app shows exactly what was loaded, so from now on it has those records.
          if (fetched[key]) { lastList[key] = fetched[key]; fetched[key] = null; }
          return { key, value, shared };
        }
        fetched[key] = null;
        const refd = await toRefs(JSON.parse(value));
        const box = readOutbox();
        const entry = box[key] || { upserts: {}, deletes: [] };
        if (!isRecordList(refd)) {
          // Blind unless it builds on a replace already waiting here (which the app was shown).
          const blind = entry.blind || (!loaded[key] && entry.replace == null);
          box[key] = { replace: JSON.stringify(refd), upserts: {}, deletes: [], ...(blind ? { blind: true } : {}) };
        } else {
          delete entry.replace;
          // "had" is the list the app last handed over or was given. A record it shows unchanged is
          // left alone, even if the server has a newer version (someone else's edit stays); a record
          // missing from "now" is deleted only if the app had it, so one fetched but not yet shown stays.
          const known = synced[key] || new Map();
          const had = lastList[key] || new Map();
          const now = new Map(refd.map((r) => [String(r.id), JSON.stringify(r)]));
          const blind = new Set(entry.blindIds || []);
          now.forEach((j, id) => {
            if (id in entry.upserts) { entry.upserts[id] = j; return; }
            if (known.get(id) === j || had.get(id) === j) return;
            if (!loaded[key] && !known.has(id)) blind.add(id);
            entry.upserts[id] = j;
          });
          Object.keys(entry.upserts).forEach((id) => { if (!now.has(id)) delete entry.upserts[id]; });
          entry.blindIds = [...blind].filter((id) => id in entry.upserts);
          if (!entry.blindIds.length) delete entry.blindIds;
          entry.deletes = [...new Set([...(entry.deletes || []), ...had.keys()])].filter((id) => !now.has(id));
          if (Object.keys(entry.upserts).length || entry.deletes.length) box[key] = entry; else delete box[key];
        }
        writeOutbox(box);            // kept on this device first; throws only if that fails
        lastValue[key] = value;
        lastList[key] = isRecordList(refd) ? new Map(refd.map((r) => [String(r.id), JSON.stringify(r)])) : null;
        try { await send(key); } catch (e) { failed(e); /* stays in the outbox and is sent again later */ }
        return { key, value, shared };
      });
    },

    async delete(key, shared = false) {
      if (!shared) {
        await idb('kv', 'readwrite', (s) => s.delete(key));
        ls()?.removeItem(local(key));
        return { key, deleted: true, shared };
      }
      return inOrder(key, async () => {
        await call('apiDelete', key);
        const box = readOutbox(); delete box[key]; writeOutbox(box);
        delete synced[key]; delete lastValue[key]; delete lastList[key]; delete fetched[key];
        return { key, deleted: true, shared };
      });
    },

    async list(prefix = '', shared = false) {
      return { keys: [], prefix, shared };
    },
  };
})();
