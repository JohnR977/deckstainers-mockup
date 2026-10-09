// Page bodies. Layout and behavior live here; every word comes from cfg.wording
// (or from cfg.services / cfg.areas / cfg.articles). Writers never need to open this file.
import { esc, val, isSample, show, sampleTag, money, icon, img, crumbs, figure } from '../lib/layout.mjs';
import { makeCiter } from '../lib/text.mjs';

const sectionHead = (num, kicker, title) =>
  `<div class="sec-head">${num ? `<span class="sec-num">${num}</span>` : ''}<p class="kicker">${kicker}</p><h2>${title}</h2></div>`;
const unslash = (p) => p.replace(/^\//, '');

function faqList(ctx, r, items, extra = {}) {
  const { T } = ctx;
  return `<div class="faq">${items.map((f, i) => `
  <details${i === 0 ? ' open' : ''}><summary><span>${T.html(f.q, extra, r)}</span><span class="faq-plus" aria-hidden="true"></span></summary><div class="faq-a"><p>${T.html(f.a, extra, r)}</p></div></details>`).join('')}</div>`;
}
export const faqPlain = (ctx, items, extra = {}) => items.map(f => ({ q: ctx.T.plain(f.q, extra), a: ctx.T.plain(f.a, extra) }));

function closingCta(ctx, r, line, extra = {}) {
  const { cfg, W, T } = ctx, C = W.closing;
  return `
<section class="closing">
  <div class="wrap closing-grid">
    <div>
      <p class="kicker kicker-light">${T.html(C.kicker, extra, r)}</p>
      <h2>${T.html(line || C.headline, extra, r)}</h2>
    </div>
    <div class="closing-actions">
      <a class="btn btn-cedar btn-lg" href="${r('estimate/')}">${icon('camera')} ${esc(C.button)}</a>
      <a class="closing-phone" href="tel:${cfg.business.phoneHref}">${esc(C.callPrefix)} <strong>${esc(cfg.business.phone)}</strong></a>
    </div>
  </div>
</section>`;
}

const pageHero = (ctx, r, crumbList, P, cls = '', extra = {}) => `
<section class="page-hero ${cls}">
  <div class="wrap">
    ${crumbs(ctx, r, crumbList)}
    <p class="kicker">${ctx.T.html(P.kicker, extra, r)}</p>
    <h1>${ctx.T.html(P.headline, extra, r)}</h1>
    <p class="page-lede">${ctx.T.html(P.lede, extra, r)}</p>
  </div>
</section>`;

const home = (ctx) => [ctx.W.site.breadcrumbHome, ''];

function swatchStrip(list) {
  return `<span class="swatch-strip">${list.slice(0, 6).map(s => `<span style="background:${s.hex}" title="${esc(s.name)}"></span>`).join('')}</span>`;
}

// ---------- HOME ----------
export function homePage(ctx, r, { areaGroups }) {
  const { cfg, W, T } = ctx, H = W.home, b = cfg.business;
  const [main, ...others] = cfg.services;
  const fin = cfg.pricing.finishes;
  const hasReviews = cfg.reviews.items && cfg.reviews.items.length;
  let k = 0; const n = () => String(++k).padStart(2, '0');
  const t = (s, x) => T.html(s, x, r);
  const tr = H.trust;
  const trust = [
    [tr.licensed, show(ctx, b.license)],
    [tr.insured, show(ctx, b.insurance)],
    [tr.rating, `${esc(val(b.rating))} ${icon('star', 'ico ico-star')}${sampleTag(ctx, b.rating)}`],
    [tr.years, `${esc(val(b.yearsInBusiness))} ${esc(tr.yearsSuffix)}${sampleTag(ctx, b.yearsInBusiness)}`],
    [tr.warranty, t(tr.warrantyValue)]
  ];
  const BA = H.beforeAfter, ba = cfg.photos.beforeAfter, F = H.finishes;
  const finRow = (key) => {
    const row = F.rows[key];
    return `<div class="spec-row${row.badge ? ' spec-pick' : ''}" role="row">
        <span role="cell"><strong>${t(row.name)}</strong>${row.badge ? ` <em class="pick">${t(row.badge)}</em>` : ''}</span>
        <span role="cell">${t(row.look)}</span>
        <span role="cell">${t(row.bestFor)}</span>
        <span role="cell">${swatchStrip(cfg.stains[key])}</span>
        <span role="cell">${money(fin[key].low, 2)}–${money(fin[key].high, 2)}${esc(F.priceSuffix)}</span>
      </div>`;
  };
  const sample0 = cfg.visualizer.samples[0];
  const teaser = cfg.visualizer.teaserColors.map(name => Object.values(cfg.stains).flat().find(s => s.name === name)).filter(Boolean);
  const RV = H.reviews;
  const review = (it, big) => `<blockquote class="review${big ? ' review-big' : ''}">
      <p>${esc(it.text)}</p>
      <footer>— ${esc(it.name)}, ${esc(it.area)}${cfg.reviews.sample ? ` <span class="sample-tag">${esc(RV.sampleTag)}</span>` : ''}</footer>
    </blockquote>`;

  return `
<section class="hero">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="kicker">${t(H.hero.kicker)}</p>
      <h1>${t(H.hero.headline)}</h1>
      <p class="hero-lede">${t(H.hero.lede)}</p>
      <div class="hero-actions">
        <a class="btn btn-cedar btn-lg" href="${r('estimate/')}">${esc(H.hero.button)}</a>
        <a class="btn btn-ghost btn-lg" href="tel:${b.phoneHref}">${icon('phone')} ${esc(b.phone)}</a>
      </div>
      <p class="hero-sub">${icon('camera')} ${t(H.hero.subline)}</p>
    </div>
    <div class="hero-media">
      ${figure(ctx, r, cfg.photos.hero.file, cfg.photos.hero.alt, { cls: 'hero-photo', loading: 'eager', isStock: cfg.photos.hero.isStock })}
      <div class="hero-tag" aria-hidden="true">
        <span class="hero-tag-k">${t(H.hero.photoTagLabel)}</span>
        <span class="hero-tag-v">${t(H.hero.photoTagValue)}</span>
      </div>
    </div>
  </div>
</section>

<section class="trust" aria-label="${esc(T.plain(tr.ariaLabel))}"><div class="wrap"><ul class="trust-list">${trust.map(([k2, v]) => `<li><span class="trust-k">${t(k2)}</span><span class="trust-v">${v}</span></li>`).join('')}</ul></div></section>

<section class="sec services-sec">
  <div class="wrap">
    ${sectionHead(n(), t(H.services.kicker), t(H.services.headline))}
    <div class="svc-layout">
      <a class="svc-feature" href="${r('services/' + main.slug + '/')}">
        ${figure(ctx, r, main.photo, main.photoAlt, { cls: 'svc-feature-photo', isStock: main.photoIsStock })}
        <div class="svc-feature-body">
          <p class="kicker">${t(main.kicker)}</p>
          <h3>${t(main.name)}</h3>
          <p>${t(main.intro)}</p>
          <span class="arrow-link">${esc(H.services.featureLink)} ${icon('arrow')}</span>
        </div>
      </a>
      <ol class="svc-list">
        ${others.map((s) => `<li><a href="${r('services/' + s.slug + '/')}"><span class="svc-name">${t(s.name)}</span><span class="svc-desc">${t(s.lede)}</span>${icon('arrow')}</a></li>`).join('')}
      </ol>
    </div>
  </div>
</section>

<section class="sec process-sec">
  <div class="wrap">
    ${sectionHead(n(), t(H.process.kicker), t(H.process.headline))}
    <ol class="process">
      ${H.process.steps.map((s, i) => `<li><span class="process-n">${i + 1}</span><h3>${t(s.title)}</h3><p>${t(s.text)}</p></li>`).join('')}
    </ol>
  </div>
</section>

<section class="sec ba-sec">
  <div class="wrap ba-grid">
    <div class="ba-copy">
      ${sectionHead(n(), t(BA.kicker), t(BA.headline))}
      ${BA.paragraphs.map(p => `<p>${t(p)}</p>`).join('')}
      ${t(BA.link).replace('<a ', '<a class="arrow-link" ').replace('</a>', ` ${icon('arrow')}</a>`)}
    </div>
    <figure class="ba" data-ba>
      <div class="ba-frame">
        <img class="ba-img ba-after" src="${img(r, ba.after)}" alt="${esc(BA.afterLabel)}: ${esc(ba.alt)}" loading="lazy">
        <div class="ba-clip"><img class="ba-img ba-before" src="${img(r, ba.before)}" alt="${esc(BA.beforeLabel)}: ${esc(ba.alt)}" loading="lazy"></div>
        <div class="ba-handle" aria-hidden="true"><span></span></div>
        <span class="ba-label ba-label-l">${esc(BA.beforeLabel)}</span><span class="ba-label ba-label-r">${esc(BA.afterLabel)}</span>
        <input class="ba-range" type="range" min="0" max="100" value="50" aria-label="${esc(BA.sliderLabel)}">
      </div>
      ${ba.isIllustration ? `<figcaption class="ph-note ph-note-block">${t(BA.illustrationNote)}</figcaption>` : ''}
    </figure>
  </div>
</section>

<section class="sec finishes-sec">
  <div class="wrap">
    ${sectionHead(n(), t(F.kicker), t(F.headline))}
    <div class="spec-table" role="table" aria-label="${esc(F.tableLabel)}">
      <div class="spec-row spec-head" role="row">${F.columns.map(c => `<span role="columnheader">${esc(c)}</span>`).join('')}</div>
      ${['transparent', 'semi-transparent', 'solid'].map(finRow).join('')}
    </div>
    <p class="fine">${t(F.footnote)}</p>
  </div>
</section>

${H.products && H.products.show ? `<section class="sec products-sec">
  <div class="wrap products-grid">
    <div>${sectionHead(n(), t(H.products.kicker), t(H.products.headline))}</div>
    <div class="products-body">
      ${H.products.paragraphs.map(p => `<p>${t(p)}</p>`).join('')}
      <ul class="pill-links">${H.products.links.map(l => `<li>${t('[' + l.label + '](' + l.link + ')')}</li>`).join('')}</ul>
    </div>
  </div>
</section>` : ''}

<section class="sec viz-teaser">
  <div class="wrap viz-grid">
    <div class="viz-copy">
      <p class="kicker kicker-light">${n()} · ${t(H.visualizer.kicker)}</p>
      <h2>${t(H.visualizer.headline)}</h2>
      <p>${t(H.visualizer.text)}</p>
      <a class="btn btn-cedar btn-lg" href="${r('visualizer/')}">${icon('brush')} ${esc(H.visualizer.button)}</a>
    </div>
    <div class="viz-demo" data-viz-demo data-src="${img(r, sample0.file)}" data-outline='${JSON.stringify(sample0.deckOutline)}'>
      <div class="viz-demo-frame">
        <img src="${img(r, sample0.file)}" alt="${esc(H.visualizer.photoAlt)}" loading="lazy">
      </div>
      <ul class="viz-demo-swatches">
        ${teaser.map(s => `<li style="background:${s.hex}" data-hex="${s.hex}" data-type="${Object.keys(cfg.stains).find(k2 => cfg.stains[k2].includes(s))}"><span>${esc(s.name)}</span></li>`).join('')}
      </ul>
      <p class="viz-demo-cap">${t(H.visualizer.caption)}</p>
    </div>
  </div>
</section>

${hasReviews ? `<section class="sec reviews">
  <div class="wrap">
    ${sectionHead(n(), t(RV.kicker), t(RV.headline))}
    ${cfg.reviews.sample ? `<p class="sample-banner">${t(RV.sampleBanner)}</p>` : ''}
    <div class="reviews-grid">
      ${review(cfg.reviews.items[0], true)}
      <div class="reviews-side">${cfg.reviews.items.slice(1).map(it => review(it, false)).join('')}</div>
    </div>
  </div>
</section>` : ''}

<section class="sec areas-sec">
  <div class="wrap">
    ${sectionHead(n(), t(H.areas.kicker), t(H.areas.headline))}
    <div class="areas-cols">
      ${areaGroups.map(g => `<div><h3>${esc(g.name)}</h3><ul>${g.areas.map(a => `<li><a href="${r('areas/' + a.slug + '/')}">${esc(a.name)}</a></li>`).join('')}</ul></div>`).join('')}
      <div class="areas-note"><p>${icon('pin')} ${t(H.areas.note)}</p></div>
    </div>
  </div>
</section>

<section class="sec faq-sec">
  <div class="wrap faq-grid">
    <div>${sectionHead(n(), t(H.faq.kicker), t(H.faq.headline))}
      <p>${t(H.faq.intro)}</p>
    </div>
    ${faqList(ctx, r, H.faq.items)}
  </div>
</section>

${closingCta(ctx, r)}`;
}

// ---------- SERVICES ----------
export function servicesIndex(ctx, r) {
  const { cfg, W, T } = ctx, P = W.servicesPage;
  return `${pageHero(ctx, r, [home(ctx), [P.breadcrumb, 'services/']], P)}
<section class="sec">
  <div class="wrap svc-index">
    ${cfg.services.map((s, i) => `
    <a class="svc-row" href="${r('services/' + s.slug + '/')}">
      <span class="svc-row-n">${String(i + 1).padStart(2, '0')}</span>
      ${figure(ctx, r, s.photo, s.photoAlt, { cls: 'svc-row-photo', isStock: s.photoIsStock })}
      <span class="svc-row-body"><span class="kicker">${T.html(s.kicker, {}, r)}</span><strong>${T.html(s.name, {}, r)}</strong><span>${T.html(s.lede, {}, r)}</span></span>
      ${icon('arrow')}
    </a>`).join('')}
  </div>
</section>
${closingCta(ctx, r)}`;
}

export function servicePage(ctx, r, s) {
  const { cfg, W, T } = ctx, P = W.servicePage;
  const x = { service: T.plain(s.name), serviceLower: T.plain(s.name).toLowerCase() };
  const t = (str) => T.html(str, x, r);
  const others = cfg.services.filter(o => o.slug !== s.slug);
  return `
<section class="page-hero page-hero-split">
  <div class="wrap split">
    <div>
      ${crumbs(ctx, r, [home(ctx), [W.servicesPage.breadcrumb, 'services/'], [T.plain(s.name), 'services/' + s.slug + '/']])}
      <p class="kicker">${t(s.kicker)}</p>
      <h1>${t(s.headline || P.headline)}</h1>
      <p class="page-lede">${t(s.lede)}</p>
      <p>${t(s.intro)}</p>
      <div class="hero-actions">
        <a class="btn btn-cedar" href="${r('estimate/')}">${esc(P.estimateButton)}</a>
        <a class="btn btn-ghost" href="${r('pricing/')}">${esc(P.calculatorButton)}</a>
      </div>
    </div>
    ${figure(ctx, r, s.photo, s.photoAlt, { cls: 'page-hero-photo', loading: 'eager', isStock: s.photoIsStock })}
  </div>
</section>
${s.showPlans ? plansBlock(ctx, r) : ''}
<section class="sec">
  <div class="wrap">
    ${sectionHead('', t(P.includedKicker), t(s.showPlans ? P.includedHeadlinePlans : P.includedHeadline))}
    <ol class="included">
      ${s.steps.map((st, i) => `<li><span class="inc-n">${String(i + 1).padStart(2, '0')}</span><div><h3>${t(st.title)}</h3><p>${t(st.text)}</p></div></li>`).join('')}
    </ol>
  </div>
</section>
<section class="sec sec-tint">
  <div class="wrap faq-grid">
    <div>${sectionHead('', t(P.faqKicker), t(P.faqHeadline))}</div>
    ${faqList(ctx, r, s.faq, x)}
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <p class="kicker">${t(P.otherServices)}</p>
    <ul class="pill-links">${others.map(o => `<li><a href="${r('services/' + o.slug + '/')}">${T.html(o.name, {}, r)}</a></li>`).join('')}</ul>
  </div>
</section>
${closingCta(ctx, r)}`;
}

function plansBlock(ctx, r) {
  const { cfg, W, T } = ctx, mp = cfg.maintenancePlans, P = W.plans;
  return `
<section class="sec plans-sec">
  <div class="wrap">
    ${sectionHead('', T.html(P.kicker, {}, r), T.html(P.headline, {}, r))}
    ${mp.sample ? `<p class="sample-banner">${T.html(P.sampleBanner, {}, r)}</p>` : ''}
    <div class="plans">
      ${mp.plans.map(p => `
      <div class="plan${p.featured ? ' plan-featured' : ''}">
        ${p.featured ? `<p class="plan-flag">${esc(P.featuredFlag)}</p>` : ''}
        <h3>${esc(p.name)}</h3>
        <p class="plan-price"><strong>${p.price < 5 ? money(p.price, 2) : money(p.price)}</strong> <span>/ ${esc(p.per)}</span></p>
        <ul class="check">${p.includes.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
        <a class="btn ${p.featured ? 'btn-cedar' : 'btn-outline'}" href="${r('estimate/?plan=' + p.id)}">${esc(P.choosePrefix)} ${esc(p.name)}</a>
      </div>`).join('')}
    </div>
  </div>
</section>`;
}

// ---------- PRICING ----------
export function pricingPage(ctx, r) {
  const { cfg, W, T } = ctx, p = cfg.pricing, P = W.pricingPage, FM = W.forms;
  const t = (s, x) => T.html(s, x, r);
  const radio = (name, obj, checked) => Object.entries(obj).map(([k, v]) => `
    <label class="opt"><input type="radio" name="${name}" value="${k}"${k === checked ? ' checked' : ''}><span><strong>${esc(v.label.split(' — ')[0])}</strong>${v.label.includes(' — ') ? `<small>${esc(v.label.split(' — ')[1])}</small>` : ''}</span></label>`).join('');
  const leg = (nn, s) => `<legend><span class="step-n">${nn}</span> ${t(s)}</legend>`;
  return `${pageHero(ctx, r, [home(ctx), [P.breadcrumb, 'pricing/']], P)}
<section class="sec calc-sec">
  <div class="wrap calc-grid">
    <form class="calc" id="calc" novalidate>
      <fieldset>
        ${leg(1, P.step1)}
        <div class="seg" role="radiogroup" aria-label="${esc(P.measureBy)}">
          <label><input type="radio" name="mode" value="lw" checked><span>${esc(P.modeLW)}</span></label>
          <label><input type="radio" name="mode" value="sqft"><span>${esc(P.modeSqft)}</span></label>
        </div>
        <div class="field-row" data-mode="lw">
          <label class="field"><span>${esc(P.length)}</span><input type="number" name="deckLength" min="0" step="1" value="16" inputmode="numeric"></label>
          <span class="times">×</span>
          <label class="field"><span>${esc(P.width)}</span><input type="number" name="deckWidth" min="0" step="1" value="12" inputmode="numeric"></label>
        </div>
        <div class="field-row" data-mode="sqft" hidden>
          <label class="field"><span>${esc(P.sqft)}</span><input type="number" name="sqft" min="0" step="10" value="192" inputmode="numeric"></label>
        </div>
        <p class="hint">${t(P.sizeHint)}</p>
      </fieldset>
      <fieldset>
        ${leg(2, P.step2)}
        <div class="field-row">
          <label class="field"><span>${esc(P.railing)}</span><input type="number" name="rail" min="0" step="1" value="28" inputmode="numeric"></label>
          <label class="field"><span>${esc(P.stairs)}</span><input type="number" name="stairs" min="0" step="1" value="4" inputmode="numeric"></label>
        </div>
        <p class="hint">${t(P.railHint)}</p>
      </fieldset>
      <fieldset>
        ${leg(3, P.step3)}
        <div class="opts">${radio('condition', p.condition, 'weathered')}</div>
      </fieldset>
      <fieldset>
        ${leg(4, P.step4)}
        <div class="opts">${radio('finish', p.finishes, 'semi-transparent')}</div>
        <p class="hint">${t(P.finishHint)}</p>
      </fieldset>
      <fieldset>
        <legend><span class="step-n">5</span> ${t(P.step5)} <small>${esc(P.optional)}</small></legend>
        <div class="opts opts-check">
          ${p.addOns.map(a => `<label class="opt opt-row"><input type="checkbox" name="addon" value="${a.id}"><span><strong>${esc(a.label)}</strong><small>${money(a.price, a.price < 5 ? 2 : 0)} / ${esc(a.unit)}</small></span>${a.unit === 'board' ? `<input class="mini" type="number" name="boards" min="1" value="2" aria-label="${esc(P.boardsLabel)}">` : ''}</label>`).join('')}
        </div>
      </fieldset>
    </form>
    <aside class="ticket" id="ticket" aria-live="polite">
      <div class="ticket-head">
        <span class="mono">${esc(P.ticketLabel)}</span>
        ${p.sample ? `<span class="sample-tag">${esc(P.sampleRates)}</span>` : ''}
      </div>
      <p class="ticket-range"><span data-out="low">$0</span><span class="dash">–</span><span data-out="high">$0</span></p>
      <dl class="ticket-lines" data-out="lines"></dl>
      <p class="ticket-dep">${esc(P.depositLabel)} <strong data-out="deposit">$0</strong> (${p.depositPercent}%)</p>
      <p class="ticket-note">${t(P.ticketNote)}</p>
      <button class="btn btn-cedar btn-block" type="button" data-open="calc-save">${esc(P.sendButton)}</button>
      <div class="ticket-save" id="calc-save" hidden>
        <form data-lead-form="calculator" novalidate>
          <label class="field"><span>${esc(FM.name)}</span><input name="name" required autocomplete="name"></label>
          <label class="field"><span>${esc(FM.phone)}</span><input name="phone" type="tel" required autocomplete="tel"></label>
          <label class="field"><span>${esc(FM.email)}</span><input name="email" type="email" autocomplete="email"></label>
          <label class="field"><span>${esc(FM.address)}</span><input name="address" autocomplete="street-address"></label>
          <button class="btn btn-forest btn-block" type="submit">${esc(P.sendSubmit)}</button>
          <p class="form-msg" role="status"></p>
        </form>
      </div>
    </aside>
  </div>
</section>
<section class="sec sec-tint">
  <div class="wrap">
    ${sectionHead('', t(P.sheetKicker), t(P.sheetHeadline))}
    <div class="price-sheet">
      <table class="data-table">
        <thead><tr><th>${esc(P.sheetItem)}</th><th>${esc(P.sheetRate)}</th></tr></thead>
        <tbody>
          ${Object.values(p.finishes).map(f => `<tr><td>${t(P.sheetFloor, { finish: f.label.toLowerCase() })}</td><td>${money(f.low, 2)}–${money(f.high, 2)} ${esc(P.perSqft)}</td></tr>`).join('')}
          ${Object.values(p.condition).map(c => `<tr><td>${t(P.sheetCondition, { condition: c.label.split(' — ')[0].toLowerCase() })}</td><td>× ${c.mult.toFixed(2)}</td></tr>`).join('')}
          <tr><td>${esc(P.sheetRailings)}</td><td>${money(p.railingPerFt.low)}–${money(p.railingPerFt.high)} ${esc(P.perFt)}</td></tr>
          <tr><td>${esc(P.sheetStairs)}</td><td>${money(p.stairPerStep.low)}–${money(p.stairPerStep.high)} ${esc(P.perStep)}</td></tr>
          <tr><td>${esc(P.sheetMinimum)}</td><td>${money(p.minimumJob)}</td></tr>
        </tbody>
      </table>
      <div class="price-context">
        <h3>${t(P.compareHeadline)}</h3>
        ${P.compareParagraphs.map(x => `<p>${t(x)}</p>`).join('')}
        <p>${t(P.plansLink).replace('<a ', '<a class="arrow-link" ').replace('</a>', ` ${icon('arrow')}</a>`)}</p>
      </div>
    </div>
  </div>
</section>
${closingCta(ctx, r, P.closing)}`;
}

// ---------- VISUALIZER ----------
export function visualizerPage(ctx, r) {
  const { cfg, W, T } = ctx, P = W.visualizerPage, TL = P.tools, FM = W.forms;
  const t = (s) => T.html(s, {}, r);
  const first = cfg.stains['semi-transparent'][0];
  return `${pageHero(ctx, r, [home(ctx), [P.breadcrumb, 'visualizer/']], P, 'page-hero-tight')}
<section class="viz-app" id="viz">
  <div class="wrap viz-app-grid">
    <div class="viz-stage-col">
      <div class="viz-steps" role="list">${P.steps.map((s, i) => `<span role="listitem" data-step="${i + 1}"${i === 0 ? ' class="is-on"' : ''}>${esc(s)}</span>`).join('')}</div>
      <div class="viz-stage" id="viz-stage">
        <div class="viz-empty" id="viz-empty">
          <p><strong>${t(P.startHeadline)}</strong></p>
          <label class="btn btn-cedar btn-lg">${icon('camera')} ${esc(P.uploadButton)}<input type="file" accept="image/*" id="viz-file" hidden></label>
          <p class="or">${esc(P.orSample)}</p>
          <div class="viz-samples">
            ${cfg.visualizer.samples.map(s => `<button type="button" class="viz-sample" data-sample="${s.id}"><img src="${img(r, s.file)}" alt="" loading="lazy"><span>${esc(s.label)}</span></button>`).join('')}
          </div>
        </div>
        <div class="viz-canvas-wrap" id="viz-canvas-wrap" hidden>
          <canvas id="viz-base" class="viz-layer"></canvas>
          <canvas id="viz-out" class="viz-layer"></canvas>
          <canvas id="viz-mask" class="viz-layer viz-mask"></canvas>
          <canvas id="viz-ui" class="viz-layer viz-ui"></canvas>
          <div class="viz-compare" id="viz-compare" hidden><input type="range" min="0" max="100" value="50" id="viz-compare-range" aria-label="${esc(P.compareLabel)}"><span class="ba-label ba-label-l">${esc(P.compareBefore)}</span><span class="ba-label ba-label-r">${esc(P.compareAfter)}</span><div class="viz-compare-line"></div></div>
        </div>
      </div>
      <div class="viz-toolbar" id="viz-toolbar" hidden>
        <div class="tool-group" role="group" aria-label="${esc(TL.groupLabel)}">
          <button type="button" class="tool is-on" data-tool="brush" title="${esc(TL.brush)}">${icon('brush')}<span>${esc(TL.brush)}</span></button>
          <button type="button" class="tool" data-tool="poly" title="${esc(TL.outlineTip)}">${icon('pin')}<span>${esc(TL.outline)}</span></button>
          <button type="button" class="tool" data-tool="erase" title="${esc(TL.eraser)}">${icon('x')}<span>${esc(TL.eraser)}</span></button>
        </div>
        <label class="tool-size">${esc(TL.size)} <input type="range" id="viz-size" min="6" max="120" value="40"></label>
        <label class="tool-check" title="${esc(TL.cleanTip)}"><input type="checkbox" id="viz-clean" checked> ${esc(TL.clean)}</label>
        <div class="tool-group">
          <button type="button" class="tool" id="viz-undo">↶<span>${esc(TL.undo)}</span></button>
          <button type="button" class="tool" id="viz-auto" hidden>✦<span>${esc(TL.suggest)}</span></button>
          <button type="button" class="tool" id="viz-clear">${esc(TL.clear)}</button>
          <button type="button" class="tool" id="viz-toggle-mask">${esc(TL.showMask)}</button>
          <button type="button" class="tool" id="viz-compare-btn">${esc(TL.compare)}</button>
          <button type="button" class="tool" id="viz-new">${esc(TL.newPhoto)}</button>
        </div>
      </div>
      <p class="viz-help" id="viz-help" hidden>${t(P.help)}</p>
    </div>
    <aside class="viz-side">
      <h2 class="viz-side-h">${t(P.colorsHeading)}</h2>
      <div class="swatch-group">
        <h3>${esc(P.cleanOnlyGroup)}</h3>
        <div class="swatches"><button type="button" class="swatch swatch-clean" data-hex="#c19467" data-opacity="none" data-type-label="${esc(P.cleanOnlyGroup)}" data-name="${esc(P.cleanOnlyName)}" style="--c:#c19467"><span class="swatch-chip"></span><span class="swatch-name">${esc(P.cleanOnlyName)}</span></button></div>
      </div>
      ${['transparent', 'semi-transparent', 'solid'].map(k => `
      <div class="swatch-group">
        <h3>${esc(P.groupNames[k])}</h3>
        <div class="swatches">
          ${cfg.stains[k].map((s, i) => `<button type="button" class="swatch${k === 'semi-transparent' && i === 0 ? ' is-on' : ''}" data-hex="${s.hex}" data-opacity="${k}" data-type-label="${esc(P.groupNames[k])}" data-name="${esc(s.name)}" style="--c:${s.hex}"><span class="swatch-chip"></span><span class="swatch-name">${esc(s.name)}</span></button>`).join('')}
        </div>
      </div>`).join('')}
      <p class="fine">${t(P.colorsNote)}${cfg.business.brandsCarried.length ? ' ' + esc(P.brandsPrefix) + ' ' + cfg.business.brandsCarried.map(esc).join(', ') + '.' : ''}</p>
      <div class="viz-chosen"><span class="viz-chosen-chip" id="viz-chip"></span><div><span class="mono">${esc(P.selectedLabel)}</span><strong id="viz-chosen-name">${esc(first.name)}</strong><small id="viz-chosen-type">${esc(P.groupNames['semi-transparent'])}</small></div></div>
      <button class="btn btn-cedar btn-block" type="button" id="viz-get" disabled>${esc(P.getButton)}</button>
      <div id="viz-lead" hidden>
        <form data-lead-form="visualizer" novalidate>
          <p class="fine">${t(P.leadNote)}</p>
          <label class="field"><span>${esc(FM.name)}</span><input name="name" required autocomplete="name"></label>
          <label class="field"><span>${esc(FM.email)}</span><input name="email" type="email" required autocomplete="email"></label>
          <label class="field"><span>${esc(FM.phoneShort)} <small>${esc(FM.optional)}</small></span><input name="phone" type="tel" autocomplete="tel"></label>
          <button class="btn btn-forest btn-block" type="submit">${esc(P.leadSubmit)}</button>
          <p class="form-msg" role="status"></p>
        </form>
      </div>
    </aside>
  </div>
</section>
<section class="sec sec-tint">
  <div class="wrap three-up">
    ${P.infoBoxes.map(b => `<div><h3>${t(b.title)}</h3><p>${t(b.text)}</p></div>`).join('')}
  </div>
</section>
${closingCta(ctx, r, P.closing)}`;
}

// ---------- ESTIMATE ----------
export function estimatePage(ctx, r) {
  const { cfg, W, T } = ctx, P = W.estimatePage, FM = W.forms;
  const t = (s) => T.html(s, {}, r);
  const opts = (list) => list.map(o => `<option>${esc(o)}</option>`).join('');
  return `${pageHero(ctx, r, [home(ctx), [P.breadcrumb, 'estimate/']], P, 'page-hero-tight')}
<section class="sec">
  <div class="wrap est-grid">
    <form class="est-form" data-lead-form="estimate" novalidate>
      <fieldset>
        <legend><span class="step-n">1</span> ${t(P.photosStep)} <small>${esc(P.photosNote)}</small></legend>
        <div class="photo-slots" id="photo-slots">
          <label class="photo-slot photo-slot-wide"><input type="file" accept="image/*" data-slot="0"><span class="photo-slot-in">${icon('camera')}<strong>${t(P.widePhotoTitle)}</strong><small>${t(P.widePhotoText)}</small></span></label>
          ${P.otherPhotos.slice(0, 4).map((s, i) => `<label class="photo-slot"><input type="file" accept="image/*" data-slot="${i + 1}"><span class="photo-slot-in">${icon('camera')}<strong>${t(s)}</strong></span></label>`).join('')}
        </div>
      </fieldset>
      <fieldset>
        <legend><span class="step-n">2</span> ${t(P.aboutYouStep)}</legend>
        <div class="field-grid">
          <label class="field"><span>${esc(FM.name)}</span><input name="name" required autocomplete="name"></label>
          <label class="field"><span>${esc(FM.phone)}</span><input name="phone" type="tel" required autocomplete="tel"></label>
          <label class="field"><span>${esc(FM.email)}</span><input name="email" type="email" autocomplete="email"></label>
          <label class="field field-wide"><span>${esc(FM.address)}</span><input name="address" required autocomplete="street-address"></label>
        </div>
      </fieldset>
      <fieldset>
        <legend><span class="step-n">3</span> ${t(P.aboutDeckStep)}</legend>
        <div class="field-grid">
          <label class="field"><span>${esc(P.deckSize)}</span><input name="size" placeholder="${esc(P.deckSizePlaceholder)}"></label>
          <label class="field"><span>${esc(P.timeframe)}</span><select name="timeframe"><option value="">${esc(FM.chooseOne)}</option>${opts(P.timeframeOptions)}</select></label>
          <label class="field"><span>${esc(P.service)} <small>${esc(FM.optional)}</small></span><select name="service">${opts(P.serviceOptions)}</select></label>
          <label class="field"><span>${esc(P.heard)}</span><select name="heard"><option value="">${esc(FM.chooseOne)}</option>${opts(P.heardOptions)}</select></label>
          <label class="field field-wide"><span>${esc(P.notes)} <small>${esc(FM.optional)}</small></span><textarea name="notes" rows="3" placeholder="${esc(P.notesPlaceholder)}"></textarea></label>
        </div>
      </fieldset>
      <input type="hidden" name="plan">
      <input type="hidden" name="color">
      <button class="btn btn-cedar btn-lg" type="submit">${esc(P.submit)}</button>
      <p class="form-msg" role="status"></p>
      ${cfg.website.mockup ? `<p class="fine">${t(P.demoNote)}</p>` : ''}
    </form>
    <aside class="est-side">
      <div class="est-card">
        <h2>${t(P.nextHeadline)}</h2>
        <ol class="mini-steps">${P.nextSteps.map(s => `<li>${t(s)}</li>`).join('')}</ol>
      </div>
      <div class="est-card est-card-quiet">
        <h2>${t(P.talkHeadline)}</h2>
        <p><a class="big-phone" href="tel:${cfg.business.phoneHref}">${icon('phone')} ${esc(cfg.business.phone)}</a></p>
        <p class="fine">${t(P.talkNote)}</p>
      </div>
      <div class="est-card est-card-quiet">
        <h2>${t(P.ballparkHeadline)}</h2>
        <p>${t(P.ballparkLink).replace('<a ', '<a class="arrow-link" ').replace('</a>', ` ${icon('arrow')}</a>`)}</p>
      </div>
    </aside>
  </div>
</section>`;
}

// ---------- AREAS ----------
export function areasIndex(ctx, r, areaGroups) {
  const { W } = ctx, P = W.areasPage;
  return `${pageHero(ctx, r, [home(ctx), [P.breadcrumb, 'areas/']], P)}
<section class="sec">
  <div class="wrap">
    ${areaGroups.map(g => `
    <div class="area-group">
      <h2 class="area-group-h">${esc(g.name)}</h2>
      <div class="area-cards">
        ${g.areas.map(a => `<a class="area-card" href="${r('areas/' + a.slug + '/')}"><strong>${esc(a.name)}, ${esc(a.state)}</strong><span>${esc(a.woodNotes[0])}</span>${icon('arrow')}</a>`).join('')}
      </div>
    </div>`).join('')}
  </div>
</section>
${closingCta(ctx, r)}`;
}

export const areaVars = (a) => ({ area: a.name, areaState: a.state, areaLede: a.lede });

export function areaPage(ctx, r, a, bySlug) {
  const { cfg, W, T } = ctx, P = W.areaPage, x = areaVars(a);
  const t = (s) => T.html(s, x, r);
  const nearby = (a.nearby || []).map(s => bySlug[s]).filter(Boolean);
  return `
<section class="page-hero page-hero-split area-hero">
  <div class="wrap split">
    <div>
      ${crumbs(ctx, r, [home(ctx), [W.areasPage.breadcrumb, 'areas/'], [a.name, 'areas/' + a.slug + '/']])}
      <p class="kicker">${esc(a.county)}</p>
      <h1>${t(a.headline)}</h1>
      <p class="page-lede">${t(a.lede)}</p>
      <div class="hero-actions">
        <a class="btn btn-cedar" href="${r('estimate/')}">${t(P.estimateButton)}</a>
        <a class="btn btn-ghost" href="tel:${cfg.business.phoneHref}">${icon('phone')} ${esc(cfg.business.phone)}</a>
      </div>
    </div>
    ${figure(ctx, r, a.photo, a.photoAlt, { cls: 'page-hero-photo', loading: 'eager', caption: a.photoCaption || (a.photoIsStock ? T.plain(P.stockCaption) : '') })}
  </div>
</section>
<section class="sec">
  <div class="wrap area-body">
    <div class="prose">
      ${a.sections.map(s => `<h2>${t(s.headline)}</h2><p>${t(s.text)}</p>`).join('')}
      <h2>${t(P.bestTimeHeadline)}</h2>
      <p>${t(P.bestTimeText)}</p>
    </div>
    <aside class="area-aside">
      <div class="est-card">
        <h2>${t(P.seeHeadline)}</h2>
        <ul class="check">${a.woodNotes.map(nn => `<li>${t(nn)}</li>`).join('')}</ul>
      </div>
      <div class="est-card est-card-quiet">
        <h2>${t(P.neighborhoodsHeadline)}</h2>
        <p>${a.neighborhoods.map(esc).join(' · ')}</p>
      </div>
      ${nearby.length ? `<div class="est-card est-card-quiet"><h2>${t(P.nearbyHeadline)}</h2><ul class="pill-links">${nearby.map(nn => `<li><a href="${r('areas/' + nn.slug + '/')}">${esc(nn.name)}</a></li>`).join('')}</ul></div>` : ''}
    </aside>
  </div>
</section>
<section class="sec sec-tint">
  <div class="wrap faq-grid">
    <div>${sectionHead('', t(P.faqKicker), t(P.faqHeadline))}</div>
    ${faqList(ctx, r, [a.faq], x)}
  </div>
</section>
${closingCta(ctx, r, P.closing, x)}`;
}

// ---------- LEARN ----------
export function learnIndex(ctx, r) {
  const { cfg, W, T } = ctx, P = W.learnPage, arts = cfg.articles;
  const [lead, ...rest] = arts;
  return `${pageHero(ctx, r, [home(ctx), [P.breadcrumb, 'learn/']], P)}
<section class="sec">
  <div class="wrap">
    <a class="learn-lead" href="${r('learn/' + lead.slug + '/')}">
      <img src="${img(r, lead.photo)}" alt="" loading="lazy">
      <div><p class="kicker">${esc(T.plain(P.minRead, { n: lead.readMinutes }))}</p><h2>${T.html(lead.title, {}, r)}</h2><p>${T.html(lead.description, {}, r)}</p><span class="arrow-link">${esc(P.readIt)} ${icon('arrow')}</span></div>
    </a>
    <ol class="learn-list">
      ${rest.map(a => `<li><a href="${r('learn/' + a.slug + '/')}"><span class="mono">${esc(T.plain(P.minShort, { n: a.readMinutes }))}</span><strong>${T.html(a.title, {}, r)}</strong><span>${T.html(a.description, {}, r)}</span></a></li>`).join('')}
    </ol>
    ${P.moreText ? `<aside class="learn-more"><h2>${T.html(P.moreHeading || '', {}, r)}</h2><p>${T.html(P.moreText, {}, r)}</p></aside>` : ''}
  </div>
</section>
${closingCta(ctx, r)}`;
}

function rainChart(ctx) {
  const { cfg, W, T } = ctx, c = cfg.location.climate, A = W.articlePage;
  const max = Math.max(...c.monthlyRainIn), min = Math.min(...c.monthlyRainIn);
  const bars = c.monthlyRainIn.map((v, i) => {
    const low = v <= min + 0.12 || i === 8 || i === 9;
    return `<div class="rain-bar${low ? ' is-low' : ''}" style="--h:${Math.round((v / max) * 100)}%"><span class="rain-val">${v.toFixed(2)}</span><span class="rain-m">${esc(A.months[i])}</span></div>`;
  }).join('');
  return `<figure class="rain-chart" aria-label="${esc(T.plain(A.rainChartLabel))}">
    <div class="rain-bars">${bars}</div>
    <figcaption>${esc(T.plain(A.rainChartCaption))}</figcaption>
  </figure>`;
}

// Article body blocks → HTML.
function blocks(ctx, r, list, cite) {
  const { T } = ctx;
  const t = (s) => T.html(s, {}, r, cite);
  return list.map(b => {
    if (typeof b === 'string') return `<p>${t(b)}</p>`;
    if (b.lede) return `<p class="lede">${t(b.lede)}</p>`;
    if (b.h2) return `<h2>${t(b.h2)}</h2>`;
    if (b.h3) return `<h3>${t(b.h3)}</h3>`;
    if (b.p) return `<p>${t(b.p)}</p>`;
    if (b.list) return `<ul>${b.list.map(i => `<li>${t(i)}</li>`).join('')}</ul>`;
    if (b.checklist) return `<ul class="check">${b.checklist.map(i => `<li>${t(i)}</li>`).join('')}</ul>`;
    if (b.steps) return `<ol class="steps-inline">${b.steps.map(i => `<li>${t(i)}</li>`).join('')}</ol>`;
    if (b.compare) return `<div class="compare">${b.compare.map(c => `<div><h3>${t(c.title)}</h3><ul>${c.items.map(i => `<li>${t(i)}</li>`).join('')}</ul></div>`).join('')}</div>`;
    if (b.table) return `<table class="data-table"><thead><tr>${b.table.head.map(h => `<th>${t(h)}</th>`).join('')}</tr></thead><tbody>${b.table.rows.map(row => `<tr>${row.map(c => `<td>${t(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    if (b.rainChart) return rainChart(ctx);
    console.warn('  ! Unknown article block: ' + JSON.stringify(b).slice(0, 80));
    return '';
  }).join('\n');
}

export function articlePage(ctx, r, a) {
  const { cfg, W, T } = ctx, A = W.articlePage;
  const cite = makeCiter(cfg.sources);
  const body = blocks(ctx, r, a.body, cite);
  const more = cfg.articles.filter(x => x.slug !== a.slug).slice(0, 3);
  const date = new Date(a.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  return `
<article class="article">
  <header class="article-head">
    <div class="wrap wrap-narrow">
      ${crumbs(ctx, r, [home(ctx), [W.learnPage.breadcrumb, 'learn/'], [T.plain(a.short), 'learn/' + a.slug + '/']])}
      <p class="kicker">${esc(T.plain(A.meta, { n: a.readMinutes, date }))}</p>
      <h1>${T.html(a.title, {}, r)}</h1>
    </div>
    <figure class="article-photo wrap"><img src="${img(r, a.photo)}" alt="" loading="eager"></figure>
  </header>
  <div class="wrap wrap-narrow prose">
    ${body}
    ${a.goDeeper && a.goDeeper.length ? `<aside class="go-deeper"><h2>${esc(A.goDeeperHeading)}</h2><ul>${a.goDeeper.map(g => `<li>${T.html(g, {}, r)}</li>`).join('')}</ul></aside>` : ''}
    <aside class="article-cta">
      <p>${T.html(A.ctaText, {}, r)}</p>
      <a class="btn btn-cedar" href="${r('estimate/')}">${esc(A.ctaButton)}</a>
    </aside>
    ${cite.list(A.sourcesHeading)}
  </div>
</article>
<section class="sec sec-tint">
  <div class="wrap">
    <p class="kicker">${esc(A.keepReading)}</p>
    <ul class="more-list">${more.map(m => `<li><a href="${r('learn/' + m.slug + '/')}">${T.html(m.title, {}, r)} ${icon('arrow')}</a></li>`).join('')}</ul>
  </div>
</section>`;
}

// ---------- ABOUT / WARRANTY / CONTACT / PRIVACY / 404 ----------
export function aboutPage(ctx, r) {
  const { cfg, W, T } = ctx, P = W.aboutPage, b = cfg.business, G = P.glance;
  const t = (s) => T.html(s, {}, r);
  return `
<section class="page-hero page-hero-split">
  <div class="wrap split">
    <div>
      ${crumbs(ctx, r, [home(ctx), [P.breadcrumb, 'about/']])}
      <p class="kicker">${t(P.kicker)}</p>
      <h1>${t(P.headline)}</h1>
      <p class="page-lede">${t(P.lede)}</p>
    </div>
    ${figure(ctx, r, cfg.photos.about.file, cfg.photos.about.alt, { cls: 'page-hero-photo', loading: 'eager', isStock: cfg.photos.about.isStock })}
  </div>
</section>
<section class="sec">
  <div class="wrap area-body">
    <div class="prose">
      <h2>${t(P.whoHeadline)}</h2>
      <p>${t(P.whoText).replace(esc(val(b.owner)), show(ctx, b.owner))}</p>
      ${P.storyPlaceholder ? `<p class="sample-banner">${t(P.storyPlaceholder)}</p>` : ''}
      ${P.story ? (Array.isArray(P.story) ? P.story : [P.story]).map(s => `<p>${t(s)}</p>`).join('') : ''}
      <h2>${t(P.howHeadline)}</h2>
      <ul class="check">${P.howList.map(i => `<li>${t(i)}</li>`).join('')}</ul>
      <h2>${t(P.licenseHeadline)}</h2>
      <p>${t(P.licenseText)}</p>
      <p>${esc(P.licenseLabel)} ${show(ctx, b.license)}<br>${esc(P.insuranceLabel)} ${show(ctx, b.insurance)}</p>
      <h2>${t(P.partnerHeadline)}</h2>
      <p>${t(P.partnerText)}</p>
    </div>
    <aside class="area-aside">
      <div class="est-card">
        <h2>${t(P.glanceHeadline)}</h2>
        <dl class="facts">
          <dt>${esc(G.crew)}</dt><dd>${t('{Crew}')}</dd>
          <dt>${esc(G.years)}</dt><dd>${show(ctx, b.yearsInBusiness)} ${esc(G.yearsSuffix)}</dd>
          <dt>${esc(G.area)}</dt><dd>${t('{region}')}</dd>
          <dt>${esc(G.hours)}</dt><dd>${esc(b.hours)}</dd>
          <dt>${esc(G.warranty)}</dt><dd><a href="${r('warranty/')}">${t(G.warrantyValue)}</a></dd>
        </dl>
      </div>
    </aside>
  </div>
</section>
${closingCta(ctx, r)}`;
}

export function warrantyPage(ctx, r) {
  const { cfg, W, T } = ctx, P = W.warrantyPage, w = cfg.warranty;
  const t = (s) => T.html(s, {}, r);
  return `
<section class="page-hero">
  <div class="wrap">
    ${crumbs(ctx, r, [home(ctx), [P.breadcrumb, 'warranty/']])}
    <p class="kicker">${t(P.kicker)}${w.sample ? ` · <span class="sample-tag">${esc(P.sampleTag)}</span>` : ''}</p>
    <h1>${t(P.headline)}</h1>
    <p class="page-lede">${t(w.summary)}</p>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <div class="warranty-terms">
      <div class="term"><span class="term-n">${w.horizontalYears}</span><span class="term-u">${esc(P.yearsUnit)}</span><p>${t(P.floorsLabel)}</p></div>
      <div class="term"><span class="term-n">${w.verticalYears}</span><span class="term-u">${esc(P.yearsUnit)}</span><p>${t(P.verticalLabel)}</p></div>
    </div>
    <div class="warranty-cols">
      <div><h2>${t(P.coversHeadline)}</h2><ul class="check">${w.covers.map(x => `<li>${t(x)}</li>`).join('')}</ul></div>
      <div><h2>${t(P.excludesHeadline)}</h2><ul class="cross">${w.excludes.map(x => `<li>${t(x)}</li>`).join('')}</ul></div>
      <div><h2>${t(P.conditionsHeadline)}</h2><ul class="check">${w.conditions.map(x => `<li>${t(x)}</li>`).join('')}</ul></div>
    </div>
    ${w.sample ? `<p class="sample-banner">${t(P.sampleBanner)}</p>` : ''}
    <p class="fine">${t(P.footnote)}</p>
  </div>
</section>
${closingCta(ctx, r)}`;
}

export function contactPage(ctx, r) {
  const { cfg, W, T } = ctx, P = W.contactPage, FM = W.forms, b = cfg.business;
  const t = (s) => T.html(s, {}, r);
  return `${pageHero(ctx, r, [home(ctx), [P.breadcrumb, 'contact/']], P, 'page-hero-tight')}
<section class="sec">
  <div class="wrap est-grid">
    <form class="est-form" data-lead-form="contact" novalidate>
      <div class="field-grid">
        <label class="field"><span>${esc(FM.name)}</span><input name="name" required autocomplete="name"></label>
        <label class="field"><span>${esc(FM.phoneShort)}</span><input name="phone" type="tel" autocomplete="tel"></label>
        <label class="field field-wide"><span>${esc(FM.email)}</span><input name="email" type="email" autocomplete="email"></label>
        <label class="field field-wide"><span>${esc(FM.message)}</span><textarea name="notes" rows="5" required></textarea></label>
      </div>
      <button class="btn btn-cedar btn-lg" type="submit">${esc(P.submit)}</button>
      <p class="form-msg" role="status"></p>
    </form>
    <aside class="est-side">
      <div class="est-card">
        <h2>${t(P.reachHeadline)}</h2>
        <p><a class="big-phone" href="tel:${b.phoneHref}">${icon('phone')} ${esc(b.phone)}</a></p>
        <p><a href="sms:${b.sms}">${esc(P.textUs)}</a> · <a href="mailto:${esc(b.email)}">${esc(b.email)}</a></p>
        <p>${show(ctx, b.street)}<br>${esc(b.city)}, ${esc(b.state)} ${esc(b.zip)}</p>
        <p class="fine">${esc(b.hours)}</p>
      </div>
      <div class="est-card est-card-quiet">
        <h2>${t(P.priceHeadline)}</h2>
        <p>${t(P.priceLink).replace('<a ', '<a class="arrow-link" ').replace('</a>', ` ${icon('arrow')}</a>`)}</p>
      </div>
    </aside>
  </div>
</section>`;
}

export function privacyPage(ctx, r) {
  const { cfg, W, T } = ctx, P = W.privacyPage;
  return `${pageHero(ctx, r, [home(ctx), [P.breadcrumb, 'privacy/']], P, 'page-hero-tight')}
<section class="sec">
  <div class="wrap wrap-narrow prose">
    ${cfg.website.mockup ? `<p class="sample-banner">${T.html(P.mockupNote, {}, r)}</p>` : ''}
    ${blocks(ctx, r, P.sections, null)}
  </div>
</section>`;
}

export function notFoundPage(ctx, r) {
  const { W, T } = ctx, P = W.notFoundPage;
  return `
<section class="page-hero">
  <div class="wrap">
    <p class="kicker">${esc(P.kicker)}</p>
    <h1>${T.html(P.headline, {}, r)}</h1>
    <p class="page-lede">${T.html(P.text, {}, r)}</p>
  </div>
</section>`;
}
