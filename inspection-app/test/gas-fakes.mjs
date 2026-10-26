// In-memory stand-ins for the Apps Script services Code.gs uses (SpreadsheetApp, DriveApp,
// Utilities, PropertiesService, LockService, Session), so the real Code.gs can be tested in Node.
// Only the methods Code.gs calls are here.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const signed = (buf) => [...buf].map((b) => (b > 127 ? b - 256 : b));

export function loadAppsScript(codePath) {
  let next = 1;
  const newId = () => 'id' + next++;
  const state = { user: 'owner@impactrank.com.my', props: {}, files: {}, sheets: {}, created: 0, blobReads: 0, cache: {} };

  class Range {
    constructor(sh, r, c, nr, nc) { Object.assign(this, { sh, r, c, nr, nc }); }
    getValues() {
      return Array.from({ length: this.nr }, (_, i) => Array.from({ length: this.nc }, (_, j) =>
        this.sh.cells[this.r - 1 + i]?.[this.c - 1 + j] ?? ''));
    }
    setValues(v) {
      if (v.length !== this.nr || v.some((row) => row.length !== this.nc)) throw new Error('setValues: size does not match range');
      if (this.c - 1 + this.nc > this.sh.maxCols) throw new Error('setValues: past the last column');
      if (this.r - 1 + this.nr > this.sh.maxRows) throw new Error('The coordinates of the range are outside the dimensions of the sheet.');
      v.forEach((row, i) => row.forEach((x, j) => {
        const r = this.r - 1 + i;
        (this.sh.cells[r] ||= [])[this.c - 1 + j] = x;
      }));
    }
    clearContent() { this.setValues(this.getValues().map((row) => row.map(() => ''))); }
  }

  class Sheet {
    constructor(name) { this.name = name; this.cells = []; this.maxCols = 26; this.maxRows = 1000; }
    getName() { return this.name; }
    getLastRow() {
      for (let r = this.cells.length; r > 0; r--) if ((this.cells[r - 1] || []).some((x) => x !== '' && x != null)) return r;
      return 0;
    }
    getLastColumn() {
      let c = 0;
      this.cells.forEach((row) => (row || []).forEach((x, j) => { if (x !== '' && x != null) c = Math.max(c, j + 1); }));
      return c;
    }
    getMaxColumns() { return this.maxCols; }
    insertColumnsAfter(_, n) { this.maxCols += n; }
    getMaxRows() { return this.maxRows; }
    insertRowsAfter(_, n) { this.maxRows += n; }
    getRange(r, c, nr = 1, nc = 1) { return new Range(this, r, c, nr, nc); }
    deleteRow(r) { this.cells.splice(r - 1, 1); }
    appendRow(a) { if (this.getLastRow() >= this.maxRows) this.maxRows++; this.cells[this.getLastRow()] = a.slice(); }
    setFrozenRows() {}
  }

  class Spreadsheet {
    constructor(name) { this.id = newId(); this.name = name; this.sheets = [new Sheet('Sheet1')]; }
    getId() { return this.id; }
    getUrl() { return 'https://docs.google.com/spreadsheets/d/' + this.id; }
    getSheetByName(n) { return this.sheets.find((s) => s.name === n) || null; }
    getSheets() { return this.sheets.slice(); }
    insertSheet(n) { const s = new Sheet(n); this.sheets.push(s); return s; }
    deleteSheet(s) { this.sheets = this.sheets.filter((x) => x !== s); }
  }

  const blob = (bytes, mime) => ({
    getBytes: () => bytes, getContentType: () => mime,
    getDataAsString: () => Buffer.from(bytes.map((b) => b & 255)).toString('utf8'),
  });
  const iterator = (list) => { let i = 0; return { hasNext: () => i < list.length, next: () => list[i++] }; };
  class Folder {
    constructor(name, parent) { this.id = newId(); this.name = name; this.parent = parent; this.children = []; }
    getId() { return this.id; }
    getName() { return this.name; }
    getUrl() { return 'https://drive.google.com/drive/folders/' + this.id; }
    getParents() { return iterator(this.parent ? [this.parent] : []); }
    createFolder(n) { const f = new Folder(n, this); state.files[f.id] = f; if (!state.appFolder) state.appFolder = this; return f; }
    createFile(b, name) {
      const f = { id: newId(), b, name, updated: new Date(), getId() { return this.id; }, getBlob() { state.blobReads++; return this.b; },
        getMimeType() { return this.b.getContentType(); }, getLastUpdated() { return this.updated; } };
      state.files[f.id] = f; this.children.push(f); state.created++;
      return f;
    }
    getFilesByName(n) { return iterator(this.children.filter((f) => f.name === n)); }
    // Test helper: what dragging a file into this folder in Drive does.
    upload(name, text, mime = 'text/html') { const f = this.createFile(blob(signed(Buffer.from(text)), mime), name); state.created--; return f; }
  }

  const spreadsheets = {};
  const gas = {
    SpreadsheetApp: {
      create(n) { const s = new Spreadsheet(n); spreadsheets[s.id] = s; state.ss = s; return s; },
      openById(id) { return spreadsheets[id]; },
    },
    DriveApp: {
      createFolder(n) { const f = new Folder(n); state.files[f.id] = f; return f; },
      getFolderById(id) { return state.files[id]; },
      getFileById(id) { return state.files[id] || { moveTo() {} }; },
    },
    Utilities: {
      DigestAlgorithm: { SHA_256: 'sha256' },
      Charset: { UTF_8: 'utf8' },
      computeDigest: (alg, s) => signed(createHash(alg).update(s, 'utf8').digest()),
      base64Encode: (bytes) => Buffer.from(bytes.map((b) => b & 255)).toString('base64'),
      base64Decode: (s) => signed(Buffer.from(s, 'base64')),
      newBlob: (data, mime, name) => blob(typeof data === 'string' ? signed(Buffer.from(data)) : data, mime, name),
    },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (k) => state.props[k] ?? null,
        setProperty: (k, v) => { state.props[k] = String(v); },
        deleteProperty: (k) => { delete state.props[k]; },
      }),
    },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    CacheService: {
      getScriptCache: () => ({
        get: (k) => state.cache[k] ?? null,
        putAll: (o) => {
          if (Object.values(o).some((v) => Buffer.byteLength(String(v)) > 100 * 1024)) throw new Error('Argument too large');
          Object.assign(state.cache, o);
        },
      }),
    },
    Session: { getActiveUser: () => ({ getEmail: () => state.user }) },
    HtmlService: {
      // Cuts off big pages. The real web app delivered the 240 KB page cut off, so its app script never ran;
      // Google's actual limit isn't known, so this uses 100,000 characters to catch a big page being served.
      createHtmlOutput: (h) => ({ html: h.slice(0, 100000), title: '', setTitle(t) { this.title = t; return this; }, addMetaTag() { return this; } }),
    },
    Logger: { log: () => {} },
  };

  const ctx = vm.createContext({ ...gas, JSON, Math, Date, String, Number, Object, Error, decodeURIComponent });
  vm.runInContext(readFileSync(codePath, 'utf8'), ctx, { filename: 'Code.gs' });
  const tab = (name) => state.ss.getSheetByName(name);
  const rows = (name) => tab(name).getRange(2, 1, Math.max(tab(name).getLastRow() - 1, 0), tab(name).getLastColumn() || 1).getValues();
  return { ctx, state, tab, rows };
}
