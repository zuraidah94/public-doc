/**
 * Workplace Inspection (HACCP, Safety, Environmental) — Google Apps Script backend.
 *
 * Serves the app (Index.html) as a web app and keeps its records in a Google Sheet:
 * one tab per data list, one row per record. Photos and signatures are saved as files
 * in a Drive folder and kept in the records as "file:<sha256>" references.
 * Setup and deployment steps are in inspection-app/README.md.
 */

// The app's shared window.storage keys. Each one gets its own tab.
const STORE_KEYS = ['app-users', 'inspections-data', 'inspection-schedules', 'inspection-drafts', 'corrective-actions'];
const CHUNK = 45000;               // a cell holds at most 50,000 characters
const MARK = '~';                  // starts every JSON cell so Sheets never reads it as a number, date or formula
const WHOLE_VALUE_ID = '__value__'; // row id used when a value is not a list of records with ids
const REF = 'file:';
// Headers of the two readable tabs. summarise_ rewrites them, so a new column reaches existing spreadsheets.
const INSPECTION_HEADER = ['Date', 'Inspectors', 'Forms', 'Overall', 'NG items', 'Status',
  'IR-PP-02.1 verified by', 'IR-PP-13.1 verified by', 'IR-PP-14.1 verified by', 'OSHP-06.02 reviewed by',
  'ISO 14001 reviewed by', 'Submitted', 'Record id'];
const NG_HEADER = ['Date', 'System', 'Area', 'Section', 'Item', 'Remarks', 'Photos', 'Record id'];

let store;

