#!/usr/bin/env node
// Checks a partner folder before building, and explains any problem in plain English.
//   node src/check.mjs partners/chattanooga            (or: npm run check)
//   node src/check.mjs partners/chattanooga --online   (also checks the Google Fonts names)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { vars } from './lib/text.mjs';

const CONTEXT_WORDS = ['area', 'areaState', 'areaLede', 'service', 'serviceLower', 'articleTitle', 'finish', 'condition', 'n', 'first', 'date', 'firstAreas'];
const FIXED_PAGES = ['', 'services/', 'pricing/', 'visualizer/', 'estimate/', 'areas/', 'learn/', 'about/', 'warranty/', 'contact/', 'privacy/', 'dashboard/'];
const REQUIRED = ['website', 'business', 'brand', 'photos', 'wording', 'services', 'reviews', 'areaGroups', 'areas', 'articles', 'pricing', 'maintenancePlans', 'warranty', 'stains', 'location', 'visualizer', 'sources'];

// Friendly JSON reading: say which line is broken and what usually causes it.
function readJson(file, label) {
  const text = fs.readFileSync(file, 'utf8');
  try { return { data: JSON.parse(text) }; }
  catch (e) {
    const m = /position (\d+)/.exec(e.message);
    const pos = m ? +m[1] : 0;
    const before = text.slice(0, pos);
    const line = before.split('\n').length, col = pos - before.lastIndexOf('\n');
    const lines = text.split('\n');
    const show = [line - 1, line].filter(n => n >= 1).map(n => `      line ${n}: ${lines[n - 1].trim().slice(0, 90)}`).join('\n');
    let hint = 'Usually a missing comma at the end of the line above, an extra comma before a } or ], or a missing quote mark.';
    if (/[“”]/.test(text)) hint = 'The file has curly quotes (“ ”). Only straight quotes (") work. Retype them in a code editor, not Word.';
    return { error: `${label} can't be read: something is off near line ${line}, character ${col}.\n${show}\n      Hint: ${hint}` };
  }
}

const levenshtein = (a, b) => {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1));
  return d[a.length][b.length];
};
const closest = (word, list) => list.map(w => [w, levenshtein(word, w)]).sort((x, y) => x[1] - y[1])[0];

