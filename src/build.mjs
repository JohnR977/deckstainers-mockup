#!/usr/bin/env node
// Builds a complete static site from ONE Pro Partner config.
//   node src/build.mjs                                  -> site.config.json into docs/
//   node src/build.mjs configs/knoxville.config.json docs/demo-knoxville
// No dependencies. Output is plain HTML/CSS/JS that runs on GitHub Pages.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as L from './lib/layout.mjs';
import * as P from './content/pages.mjs';
import { services as getServices } from './content/services.mjs';
import { articles as getArticles, makeCiter } from './content/articles.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfgPath = path.resolve(ROOT, process.argv[2] || 'site.config.json');
const outDir = path.resolve(ROOT, process.argv[3] || 'docs');

const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const src = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/sources.json'), 'utf8'));
const areas = JSON.parse(fs.readFileSync(path.join(ROOT, cfg.location.areasFile), 'utf8'));
const bySlug = Object.fromEntries(areas.map(a => [a.slug, a]));
const areaGroups = cfg.location.areaGroups.map(g => ({ name: g.name, areas: g.slugs.map(s => {
  if (!bySlug[s]) throw new Error(`Area "${s}" is listed in areaGroups but has no copy in ${cfg.location.areasFile}`);
  return bySlug[s];
}) }));
const orderedAreas = areaGroups.flatMap(g => g.areas);
const services = getServices(cfg);
const arts = getArticles(cfg);
const pages = [];

