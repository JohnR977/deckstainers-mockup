#!/usr/bin/env node
// Builds a complete static site from ONE partner folder:
//   partners/<name>/site.config.json   ← every word, photo, color, font and the logo
//   partners/<name>/images/            ← every picture
//   partners/<name>/crm.config.json    ← dashboard settings (not for marketing)
//
//   node src/build.mjs partners/chattanooga docs
//   node src/build.mjs partners/knoxville docs/demo-knoxville
// No dependencies. Output is plain HTML/CSS/JS that runs on GitHub Pages.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as L from './lib/layout.mjs';
import * as P from './content/pages.mjs';
import { makeText } from './lib/text.mjs';
import { loadPartner } from './check.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const partnerDir = path.resolve(ROOT, process.argv[2] || 'partners/chattanooga');
const outDir = path.resolve(ROOT, process.argv[3] || 'docs');

// Load + check. Any mistake in the config stops here with a plain-English message.
const { cfg, crm, problems } = loadPartner(partnerDir);
if (problems.errors.length) {
  console.error(`\n✗ ${path.relative(ROOT, partnerDir)} has ${problems.errors.length} problem(s) to fix before the site can be built:\n`);
  problems.errors.forEach(e => console.error('  • ' + e));
  console.error('');
  process.exit(1);
}
problems.warnings.forEach(w => console.warn('  ! ' + w));

const T = makeText(cfg);
const ctx = { cfg, W: cfg.wording, T };
const bySlug = Object.fromEntries(cfg.areas.map(a => [a.slug, a]));
const areaGroups = cfg.areaGroups.map(g => ({ name: g.name, areas: g.slugs.map(s => bySlug[s]) }));
const orderedAreas = areaGroups.flatMap(g => g.areas);
const pages = [];
const S = cfg.wording.seo;
const clip = (d) => (d.length > 160 ? d.slice(0, 157).replace(/[\s,;:]+\S*$/, '') + '…' : d);