function doGet() {
  const problem = accessProblem_();
  if (problem) {
    return HtmlService.createHtmlOutput('<p style="font:16px sans-serif;padding:24px">' + escape_(problem) + '</p>')
      .setTitle('No access');
  }
  const page = page_();
  if (!page.shell) {
    return HtmlService.createHtmlOutput('<p style="font:16px sans-serif;padding:24px">' + escape_(page.problem) + '</p>')
      .setTitle('Setup needed');
  }
  return HtmlService.createHtmlOutput(page.shell)
    .setTitle('Workplace Inspection')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Run once from the Apps Script editor. Creates the records spreadsheet and photos folder and logs their links. */
function setup() {
  const s = store_();
  Logger.log('Records spreadsheet: ' + s.ss.getUrl());
  Logger.log('Photos folder: ' + s.photos.getUrl());
  Logger.log('Upload Index.html to: ' + s.photos.getParents().next().getUrl());
}

// The app page is the Index.html file uploaded to the HACCP Inspection App folder, not a file in this
// project: it is too big to paste into the Apps Script editor reliably, and uploading a new one updates
// the app without a new deployment.
//
// The page is served without its big app script (about 230 KB): served whole, the script reached the
// browser cut off and never ran. In its place goes a small loader that fetches the script in pieces
// through google.script.run (apiAppCode) and runs it.
const PAGE_FILE = 'Index.html';
const PAGE_END = '<!-- end of Index.html -->';
const APP_OPEN = '<script id="app-code">';
const APP_PART = 90000;
const APP_LOADER = '<script>\n(function () {\n' +
  '  var parts = [];\n' +
  '  function fail(e) { window.__startError("Could not load the app code: " + ((e && e.message) || e)); }\n' +
  '  function get(i, done) { google.script.run.withFailureHandler(fail).withSuccessHandler(function (r) { done(JSON.parse(r)); }).apiAppCode(i); }\n' +
  '  function run() { var s = document.createElement("script"); s.textContent = parts.join(""); document.body.appendChild(s); }\n' +
  '  get(0, function (r) {\n' +
  '    parts[0] = r.code; var left = r.parts - 1; if (!left) return run();\n' +
  '    for (var i = 1; i < r.parts; i++) (function (i) { get(i, function (x) { parts[i] = x.code; if (!--left) run(); }); })(i);\n' +
  '  });\n' +
  '})();\n</script>';

function page_() {
  const folder = store_().photos.getParents().next();
  const files = [];
  const it = folder.getFilesByName(PAGE_FILE);
  while (it.hasNext()) files.push(it.next());
  // The newest upload counts, so uploading a new Index.html replaces the app even if the old one stays.
  const newest = files.sort(function (a, b) { return b.getLastUpdated() - a.getLastUpdated(); })[0];
  if (!newest) {
    return { problem: 'Upload Index.html to the "' + folder.getName() + '" folder in Google Drive, then reload this page.' };
  }
  if (newest.getMimeType().indexOf('application/vnd.google-apps') === 0) {
    return { problem: 'Index.html in the "' + folder.getName() + '" Drive folder was converted to a Google Doc. Delete it ' +
      'and upload it again with Drive\'s "Convert uploads" setting turned off.' };
  }
  const text = newest.getBlob().getDataAsString('UTF-8');
  if (text.indexOf(PAGE_END) < 0) {
    return { problem: 'Index.html in the "' + folder.getName() + '" Drive folder is incomplete. Download it again ' +
      'from GitHub and upload it, replacing the old one.' };
  }
  const start = text.indexOf(APP_OPEN);
  const end = start < 0 ? -1 : text.indexOf('</script>', start);
  if (end < 0) {
    return { problem: 'Index.html in the "' + folder.getName() + '" Drive folder is an older version. Download the ' +
      'latest from GitHub and upload it.' };
  }
  return {
    shell: text.slice(0, start) + APP_LOADER + text.slice(end + '</script>'.length),
    code: text.slice(start + APP_OPEN.length, end),
  };
}

/** Piece i of the app script, as {parts, code}. See APP_LOADER. */
function apiAppCode(i) {
  assertAccess_();
  const page = page_();
  if (!page.code) throw new Error(page.problem);
  return JSON.stringify({ parts: Math.ceil(page.code.length / APP_PART), code: page.code.slice(i * APP_PART, (i + 1) * APP_PART) });
}

// ── Calls from the app (google.script.run). Arguments and results are JSON strings. ──

function apiGet(key) {
  assertAccess_();
  checkKey_(key);
  const rows = readRows_(sheet_(key));
  if (!rows.length) {
    return PropertiesService.getScriptProperties().getProperty('SET_' + key) ? '{"records":[]}' : 'null';
  }
  if (rows.length === 1 && rows[0].id === WHOLE_VALUE_ID) return JSON.stringify({ value: rows[0].json });
  return '{"records":[' + rows.map(function (r) { return r.json; }).join(',') + ']}';
}

/**
 * Save changes to one list. payload is {upserts: [recordJson], deletes: [id], uploads: {sha256: dataUrl}}
 * or {replace: valueJson, uploads}. Only records the app changed are sent, so a phone holding older
 * data can't overwrite records other people have saved since.
 */
function apiSave(key, payload) {
  assertAccess_();
  checkKey_(key);
  const p = JSON.parse(payload);
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    saveUploads_(p.uploads || {});
    const sh = sheet_(key);
    const who = Session.getActiveUser().getEmail() || 'unknown';
    if (p.replace != null) {
      clearRows_(sh);
      writeRow_(sh, 2, WHOLE_VALUE_ID, p.replace, who);
    } else {
      const rowOf = {};
      readRows_(sh).forEach(function (r) { rowOf[r.id] = r.row; });
      if (rowOf[WHOLE_VALUE_ID]) { clearRows_(sh); Object.keys(rowOf).forEach(function (k) { delete rowOf[k]; }); }
      (p.upserts || []).forEach(function (json) {
        const id = String(JSON.parse(json).id);
        if (!rowOf[id]) rowOf[id] = Math.max(sh.getLastRow(), 1) + 1;
        writeRow_(sh, rowOf[id], id, json, who);
      });
      (p.deletes || []).map(String).filter(function (id) { return rowOf[id]; })
        .map(function (id) { return rowOf[id]; })
        .sort(function (a, b) { return b - a; })
        .forEach(function (row) { sh.deleteRow(row); });
    }
    PropertiesService.getScriptProperties().setProperty('SET_' + key, '1');
    if (key === 'inspections-data') summarise_();
  } finally {
    lock.releaseLock();
  }
  return '{"ok":true}';
}

function apiDelete(key) {
  assertAccess_();
  checkKey_(key);
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    clearRows_(sheet_(key));
    PropertiesService.getScriptProperties().deleteProperty('SET_' + key);
  } finally {
    lock.releaseLock();
  }
  return '{"ok":true}';
}

/** Photos and signatures for the given hashes, as {sha256: dataUrl}. */
function apiFiles(hashes) {
  assertAccess_();
  const index = filesIndex_();
  const out = {};
  JSON.parse(hashes).forEach(function (h) {
    const f = index[h];
    if (!f) return;
    const blob = DriveApp.getFileById(f.fileId).getBlob();
    out[h] = 'data:' + blob.getContentType() + ';base64,' + Utilities.base64Encode(blob.getBytes());
  });
  return JSON.stringify(out);
}

