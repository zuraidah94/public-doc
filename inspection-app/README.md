# Workplace Inspection app (HACCP, Safety, Environmental)

The Impact Rank (M) Sdn Bhd inspection app, first built as a claude.ai artifact ("Impactrankapp") for
HACCP, now covering workplace safety and environmental inspections too. It runs as a Google Apps Script
web app: everyone opens one link, signs in with Google, and all records are saved in one Google Sheet.

**Open the app:** https://script.google.com/macros/s/AKfycbytx5uxMD3vGso1nbUTJF_AyhCjzks9WrDYaASZtYm28EQXDnzZxfOFKYJcoKPZxHJs/exec

<img src="qr-code.png" alt="QR code that opens the Workplace Inspection app" width="200">

Scan to open the app. For printing, use [`qr-code.png`](qr-code.png) (1200 × 1200) or
[`qr-code.svg`](qr-code.svg), which stays sharp at any size.

| Section | Form | Title | Rev in app | Rated |
|---|---|---|---|---|
| HACCP | IR-PP-02.1 | Cleaning and Sanitation Inspection Checksheet | Rev 05 (Issue 05, 12-10-2026) | OK / NG, per area |
| HACCP | IR-PP-13.1 | Glass, Hard Plastic, Wood and Metal Register | Rev 02 | ✓ / × / N/A |
| HACCP | IR-PP-01.1 | Personnel Hygiene and GMP Inspection Checklist | Rev 01 | 1–5 |
| HACCP | IR-PP-14.1 | Buildings and Fabrication Inspection Record | Rev 00 | ✓ / ×, whole factory |
| Safety | OSHP-06.02 | Workplace Safety Inspection Report (Laporan Pemeriksaan Tempat Kerja sheet) | Issue 00 | Baik / Kurang Baik / N/A, whole factory |
| Environmental | (none) | ISO 14001:2015 Environmental Walkthrough Inspection Checklist | — | ✔ / ✖ / N/A, whole factory |

Inspectors log in, pick the form, rate each item (a failed item needs a remark and a photo), submit, and
a verifier signs each form off. The app also does schedules, corrective actions, backup and printable
reports laid out like the paper forms.

- **Safety** shows each item in BM as printed on OSHP-06.02, with an English translation underneath.
  The form's JKKP checklist sheet (A/B/C ratings) is not in the app. Item numbering follows the form,
  which skips "iv" under item 4 and "i" under item 6. "Disemak oleh" (reviewer) can be any Verifier or
  Admin, because the form names a role, not a person.
- **Environmental** has the 18 walkthrough items with their "Evidence / Form to Verify", a Person In
  Charge and Auditor Comments box. The person named on the form reviews it (set in `VERIFIER_RULES`). The form has no document
  number; set one on the app's ⚙️ Form screen if it gets one.
- **Corrective actions** are three separate lists on the 🔧 CAR screen: HACCP CAR, Safety CSAR
  (OSHP-06.03) and Environmental Findings. Each shows only its own section's failed items.
- Failed items are stored as NG whatever the form calls them (NG, ×, Kurang Baik, ✖), so compliance %,
  NC counts and the NG Items tab work the same for every form.

## Where the records are saved

All records go to a spreadsheet called **HACCP Inspection App - Records**, in a Drive folder called
**HACCP Inspection App**, owned by whoever deploys the script. Photos and signatures are saved as image
files in the folder's **Photos and signatures** subfolder. GitHub only holds the app's code.

| Tab | What it holds |
|---|---|
| Inspections | One readable row per inspection: date, inspectors, form, OK/NG, status, verifiers and reviewers |
| NG Items | One row per failed item: system (HACCP / Safety / Environmental), area, item, remarks, links to the photos. Use this for audits |
| Access | Optional list of who may open the app (see below) |
| Files | Index of the photo and signature files |
| app-users, inspections-data, inspection-schedules, inspection-drafts, corrective-actions | The app's own data, one record per row. Don't edit these by hand |

Inspections and NG Items are rebuilt every time an inspection is saved, so edits there are overwritten.

The app only sends the records that changed, and only deletes records the phone has seen. Two inspectors
can work at the same time without overwriting each other's inspections. Every inspection gets its own
record number, so inspections started at the same moment, with the same names and time, stay separate,
and so does each submission of a shared draft. If two people change the **same** submitted inspection at
once (for example, both verify it), the last save wins. Each phone fetches everyone's records again every
30 seconds and when the app comes back on screen; 🔄 Sync does it straight away.

### No signal, refreshes and closed tabs

The app needs internet to open (it is served by Google). Once open, nothing is lost:

- The inspection being filled in is saved on the phone (in the browser's IndexedDB, which has room for
  photos) after every change. After a refresh, or reopening the app, it opens again where you left off.
- Every submit, draft, verification and corrective action is first kept on the phone, then uploaded.
  If there is no signal, it stays on the phone, even through a refresh or a closed tab, and uploads
  by itself: every 15 seconds while the app is open, when the signal returns, and the next time the
  app opens. A yellow badge ("⏳ N changes saved on this device, waiting to upload") shows until
  everything has reached the Google Sheet.
- If the app opens but can't load a list from Google, changes it saves to that list without having
  seen it never overwrite records already on the Sheet (for example the default user list can't
  reset a changed password).

Don't clear the browser's site data for the app while the badge is showing; that would delete the
waiting changes.

## Set it up on Google (once)

Do this signed in as the account that should own the records, for example the department's Google account.
You don't need to build anything: the files are ready in `inspection-app/apps-script/` on GitHub.

