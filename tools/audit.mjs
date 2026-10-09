// Quick site audit: broken internal links, missing alt text, duplicate titles/descriptions, noindex, JSON-LD parse.
// usage: node tools/audit.mjs docs   (each demo-* folder is its own site: audit it separately)
import fs from 'node:fs'; import path from 'node:path';
const root = path.resolve(process.argv[2] || 'docs');
const files = []; (function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) { if (!f.startsWith('demo-')) walk(p); } else if (f.endsWith('.html')) files.push(p); } })(root);
const titles = {}, descs = {}; let problems = 0;
const bad = (f, m) => { problems++; console.log('  ✗', path.relative(root, f), '—', m); };
for (const f of files) {
  const h = fs.readFileSync(f, 'utf8');
  if (f.endsWith('404.html') || f.includes('/dashboard/')) continue;
  const t = (h.match(/<title>([^<]*)<\/title>/) || [])[1]; const d = (h.match(/name="description" content="([^"]*)"/) || [])[1];
  (titles[t] = titles[t] || []).push(f); (descs[d] = descs[d] || []).push(f);
  if (!/name="robots" content="noindex/.test(h)) bad(f, 'no noindex (expected while mockup)');
  if (d && d.length > 170) bad(f, 'description ' + d.length + ' chars');
  for (const m of h.matchAll(/<img\b[^>]*>/g)) if (!/\balt="/.test(m[0])) bad(f, 'img without alt: ' + m[0].slice(0, 80));
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch { bad(f, 'bad JSON-LD'); } }
  if ((h.match(/<h1\b/g) || []).length !== 1) bad(f, 'h1 count ' + (h.match(/<h1\b/g) || []).length);
  for (const m of h.matchAll(/(?:href|src)="([^"#?]+)[^"]*"/g)) {
    const u = m[1]; if (/^(https?:|mailto:|tel:|sms:|data:)/.test(u)) continue;
    let target = path.resolve(path.dirname(f), u); if (u.endsWith('/')) target = path.join(target, 'index.html');
    if (!fs.existsSync(target)) bad(f, 'broken link ' + u);
  }
}
for (const [t, fs_] of Object.entries(titles)) if (fs_.length > 1) bad(fs_[0], 'duplicate title x' + fs_.length + ': ' + t);
for (const [t, fs_] of Object.entries(descs)) if (fs_.length > 1) bad(fs_[0], 'duplicate description x' + fs_.length);
console.log(files.length + ' html files checked, ' + problems + ' problems');