// ── Access ──

/**
 * Who may open the app is set first by the deployment ("Who has access"). The Access tab can
 * narrow it further: list emails, or "@domain" for a whole domain. Leave it empty to allow
 * everyone the deployment allows.
 */
function accessProblem_() {
  const sh = store_().ss.getSheetByName('Access');
  const n = sh.getLastRow() - 1;
  const allowed = n > 0 ? sh.getRange(2, 1, n, 1).getValues()
    .map(function (r) { return String(r[0]).trim().toLowerCase(); }).filter(String) : [];
  if (!allowed.length) return '';
  const email = (Session.getActiveUser().getEmail() || '').toLowerCase();
  if (!email) return 'The app could not tell which Google account you are using. Ask the app owner to check the access settings.';
  const ok = allowed.some(function (a) { return a.charAt(0) === '@' ? email.slice(-a.length) === a : email === a; });
  return ok ? '' : 'Your Google account (' + email + ') is not on the access list. Ask the HACCP Team Leader to add you.';
}

function assertAccess_() {
  const problem = accessProblem_();
  if (problem) throw new Error(problem);
}

// ── Storage ──

function store_() {
  if (store) return store;
  const props = PropertiesService.getScriptProperties();
  let folder, photos, ss;
  if (props.getProperty('SHEET_ID')) {
    ss = SpreadsheetApp.openById(props.getProperty('SHEET_ID'));
    photos = DriveApp.getFolderById(props.getProperty('PHOTOS_ID'));
  } else {
    folder = DriveApp.createFolder('HACCP Inspection App');
    photos = folder.createFolder('Photos and signatures');
    ss = SpreadsheetApp.create('HACCP Inspection App - Records');
    DriveApp.getFileById(ss.getId()).moveTo(folder);
    const tabs = [
      ['Inspections', INSPECTION_HEADER],
      ['NG Items', NG_HEADER],
      ['Access', ['Email or @domain (leave empty to allow everyone the deployment allows)']],
      ['Files', ['sha256', 'fileId', 'mimeType', 'bytes', 'created', 'createdBy']],
    ].concat(STORE_KEYS.map(function (k) { return [k, ['id', 'updated', 'updatedBy', 'json']]; }));
    tabs.forEach(function (t) {
      const sh = ss.insertSheet(t[0]);
      sh.getRange(1, 1, 1, t[1].length).setValues([t[1]]);
      sh.setFrozenRows(1);
    });
    ss.getSheets().filter(function (sh) { return !tabs.some(function (t) { return t[0] === sh.getName(); }); })
      .forEach(function (sh) { ss.deleteSheet(sh); });
    props.setProperty('SHEET_ID', ss.getId());
    props.setProperty('PHOTOS_ID', photos.getId());
  }
  store = { ss: ss, photos: photos };
  return store;
}

function checkKey_(key) {
  if (STORE_KEYS.indexOf(key) < 0) throw new Error('Unknown storage key: ' + key);
}

function sheet_(key) {
  return store_().ss.getSheetByName(key);
}

function readRows_(sh) {
  const n = sh.getLastRow() - 1;
  if (n < 1) return [];
  return sh.getRange(2, 1, n, sh.getLastColumn()).getValues().map(function (r, i) {
    return {
      row: i + 2,
      id: String(r[0]),
      json: r.slice(3).filter(function (c) { return c !== ''; })
        .map(function (c) { return String(c).slice(MARK.length); }).join(''),
    };
  });
}

function writeRow_(sh, row, id, json, who) {
  const cells = [id, new Date(), who];
  for (let i = 0; i < json.length; i += CHUNK) cells.push(MARK + json.slice(i, i + CHUNK));
  if (sh.getMaxColumns() < cells.length) sh.insertColumnsAfter(sh.getMaxColumns(), cells.length - sh.getMaxColumns());
  if (row <= sh.getLastRow()) sh.getRange(row, 1, 1, sh.getLastColumn()).clearContent();
  sh.getRange(row, 1, 1, cells.length).setValues([cells]);
}

// Clears rather than deletes: Sheets refuses to delete every unfrozen row.
function clearRows_(sh) {
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).clearContent();
}

// ── Photos and signatures ──

function filesIndex_() {
  const sh = store_().ss.getSheetByName('Files');
  const n = sh.getLastRow() - 1;
  const index = {};
  if (n > 0) sh.getRange(2, 1, n, 3).getValues().forEach(function (r) { index[r[0]] = { fileId: r[1], mimeType: r[2] }; });
  return index;
}