1. Go to [script.google.com](https://script.google.com) → **New project**. Name it "HACCP Inspection App".
2. **Project Settings** (gear icon) → tick **Show "appsscript.json" manifest file in editor**.
3. Back in **Editor**, replace the contents of two files with the ones in `inspection-app/apps-script/`:
   - `appsscript.json`
   - `Code.gs`

   The project needs no Index.html. If you added one earlier, delete it (⋮ next to it → **Delete**).
4. With **Code.gs** open, pick **setup** in the function list above the code and click **Run**. Allow the
   permissions it asks for. The log shows links to the new spreadsheet, photos folder and app folder.
5. Download `apps-script/Index.html` from GitHub (the **Download raw file** button), and upload it to the
   **HACCP Inspection App** folder in Google Drive (drag it in, or **New** → **File upload**).
   The app is about 240 KB, too big to paste into the Apps Script editor reliably, so it lives in Drive.
6. **Deploy** → **New deployment** → type **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone within Impact Rank** (the manifest already sets this)
7. Copy the web app URL (it ends in `/exec`). That's the link for inspectors; put it in a QR code for
   the shop floor.

If the app shows a message instead of the login screen, it says what to fix: Index.html not uploaded
yet, cut off (download and upload it again), or converted to a Google Doc (turn off Drive's
"Convert uploads" setting, delete it and upload again).

### If the company accounts are not Google Workspace

"Anyone within Impact Rank" only exists for Google Workspace accounts. Without Workspace:

- In `appsscript.json` set `"executeAs": "USER_ACCESSING"` and `"access": "ANYONE"`.
- Share the **HACCP Inspection App** folder with each inspector as **Editor**.
- Each person then signs in with their own Google account, and only people the folder is shared with
  can save. They can also open the spreadsheet directly, so ask them not to edit the data tabs.

### Who can open it

The deployment's "Who has access" is the main control. To narrow it, list people on the **Access** tab:
one email per row (`name@impactrank.com.my`), or `@impactrank.com.my` for everyone at the company.
Leave it empty to allow everyone the deployment allows.

The app still has its own login screen with the old user list. Every default password is `123`, and the
login screen says so. Change them from the Admin screen.

### Check these on the first deployment

The automated tests below run the real `Code.gs` on stand-ins for Sheets and Drive. A few things can
only be checked on Google itself:

- Downloading a report, a backup or a photo works from inside the web app.
- Printing a report works.
- The app opens reasonably fast on an inspector's phone.

## Move the records from the claude.ai artifact

1. Open the old claude.ai app, go to **📦 Backup** → **JSON Backup** → **📥 Download**.
2. Open the new web app, go to **📦 Backup** → **📤 Restore**, and pick that file.

Restore adds anything new and doesn't duplicate what is already there.

## Updating the app

1. Edit `ImpactRankApp.jsx` (or ask the `inspection-app-checker` agent to).
2. Run `npm test`. It rebuilds both pages and runs all the checks.
3. Upload the new `apps-script/Index.html` to the **HACCP Inspection App** Drive folder. The newest upload
   is used, so you can leave or delete the old one. Reload the app; no new deployment is needed.
4. Only if `Code.gs` changed: paste it into the Apps Script project, then **Deploy** → **Manage
   deployments** → edit (pencil) → Version: **New version** → **Deploy**. The link stays the same.

## Files

- `ImpactRankApp.jsx` — the app. Edit this one.
- `template.html` — the page shell: React, lucide and Tailwind from a CDN.
- `storage-google.js` — `window.storage` for the web app: saves through `Code.gs` to the Sheet.
- `storage-local.js` — `window.storage` that keeps records in one browser, for the local copy.
- `build.py` — compiles the JSX and writes `apps-script/Index.html` and `index.html`.
- `apps-script/` — `Code.gs` and `appsscript.json` go into the Apps Script project; `Index.html` is
  uploaded to the app's Drive folder.
- `index.html` — local copy that saves in the browser only. For trying changes, not for real records.
- `qr-code.png`, `qr-code.svg` — QR code for the app link, to print for the shop floor.
- `publish_public.py` — makes the public copy in zuraidah94/public-doc, with staff names, logins and
  passwords replaced by example users. Run `python3 publish_public.py ../../public-doc/inspection-app`.
- `forms/` — word-for-word copies of the current IR-PP-02.1, OSHP-06.02 and ISO 14001 walkthrough forms,
  which the app must match.
- `check-checklist.mjs` — compares the app's checklists, Rev and Issue with those copies.
- `smoke-test.mjs` — in headless Chromium, runs an IR-PP-02.1, a Safety and an Environmental inspection
  from login to submit, checks the printed reports and files a finding in the Environmental list.
- `test/apps-script.test.mjs` — runs `Code.gs` on stand-ins for Sheets and Drive, with two inspectors
  using `apps-script/Index.html` at once: shared records, no overwriting, photos, NG Items, access list.

## Checking the app

```
cd inspection-app
npm install      # once
npm test         # build, checklist check, smoke test, Apps Script test
```

The private repo has an `inspection-app-checker` agent for Claude Code that does this for you.
Ask Claude Code to "check the inspection app". It finds the latest Form PP02.1 issue in Google Drive,
updates the app to match, runs `npm test`, fixes what fails, and lists improvements for the HACCP Team
Leader to decide.

## Notes

- Changes to the checklist made on the app's Form screen last only until the page is reloaded; the
  app always starts from the built-in checklist. Change `ImpactRankApp.jsx` to change it for everyone.
