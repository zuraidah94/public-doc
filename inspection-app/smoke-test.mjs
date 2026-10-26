// Open index.html in headless Chromium and walk one IR-PP-02.1 inspection end to end:
// log in, start a cleaning inspection, check the current form's rows and Rev are shown,
// mark everything OK, submit, and confirm the record was saved. Fails on any page error.
//
// Run: python3 build.py && node smoke-test.mjs [screenshot-dir]
// If `npm install` has been run here, the CDN scripts are served from node_modules, so the
// test also works without internet (Tailwind is then skipped, so screenshots are unstyled).
import { createRequire } from 'node:module';
import { existsSync, readFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const form = JSON.parse(readFileSync(path.join(here, 'forms/IR-PP-02.1.json'), 'utf8'));
const shots = process.argv[2] || path.join(tmpdir(), 'inspection-app-smoke');
mkdirSync(shots, { recursive: true });
const nm = path.join(here, 'node_modules');
const offline = existsSync(path.join(nm, 'react'));

const failures = [], dialogs = [];
const check = (ok, msg) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`); if (!ok) failures.push(msg); };

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
page.on('pageerror', e => failures.push('page error: ' + e.message));
page.on('console', m => { if (m.type() === 'error') failures.push('console error: ' + m.text()); });
page.on('dialog', d => { dialogs.push(d.message()); d.accept(); });
if (offline) {
  await page.route('**/*', r => {
    const u = r.request().url();
    const m = u.match(/cdn\.jsdelivr\.net\/npm\/(@?[^@]+)@[^/]+\/(.+)$/);
    if (m) return r.fulfill({ path: path.join(nm, m[1], m[2]), contentType: 'application/javascript' });
    if (u.includes('cdn.tailwindcss.com')) return r.fulfill({ body: '', contentType: 'application/javascript' });
    return u.startsWith('file:') ? r.continue() : r.abort();
  });
}

try {
  await page.goto('file://' + path.join(here, 'index.html'));
  await page.waitForSelector('text=Login', { timeout: 20000 });
  await page.fill('input[placeholder*="Inspector"]', 'admin');
  await page.fill('input[type=password]', '123');
  await page.keyboard.press('Enter');
  await page.waitForSelector('text=Quick Actions', { timeout: 10000 });
  check(true, 'log in as admin and reach the dashboard');

  await page.locator('button', { hasText: 'New' }).first().click();
  await page.locator('label', { hasText: form.number }).first().click();
  await page.locator('button', { hasText: 'Today' }).first().click();
  await page.waitForSelector('text=All OK', { timeout: 10000 });
  check(true, `start a ${form.number} inspection`);

  const body = await page.innerText('body');
  check(body.includes(`${form.number} ${form.rev}`), `form shows "${form.number} ${form.rev}"`);

  // Area tabs read "<icon> <first word of area name>" over "<done>/<total>".
  const tabs = await page.locator('button', { hasText: /\d+\/\d+/ }).allInnerTexts();
  for (const area of form.areas) {
    const word = area.app.split('-')[0].replace(/^./, c => c.toUpperCase());
    const tab = tabs.find(t => t.includes(word));
    const total = tab && tab.match(/\d+\/(\d+)/)[1];
    check(total == area.rows.length, `${area.form}: tab shows ${area.rows.length} rows (got ${total ?? 'no tab'})`);
  }
  const surroundings = form.areas.find(a => a.app === 'surroundings');
  await page.locator('button', { hasText: 'Surroundings' }).first().dispatchEvent('pointerdown');
  await page.waitForTimeout(300);
  const tabText = await page.innerText('body');
  const newest = surroundings.rows[surroundings.rows.length - 1];
  check(tabText.includes(newest.slice(0, 40)), `Surroundings shows "${newest.slice(0, 40)}..."`);
  await page.screenshot({ path: path.join(shots, 'surroundings.png'), fullPage: true });

  await page.locator('button', { hasText: 'All OK' }).first().dispatchEvent('pointerdown');
  await page.locator('button', { hasText: 'Submit' }).first().click();
  await page.waitForSelector('text=Quick Actions', { timeout: 10000 });
  for (let i = 0; i < 20 && !dialogs.some(d => d.includes('Submitted')); i++) await page.waitForTimeout(100);
  check(dialogs.some(d => d.includes('Submitted') && d.includes('OK')), 'submit shows "Submitted! Status: OK"');

  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('irapp:shared:inspections-data') || '[]'));
  const rows = saved[0] ? Object.values(saved[0].areas).flat().length : 0;
  const total = form.areas.reduce((n, a) => n + a.rows.length, 0);
  check(saved.length === 1 && rows === total, `saved 1 inspection with ${total} rows (got ${saved.length}, ${rows})`);
  await page.screenshot({ path: path.join(shots, 'dashboard.png') });

  // Workplace Safety (OSHP-06.02): whole factory, everything Baik.
  const safetyForm = JSON.parse(readFileSync(path.join(here, 'forms/OSHP-06.02.json'), 'utf8'));
  const start = async (label, ready) => {
    await page.locator('button', { hasText: 'New' }).first().click();
    await page.locator('label', { hasText: label }).first().click();
    await page.locator('button', { hasText: 'Today' }).first().click();
    await page.waitForSelector(`text=${ready}`, { timeout: 10000 });
  };
  const submitted = async (status) => {
    const before = dialogs.length;
    await page.locator('button', { hasText: 'Submit' }).first().click();
    await page.waitForSelector('text=Quick Actions', { timeout: 10000 });
    for (let i = 0; i < 20 && !dialogs.slice(before).some(d => d.includes('Submitted')); i++) await page.waitForTimeout(100);
    return dialogs.slice(before).some(d => d.includes('Submitted') && d.includes(status));
  };
  await start('OSHP-06.02', 'LAPORAN PEMERIKSAAN TEMPAT KERJA');
  const safetyText = await page.innerText('body');
  check(safetyText.includes(safetyForm.rows[safetyForm.rows.length - 1].bm) && safetyText.includes('Psychosocial hazards'),
    'Safety form shows the BM items with English underneath');
  await page.screenshot({ path: path.join(shots, 'safety.png'), fullPage: true });
  await page.locator('button', { hasText: 'All Baik' }).first().dispatchEvent('pointerdown');
  check(await submitted('OK'), 'Safety inspection, all Baik, submits as OK');

  // Environmental walkthrough: one ✖ that needs a remark and a photo before it can be submitted.
  const envForm = JSON.parse(readFileSync(path.join(here, 'forms/ISO-14001-walkthrough.json'), 'utf8'));
  await start('ISO 14001', 'ENVIRONMENTAL WALKTHROUGH INSPECTION CHECKLIST');
  await page.locator('button', { hasText: 'All ✔' }).first().dispatchEvent('pointerdown');
  const row = page.locator('tr#item-env-3');
  await row.locator('button', { hasText: '✖' }).click();
  await row.locator('textarea').fill('Drum of waste oil outside the SW store');
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==', 'base64');
  await row.locator('input[type=file]').setInputFiles({ name: 'sw.png', mimeType: 'image/png', buffer: png });
  await page.waitForTimeout(800);
  await page.locator('label', { hasText: 'Person In Charge' }).locator('input').fill('Ali Ahmad');
  check(await submitted('NG'), 'Environmental inspection with one ✖ (remark + photo) submits as NG');

  const all = await page.evaluate(() => JSON.parse(localStorage.getItem('irapp:shared:inspections-data') || '[]'));
  const safety = all.find(i => i.documentType === 'safety'), env = all.find(i => i.documentType === 'environment');
  check(safety && safety.areas.safety.length === safetyForm.rows.length, `Safety record has ${safetyForm.rows.length} rows`);
  const ng = env?.areas.environment.filter(i => i.status === 'NG') || [];
  check(env && env.areas.environment.length === envForm.rows.length && ng.length === 1 && ng[0].photos.length === 1 && env.personInCharge === 'Ali Ahmad',
    `Environmental record has ${envForm.rows.length} rows, 1 NG with its photo, and the Person In Charge`);

  // Printed reports use the form layouts.
  const reports = await page.evaluate(([s, e]) => [buildFormHTML(s, 'safety', { number: 'OSHP-06.02', rev: 'Issue 00' }),
    buildFormHTML(e, 'environment', { number: 'ISO 14001 Walkthrough', rev: '' })], [safety, env]);
  check(reports[0].includes('LAPORAN PEMERIKSAAN TEMPAT KERJA') && (reports[0].match(/>✓</g) || []).length === safetyForm.rows.length,
    'printed Safety report has every row ticked Baik');
  check(reports[1].includes('ENVIRONMENTAL WALKTHROUGH') && reports[1].includes('Drum of waste oil') && reports[1].includes('Ali Ahmad'),
    'printed Environmental report has the ✖ remark and the Person In Charge');

  // A backup import keeps the Safety and Environmental fields.
  const imported = await page.evaluate(([s, e]) => [normalizeImportedInspection(s), normalizeImportedInspection(e)], [safety, env]);
  check(imported[0].areas.safety[0].itemTextEn && imported[0].areas.safety[0].group && imported[1].areas.environment[0].evidence,
    'importing a backup keeps the Safety English text and groups, and the Environmental evidence');

  // The report view offers the Safety and Environmental downloads.
  await page.evaluate(() => window.scrollTo(0, 0));
  const reportButtons = async (badge) => {
    const card = page.locator('div.overflow-hidden', { hasText: badge }).filter({ has: page.locator('text=' + badge) }).last();
    await card.locator('div.cursor-pointer').first().click();
    await card.locator('button', { hasText: 'View' }).first().click();
    const texts = await page.locator('button', { hasText: '📥' }).allInnerTexts();
    await page.keyboard.press('Escape').catch(() => {});
    return texts.join(' ');
  };
  check((await reportButtons('🦺 Safety')).includes('OSHP-06.02'), 'the report view of a Safety inspection has a 📥 OSHP-06.02 download');

  // Corrective actions: three separate lists.
  await page.locator('button', { hasText: 'CAR' }).first().click();
  await page.locator('button', { hasText: 'Environmental' }).first().click();
  const envList = await page.innerText('body');
  check(envList.includes('Environmental Findings') && envList.includes('Drum of waste oil'), 'Environmental Findings list shows the ✖ item');
  await page.locator('button', { hasText: 'Safety' }).first().click();
  check((await page.innerText('body')).includes('No Non-Conformities'), 'Safety CSAR list is empty (no Kurang Baik items)');
  await page.locator('button', { hasText: 'Environmental' }).first().click();
  await page.locator('button', { hasText: 'Add Finding' }).first().click();
  await page.locator('textarea[placeholder^="Finding"]').fill('Move drum into the SW store today');
  await page.locator('button', { hasText: 'Save' }).first().click();
  const cas = await page.evaluate(() => JSON.parse(localStorage.getItem('irapp:shared:corrective-actions') || '[]'));
  check(cas.length === 1 && cas[0].kind === 'environment', 'a finding saved from that list is filed as Environmental');
  await page.screenshot({ path: path.join(shots, 'findings.png'), fullPage: true });
} catch (e) {
  failures.push('step failed: ' + e.message.split('\n')[0]);
  await page.screenshot({ path: path.join(shots, 'failure.png') }).catch(() => {});
}
await browser.close();

console.log(`\nScreenshots: ${shots}${offline ? ' (offline mode, no Tailwind styling)' : ''}`);
if (failures.length) { console.log(`\n${failures.length} problem(s):`); failures.forEach(f => console.log('- ' + f)); process.exit(1); }
console.log('Smoke test passed.');
