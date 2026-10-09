// Shared page shell: <head>, header, footer, JSON-LD helpers.
// Every link is written relative (via `r()`), so the same build works on
// GitHub Pages under /deckstainers-mockup/, on a custom domain, or opened locally.

export const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Values in the config can be plain, or {value, sample:true}.
export const val = (v) => (v && typeof v === 'object' && 'value' in v ? v.value : v);
export const isSample = (v) => !!(v && typeof v === 'object' && v.sample);
export const sampleTag = (v) => (isSample(v) ? ' <span class="sample-tag" title="Placeholder value — replace in site.config.json">Sample</span>' : '');
export const show = (v) => esc(val(v)) + sampleTag(v);

export const money = (n, d = 0) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export function makeRel(depth) {
  const up = depth ? '../'.repeat(depth) : './';
  return (p = '') => (p.startsWith('http') || p.startsWith('#') || p.startsWith('mailto:') || p.startsWith('tel:') || p.startsWith('sms:')) ? p : up + p;
}

export function icon(name, cls = 'ico') {
  const paths = {
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    check: '<path d="M5 12l5 5L20 7"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
    brush: '<path d="M14 4l6 6-7 7-6-6zM7 11l-3 3c-1 1-1 3 0 4s3 1 4 0l3-3"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/>',
    star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8L3.5 9.7l5.9-.8z"/>'
  };
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || ''}</svg>`;
}

export function logo(cfg, r) {
  const b = cfg.business;
  return `<a class="logo" href="${r('')}" aria-label="${esc(b.name)} home">
    <span class="logo-mark" aria-hidden="true">${esc(cfg.theme.logoMark)}</span>
    <span class="logo-text"><strong>${esc(b.shortName)}</strong><small>${esc(b.logoSub || 'of ' + b.city)}</small></span>
  </a>`;
}

const NAV = [
  ['Services', 'services/'],
  ['Prices', 'pricing/'],
  ['Color Visualizer', 'visualizer/'],
  ['Service Areas', 'areas/'],
  ['Learn', 'learn/'],
  ['About', 'about/']
];

export function header(cfg, r, current) {
  const b = cfg.business;
  return `
<a class="skip" href="#main">Skip to content</a>
${cfg.mockup ? `<div class="mockup-bar">Demo site for a Stain &amp; Seal Supply Pro Partner. Business, prices and reviews are samples. <a href="${r('dashboard/')}">Open the Pro Partner Dashboard →</a></div>` : ''}
<header class="site-header">
  <div class="wrap header-row">
    ${logo(cfg, r)}
    <nav class="main-nav" id="main-nav" aria-label="Main">
      <ul>
        ${NAV.map(([t, p]) => `<li><a href="${r(p)}"${current === p ? ' aria-current="page"' : ''}>${t}</a></li>`).join('')}
      </ul>
    </nav>
    <div class="header-cta">
      <a class="header-phone" href="tel:${b.phoneHref}">${icon('phone')}<span>${esc(b.phone)}</span></a>
      <a class="btn btn-cedar btn-sm" href="${r('estimate/')}">Free Estimate</a>
      <button class="nav-toggle" aria-controls="main-nav" aria-expanded="false">${icon('menu')}<span class="sr">Menu</span></button>
    </div>
  </div>
</header>`;
}

export function footer(cfg, r, areas) {
  const b = cfg.business;
  return `
<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-brand">
      ${logo(cfg, r)}
      <p>${esc(b.tagline)}. ${esc(cap(b.crewSize))}, owner on every job.</p>
      <p class="footer-contact">
        <a href="tel:${b.phoneHref}">${esc(b.phone)}</a><br>
        <a href="mailto:${esc(b.email)}">${esc(b.email)}</a><br>
        ${show(b.street)}, ${esc(b.city)}, ${esc(b.state)} ${esc(b.zip)}<br>
        ${esc(b.hours)}
      </p>
      <p class="footer-license">${show(b.license)}<br>Insured: ${show(b.insurance)}</p>
    </div>
    <div>
      <h2 class="footer-h">Services</h2>
      <ul class="footer-list">
        <li><a href="${r('services/deck-staining/')}">Deck Staining</a></li>
        <li><a href="${r('services/deck-cleaning-restoration/')}">Cleaning &amp; Restoration</a></li>
        <li><a href="${r('services/fence-staining/')}">Fence Staining</a></li>
        <li><a href="${r('services/log-home-staining/')}">Log Homes &amp; Cabins</a></li>
        <li><a href="${r('services/pergolas-porches/')}">Pergolas &amp; Porches</a></li>
        <li><a href="${r('services/maintenance-plans/')}">Maintenance Plans</a></li>
      </ul>
    </div>
    <div>
      <h2 class="footer-h">Service areas</h2>
      <ul class="footer-list footer-areas">
        ${areas.map(a => `<li><a href="${r('areas/' + a.slug + '/')}">${esc(a.name)}</a></li>`).join('')}
      </ul>
    </div>
    <div>
      <h2 class="footer-h">Company</h2>
      <ul class="footer-list">
        <li><a href="${r('pricing/')}">Prices &amp; Calculator</a></li>
        <li><a href="${r('visualizer/')}">Color Visualizer</a></li>
        <li><a href="${r('estimate/')}">Get an Estimate</a></li>
        <li><a href="${r('warranty/')}">Warranty</a></li>
        <li><a href="${r('learn/')}">Learn</a></li>
        <li><a href="${r('about/')}">About</a></li>
        <li><a href="${r('contact/')}">Contact</a></li>
        <li><a href="${r('privacy/')}">Privacy</a></li>
      </ul>
    </div>
  </div>
  <div class="wrap footer-fine">
    <p>© ${new Date().getFullYear()} ${esc(b.name)}. ${cfg.mockup ? 'Fictional demo business. Photos are free-license stock placeholders — see credits.' : ''}</p>
    <p>Website &amp; CRM by Stain &amp; Seal Supply Pro Partners</p>
  </div>