// Guard against copy-paste area pages: flag any two areas whose body copy is too similar.
(function checkAreaCopy() {
  const words = a => new Set(a.sections.map(s => s.p).join(' ').toLowerCase().match(/[a-z']+/g));
  for (let i = 0; i < areas.length; i++) for (let j = i + 1; j < areas.length; j++) {
    const A = words(areas[i]), B = words(areas[j]);
    const inter = [...A].filter(w => B.has(w)).length;
    const jac = inter / (A.size + B.size - inter);
    if (jac > 0.45) console.warn(`  ! Area copy for ${areas[i].slug} and ${areas[j].slug} looks too similar (${jac.toFixed(2)})`);
  }
})();

function emit(relPath, html) {
  const file = path.join(outDir, relPath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

function addPage({ path: p, title, description, body, current, schema = [], ogImage, scripts, bodyClass, priority = 0.6 }) {
  const depth = p ? p.split('/').filter(Boolean).length : 0;
  if (description.length > 160) description = description.slice(0, 157).replace(/[\s,;:]+\S*$/, '') + '…';
  const html = L.page(cfg, { path: p, depth, title, description, body: body(L.makeRel(depth)), current, schema, ogImage, scripts, areas: orderedAreas, bodyClass });
  emit(p + 'index.html', html);
  pages.push({ path: p, priority });
}

const B = cfg.business;
const city = `${B.city}, ${B.state}`;
const biz = L.businessSchema(cfg, orderedAreas);
const crumbsLd = (list) => L.breadcrumbSchema(cfg, list);

// ---------- clean output (keep any nested demo folders) ----------
fs.mkdirSync(outDir, { recursive: true });
for (const f of fs.readdirSync(outDir)) {
  if (f.startsWith('demo-')) continue;
  fs.rmSync(path.join(outDir, f), { recursive: true, force: true });
}

// ---------- pages ----------
addPage({
  path: '', priority: 1.0, bodyClass: 'is-home',
  title: `Deck Staining ${city} | ${B.name}`,
  description: `${B.city} deck staining, cleaning and restoration. Free photo estimates, published prices, a stain color visualizer and a written warranty. Call ${B.phone}.`,
  body: (r) => P.home(cfg, r, { services, areas: orderedAreas, areaGroups, src }).body,
  schema: [biz, L.faqSchema(P.homeFaqs(cfg, src))]
});

addPage({
  path: 'services/', current: 'services/', priority: 0.8,
  title: `Deck Staining & Wood Care Services in ${city} | ${B.shortName}`,
  description: `Deck staining, deck cleaning and restoration, fence staining, log home staining, pergolas and maintenance plans in ${B.city}.`,
  body: (r) => P.servicesIndex(cfg, r, services),
  schema: [biz, crumbsLd([['Home', ''], ['Services', 'services/']])]
});

for (const s of services) {
  addPage({
    path: `services/${s.slug}/`, current: 'services/', priority: 0.8,
    title: `${s.title} | ${B.shortName}`, description: s.description,
    ogImage: cfg.photos[s.photo].src,
    body: (r) => P.servicePage(cfg, r, s, { services, plansHtml: P.plansBlock(cfg, r) }),
    schema: [L.serviceSchema(cfg, s.name, s.description, `services/${s.slug}/`, orderedAreas), L.faqSchema(s.faqs),
      crumbsLd([['Home', ''], ['Services', 'services/'], [s.name, `services/${s.slug}/`]])]
  });
}

addPage({
  path: 'pricing/', current: 'pricing/', priority: 0.9,
  title: `Deck Staining Cost in ${B.city} — Price Calculator | ${B.shortName}`,
  description: `See what deck staining costs in ${B.city}. Enter your deck size, railings, stairs and condition for an instant price range. Published rates, no phone tag.`,
  body: (r) => P.pricingPage(cfg, r, src),
  scripts: ['assets/js/calculator.js'],
  schema: [biz, crumbsLd([['Home', ''], ['Prices', 'pricing/']])]
});

addPage({
  path: 'visualizer/', current: 'visualizer/', priority: 0.8,
  title: `Deck Stain Color Visualizer — Try Colors on Your Deck | ${B.shortName}`,
  description: `Upload a photo of your deck and try transparent, semi-transparent and solid stain colors. Free tool from ${B.name}.`,
  body: (r) => P.visualizerPage(cfg, r),
  scripts: ['assets/js/visualizer.js'], bodyClass: 'is-viz',
  schema: [crumbsLd([['Home', ''], ['Color Visualizer', 'visualizer/']])]
});

addPage({
  path: 'estimate/', priority: 0.9,
  title: `Free Deck Staining Estimate in ${B.city} — Send Photos | ${B.shortName}`,
  description: `Upload up to 5 photos of your deck and get a price range, usually the same day. Serving ${cfg.location.region}.`,
  body: (r) => P.estimatePage(cfg, r),
  schema: [crumbsLd([['Home', ''], ['Get an Estimate', 'estimate/']])]
});

addPage({
  path: 'areas/', current: 'areas/', priority: 0.7,
  title: `Deck Staining Service Areas around ${B.city} | ${B.shortName}`,
  description: `Deck staining across ${cfg.location.region}: ${orderedAreas.slice(0, 8).map(a => a.name).join(', ')} and more.`,
  body: (r) => P.areasIndex(cfg, r, areaGroups),
  schema: [biz, crumbsLd([['Home', ''], ['Service Areas', 'areas/']])]
});

for (const a of orderedAreas) {
  const desc = `${a.lede} Deck staining and restoration in ${a.name}, ${a.state}. Free photo estimates from ${B.name}.`;
  addPage({
    path: `areas/${a.slug}/`, current: 'areas/', priority: 0.7,
    title: `Deck Staining ${a.name}, ${a.state} | ${B.shortName}`,
    description: desc.length > 160 ? desc.slice(0, 157).replace(/\s+\S*$/, '') + '…' : desc,
    ogImage: a.image,
    body: (r) => P.areaPage(cfg, r, a, { bySlug, src }),
    schema: [
      { ...L.serviceSchema(cfg, 'Deck Staining', a.lede, `areas/${a.slug}/`, [a]) },
      L.faqSchema([a.faq]),
      crumbsLd([['Home', ''], ['Service Areas', 'areas/'], [a.name, `areas/${a.slug}/`]])
    ]
  });
}

addPage({
  path: 'learn/', current: 'learn/', priority: 0.6,
  title: `Deck Care Guides for ${B.stateName} Homeowners | ${B.shortName}`,
  description: `When to stain, oil vs. water-based, semi-transparent vs. solid, new pressure-treated wood, peeling and how often to restain. With expert sources.`,
  body: (r) => P.learnIndex(cfg, r, arts),
  schema: [crumbsLd([['Home', ''], ['Learn', 'learn/']])]
});

for (const a of arts) {
  addPage({
    path: `learn/${a.slug}/`, current: 'learn/', priority: 0.6,
    title: `${a.title} | ${B.shortName}`, description: a.description, ogImage: a.image,
    body: (r) => { const cite = makeCiter(src); const html = a.body(cite); return P.articlePage(cfg, r, a, html, cite.list(), arts); },
    schema: [L.articleSchema(cfg, a, `learn/${a.slug}/`), crumbsLd([['Home', ''], ['Learn', 'learn/'], [a.short, `learn/${a.slug}/`]])]
  });
}

addPage({ path: 'about/', current: 'about/', title: `About ${B.name}`, description: `${B.name}: ${B.crewSize} in ${B.city} that only stains and restores outdoor wood. Licensed, insured, Stain & Seal Supply Pro Partner.`, body: (r) => P.aboutPage(cfg, r, src), schema: [biz] });
addPage({ path: 'warranty/', title: `Deck Staining Warranty — Written Terms | ${B.shortName}`, description: `Our written warranty: ${cfg.warranty.horizontalYears} years on deck floors, ${cfg.warranty.verticalYears} years on railings and fences. What's covered and what isn't.`, body: (r) => P.warrantyPage(cfg, r) });
addPage({ path: 'contact/', title: `Contact ${B.name} — ${B.phone}`, description: `Call or text ${B.phone}, email, or send a message. ${B.hours}.`, body: (r) => P.contactPage(cfg, r), schema: [biz] });
addPage({ path: 'privacy/', title: `Privacy Policy | ${B.shortName}`, description: `How ${B.name} uses the information you send us.`, body: (r) => P.privacyPage(cfg, r), priority: 0.2 });

// 404 lives at the site root but is served at any URL, so its links use the absolute base path.
{
  const basePath = new URL(cfg.mockup ? cfg.siteUrl : cfg.launchUrl).pathname;
  const abs = (p = '') => (/^(https?:|#|mailto:|tel:|sms:)/.test(p) ? p : basePath + p);
  let html = L.page(cfg, { path: '404.html', depth: 0, title: `Page not found | ${B.shortName}`, description: 'Page not found.', body: P.notFoundPage(cfg, abs), areas: orderedAreas });
  html = html.replace(/(href|src|data-root)="\.\/([^"]*)"/g, (_, a, p) => `${a}="${basePath}${p}"`);
  emit('404.html', html);
}

// ---------- dashboard (fake login, localStorage CRM) ----------
{
  const dash = fs.readFileSync(path.join(ROOT, 'src/dashboard/index.html'), 'utf8')
    .replaceAll('{{NAME}}', L.esc(B.name))
    .replaceAll('{{SHORT}}', L.esc(B.shortName))
    .replaceAll('{{CITY}}', L.esc(B.city))
    .replaceAll('{{FOREST}}', cfg.theme.forest)
    .replace('{{THEME}}', L.themeStyle(cfg))
    .replace('{{CONFIG}}', JSON.stringify({
      ...L.publicConfig(cfg),
      business: { name: B.name, phone: B.phone, email: B.email, city: B.city, state: B.state, license: L.val(B.license), googleReviewUrl: B.googleReviewUrl, street: L.val(B.street), zip: B.zip },
      depositPercent: cfg.pricing.depositPercent, demoUser: cfg.dashboard.demoUser, demoPass: cfg.dashboard.demoPass,
      areas: orderedAreas.map(a => a.name), plans: cfg.maintenancePlans.plans, warranty: cfg.warranty
    }));
  emit('dashboard/index.html', dash);
}

// ---------- assets ----------
fs.cpSync(path.join(ROOT, 'src/assets'), path.join(outDir, 'assets'), { recursive: true, filter: (s) => !s.endsWith('_credits.json') });
emit('assets/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="${cfg.theme.forest}"/><text x="32" y="42" font-family="Georgia,serif" font-size="28" font-weight="700" fill="${cfg.theme.cedarLight}" text-anchor="middle">${L.esc(cfg.theme.logoMark)}</text></svg>`);

// ---------- sitemap + robots ----------
const base = cfg.mockup ? cfg.siteUrl : cfg.launchUrl;
const today = new Date().toISOString().slice(0, 10);
emit('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url><loc>${base}${p.path}</loc><lastmod>${today}</lastmod><priority>${p.priority.toFixed(1)}</priority></url>`).join('\n')}
</urlset>
`);
emit('robots.txt', cfg.mockup
  ? `# MOCKUP: every page also carries <meta name="robots" content="noindex">.\n# At launch set "mockup": false in site.config.json and rebuild.\nUser-agent: *\nAllow: /\nDisallow: /dashboard/\nSitemap: ${base}sitemap.xml\n`
  : `User-agent: *\nAllow: /\nDisallow: /dashboard/\nSitemap: ${base}sitemap.xml\n`);
if (outDir.endsWith('docs')) emit('.nojekyll', '');

console.log(`Built ${pages.length + 2} pages for ${B.name} → ${path.relative(ROOT, outDir) || '.'}`);