export function loadPartner(dir) {
  const errors = [], warnings = [];
  const rel = (p) => path.relative(process.cwd(), p) || p;
  const cfgFile = path.join(dir, 'site.config.json'), crmFile = path.join(dir, 'crm.config.json'), imgDir = path.join(dir, 'images');
  if (!fs.existsSync(cfgFile)) return { problems: { errors: [`Can't find ${rel(cfgFile)}.`], warnings } };
  const a = readJson(cfgFile, rel(cfgFile));
  if (a.error) return { problems: { errors: [a.error], warnings } };
  const cfg = a.data;
  let crm = { demoUser: 'demo', demoPass: 'demo', reminderYears: { transparent: 2, 'semi-transparent': 2, solid: 3 } };
  if (fs.existsSync(crmFile)) { const c = readJson(crmFile, rel(crmFile)); if (c.error) errors.push(c.error); else crm = c.data; }

  const missing = REQUIRED.filter(k => !(k in cfg));
  if (missing.length) return { cfg, crm, problems: { errors: [`site.config.json is missing these sections: ${missing.join(', ')}. Copy them back from another partner's file.`], warnings } };

  // ---- images ----
  const files = fs.existsSync(imgDir) ? fs.readdirSync(imgDir).filter(f => !f.startsWith('.')) : [];
  if (!files.length) errors.push(`The images folder (${rel(imgDir)}) is missing or empty.`);
  const used = new Set();
  const needImage = (file, where) => {
    if (!file) { errors.push(`${where} has no photo file name.`); return; }
    used.add(file);
    if (files.includes(file)) return;
    const near = files.find(f => f.toLowerCase() === file.toLowerCase());
    if (near) errors.push(`${where} says "${file}" but the file is named "${near}". Capital letters must match exactly.`);
    else { const c = files.length ? closest(file, files) : null; errors.push(`${where} uses "${file}", but there's no file with that name in ${rel(imgDir)}.${c && c[1] <= 6 ? ` Did you mean "${c[0]}"?` : ''}`); }
  };
  needImage(cfg.photos.hero?.file, 'photos.hero');
  needImage(cfg.photos.about?.file, 'photos.about');
  needImage(cfg.photos.beforeAfter?.before, 'photos.beforeAfter.before');
  needImage(cfg.photos.beforeAfter?.after, 'photos.beforeAfter.after');
  cfg.services.forEach((s, i) => needImage(s.photo, `Service "${s.name}" (services #${i + 1})`));
  cfg.areas.forEach(ar => needImage(ar.photo, `Area "${ar.name}"`));
  cfg.articles.forEach(ar => needImage(ar.photo, `Article "${ar.slug}"`));
  cfg.visualizer.samples.forEach(s => needImage(s.file, `Visualizer sample "${s.label}"`));
  if (cfg.brand.logo?.image) needImage(cfg.brand.logo.image, 'brand.logo.image');
  if (cfg.brand.favicon) needImage(cfg.brand.favicon, 'brand.favicon');
  for (const f of files) {
    const size = fs.statSync(path.join(imgDir, f)).size;
    if (size > 1.5e6) warnings.push(`images/${f} is ${(size / 1e6).toFixed(1)} MB. Photos over ~1 MB load slowly on phones; resize to about 2000 px wide.`);
    if (/\s/.test(f)) warnings.push(`images/${f} has a space in its name. Use dashes instead (my-deck.jpg) to be safe.`);
  }
  const unused = files.filter(f => !used.has(f) && !/^(ba-|teaser-)/.test(f));
  if (unused.length) warnings.push(`Not used anywhere (fine, just so you know): ${unused.join(', ')}`);

  // ---- brand ----
  for (const [k, v] of Object.entries(cfg.brand.colors || {})) if (!/^#[0-9a-fA-F]{6}$/.test(v)) errors.push(`brand.colors.${k} is "${v}". Colors must look like #1f3a2e (a # and 6 letters/numbers).`);
  for (const k of ['headings', 'body', 'labels']) if (!cfg.brand.fonts?.[k]?.name) errors.push(`brand.fonts.${k} needs a font name from fonts.google.com.`);
  for (const [k, s] of Object.entries(cfg.stains)) if (!k.startsWith('_')) s.forEach(st => { if (!/^#[0-9a-fA-F]{6}$/.test(st.hex)) errors.push(`Stain color "${st.name}" has a bad color code "${st.hex}".`); });
  const stainNames = Object.entries(cfg.stains).filter(([k]) => !k.startsWith('_')).flatMap(([, s]) => s.map(x => x.name));
  (cfg.visualizer.teaserColors || []).forEach(n => { if (!stainNames.includes(n)) errors.push(`visualizer.teaserColors lists "${n}", which isn't one of the stain colors.`); });

  // ---- pages, slugs, links ----
  const slugs = [...cfg.services.map(s => 'services/' + s.slug + '/'), ...cfg.areas.map(s => 'areas/' + s.slug + '/'), ...cfg.articles.map(s => 'learn/' + s.slug + '/')];
  const known = new Set([...FIXED_PAGES, ...slugs]);
  for (const s of [...cfg.services, ...cfg.areas, ...cfg.articles]) if (!/^[a-z0-9-]+$/.test(s.slug || '')) errors.push(`"${s.slug}" isn't a valid page address. Use lowercase letters, numbers and dashes only.`);
  const dup = slugs.filter((s, i) => slugs.indexOf(s) !== i); if (dup.length) errors.push(`Two pages share the same address: ${[...new Set(dup)].join(', ')}`);
  const bySlug = Object.fromEntries(cfg.areas.map(x => [x.slug, x]));
  cfg.areaGroups.forEach(g => g.slugs.forEach(s => { if (!bySlug[s]) errors.push(`areaGroups "${g.name}" lists "${s}", but there's no area with that slug.`); }));
  const grouped = new Set(cfg.areaGroups.flatMap(g => g.slugs));
  cfg.areas.forEach(x => { if (!grouped.has(x.slug)) warnings.push(`Area "${x.name}" isn't in any areaGroups list, so it won't be built.`); });

  // ---- every piece of wording ----
  const words = new Set([...Object.keys(vars(cfg)), ...CONTEXT_WORDS]);
  const sources = cfg.sources;
  const srcOk = (k) => k === 'climate' || k === 'humidity' || (sources[k] && !k.startsWith('_'));
  const walk = (node, where) => {
    if (typeof node === 'string') {
      for (const m of node.matchAll(/\{([A-Za-z]+)\}/g)) if (!words.has(m[1])) { const c = closest(m[1], [...words]); errors.push(`${where} uses {${m[1]}}, which isn't a fill-in word.${c[1] <= 3 ? ` Did you mean {${c[0]}}?` : ' See the list in MARKETING_GUIDE.md.'}`); }
      for (const m of node.matchAll(/\{cite:([A-Za-z]+)\}/g)) if (!srcOk(m[1])) errors.push(`${where} cites {cite:${m[1]}}, but there's no source called "${m[1]}" in the sources list.`);
      for (const m of node.matchAll(/\]\(([^)\s]*)\)/g)) {
        const t = m[1];
        if (t.startsWith('source:')) { if (!srcOk(t.slice(7))) errors.push(`${where} links to ${t}, but there's no such source.`); }
        else if (t.startsWith('/')) { const p = t.slice(1).split(/[?#]/)[0]; if (!known.has(p)) { const c = closest(p, [...known]); errors.push(`${where} links to "${t}", which isn't a page on this site.${c[1] <= 6 ? ` Did you mean "/${c[0]}"?` : ''}`); } }
        else if (!/^(https?:|mailto:|tel:|sms:)/.test(t) && !t.includes('{')) errors.push(`${where} has a link to "${t}". Links must start with / (this site), https:// (another site) or source:.`);
      }
      if ((node.match(/\*\*/g) || []).length % 2) warnings.push(`${where} has an unmatched ** (bold marker).`);
      if (/<[a-z][^>]*>/i.test(node)) warnings.push(`${where} contains something that looks like HTML. It will show as plain text; use **bold** and [links](/page/) instead.`);
      return;
    }
    if (Array.isArray(node)) node.forEach((x, i) => walk(x, `${where}[${i + 1}]`));
    else if (node && typeof node === 'object') for (const [k, v] of Object.entries(node)) if (!k.startsWith('_')) walk(v, where ? `${where}.${k}` : k);
  };
  for (const sec of ['wording', 'services', 'areas', 'articles', 'reviews', 'warranty', 'maintenancePlans', 'business', 'location']) walk(cfg[sec], sec);

  // ---- local copy must not be copy-paste ----
  const wset = (x) => new Set(x.sections.map(s => s.text).join(' ').toLowerCase().match(/[a-z']+/g));
  for (let i = 0; i < cfg.areas.length; i++) for (let j = i + 1; j < cfg.areas.length; j++) {
    const A = wset(cfg.areas[i]), B = wset(cfg.areas[j]); const inter = [...A].filter(w => B.has(w)).length;
    if (inter / (A.size + B.size - inter) > 0.45) warnings.push(`Area pages "${cfg.areas[i].name}" and "${cfg.areas[j].name}" read almost the same. Google treats copy-paste city pages as spam; give each its own local details.`);
  }
  return { cfg, crm, problems: { errors, warnings } };
}

// ---- command line ----
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dirs = process.argv.slice(2).filter(a => !a.startsWith('--'));
  const online = process.argv.includes('--online');
  const list = dirs.length ? dirs : fs.readdirSync('partners').map(d => path.join('partners', d)).filter(d => fs.statSync(d).isDirectory());
  let bad = 0;
  for (const d of list) {
    const { cfg, problems } = loadPartner(path.resolve(d));
    console.log(`\n${d}`);
    if (online && cfg && !problems.errors.length) {
      const { fontsUrl } = await import('./lib/layout.mjs');
      try {
        const res = await fetch(fontsUrl(cfg));
        if (!res.ok) problems.errors.push(`Google Fonts didn't accept the font settings (${res.status}). Check the font names on fonts.google.com, or set "weights" to "400".`);
        else console.log('  ✓ Fonts found on Google Fonts');
      } catch { problems.warnings.push('Could not reach Google Fonts to check the font names (offline?).'); }
    }
    problems.errors.forEach(e => console.log('  ✗ ' + e));
    problems.warnings.forEach(w => console.log('  ! ' + w));
    if (!problems.errors.length) console.log(`  ✓ No problems${problems.warnings.length ? ' (the ! lines are just notes)' : ''}`);
    bad += problems.errors.length;
  }
  process.exit(bad ? 1 : 0);
}
