"""Build the two pages from ImpactRankApp.jsx. Edit the JSX, then run: python3 build.py

- apps-script/Index.html — the Google Sheets version, served by apps-script/Code.gs.
  Records are shared by everyone, through storage-google.js.
- index.html — a local copy that keeps records in this browser only (storage-local.js).
  Handy for trying changes; the smoke test runs against it.

The JSX is compiled to plain JavaScript here, so phones don't have to compile it on every
visit. That needs Babel from node_modules: run `npm install` once first.
"""
import hashlib
import re
import subprocess
from pathlib import Path

HERE = Path(__file__).parent
jsx = (HERE / "ImpactRankApp.jsx").read_text(encoding="utf-8")

# The page loads React and lucide as browser globals, so turn the two imports into lookups on
# those globals, drop the export keyword and mount the app.
imports = re.findall(r"^import\s+(.+?)\s+from\s+'([^']+)';\s*$", jsx, flags=re.M)
lines = []
for names, pkg in imports:
    glob = {"react": "React", "lucide-react": "LucideReact"}[pkg]
    named = re.search(r"\{(.+)\}", names)
    if named:
        lines.append(f"const {{{named.group(1).strip()}}} = {glob};")
body = re.sub(r"^import\s+.+?;\s*$\n", "", jsx, flags=re.M)
body = body.replace("export default function ImpactRankApp", "function ImpactRankApp", 1)
source = "\n".join(lines) + "\n" + body + \
    '\nReactDOM.createRoot(document.getElementById("root")).render(<ImpactRankApp />);\n'

babel = HERE / "node_modules" / "@babel" / "standalone"
if not babel.exists():
    raise SystemExit("Babel not found: run `npm install` in inspection-app first.")
compiled = subprocess.run(
    ["node", "-e", "const B=require(process.argv[1]);let s='';process.stdin.on('data',d=>s+=d)"
     ".on('end',()=>process.stdout.write(B.transform(s,{presets:['react'],comments:false}).code))", str(babel)],
    input=source, capture_output=True, text=True, check=True).stdout
assert "</script" not in compiled, "compiled app contains </script>, which would end the inline script early"

# Shown on the loading line, so a screenshot tells which version is deployed.
shell = "".join((HERE / f).read_text(encoding="utf-8") for f in ["template.html", "storage-local.js", "storage-google.js"])
build = hashlib.sha256((source + shell).encode()).hexdigest()[:7]
template = (HERE / "template.html").read_text(encoding="utf-8")
for out, storage in [("index.html", "storage-local.js"), ("apps-script/Index.html", "storage-google.js")]:
    html = template.replace("/*__STORAGE__*/", (HERE / storage).read_text(encoding="utf-8").strip())
    html = html.replace("/*__APP__*/", compiled).replace("/*__BUILD__*/", build)
    (HERE / out).write_text(html, encoding="utf-8")
    print(f"Wrote {out} ({len(html):,} bytes)")
