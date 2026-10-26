// End-to-end test of the Google Sheets version: the real apps-script/Code.gs runs on in-memory
// fakes of Sheets and Drive (gas-fakes.mjs), and the real apps-script/Index.html runs in headless
// Chromium, with google.script.run wired to it. Two inspectors use the app at the same time.
//
// Run: python3 build.py && node test/apps-script.test.mjs   (after npm install)
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { loadAppsScript } from './gas-fakes.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const nm = path.join(root, 'node_modules');
const html = readFileSync(path.join(root, 'apps-script/Index.html'), 'utf8');
const gas = loadAppsScript(path.join(root, 'apps-script/Code.gs'));
const APP = 'https://script.test/exec';

const failures = [];
const check = (ok, msg) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`); if (!ok) failures.push(msg); };
const records = (key) => gas.rows(key).filter((r) => r[0] !== '');
const json = (key) => records(key).map((r) => r.slice(3).filter((c) => c !== '').map((c) => String(c).slice(1)).join(''));

const browser = await chromium.launch();
let offline = false;   // while true, every call to Google fails, as with no signal
let failing = null;     // (fn, args) => true to make just some calls fail
async function open(email) {
  const context = await browser.newContext({ viewport: { width: 420, height: 900 } });
  const page = await context.newPage();
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') page.errors.push(m.text()); });
  page.on('dialog', (d) => d.accept());
  await page.exposeFunction('__gas', (fn, args) => {
    if (offline || failing?.(fn, args)) return { err: 'NetworkError: no connection' };
    gas.state.user = email;
    try { return { ok: gas.ctx[fn](...JSON.parse(args)) }; } catch (e) { return { err: e.message }; }
  });
  await page.addInitScript(() => {
    const make = (ok, fail) => new Proxy({}, {
      get: (_, name) => name === 'withSuccessHandler' ? (f) => make(f, fail)
        : name === 'withFailureHandler' ? (f) => make(ok, f)
        : (...args) => window.__gas(name, JSON.stringify(args)).then((r) =>
          setTimeout(() => ('err' in r ? fail && fail(new Error(r.err)) : ok && ok(r.ok)), 0)),
    });
    window.google = { script: { run: make() } };
  });
  await page.route('**/*', (r) => {
    const u = r.request().url();
    if (u === APP) { gas.state.user = email; return r.fulfill({ body: gas.ctx.doGet().html, contentType: 'text/html' }); }
    const m = u.match(/cdn\.jsdelivr\.net\/npm\/(@?[^@]+)@[^/]+\/(.+)$/);
    if (m) return r.fulfill({ path: path.join(nm, m[1], m[2]), contentType: 'application/javascript' });
    if (u.includes('cdn.tailwindcss.com')) return r.fulfill({ body: '', contentType: 'application/javascript' });
    return r.abort();
  });
  await page.goto(APP);
  await page.waitForSelector('text=Login', { timeout: 20000 });
  return page;
}
async function login(page, user) {
  await page.fill('input[placeholder*="Inspector"]', user);
  await page.fill('input[type=password]', '123');
  await page.keyboard.press('Enter');
  await page.waitForSelector('text=Quick Actions', { timeout: 10000 });
}
async function inspect(page) {
  await page.locator('button', { hasText: 'New' }).first().click();
  await page.locator('label', { hasText: 'IR-PP-02.1' }).first().click();
  await page.locator('button', { hasText: 'Today' }).first().click();
  await page.waitForSelector('text=All OK');
  await page.locator('button', { hasText: 'All OK' }).first().dispatchEvent('pointerdown');
  await page.locator('button', { hasText: 'Submit' }).first().click();
  await page.waitForSelector('text=Quick Actions');
  await page.waitForTimeout(500);
}
const shown = async (page) => (await page.innerText('body')).match(/All Inspections\((\d+)\/(\d+)\)/)?.[2];

try {
  gas.ctx.setup();
  const folder = gas.state.appFolder;
  const page = () => gas.ctx.doGet();
  check(page().title === 'Setup needed' && /Upload Index\.html/.test(page().html), 'before Index.html is uploaded, the app says to upload it');
  folder.upload('Index.html', html.slice(0, html.length / 2));
  check(/incomplete/.test(page().html), 'a cut-off Index.html is caught and the app says to upload it again');
  folder.upload('Index.html', html, 'application/vnd.google-apps.document').updated = new Date(Date.now() + 1000);
  check(/converted to a Google Doc/.test(page().html), 'an Index.html Drive converted to a Google Doc is explained');
  folder.upload('Index.html', html).updated = new Date(Date.now() + 2000);
  check(page().title === 'Workplace Inspection' && page().html.length < 30000 && page().html.includes('apiAppCode'),
    `with the full Index.html uploaded, a small page is served (${page().html.length} characters) that loads the app in pieces`);

  const a = await open('verifier@impactrank.com.my');
  await login(a, 'verifier');
  const defaultUsers = (readFileSync(path.join(root, 'ImpactRankApp.jsx'), 'utf8').match(/const DEFAULT_USERS = \[([\s\S]*?)\n\];/)[1].match(/\{ ?id:/g) || []).length;
  check(records('app-users').length === defaultUsers, `first visit stores the ${defaultUsers} default users (got ${records('app-users').length})`);

  await inspect(a);
  check(records('inspections-data').length === 1, 'inspector A submits; the Sheet has 1 inspection');
  const summary = records('Inspections');
  check(summary.length === 1 && summary[0][2] === 'IR-PP-02.1' && summary[0][3] === 'OK',
    `Inspections tab shows it (${JSON.stringify(summary[0]?.slice(2, 6))})`);
  check(records('inspections-data')[0][2] === 'verifier@impactrank.com.my', 'the row records who saved it');

  const b = await open('inspector@impactrank.com.my');
  await login(b, 'inspector');
  check(await shown(b) === '1', 'inspector B, on another phone, sees A\'s inspection');
  await inspect(b);
  check(records('inspections-data').length === 2, 'inspector B submits; the Sheet has 2 inspections');

  await inspect(a);
  check(records('inspections-data').length === 3, 'A submits again without syncing first; B\'s inspection is still there (3)');
  await a.waitForTimeout(6000);
  check(records('inspections-data').length === 3, 'A\'s automatic re-save every 5 s does not remove B\'s inspection');
  await a.locator('button', { hasText: 'Sync' }).first().click();
  await a.waitForTimeout(800);
  check(await shown(a) === '3', 'after Sync, A sees all 3 inspections');

  // Direct storage calls from a page nobody is logged in to, so the app's own re-save stays out of it.
  const c = await open('verifier@impactrank.com.my');
  const photo = await c.evaluate(() => {
    const cv = document.createElement('canvas'); cv.width = 64; cv.height = 64;
    const g = cv.getContext('2d'); g.fillStyle = '#c00'; g.fillRect(8, 8, 40, 40);
    return cv.toDataURL('image/jpeg', 0.8);
  });
  const car = (id, photos) => ({ id, description: 'Drain blocked', photos, status: 'open' });
  await c.evaluate(([v]) => window.storage.set('corrective-actions', v, true), [JSON.stringify([car('c1', [photo])])]);
  check(gas.state.created === 1 && records('Files').length === 1, 'a photo is saved once as a Drive file');
  check(json('corrective-actions')[0].includes('"file:') && !json('corrective-actions')[0].includes('data:'),
    'the record keeps a file reference, not the image');
  await c.evaluate(([v]) => window.storage.set('corrective-actions', v, true), [JSON.stringify([car('c1', [photo]), car('c2', [photo])])]);
  check(gas.state.created === 1, 'saving again does not upload the same photo again');
  const back = await b.evaluate(() => window.storage.get('corrective-actions', true));
  check(JSON.parse(back.value)[1].photos[0] === photo, 'B gets the photo back exactly');

  const insp = { id: 'ng1', dateTime: '2026-10-26T09:00:00Z', inspectors: ['Verifier'], documentType: 'cleaning',
    overallStatus: 'NG', status: 'pending_verification',
    areas: { surroundings: [{ id: 'surroundings-5', areaName: 'Surroundings', section: 'Stagnant Water',
      itemText: 'Pails, containers...', status: 'NG', remarks: '=Pail with water behind store', photos: [photo] }] } };
  const all = JSON.parse((await c.evaluate(() => window.storage.get('inspections-data', true))).value);
  await c.evaluate(([v]) => window.storage.set('inspections-data', v, true), [JSON.stringify([...all, insp])]);
  const ng = records('NG Items');
  check(ng.length === 1 && ng[0][6].startsWith('https://drive.google.com/file/d/') && ng[0][1] === 'HACCP', 'NG Items tab lists the NG row with a photo link');
  check(ng[0][5] === "'=Pail with water behind store", 'remarks starting with "=" are kept as text, not run as a formula');

  const safetyInsp = { id: 'sf1', dateTime: '2026-10-27T09:00:00Z', inspectors: ['Verifier'], documentType: 'safety',
    overallStatus: 'NG', status: 'pending_verification', verifiedBySafety: 'Verifier',
    areas: { safety: [{ id: 'sf-25', areaName: 'Safety', section: 'Keadaan Tidak Selamat [OSHP-06.02]', itemText: 'Alat elektrik dalam keadaan baik',
      itemTextEn: 'Electrical equipment is in good condition', status: 'NG', remarks: 'Cracked plug at mixer', photos: [photo] }] } };
  const now = JSON.parse((await c.evaluate(() => window.storage.get('inspections-data', true))).value);
  await c.evaluate(([v]) => window.storage.set('inspections-data', v, true), [JSON.stringify([...now, safetyInsp])]);
  const header = gas.tab('Inspections').getRange(1, 1, 1, 13).getValues()[0];
  const sRow = records('Inspections').find((r) => r[12] === 'sf1');
  check(header[9] === 'OSHP-06.02 reviewed by' && sRow && sRow[2] === 'OSHP-06.02' && sRow[9] === 'Verifier',
    'Inspections tab gets the new reviewer columns and lists the Safety inspection with its reviewer');
  const sNg = records('NG Items').find((r) => r[7] === 'sf1');
  check(sNg && sNg[1] === 'Safety' && sNg[4] === 'Alat elektrik dalam keadaan baik\nElectrical equipment is in good condition',
    'NG Items tab marks the Safety NG and shows the BM and English text');

  const long = 'x'.repeat(100000);
  await c.evaluate(([v]) => window.storage.set('inspection-schedules', v, true), [JSON.stringify([{ id: 's1', note: long }])]);
  const cells = records('inspection-schedules')[0].slice(3).filter((x) => x !== '').length;
  const sched = JSON.parse((await b.evaluate(() => window.storage.get('inspection-schedules', true))).value);
  check(cells === 3 && sched[0].note === long, `a 100,000-character record is split over ${cells} cells and comes back whole`);

  await c.evaluate(([v]) => window.storage.set('corrective-actions', v, true), [JSON.stringify([car('c2', [photo])])]);
  check(records('corrective-actions').length === 1, 'a record deleted in the app is deleted from the Sheet');

  gas.tab('Access').getRange(2, 1).setValues([['someone@else.com']]);
  gas.state.user = 'verifier@impactrank.com.my';
  check(gas.ctx.doGet().title === 'No access', 'with an Access list, people not on it are turned away');
  let refused = false;
  try { gas.ctx.apiGet('inspections-data'); } catch { refused = true; }
  check(refused, '... and their data calls are refused too');
  gas.tab('Access').getRange(2, 1).setValues([['@impactrank.com.my']]);
  check(gas.ctx.doGet().title !== 'No access', 'an "@impactrank.com.my" entry lets the whole company in');
  gas.tab('Access').getRange(2, 1).setValues([['']]);

  // ── No signal and refreshes: nothing is lost ──
  const badgeText = async (p) => (await p.locator('#irapp-outbox').count()) ? p.locator('#irapp-outbox').innerText() : '';
  const comeOnline = async (p) => { offline = false; await p.evaluate(() => window.dispatchEvent(new Event('online'))); await p.waitForTimeout(1500); };
  const usersBefore = records('app-users').length;
  // Someone has changed a password on the server (C loads the users first, so its change is a real edit).
  const users = JSON.parse((await c.evaluate(() => window.storage.get('app-users', true))).value);
  users[0].password = 'changed-pw';
  await c.evaluate(([v]) => window.storage.set('app-users', v, true), [JSON.stringify(users)]);
  const pwOnServer = () => JSON.parse(json('app-users').find((j) => JSON.parse(j).id === users[0].id)).password;
  check(pwOnServer() === 'changed-pw', 'a changed password is saved to the Sheet');

  const before = records('inspections-data').length;
  offline = true;
  await inspect(a);
  check(records('inspections-data').length === before, 'with no signal, a submitted inspection is not on the Sheet yet');
  check(/1 change saved on this device/.test(await badgeText(a)), 'the "waiting to upload" badge shows 1 change');
  // The tab is refreshed; the app opens again once there is signal. Loading the user list happens to
  // fail this time, so the app re-saves its default users without knowing what is on the Sheet.
  offline = false;
  failing = (fn, args) => fn === 'apiGet' && args.includes('app-users');
  await a.reload();
  await a.waitForSelector('text=Login', { timeout: 20000 });
  await a.waitForTimeout(1500);
  check(records('inspections-data').length === before + 1, 'after the refresh, the inspection that was waiting uploads by itself');
  await login(a, 'verifier');
  check(await shown(a) === String(before + 1), 'and the app shows it');
  failing = null;
  await comeOnline(a);
  check(!(await badgeText(a)), 'once everything has uploaded, the badge goes away');
  check(records('app-users').length === usersBefore && pwOnServer() === 'changed-pw',
    'the default users the app re-saved while it could not load them did not overwrite the changed password');

  // Refresh in the middle of an inspection: the ticks are restored.
  await a.locator('button', { hasText: 'New' }).first().click();
  await a.locator('label', { hasText: 'OSHP-06.02' }).first().click();
  await a.locator('button', { hasText: 'Today' }).first().click();
  await a.waitForSelector('text=All Baik');
  await a.locator('button', { hasText: 'All Baik' }).first().dispatchEvent('pointerdown');
  await a.waitForTimeout(500);
  await a.reload();
  await a.waitForSelector('text=Login', { timeout: 20000 });
  await login(a, 'verifier').catch(() => {});
  await a.waitForTimeout(800);
  const progress = (await a.innerText('body')).match(/(\d+)\/(\d+) \(100%\)/);
  check(!!progress, 'after a refresh mid-inspection, the inspection comes back with every tick (100%)');

  // A photo saved with no signal still reaches Google after a refresh.
  const cas = JSON.parse((await c.evaluate(() => window.storage.get('corrective-actions', true))).value);
  const photo2 = photo.replace(/.{8}$/, 'AAAAAAA=');
  offline = true;
  const filesBefore = gas.state.created;
  await c.evaluate(([v]) => window.storage.set('corrective-actions', v, true), [JSON.stringify([...cas, { id: 'c9', description: 'Leak', photos: [photo2] }])]);
  check(gas.state.created === filesBefore, 'with no signal, the photo is not uploaded yet');
  offline = false;
  await c.reload();
  await c.waitForSelector('text=Login', { timeout: 20000 });
  await c.waitForTimeout(1500);
  check(gas.state.created === filesBefore + 1 && json('corrective-actions').some((j) => j.includes('"c9"')),
    'a record with a photo, saved with no signal and then refreshed, uploads with its photo');

  for (const [name, p] of [['A', a], ['B', b], ['C', c]]) check(!p.errors.length, `no page errors on ${name}` + (p.errors.length ? ': ' + p.errors.join(' | ') : ''));
} catch (e) {
  failures.push('step failed: ' + e.message.split('\n')[0]);
  console.log('FAIL  ' + e.message.split('\n')[0]);
}
await browser.close();
if (failures.length) { console.log(`\n${failures.length} problem(s).`); process.exit(1); }
console.log('\nApps Script test passed.');