function saveUploads_(uploads) {
  const hashes = Object.keys(uploads);
  if (!hashes.length) return;
  const index = filesIndex_();
  const sh = store_().ss.getSheetByName('Files');
  const who = Session.getActiveUser().getEmail() || 'unknown';
  hashes.filter(function (h) { return !index[h]; }).forEach(function (h) {
    const dataUrl = uploads[h];
    if (sha256_(dataUrl) !== h) throw new Error('Photo did not arrive intact; please save again.');
    const m = /^data:([^;,]+)?(;base64)?,(.*)$/.exec(dataUrl);
    if (!m) throw new Error('Unrecognised photo format.');
    const mime = m[1] || 'application/octet-stream';
    const bytes = m[2] ? Utilities.base64Decode(m[3]) : Utilities.newBlob(decodeURIComponent(m[3])).getBytes();
    const ext = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }[mime] || '';
    const file = store_().photos.createFile(Utilities.newBlob(bytes, mime, h + ext));
    sh.appendRow([h, file.getId(), mime, bytes.length, new Date(), who]);
    index[h] = { fileId: file.getId(), mimeType: mime };
  });
}

function sha256_(s) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8)
    .map(function (b) { return ((b & 0xff) + 0x100).toString(16).slice(1); }).join('');
}

// ── Readable tabs for audits ──

/** Rebuild the Inspections and NG Items tabs from the inspection records. */
function summarise_() {
  const index = filesIndex_();
  const link = function (v) {
    return typeof v === 'string' && v.indexOf(REF) === 0 && index[v.slice(REF.length)]
      ? 'https://drive.google.com/file/d/' + index[v.slice(REF.length)].fileId + '/view' : '';
  };
  const FORMS = { all: 'All HACCP', cleaning: 'IR-PP-02.1', glass: 'IR-PP-13.1', hygiene: 'IR-PP-01.1', building: 'IR-PP-14.1',
    safety: 'OSHP-06.02', environment: 'ISO 14001' };
  const system = function (section) {
    return section.indexOf('[OSHP-06.02]') >= 0 ? 'Safety' : section.indexOf('[ISO 14001]') >= 0 ? 'Environmental' : 'HACCP';
  };
  const inspections = [], ngItems = [];
  readRows_(sheet_('inspections-data')).forEach(function (r) {
    if (r.id === WHOLE_VALUE_ID) return;
    const insp = JSON.parse(r.json);
    const items = [].concat.apply([], Object.keys(insp.areas || {}).map(function (a) { return insp.areas[a] || []; }));
    const ng = items.filter(function (i) { return i.status === 'NG'; });
    const date = insp.dateTime ? new Date(insp.dateTime) : '';
    inspections.push([date, (insp.inspectors || [insp.inspector]).join(', '), FORMS[insp.documentType] || insp.documentType || '',
      insp.overallStatus || '', ng.length, insp.status || '', insp.verifiedByCleaning || '', insp.verifiedByGlass || '',
      insp.verifiedByBuilding || '', insp.verifiedBySafety || '', insp.verifiedByEnvironment || '',
      insp.submittedAt ? new Date(insp.submittedAt) : '', insp.id]);
    ng.forEach(function (i) {
      ngItems.push([date, system(i.section || ''), i.areaName || i.area || '', i.section || '',
        (i.itemText || '') + (i.itemTextEn ? '\n' + i.itemTextEn : ''), i.remarks || '',
        (i.photos || []).map(link).filter(String).join('\n'), insp.id]);
    });
  });
  [['Inspections', INSPECTION_HEADER, inspections], ['NG Items', NG_HEADER, ngItems]].forEach(function (t) {
    const sh = store_().ss.getSheetByName(t[0]), header = t[1];
    if (sh.getMaxColumns() < header.length) sh.insertColumnsAfter(sh.getMaxColumns(), header.length - sh.getMaxColumns());
    sh.getRange(1, 1, 1, header.length).setValues([header]);
    clearRows_(sh);
    const rows = t[2].map(function (row) { return row.map(text_); });
    if (rows.length) sh.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  });
}

// Text typed by people goes into plain cells; stop Sheets treating "=..." or "+..." as a formula.
function text_(v) {
  return typeof v === 'string' && /^[=+\-@]/.test(v) ? "'" + v : v;
}

function escape_(s) {
  return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
}
