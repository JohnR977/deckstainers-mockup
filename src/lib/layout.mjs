// Shared page shell: <head>, header, footer, JSON-LD helpers.
// All words come from cfg.wording; colors, fonts and logo from cfg.brand.
// Every link is written relative (via `r()`), so the same build works on GitHub Pages,
// a custom domain, or opened locally.

import { esc } from './text.mjs';
import { val, isSample } from './values.mjs';
export { esc, val, isSample };

export const money = (n, d = 0) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
export const img = (r, file) => r('assets/img/' + file);

export function makeRel(depth) {
  const up = depth ? '../'.repeat(depth) : './';
  return (p = '') => (/^(https?:|#|mailto:|tel:|sms:)/.test(p)) ? p : up + p;
}

export function icon(name, cls = 'ico') {
  const paths = {
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    brush: '<path d="M14 4l6 6-7 7-6-6zM7 11l-3 3c-1 1-1 3 0 4s3 1 4 0l3-3"/>',
    star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8L3.5 9.7l5.9-.8z"/>'
  };
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || ''}</svg>`;
}

// A config value that might be a placeholder → text + SAMPLE tag.
export function show(ctx, v) {
  const s = ctx.W.site;
  return esc(val(v)) + (isSample(v) ? ` <span class="sample-tag" title="${esc(s.sampleTagTitle)}">${esc(s.sampleTag)}</span>` : '');
}
export const sampleTag = (ctx, v, label) => (isSample(v) ? ` <span class="sample-tag">${esc(label || ctx.W.site.sampleTag)}</span>` : '');

export function logo(ctx, r, { light = false } = {}) {
  const L = ctx.cfg.brand.logo, b = ctx.cfg.business;
  if (L.image) {
    return `<a class="logo logo-img" href="${r('')}" aria-label="${esc(b.name)} home"><img src="${img(r, L.image)}" alt="${esc(b.name)}" style="height:${+L.imageHeight || 40}px"${light ? ' class="on-dark"' : ''}></a>`;
  }
  return `<a class="logo" href="${r('')}" aria-label="${esc(b.name)} home">
    <span class="logo-mark" aria-hidden="true">${esc(L.mark)}</span>
    <span class="logo-text"><strong>${esc(L.name)}</strong><small>${esc(L.subline)}</small></span>
  </a>`;
}

export function header(ctx, r, current) {
  const { cfg, W, T } = ctx, b = cfg.business;
  return `
<a class="skip" href="#main">${esc(W.site.skipLink)}</a>
${cfg.website.mockup ? `<div class="mockup-bar">${esc(W.site.mockupBar)} <a href="${r('dashboard/')}">${esc(W.site.mockupBarLink)}</a></div>` : ''}
<header class="site-header">
  <div class="wrap header-row">
    ${logo(ctx, r)}
    <nav class="main-nav" id="main-nav" aria-label="Main">
      <ul>
        ${W.nav.map(n => { const p = n.page.replace(/^\//, ''); return `<li><a href="${r(p)}"${current === p ? ' aria-current="page"' : ''}>${esc(n.label)}</a></li>`; }).join('')}
      </ul>
    </nav>
    <div class="header-cta">
      <a class="header-phone" href="tel:${b.phoneHref}">${icon('phone')}<span>${esc(b.phone)}</span></a>
      <a class="btn btn-cedar btn-sm" href="${r('estimate/')}">${esc(W.site.freeEstimateButton)}</a>
      <button class="nav-toggle" aria-controls="main-nav" aria-expanded="false">${icon('menu')}<span class="sr">${esc(W.site.menuButton)}</span></button>
    </div>
  </div>
</header>`;
}

export function footer(ctx, r, areas) {
  const { cfg, W, T } = ctx, b = cfg.business, F = W.footer;
  return `
<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-brand">
      ${logo(ctx, r, { light: true })}
      <p>${T.html(F.about, {}, r)}</p>
      <p class="footer-contact">
        <a href="tel:${b.phoneHref}">${esc(b.phone)}</a><br>
        <a href="mailto:${esc(b.email)}">${esc(b.email)}</a><br>
        ${show(ctx, b.street)}, ${esc(b.city)}, ${esc(b.state)} ${esc(b.zip)}<br>
        ${esc(b.hours)}
      </p>
      <p class="footer-license">${show(ctx, b.license)}<br>${esc(F.insuredLabel)} ${show(ctx, b.insurance)}</p>
    </div>
    <div>
      <h2 class="footer-h">${esc(F.servicesHeading)}</h2>
      <ul class="footer-list">
        ${cfg.services.map(s => `<li><a href="${r('services/' + s.slug + '/')}">${esc(T.plain(s.shortName || s.name))}</a></li>`).join('')}
      </ul>
    </div>
    <div>
      <h2 class="footer-h">${esc(F.areasHeading)}</h2>
      <ul class="footer-list footer-areas">
        ${areas.map(a => `<li><a href="${r('areas/' + a.slug + '/')}">${esc(a.name)}</a></li>`).join('')}
      </ul>
    </div>
    <div>
      <h2 class="footer-h">${esc(F.companyHeading)}</h2>
      <ul class="footer-list">
        ${F.companyLinks.map(l => `<li><a href="${r(l.page.replace(/^\//, ''))}">${esc(l.label)}</a></li>`).join('')}
      </ul>
    </div>
  </div>
  <div class="wrap footer-fine">
    <p>© ${new Date().getFullYear()} ${esc(b.name)}. ${cfg.website.mockup ? esc(F.mockupNote) : ''}</p>
    <p>${esc(F.credit)}</p>
  </div>
</footer>
<div class="mobile-cta" role="region" aria-label="Quick contact">
  <a href="tel:${b.phoneHref}" class="mobile-cta-call">${icon('phone')} ${esc(W.site.mobileCall)}</a>
  <a href="${r('estimate/')}" class="mobile-cta-est">${esc(W.site.mobileEstimate)}</a>
</div>`;
}

// ---------- brand: colors + fonts ----------
const FALLBACK = { headings: "Georgia, 'Times New Roman', serif", body: "system-ui, -apple-system, 'Segoe UI', sans-serif", labels: 'ui-monospace, Menlo, monospace' };

export function fontsUrl(cfg) {
  const fams = Object.values(cfg.brand.fonts).map(f => {
    const name = f.name.trim().replace(/ /g, '+');
    const w = String(f.weights || '400').split(/[;,\s]+/).filter(Boolean).sort((a, b) => a - b);
    return f.italic ? `family=${name}:ital,wght@${w.map(x => '0,' + x).join(';')};1,${w[0]}` : `family=${name}:wght@${w.join(';')}`;
  });
  return `https://fonts.googleapis.com/css2?${[...new Set(fams)].join('&')}&display=swap`;
}

export function themeStyle(cfg) {
  const c = cfg.brand.colors, f = cfg.brand.fonts;
  const fam = (k) => `'${f[k].name}', ${FALLBACK[k]}`;
  return `<style>:root{--ink:${c.text};--forest:${c.primary};--forest-deep:${c.primaryDark};--cedar:${c.accent};--cedar-light:${c.accentLight};--paper:${c.background};--paper-deep:${c.backgroundAlt};--serif:${fam('headings')};--sans:${fam('body')};--mono:${fam('labels')}}</style>`;
}

export function fontLinks(cfg) {
  return `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${esc(fontsUrl(cfg))}" rel="stylesheet">`;
}

export function page(ctx, { path, depth, title, description, body, current, schema = [], ogImage, scripts = [], areas, bodyClass = '', rel }) {
  const { cfg } = ctx;
  const r = rel || makeRel(depth);
  const base = cfg.website.mockup ? cfg.website.siteUrl : cfg.website.launchUrl;
  const canonical = base + path;
  const og = base + 'assets/img/' + (ogImage || cfg.photos.hero.file);
  const favicon = cfg.brand.favicon ? img(r, cfg.brand.favicon) : r('assets/favicon.svg');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${cfg.website.mockup ? '<meta name="robots" content="noindex, nofollow">\n<!-- MOCKUP: set "mockup": false in site.config.json at launch to remove noindex -->' : ''}
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${og}">
<meta property="og:site_name" content="${esc(cfg.business.name)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="${cfg.brand.colors.primary}">
<link rel="icon" href="${favicon}">
${fontLinks(cfg)}
<link rel="stylesheet" href="${r('assets/css/site.css')}">
${themeStyle(cfg)}
${schema.map(s => `<script type="application/ld+json">${JSON.stringify(s).replace(/</g, '\\u003c')}</script>`).join('\n')}
</head>
<body class="${bodyClass}" data-site="${esc(cfg.website.slug)}" data-root="${r('')}">
${header(ctx, r, current)}
<main id="main">
${body}
</main>
${footer(ctx, r, areas)}
<script>window.SITE=${JSON.stringify(publicConfig(ctx)).replace(/</g, '\\u003c')};</script>
<script src="${r('assets/js/store.js')}"></script>
<script src="${r('assets/js/site.js')}"></script>
${scripts.map(s => `<script src="${r(s)}"></script>`).join('\n')}
</body>
</html>`;
}

// What the browser needs (calculator, visualizer, forms).
export function publicConfig(ctx) {
  const { cfg, W, T } = ctx;
  const wordsFor = (o) => JSON.parse(JSON.stringify(o), (k, v) => (typeof v === 'string' ? T.fill(v, { n: '{n}', first: '{first}' }) : v));
  return {
    slug: cfg.website.slug,
    name: cfg.business.name,
    phone: cfg.business.phone,
    pricing: cfg.pricing,
    stains: cfg.stains,
    samples: cfg.visualizer.samples,
    teaser: cfg.visualizer.teaserColors,
    words: wordsFor({ forms: W.forms, calc: W.pricingPage.calc, viz: { before: W.visualizerPage.imageBeforeLabel, after: W.visualizerPage.imageAfterLabel }, remove: W.estimatePage.removePhoto })
  };
}

// ---------- JSON-LD ----------
export function businessSchema(cfg, areas) {
  const b = cfg.business;
  const base = cfg.website.mockup ? cfg.website.siteUrl : cfg.website.launchUrl;
  const s = {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    '@id': base + '#business',
    name: b.name, url: base, telephone: b.phone, email: b.email,
    image: base + 'assets/img/' + cfg.photos.hero.file,
    priceRange: '$$',
    address: { '@type': 'PostalAddress', streetAddress: val(b.street), addressLocality: b.city, addressRegion: b.state, postalCode: b.zip, addressCountry: 'US' },
    geo: { '@type': 'GeoCoordinates', latitude: b.geo.lat, longitude: b.geo.lng },
    openingHours: b.hoursSchema,
    areaServed: areas.map(a => ({ '@type': 'City', name: `${a.name}, ${a.state}` }))
  };
  if (cfg.brand.logo.image) s.logo = base + 'assets/img/' + cfg.brand.logo.image;
  if (!isSample(b.rating) && val(b.reviewCount) > 0) {
    s.aggregateRating = { '@type': 'AggregateRating', ratingValue: val(b.rating), reviewCount: val(b.reviewCount) };
  }
  return s;
}

export function serviceSchema(cfg, name, description, path, areas) {
  const base = cfg.website.mockup ? cfg.website.siteUrl : cfg.website.launchUrl;
  return {
    '@context': 'https://schema.org', '@type': 'Service',
    serviceType: name, name: `${name} in ${cfg.business.city}, ${cfg.business.state}`,
    description, url: base + path, provider: { '@id': base + '#business' },
    areaServed: areas.map(a => ({ '@type': 'City', name: `${a.name}, ${a.state}` }))
  };
}

export function faqSchema(items) {
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };
}

export function breadcrumbSchema(cfg, list) {
  const base = cfg.website.mockup ? cfg.website.siteUrl : cfg.website.launchUrl;
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: list.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: base + p })) };
}

export function articleSchema(cfg, a, path) {
  const base = cfg.website.mockup ? cfg.website.siteUrl : cfg.website.launchUrl;
  return {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: a.title, description: a.description, datePublished: a.date, dateModified: a.date,
    author: { '@type': 'Organization', name: cfg.business.name },
    publisher: { '@id': base + '#business' }, mainEntityOfPage: base + path, image: base + 'assets/img/' + a.photo
  };
}

export function crumbs(ctx, r, list) {
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${list.map(([t, p], i) =>
    i === list.length - 1 ? `<li aria-current="page">${esc(t)}</li>` : `<li><a href="${r(p)}">${esc(t)}</a></li>`).join('')}</ol></nav>`;
}

// A photo with its "stock photo" note when isStock is true.
export function figure(ctx, r, file, alt, { cls = '', loading = 'lazy', isStock = false, caption = '' } = {}) {
  const note = caption || (isStock ? ctx.W.site.stockPhotoNote : '');
  return `<figure class="photo ${cls}">
    <img src="${img(r, file)}" alt="${esc(alt)}" loading="${loading}" decoding="async">
    ${note ? `<figcaption class="ph-note">${esc(note)}</figcaption>` : ''}
  </figure>`;
}
