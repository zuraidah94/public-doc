// Check the app's checklists against the copies of the current forms in forms/: IR-PP-02.1
// (forms/IR-PP-02.1.json), OSHP-06.02 Workplace Safety and the ISO 14001 environmental walkthrough.
// Prints every difference and exits 1 if there are any.
//
// Run: node check-checklist.mjs
import { readFileSync } from 'node:fs';

const here = new URL('.', import.meta.url);
const jsx = readFileSync(new URL('ImpactRankApp.jsx', here), 'utf8');
const form = JSON.parse(readFileSync(new URL('forms/IR-PP-02.1.json', here), 'utf8'));

// CHECKLIST_ITEMS is a plain object literal, so it can be evaluated on its own.
const m = jsx.match(/const CHECKLIST_ITEMS = (\{[\s\S]*?\n\});/);
if (!m) { console.error('CHECKLIST_ITEMS not found in ImpactRankApp.jsx'); process.exit(2); }
const checklist = Function(`return (${m[1]});`)();

// Cleaning items are every section not tagged with another form, as in inspectionHasCleaning.
const OTHER_FORMS = ['[IR-PP-13.1]', '[IR-PP-01.1]', '[IR-PP-14.1]'];
const cleaningRows = (area) => Object.entries(checklist[area] || {})
  .filter(([section]) => !OTHER_FORMS.some(f => section.includes(f)))
  .flatMap(([, items]) => items);

const problems = [];
const norm = (s) => s.replace(/\s+/g, ' ').trim();

for (const { form: formArea, app, rows } of form.areas) {
  if (!checklist[app]) { problems.push(`${formArea}: area "${app}" is missing from CHECKLIST_ITEMS`); continue; }
  const got = cleaningRows(app);
  rows.forEach((want, i) => {
    if (got[i] === undefined) problems.push(`${formArea} row ${i + 1}: missing, form says "${want}"`);
    else if (norm(got[i]) !== norm(want)) problems.push(`${formArea} row ${i + 1}:\n    app:  "${got[i]}"\n    form: "${want}"`);
  });
  got.slice(rows.length).forEach((extra, j) =>
    problems.push(`${formArea} row ${rows.length + j + 1}: in the app but not on the form: "${extra}"`));
}

// The Rev appears in the initial doc details and again in the Form screen's Reset button.
const revs = [...jsx.matchAll(/number:\s*'IR-PP-02\.1',\s*rev:\s*'([^']+)'/g)].map(r => r[1]);
if (!revs.length) problems.push('Rev for IR-PP-02.1 not found in the doc details');
revs.forEach((rev, i) => { if (rev !== form.rev) problems.push(`Doc details #${i + 1}: rev is "${rev}", form is "${form.rev}"`); });

if (!jsx.includes(form.footer)) problems.push(`Footer line missing: "${form.footer}"`);

// Workplace Safety (OSHP-06.02) and Environmental walkthrough rows, compared with their reference copies.
const literal = (name) => {
  const found = jsx.match(new RegExp(`const ${name} = (\\[[\\s\\S]*?\\n\\]);`));
  if (!found) { problems.push(`${name} not found in ImpactRankApp.jsx`); return []; }
  return Function(`return (${found[1]});`)();
};
const safetyForm = JSON.parse(readFileSync(new URL('forms/OSHP-06.02.json', here), 'utf8'));
const safetyApp = literal('SAFETY_GROUPS').flatMap(g => g.topics.flatMap(t => t.items.map(([sub, bm]) => ({ no: t.no, sub, bm: bm || t.bm }))));
const envForm = JSON.parse(readFileSync(new URL('forms/ISO-14001-walkthrough.json', here), 'utf8'));
const envApp = literal('ENV_MASTER_ITEMS').map(([item, evidence]) => ({ item, evidence }));
const compareRows = (label, want, got, key) => {
  want.forEach((w, i) => {
    if (!got[i]) problems.push(`${label} row ${i + 1}: missing, form says "${key(w)}"`);
    else if (key(got[i]) !== key(w)) problems.push(`${label} row ${i + 1}:\n    app:  "${key(got[i])}"\n    form: "${key(w)}"`);
  });
  got.slice(want.length).forEach((g, j) => problems.push(`${label} row ${want.length + j + 1}: in the app but not on the form: "${key(g)}"`));
};
compareRows('OSHP-06.02', safetyForm.rows, safetyApp, (r) => `${r.no}${r.sub ? ' ' + r.sub : ''}. ${norm(r.bm)}`);
compareRows('ISO 14001 walkthrough', envForm.rows, envApp, (r) => `${norm(r.item)} | ${norm(r.evidence)}`);
// Like the IR-PP-02.1 Rev, the Issue is in the initial doc details and in the Form screen's Reset button.
const safetyRevs = [...jsx.matchAll(/safety:\s*\{\s*number:\s*'OSHP-06\.02',\s*rev:\s*'([^']+)'/g)].map(r => r[1]);
if (safetyRevs.length < 2) problems.push(`OSHP-06.02 issue found ${safetyRevs.length} time(s) in the doc details, expected 2`);
safetyRevs.forEach((rev, i) => { if (rev !== safetyForm.issue) problems.push(`OSHP-06.02 doc details #${i + 1}: issue is "${rev}", form is "${safetyForm.issue}"`); });

if (problems.length) {
  console.log(`${problems.length} difference(s) between the app and the forms:\n`);
  problems.forEach(p => console.log('- ' + p));
  process.exit(1);
}
console.log(`IR-PP-02.1 matches ${form.rev} / ${form.issue}: ${form.areas.length} areas, ` +
  `${form.areas.reduce((n, a) => n + a.rows.length, 0)} rows.`);
console.log(`OSHP-06.02 matches ${safetyForm.issue}: ${safetyForm.rows.length} rows. ` +
  `ISO 14001 walkthrough matches: ${envForm.rows.length} rows.`);
