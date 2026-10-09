// Turns the plain-English wording in site.config.json into HTML.
//
//   {city}                 fill-in words (see vars() below, and MARKETING_GUIDE.md)
//   **bold**  *italic*
//   [link text](/pricing/)          a page on this site
//   [link text](https://…)          another website (opens in a new tab)
//   [link text](source:angi)        a source from the "sources" list
//   [link text](tel:… / mailto:…)
//   {cite:angi}                     a small footnote link to a source
//
// Writers never type HTML; anything that looks like HTML is shown as plain text.

import { val } from './values.mjs';

export const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const money = (n, d = 0) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

// The fill-in words available everywhere.
export function vars(cfg) {
  const b = cfg.business, L = cfg.location, c = L.climate, w = cfg.warranty, p = cfg.pricing;
  return {
    business: b.name, short: b.shortName, tagline: b.tagline,
    city: b.city, state: b.state, stateName: b.stateName,
    phone: b.phone, phoneHref: b.phoneHref, email: b.email, hours: b.hours,
    owner: val(b.owner), crew: b.crewSize, Crew: cap(b.crewSize),
    metro: L.metro, region: L.region, radius: L.radius, shadyArea: L.shadyArea, cabinAreas: L.cabinAreas, licenseCounty: L.licenseCounty,
    bestMonths: c.bestMonths, bestMonthsAmp: c.bestMonths.replace(' and ', ' & '),
    driestMonths: c.driestMonths, driestMonth: c.driestMonths.split(' and ')[0].replace(/\s*\(.*/, ''),
    fewestRainDays: c.fewestRainDays, annualRain: Math.round(c.annualRainIn), humidity: c.humidity, station: c.station,
    floorYears: w.horizontalYears, railYears: w.verticalYears,
    deposit: p.depositPercent + '%', minimumJob: money(p.minimumJob),
    semiFrom: money(p.finishes['semi-transparent'].low, 2)
  };
}

// Source keys that point somewhere else: {cite:climate} → this partner's NOAA source.
function sourceKey(cfg, key) {
  if (key === 'climate') return cfg.location.climate.sourceKey;
  if (key === 'humidity') return cfg.location.climate.humiditySourceKey;
  return key;
}

export function makeText(cfg, warn = (m) => console.warn('  ! ' + m)) {
  const base = vars(cfg);
  const src = cfg.sources;

  function fill(str, extra = {}) {
    const all = { ...base, ...extra };
    return String(str).replace(/\{([A-Za-z]+)\}/g, (m, k) => {
      if (k in all) return all[k];
      warn(`Unknown fill-in word ${m} in: "${String(str).slice(0, 60)}…"`);
      return m;
    });
  }

  // Plain text (for <title>, alt text, aria labels): fill-ins in, formatting out.
  function plain(str, extra = {}) {
    return fill(str, extra)
      .replace(/\{cite:[A-Za-z]+\}/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1');
  }

  // Rich text → HTML. r() makes site links relative. cite() lets articles number their footnotes.
  function html(str, extra = {}, r = (p) => p, cite = null) {
    let s = esc(fill(str, extra));
    s = s.replace(/\{cite:([A-Za-z]+)\}/g, (m, k) => {
      const key = sourceKey(cfg, k);
      if (!src[key]) { warn(`Unknown source {cite:${k}}`); return ''; }
      if (cite) return cite(key);
      return `<sup class="fn"><a href="${esc(src[key].url)}" target="_blank" rel="noopener">${esc(src[key].short || 'source')}</a></sup>`;
    });
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, text, target) => {
      target = target.replace(/&amp;/g, '&');
      if (target.startsWith('source:')) {
        const key = sourceKey(cfg, target.slice(7));
        if (!src[key]) { warn(`Unknown source ${target}`); return text; }
        return `<a href="${esc(src[key].url)}" target="_blank" rel="noopener">${text}</a>`;
      }
      if (/^https?:/.test(target)) return `<a href="${esc(target)}" target="_blank" rel="noopener">${text}</a>`;
      if (/^(mailto|tel|sms):/.test(target)) return `<a href="${esc(target)}">${text}</a>`;
      if (target.startsWith('/')) return `<a href="${esc(r(target.slice(1)))}">${text}</a>`;
      warn(`Link "${target}" should start with / (a page here), https:// (another site) or source:`);
      return text;
    });
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
    return s;
  }

  return { fill, plain, html, vars: base };
}

// Numbered footnotes for an article.
export function makeCiter(sources) {
  const order = [];
  const fn = (key) => {
    let i = order.indexOf(key);
    if (i === -1) { order.push(key); i = order.length - 1; }
    return `<sup class="fn"><a href="#src-${i + 1}" aria-label="Source ${i + 1}">${i + 1}</a></sup>`;
  };
  fn.list = (heading) => order.length ? `<section class="sources" aria-labelledby="src-h"><h2 id="src-h">${esc(heading)}</h2><ol>${order.map((k, i) =>
    `<li id="src-${i + 1}"><a href="${esc(sources[k].url)}" target="_blank" rel="noopener">${esc(sources[k].name)}</a></li>`).join('')}</ol></section>` : '';
  return fn;
}