</footer>
<div class="mobile-cta" role="region" aria-label="Quick contact">
  <a href="tel:${b.phoneHref}" class="mobile-cta-call">${icon('phone')} Call</a>
  <a href="${r('estimate/')}" class="mobile-cta-est">Free Estimate</a>
</div>`;
}

export const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export function themeStyle(cfg) {
  const t = cfg.theme;
  return `<style>:root{--ink:${t.ink};--forest:${t.forest};--forest-deep:${t.forestDeep};--cedar:${t.cedar};--cedar-light:${t.cedarLight};--paper:${t.paper};--paper-deep:${t.paperDeep}}</style>`;
}

export function page(cfg, { path, depth, title, description, body, current, schema = [], ogImage, extraHead = '', scripts = [], areas, bodyClass = '' }) {
  const r = makeRel(depth);
  const canonical = (cfg.mockup ? cfg.siteUrl : cfg.launchUrl) + path;
  const og = (cfg.mockup ? cfg.siteUrl : cfg.launchUrl) + 'assets/img/' + (ogImage || cfg.photos.hero.src);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${cfg.mockup ? '<meta name="robots" content="noindex, nofollow">\n<!-- MOCKUP: remove the robots noindex line at launch (set "mockup": false in site.config.json) -->' : ''}
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${og}">
<meta property="og:site_name" content="${esc(cfg.business.name)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="${cfg.theme.forest}">
<link rel="icon" href="${r('assets/favicon.svg')}" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=Public+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${r('assets/css/site.css')}">
${themeStyle(cfg)}
${extraHead}
${schema.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')}
</head>
<body class="${bodyClass}" data-site="${esc(cfg.slug)}" data-root="${r('')}">
${header(cfg, r, current)}
<main id="main">
${body}
</main>
${footer(cfg, r, areas)}
<script>window.SITE=${JSON.stringify(publicConfig(cfg))};</script>
<script src="${r('assets/js/store.js')}"></script>
<script src="${r('assets/js/site.js')}"></script>
${scripts.map(s => `<script src="${r(s)}"></script>`).join('\n')}
</body>
</html>`;
}

// What the browser needs (calculator, visualizer, forms). No secrets in here anyway.
export function publicConfig(cfg) {
  return {
    slug: cfg.slug,
    name: cfg.business.name,
    phone: cfg.business.phone,
    pricing: cfg.pricing,
    stains: cfg.stains,
    reminderYears: cfg.dashboard.reminderYears,
    samples: cfg.visualizerSamples
  };
}

// ---------- JSON-LD ----------
export function businessSchema(cfg, areas) {
  const b = cfg.business;
  const base = cfg.mockup ? cfg.siteUrl : cfg.launchUrl;
  const s = {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    '@id': base + '#business',
    name: b.name,
    url: base,
    telephone: b.phone,
    email: b.email,
    image: base + 'assets/img/' + cfg.photos.hero.src,
    priceRange: '$$',
    address: { '@type': 'PostalAddress', streetAddress: val(b.street), addressLocality: b.city, addressRegion: b.state, postalCode: b.zip, addressCountry: 'US' },
    geo: { '@type': 'GeoCoordinates', latitude: b.geo.lat, longitude: b.geo.lng },
    openingHours: b.hoursSchema,
    areaServed: areas.map(a => ({ '@type': 'City', name: `${a.name}, ${a.state}` }))
  };
  // Only publish a rating once it's real.
  if (!isSample(b.rating) && val(b.reviewCount) > 0) {
    s.aggregateRating = { '@type': 'AggregateRating', ratingValue: val(b.rating), reviewCount: val(b.reviewCount) };
  }
  return s;
}

export function serviceSchema(cfg, name, description, path, areas) {
  const base = cfg.mockup ? cfg.siteUrl : cfg.launchUrl;
  return {
    '@context': 'https://schema.org', '@type': 'Service',
    serviceType: name, name: `${name} in ${cfg.business.city}, ${cfg.business.state}`,
    description, url: base + path,
    provider: { '@id': base + '#business' },
    areaServed: areas.map(a => ({ '@type': 'City', name: `${a.name}, ${a.state}` }))
  };
}

export function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>/g, '') } }))
  };
}

export function breadcrumbSchema(cfg, crumbs) {
  const base = cfg.mockup ? cfg.siteUrl : cfg.launchUrl;
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: crumbs.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: base + p }))
  };
}

export function articleSchema(cfg, a, path) {
  const base = cfg.mockup ? cfg.siteUrl : cfg.launchUrl;
  return {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: a.title, description: a.description, datePublished: a.date, dateModified: a.date,
    author: { '@type': 'Organization', name: cfg.business.name },
    publisher: { '@id': base + '#business' }, mainEntityOfPage: base + path,
    image: base + 'assets/img/' + a.image
  };
}

export function crumbs(r, list) {
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${list.map(([t, p], i) =>
    i === list.length - 1 ? `<li aria-current="page">${esc(t)}</li>` : `<li><a href="${r(p)}">${esc(t)}</a></li>`).join('')}</ol></nav>`;
}

export function photo(cfg, r, key, { cls = '', sizes = '', loading = 'lazy' } = {}) {
  const p = cfg.photos[key];
  return `<figure class="photo ${cls}">
    <img src="${r('assets/img/' + p.src)}" alt="${esc(p.alt)}" loading="${loading}" decoding="async">
    ${p.placeholder ? '<figcaption class="ph-note">Stock photo — swap in a real job photo</figcaption>' : ''}
  </figure>`;
}