function emit(relPath, html) {
  const file = path.join(outDir, relPath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

function addPage({ path: p, seo, extra = {}, body, current, schema = [], ogImage, scripts, bodyClass, priority = 0.6 }) {
  const depth = p ? p.split('/').filter(Boolean).length : 0;
  const title = T.plain(seo.title, extra), description = clip(T.plain(seo.description, extra));
  const html = L.page(ctx, { path: p, depth, title, description, body: body(L.makeRel(depth)), current, schema, ogImage, scripts, areas: orderedAreas, bodyClass });
  emit(p + 'index.html', html);
  pages.push({ path: p, priority });
}

const B = cfg.business;
const biz = L.businessSchema(cfg, orderedAreas);
const crumbsLd = (list) => L.breadcrumbSchema(cfg, list);
const home = cfg.wording.site.breadcrumbHome;

// Files are overwritten in place, never deleted (project rule: move throwaways to _to_delete/ by hand).
fs.mkdirSync(outDir, { recursive: true });

// ---------- pages ----------
addPage({ path: '', priority: 1.0, bodyClass: 'is-home', seo: S.home,
  body: (r) => P.homePage(ctx, r, { areaGroups }),
  schema: [biz, L.faqSchema(P.faqPlain(ctx, cfg.wording.home.faq.items))],
  scripts: ['assets/js/tint.js'] });

addPage({ path: 'services/', current: 'services/', priority: 0.8, seo: S.services,
  body: (r) => P.servicesIndex(ctx, r),
  schema: [biz, crumbsLd([[home, ''], [cfg.wording.servicesPage.breadcrumb, 'services/']])] });

for (const s of cfg.services) {
  const name = T.plain(s.name), x = { service: name, serviceLower: name.toLowerCase() };
  addPage({ path: `services/${s.slug}/`, current: 'services/', priority: 0.8, extra: x,
    seo: { title: s.seoTitle, description: s.seoDescription }, ogImage: s.photo,
    body: (r) => P.servicePage(ctx, r, s),
    schema: [L.serviceSchema(cfg, name, T.plain(s.seoDescription, x), `services/${s.slug}/`, orderedAreas), L.faqSchema(P.faqPlain(ctx, s.faq, x)),
      crumbsLd([[home, ''], [cfg.wording.servicesPage.breadcrumb, 'services/'], [name, `services/${s.slug}/`]])] });
}

addPage({ path: 'pricing/', current: 'pricing/', priority: 0.9, seo: S.pricing,
  body: (r) => P.pricingPage(ctx, r), scripts: ['assets/js/calculator.js'],
  schema: [biz, crumbsLd([[home, ''], [cfg.wording.pricingPage.breadcrumb, 'pricing/']])] });

addPage({ path: 'visualizer/', current: 'visualizer/', priority: 0.8, seo: S.visualizer,
  body: (r) => P.visualizerPage(ctx, r), scripts: ['assets/js/tint.js', 'assets/js/visualizer.js'], bodyClass: 'is-viz',
  schema: [crumbsLd([[home, ''], [cfg.wording.visualizerPage.breadcrumb, 'visualizer/']])] });

addPage({ path: 'estimate/', priority: 0.9, seo: S.estimate,
  body: (r) => P.estimatePage(ctx, r),
  schema: [crumbsLd([[home, ''], [cfg.wording.estimatePage.breadcrumb, 'estimate/']])] });

addPage({ path: 'areas/', current: 'areas/', priority: 0.7, seo: S.areas, extra: { firstAreas: orderedAreas.slice(0, 8).map(a => a.name).join(', ') },
  body: (r) => P.areasIndex(ctx, r, areaGroups),
  schema: [biz, crumbsLd([[home, ''], [cfg.wording.areasPage.breadcrumb, 'areas/']])] });

for (const a of orderedAreas) {
  const x = P.areaVars(a);
  addPage({ path: `areas/${a.slug}/`, current: 'areas/', priority: 0.7, seo: S.area, extra: x, ogImage: a.photo,
    body: (r) => P.areaPage(ctx, r, a, bySlug),
    schema: [L.serviceSchema(cfg, 'Deck Staining', T.plain(a.lede), `areas/${a.slug}/`, [a]), L.faqSchema(P.faqPlain(ctx, [a.faq], x)),
      crumbsLd([[home, ''], [cfg.wording.areasPage.breadcrumb, 'areas/'], [a.name, `areas/${a.slug}/`]])] });
}

addPage({ path: 'learn/', current: 'learn/', priority: 0.6, seo: S.learn,
  body: (r) => P.learnIndex(ctx, r),
  schema: [crumbsLd([[home, ''], [cfg.wording.learnPage.breadcrumb, 'learn/']])] });

for (const a of cfg.articles) {
  const title = T.plain(a.title), x = { articleTitle: title };
  addPage({ path: `learn/${a.slug}/`, current: 'learn/', priority: 0.6, extra: x,
    seo: { title: S.article.title, description: a.description }, ogImage: a.photo,
    body: (r) => P.articlePage(ctx, r, a),
    schema: [L.articleSchema(cfg, { ...a, title, description: T.plain(a.description) }, `learn/${a.slug}/`),
      crumbsLd([[home, ''], [cfg.wording.learnPage.breadcrumb, 'learn/'], [T.plain(a.short), `learn/${a.slug}/`]])] });
}

addPage({ path: 'about/', current: 'about/', seo: S.about, body: (r) => P.aboutPage(ctx, r), schema: [biz] });
addPage({ path: 'warranty/', seo: S.warranty, body: (r) => P.warrantyPage(ctx, r) });
addPage({ path: 'contact/', seo: S.contact, body: (r) => P.contactPage(ctx, r), schema: [biz] });
addPage({ path: 'privacy/', seo: S.privacy, body: (r) => P.privacyPage(ctx, r), priority: 0.2 });

// 404 is served at any URL, so its links use the absolute base path.
{
  const basePath = new URL(cfg.website.mockup ? cfg.website.siteUrl : cfg.website.launchUrl).pathname;
  const abs = (p = '') => (/^(https?:|#|mailto:|tel:|sms:)/.test(p) ? p : basePath + p);
  const html = L.page(ctx, { path: '404.html', depth: 0, title: T.plain(S.notFound.title), description: T.plain(S.notFound.description), body: P.notFoundPage(ctx, abs), areas: orderedAreas, rel: abs });
  emit('404.html', html);
}

// ---------- dashboard (fake login, localStorage CRM) ----------
{
  const r = L.makeRel(1);
  const logoHtml = cfg.brand.logo.image
    ? `<img class="brand-img" src="${L.img(r, cfg.brand.logo.image)}" alt="${L.esc(B.name)}">`
    : `<span class="logo-mark">${L.esc(cfg.brand.logo.mark)}</span><span><strong>${L.esc(cfg.brand.logo.name)}</strong><small>{{SUB}}</small></span>`;
  const dash = fs.readFileSync(path.join(ROOT, 'src/dashboard/index.html'), 'utf8')
    .replaceAll('{{LOGO_LOGIN}}', logoHtml.replace('{{SUB}}', 'Pro Partner Dashboard'))
    .replaceAll('{{LOGO_TOP}}', logoHtml.replace('{{SUB}}', 'Dashboard'))
    .replaceAll('{{SHORT}}', L.esc(B.shortName))
    .replaceAll('{{FOREST}}', cfg.brand.colors.primary)
    .replace('{{FONTS}}', L.fontLinks(cfg))
    .replace('{{FAVICON}}', cfg.brand.favicon ? L.img(r, cfg.brand.favicon) : '../assets/favicon.svg')
    .replace('{{THEME}}', L.themeStyle(cfg))
    .replace('{{CONFIG}}', JSON.stringify({
      ...L.publicConfig(ctx),
      business: { name: B.name, phone: B.phone, email: B.email, city: B.city, state: B.state, license: L.val(B.license), googleReviewUrl: B.googleReviewUrl, street: L.val(B.street), zip: B.zip },
      depositPercent: cfg.pricing.depositPercent, demoUser: crm.demoUser, demoPass: crm.demoPass, reminderYears: crm.reminderYears,
      areas: orderedAreas.map(a => a.name), plans: cfg.maintenancePlans.plans, warranty: { summary: T.plain(cfg.warranty.summary) }
    }).replace(/</g, '\\u003c'));
  emit('dashboard/index.html', dash);
}

// ---------- assets ----------
fs.cpSync(path.join(ROOT, 'src/assets/css'), path.join(outDir, 'assets/css'), { recursive: true });
fs.cpSync(path.join(ROOT, 'src/assets/js'), path.join(outDir, 'assets/js'), { recursive: true });
fs.cpSync(path.join(partnerDir, 'images'), path.join(outDir, 'assets/img'), { recursive: true });
const c = cfg.brand.colors;
emit('assets/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="${c.primary}"/><text x="32" y="42" font-family="Georgia,serif" font-size="28" font-weight="700" fill="${c.accentLight}" text-anchor="middle">${L.esc(cfg.brand.logo.mark)}</text></svg>`);

// ---------- sitemap + robots ----------
const base = cfg.website.mockup ? cfg.website.siteUrl : cfg.website.launchUrl;
const today = new Date().toISOString().slice(0, 10);
emit('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url><loc>${base}${p.path}</loc><lastmod>${today}</lastmod><priority>${p.priority.toFixed(1)}</priority></url>`).join('\n')}
</urlset>
`);
emit('robots.txt', cfg.website.mockup
  ? `# MOCKUP: every page also carries <meta name="robots" content="noindex">.\n# At launch set "mockup": false in site.config.json and rebuild.\nUser-agent: *\nAllow: /\nDisallow: /dashboard/\nSitemap: ${base}sitemap.xml\n`
  : `User-agent: *\nAllow: /\nDisallow: /dashboard/\nSitemap: ${base}sitemap.xml\n`);
if (path.basename(outDir) === 'docs') emit('.nojekyll', '');

console.log(`✓ Built ${pages.length + 2} pages for ${B.name} → ${path.relative(ROOT, outDir) || '.'}`);
