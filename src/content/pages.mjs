import { esc, val, show, isSample, money, icon, photo, crumbs, cap } from '../lib/layout.mjs';

// ---------- small building blocks ----------
const sectionHead = (num, kicker, title, extra = '') =>
  `<div class="sec-head">${num ? `<span class="sec-num">${num}</span>` : ''}<p class="kicker">${kicker}</p><h2>${title}</h2>${extra}</div>`;

export function homeFaqs(cfg, src) {
  const c = cfg.location.climate;
  const city = cfg.business.city;
  const link = (k, t) => `<a href="${src[k].url.replace(/&/g, '&amp;')}" target="_blank" rel="noopener">${t}</a>`;
  return [
    { q: `How much does deck staining cost in ${city}?`, a: `Nationally, Angi puts a typical job at $550–$1,250, about $850 on average, or roughly $2 to $4 per square foot (${link('angi', 'Angi, 2026')}). Your price depends on size, railings, stairs and how much prep the wood needs. Our price calculator gives you a range in about a minute.` },
    { q: 'How often does a deck need to be restained?', a: `Most sources say every two to three years for a deck floor (${link('angi', 'Angi')}). The U.S. Forest Products Lab gives semi-transparent stain about 2–3 years on new smooth decking and 3–6 years on weathered wood (${link('usdaSouth', 'USDA FPL')}). Shade, sun and use change that.` },
    { q: `When is the best time of year to stain a deck in ${city}?`, a: `${c.bestMonths}. ${c.driestMonths.split(' and ')[0].replace(/\s*\(.*/, '')} is the driest month on average here, and ${c.fewestRainDays} have the fewest rainy days (${link(c.sourceKey, 'NOAA normals')}). Stain needs dry wood and a few dry days.` },
    { q: 'Semi-transparent or solid stain?', a: `The experts disagree. The U.S. Forest Products Lab says film finishes like solid stain tend to peel on decks (${link('usdaFinishes', 'USDA FPL')}). Consumer Reports says solid scores best in their testing (${link('consumerReports', 'via KOMO')}). We usually suggest semi-transparent on floors and solid on railings, if you want solid.` },
    { q: 'Do you pressure-wash?', a: `Not the way most people mean it. High pressure can strip wood fibers off the surface (${link('usdaFinishes', 'USDA FPL')}). We use cleaners and low pressure, then a brightener.` },
    { q: 'Can you give me a price from photos?', a: 'Yes. That\'s how most of our estimates start. Upload up to five photos, including one wide shot of the whole deck, and we\'ll send a price range. We confirm it in person or by video before we start.' },
    { q: 'Are you licensed?', a: `In Hamilton County, Tennessee requires a Home Improvement license for residential jobs from $3,000 to $24,999 (${link('tnHomeImprovement', 'TN.gov')}). Our license and insurance are listed at the bottom of every page.` },
    { q: 'Do I need to be home?', a: 'No. We just need access to the deck, a water spigot, and pets kept inside. We\'ll text you when we start, when we finish each day, and before we leave.' }
  ];
}

const faqList = (faqs) => `<div class="faq">${faqs.map((f, i) => `
  <details${i === 0 ? ' open' : ''}><summary><span>${esc(f.q)}</span><span class="faq-plus" aria-hidden="true"></span></summary><div class="faq-a"><p>${f.a}</p></div></details>`).join('')}</div>`;

const closingCta = (cfg, r, line = 'Send a few photos. Get a price range back, usually the same day.') => `
<section class="closing">
  <div class="wrap closing-grid">
    <div>
      <p class="kicker kicker-light">Ready when you are</p>
      <h2>${line}</h2>
    </div>
    <div class="closing-actions">
      <a class="btn btn-cedar btn-lg" href="${r('estimate/')}">${icon('camera')} Get a Free Estimate</a>
      <a class="closing-phone" href="tel:${cfg.business.phoneHref}">or call <strong>${esc(cfg.business.phone)}</strong></a>
    </div>
  </div>
</section>`;

function beforeAfter(cfg, r, cls = '') {
  const p = cfg.photos.beforeAfter;
  return `<figure class="ba ${cls}" data-ba>
    <div class="ba-frame">
      <img class="ba-img ba-after" src="${r('assets/img/' + p.after)}" alt="After: ${esc(p.alt)}" loading="lazy">
      <div class="ba-clip"><img class="ba-img ba-before" src="${r('assets/img/' + p.before)}" alt="Before: ${esc(p.alt)}" loading="lazy"></div>
      <div class="ba-handle" aria-hidden="true"><span></span></div>
      <span class="ba-label ba-label-l">Before</span><span class="ba-label ba-label-r">After</span>
      <input class="ba-range" type="range" min="0" max="100" value="50" aria-label="Drag to compare before and after">
    </div>
    ${p.illustration ? '<figcaption class="ph-note ph-note-block">Illustration made from a stock photo. Replace with a real before/after pair from your own jobs.</figcaption>' : ''}
  </figure>`;
}

function swatchStrip(list) {
  return `<span class="swatch-strip">${list.slice(0, 6).map(s => `<span style="background:${s.hex}" title="${esc(s.name)}"></span>`).join('')}</span>`;
}

function trustBar(cfg) {
  const b = cfg.business;
  const items = [
    ['Licensed', show(b.license).replace('TN Home Improvement ', 'TN Home Improvement<br>')],
    ['Insured', show(b.insurance)],
    ['Google rating', `${esc(val(b.rating))} ${icon('star', 'ico ico-star')}${isSample(b.rating) ? ' <span class="sample-tag">Sample</span>' : ''}`],
    ['In business', `${esc(val(b.yearsInBusiness))} years${isSample(b.yearsInBusiness) ? ' <span class="sample-tag">Sample</span>' : ''}`],
    ['Written warranty', `${cfg.warranty.horizontalYears}-yr floors · ${cfg.warranty.verticalYears}-yr rails`]
  ];
  return `<section class="trust" aria-label="Why homeowners trust us"><div class="wrap"><ul class="trust-list">${items.map(([k, v]) => `<li><span class="trust-k">${k}</span><span class="trust-v">${v}</span></li>`).join('')}</ul></div></section>`;
}

function reviewsBlock(cfg) {
  const rv = cfg.reviews;
  if (!rv.items || !rv.items.length) return '';
  const [first, ...rest] = rv.items;
  const q = (it, big) => `<blockquote class="review${big ? ' review-big' : ''}">
      <p>${esc(it.text)}</p>
      <footer>— ${esc(it.name)}, ${esc(it.area)}${rv.sample ? ' <span class="sample-tag">Sample review</span>' : ''}</footer>
    </blockquote>`;
  return `<section class="sec reviews">
  <div class="wrap">
    ${sectionHead('06', 'Reviews', 'What neighbors say')}
    ${rv.sample ? '<p class="sample-banner">These are placeholders, not real reviews. Replace them with your own Google reviews (with permission) in site.config.json, or empty the list to hide this section.</p>' : ''}
    <div class="reviews-grid">
      ${q(first, true)}
      <div class="reviews-side">${rest.map(it => q(it, false)).join('')}</div>
    </div>
  </div>
</section>`;
}

// ---------- HOME ----------
export function home(cfg, r, { services, areas, areaGroups, src }) {
  const b = cfg.business;
  const c = cfg.location.climate;
  const [main, ...others] = services;
  const faqs = homeFaqs(cfg, src);
  const fin = cfg.pricing.finishes;
  const body = `
<section class="hero">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="kicker">Deck staining &amp; restoration · ${esc(b.city)}, ${esc(b.state)}</p>
      <h1>${esc(b.city)} deck staining, done by hand and done right.</h1>
      <p class="hero-lede">We wash, we brighten, we stain. Most decks take two days. ${esc(cap(b.crewSize))}, and the owner is on every job.</p>
      <div class="hero-actions">
        <a class="btn btn-cedar btn-lg" href="${r('estimate/')}">Get a Free Estimate</a>
        <a class="btn btn-ghost btn-lg" href="tel:${b.phoneHref}">${icon('phone')} ${esc(b.phone)}</a>
      </div>
      <p class="hero-sub">${icon('camera')} Send photos, get a price range. No drive-out needed for most decks.</p>
    </div>
    <div class="hero-media">
      ${photo(cfg, r, 'hero', { cls: 'hero-photo', loading: 'eager' })}
      <div class="hero-tag" aria-hidden="true">
        <span class="hero-tag-k">Best months to stain here</span>
        <span class="hero-tag-v">${esc(c.bestMonths.replace(' and ', ' & '))}</span>
      </div>
    </div>
  </div>
</section>

${trustBar(cfg)}

<section class="sec services-sec">
  <div class="wrap">
    ${sectionHead('01', 'Services', 'Everything wood, outside the house')}
    <div class="svc-layout">
      <a class="svc-feature" href="${r('services/' + main.slug + '/')}">
        ${photo(cfg, r, main.photo, { cls: 'svc-feature-photo' })}
        <div class="svc-feature-body">
          <p class="kicker">${esc(main.kicker)}</p>
          <h3>${esc(main.name)}</h3>
          <p>${esc(main.intro)}</p>
          <span class="arrow-link">See how we do it ${icon('arrow')}</span>
        </div>
      </a>
      <ol class="svc-list">
        ${others.map((s) => `<li><a href="${r('services/' + s.slug + '/')}"><span class="svc-name">${esc(s.name)}</span><span class="svc-desc">${esc(s.lede)}</span>${icon('arrow')}</a></li>`).join('')}
      </ol>
    </div>
  </div>
</section>

<section class="sec process-sec">
  <div class="wrap">
    ${sectionHead('02', 'How it works', 'Four steps. Usually two days on site.')}
    <ol class="process">
      ${cfg.process.map((s, i) => `<li><span class="process-n">${i + 1}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('')}
    </ol>
  </div>
</section>

<section class="sec ba-sec">
  <div class="wrap ba-grid">
    <div class="ba-copy">
      ${sectionHead('03', 'Before &amp; after', 'Gray wood isn\'t dead wood.')}
      <p>That silver look is just the sun-worn top layer. A proper wash and brightener takes it off. The wood underneath is usually fine, and it takes stain beautifully.</p>
      <p>Drag the slider to compare.</p>
      <a class="arrow-link" href="${r('services/deck-cleaning-restoration/')}">How restoration works ${icon('arrow')}</a>
    </div>
    ${beforeAfter(cfg, r)}
  </div>
</section>

<section class="sec finishes-sec">
  <div class="wrap">
    ${sectionHead('04', 'Finish options', 'Three kinds of stain. Here\'s the honest difference.')}
    <div class="spec-table" role="table" aria-label="Stain finish comparison">
      <div class="spec-row spec-head" role="row">
        <span role="columnheader">Finish</span><span role="columnheader">What you see</span><span role="columnheader">Best for</span><span role="columnheader">Colors</span><span role="columnheader">Sample price</span>
      </div>
      <div class="spec-row" role="row">
        <span role="cell"><strong>Transparent / toner</strong></span>
        <span role="cell">Almost all grain. A light tint.</span>
        <span role="cell">New or nice wood you want to show off. Needs the most frequent recoats.</span>
        <span role="cell">${swatchStrip(cfg.stains.transparent)}</span>
        <span role="cell">${money(fin.transparent.low, 2)}–${money(fin.transparent.high, 2)}/sq ft</span>
      </div>
      <div class="spec-row spec-pick" role="row">
        <span role="cell"><strong>Semi-transparent</strong> <em class="pick">Our usual pick</em></span>
        <span role="cell">Rich color, grain still shows.</span>
        <span role="cell">Most deck floors. Fades instead of peeling, so recoats are easy.</span>
        <span role="cell">${swatchStrip(cfg.stains['semi-transparent'])}</span>
        <span role="cell">${money(fin['semi-transparent'].low, 2)}–${money(fin['semi-transparent'].high, 2)}/sq ft</span>
      </div>
      <div class="spec-row" role="row">
        <span role="cell"><strong>Solid color</strong></span>
        <span role="cell">Even color, like paint. Texture only.</span>
        <span role="cell">Railings, fences and patched or mismatched wood. Can peel on floors.</span>
        <span role="cell">${swatchStrip(cfg.stains.solid)}</span>
        <span role="cell">${money(fin.solid.low, 2)}–${money(fin.solid.high, 2)}/sq ft</span>
      </div>
    </div>
    <p class="fine">Prices shown are sample rates for a deck in good shape; weathered and peeling decks cost more. <a href="${r('learn/semi-transparent-vs-solid-deck-stain/')}">Read: semi-transparent vs. solid</a></p>
  </div>
</section>

<section class="sec viz-teaser">
  <div class="wrap viz-grid">
    <div class="viz-copy">
      <p class="kicker kicker-light">05 · Color visualizer</p>
      <h2>See the color on <em>your</em> deck before we open a can.</h2>
      <p>Upload a photo of your deck, trace the boards, and try every stain color we carry. Wood grain still shows through on semi-transparent, just like the real thing.</p>
      <a class="btn btn-cedar btn-lg" href="${r('visualizer/')}">${icon('brush')} Try the Visualizer</a>
    </div>
    <div class="viz-demo" data-viz-demo>
      <img src="${r('assets/img/' + cfg.visualizerSamples[0].src)}" alt="Sample deck photo" loading="lazy">
      <ul class="viz-demo-swatches">
        ${cfg.stains['semi-transparent'].slice(0, 5).map(s => `<li style="background:${s.hex}"><span>${esc(s.name)}</span></li>`).join('')}
      </ul>
    </div>
  </div>
</section>

${reviewsBlock(cfg)}

<section class="sec areas-sec">
  <div class="wrap">
    ${sectionHead('07', 'Service area', `${esc(cfg.location.metro)} and about 30 miles around`)}
    <div class="areas-cols">
      ${areaGroups.map(g => `<div><h3>${esc(g.name)}</h3><ul>${g.areas.map(a => `<li><a href="${r('areas/' + a.slug + '/')}">${esc(a.name)}</a></li>`).join('')}</ul></div>`).join('')}
      <div class="areas-note">
        <p>${icon('pin')} Not sure if you're in range? Send your address with your photos. If we can't get there, we'll point you to another Stain &amp; Seal Supply Pro Partner who can.</p>
      </div>
    </div>
  </div>
</section>

<section class="sec faq-sec">
  <div class="wrap faq-grid">
    <div>${sectionHead('08', 'Questions', 'What homeowners ask us most')}
      <p>Straight answers, with links to the experts where it matters. More in our <a href="${r('learn/')}">Learn</a> section.</p>
    </div>
    ${faqList(faqs)}
  </div>
</section>

${closingCta(cfg, r)}`;
  return { body, faqs };
}

// ---------- SERVICES ----------
export function servicesIndex(cfg, r, services) {
  return `
<section class="page-hero">
  <div class="wrap">
    ${crumbs(r, [['Home', ''], ['Services', 'services/']])}
    <p class="kicker">Services</p>
    <h1>Deck staining and wood care in ${esc(cfg.business.city)}</h1>
    <p class="page-lede">One crew, one focus: outdoor wood. Decks, fences, log homes, porches and pergolas, and keeping them nice afterward.</p>
  </div>
</section>
<section class="sec">
  <div class="wrap svc-index">
    ${services.map((s, i) => `
    <a class="svc-row" href="${r('services/' + s.slug + '/')}">
      <span class="svc-row-n">${String(i + 1).padStart(2, '0')}</span>
      ${photo(cfg, r, s.photo, { cls: 'svc-row-photo' })}
      <span class="svc-row-body"><span class="kicker">${esc(s.kicker)}</span><strong>${esc(s.name)}</strong><span>${esc(s.lede)}</span></span>
      ${icon('arrow')}
    </a>`).join('')}
  </div>
</section>
${closingCta(cfg, r)}`;
}

export function servicePage(cfg, r, s, { services, plansHtml }) {
  const others = services.filter(x => x.slug !== s.slug);
  return `
<section class="page-hero page-hero-split">
  <div class="wrap split">
    <div>
      ${crumbs(r, [['Home', ''], ['Services', 'services/'], [s.name, 'services/' + s.slug + '/']])}
      <p class="kicker">${esc(s.kicker)}</p>
      <h1>${esc(s.name)} in ${esc(cfg.business.city)}</h1>
      <p class="page-lede">${esc(s.lede)}</p>
      <p>${esc(s.intro)}</p>
      <div class="hero-actions">
        <a class="btn btn-cedar" href="${r('estimate/')}">Get a Free Estimate</a>
        <a class="btn btn-ghost" href="${r('pricing/')}">Price calculator</a>
      </div>
    </div>
    ${photo(cfg, r, s.photo, { cls: 'page-hero-photo', loading: 'eager' })}
  </div>
</section>
${s.plans ? plansHtml : ''}
<section class="sec">
  <div class="wrap">
    ${sectionHead('', 'What\'s included', s.plans ? 'Why a plan pays for itself' : 'What we do, step by step')}
    <ol class="included">
      ${s.included.map(([h, p], i) => `<li><span class="inc-n">${String(i + 1).padStart(2, '0')}</span><div><h3>${esc(h)}</h3><p>${esc(p)}</p></div></li>`).join('')}
    </ol>
  </div>
</section>
<section class="sec sec-tint">
  <div class="wrap faq-grid">
    <div>${sectionHead('', 'Questions', `About ${esc(s.name.toLowerCase())}`)}</div>
    ${faqList(s.faqs)}
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <p class="kicker">Other services</p>
    <ul class="pill-links">${others.map(o => `<li><a href="${r('services/' + o.slug + '/')}">${esc(o.name)}</a></li>`).join('')}</ul>
  </div>
</section>
${closingCta(cfg, r)}`;
}

export function plansBlock(cfg, r) {
  const mp = cfg.maintenancePlans;
  return `
<section class="sec plans-sec">
  <div class="wrap">
    ${sectionHead('', 'Maintenance plans', 'Pick one. We\'ll keep track of the rest.')}
    ${mp.sample ? '<p class="sample-banner">Sample prices. Each Pro Partner sets their own in site.config.json.</p>' : ''}
    <div class="plans">
      ${mp.plans.map(p => `
      <div class="plan${p.featured ? ' plan-featured' : ''}">
        ${p.featured ? '<p class="plan-flag">Most popular</p>' : ''}
        <h3>${esc(p.name)}</h3>
        <p class="plan-price"><strong>${p.price < 5 ? money(p.price, 2) : money(p.price)}</strong> <span>/ ${esc(p.per)}</span></p>
        <ul class="check">${p.includes.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
        <a class="btn ${p.featured ? 'btn-cedar' : 'btn-outline'}" href="${r('estimate/?plan=' + p.id)}">Choose ${esc(p.name)}</a>
      </div>`).join('')}
    </div>
  </div>
</section>`;
}

// ---------- PRICING ----------
export function pricingPage(cfg, r, src) {
  const p = cfg.pricing;
  const radio = (name, obj, checked) => Object.entries(obj).map(([k, v]) => `
    <label class="opt"><input type="radio" name="${name}" value="${k}"${k === checked ? ' checked' : ''}><span><strong>${esc(v.label.split(' — ')[0])}</strong>${v.label.includes(' — ') ? `<small>${esc(v.label.split(' — ')[1])}</small>` : ''}</span></label>`).join('');
  return `
<section class="page-hero">
  <div class="wrap">
    ${crumbs(r, [['Home', ''], ['Prices', 'pricing/']])}
    <p class="kicker">Prices &amp; estimate calculator</p>
    <h1>What will my deck cost?</h1>
    <p class="page-lede">Nobody else around ${esc(cfg.business.city)} publishes deck staining prices. We do. Put in your deck and get a range in about a minute.</p>
  </div>
</section>
<section class="sec calc-sec">
  <div class="wrap calc-grid">
    <form class="calc" id="calc" novalidate>
      <fieldset>
        <legend><span class="step-n">1</span> How big is the deck?</legend>
        <div class="seg" role="radiogroup" aria-label="Measure by">
          <label><input type="radio" name="mode" value="lw" checked><span>Length × width</span></label>
          <label><input type="radio" name="mode" value="sqft"><span>I know the sq ft</span></label>
        </div>
        <div class="field-row" data-mode="lw">
          <label class="field"><span>Length (ft)</span><input type="number" name="length" min="0" step="1" value="16" inputmode="numeric"></label>
          <span class="times">×</span>
          <label class="field"><span>Width (ft)</span><input type="number" name="width" min="0" step="1" value="12" inputmode="numeric"></label>
        </div>
        <div class="field-row" data-mode="sqft" hidden>
          <label class="field"><span>Square feet</span><input type="number" name="sqft" min="0" step="10" value="192" inputmode="numeric"></label>
        </div>
        <p class="hint">Two levels? Add them together. A 16×12 deck is 192 sq ft.</p>
      </fieldset>
      <fieldset>
        <legend><span class="step-n">2</span> Railings &amp; stairs</legend>
        <div class="field-row">
          <label class="field"><span>Railing (feet)</span><input type="number" name="rail" min="0" step="1" value="28" inputmode="numeric"></label>
          <label class="field"><span>Stair steps</span><input type="number" name="stairs" min="0" step="1" value="4" inputmode="numeric"></label>
        </div>
        <p class="hint">Measure along the top rail. Count each step once.</p>
      </fieldset>
      <fieldset>
        <legend><span class="step-n">3</span> What shape is it in?</legend>
        <div class="opts">${radio('condition', p.condition, 'weathered')}</div>
      </fieldset>
      <fieldset>
        <legend><span class="step-n">4</span> Which finish?</legend>
        <div class="opts">${radio('finish', p.finishes, 'semi-transparent')}</div>
        <p class="hint">Not sure? <a href="${r('learn/semi-transparent-vs-solid-deck-stain/')}">Here's how to choose.</a></p>
      </fieldset>
      <fieldset>
        <legend><span class="step-n">5</span> Extras <small>(optional)</small></legend>
        <div class="opts opts-check">
          ${p.addOns.map(a => `<label class="opt opt-row"><input type="checkbox" name="addon" value="${a.id}"><span><strong>${esc(a.label)}</strong><small>${money(a.price, a.price < 5 ? 2 : 0)} / ${esc(a.unit)}</small></span>${a.unit === 'board' ? '<input class="mini" type="number" name="boards" min="1" value="2" aria-label="How many boards">' : ''}</label>`).join('')}
        </div>
      </fieldset>
    </form>
    <aside class="ticket" id="ticket" aria-live="polite">
      <div class="ticket-head">
        <span class="mono">Estimate range</span>
        ${p.sample ? '<span class="sample-tag">Sample rates</span>' : ''}
      </div>
      <p class="ticket-range"><span data-out="low">$0</span><span class="dash">–</span><span data-out="high">$0</span></p>
      <dl class="ticket-lines" data-out="lines"></dl>
      <p class="ticket-dep">Deposit to book: <strong data-out="deposit">$0</strong> (${p.depositPercent}%)</p>
      <p class="ticket-note">This is a range, not a final price. We confirm it after we see photos or visit. Wood condition can change once it's clean.</p>
      <button class="btn btn-cedar btn-block" type="button" data-open="calc-save">Send me this estimate</button>
      <div class="ticket-save" id="calc-save" hidden>
        <form data-lead-form="calculator" novalidate>
          <label class="field"><span>Name</span><input name="name" required autocomplete="name"></label>
          <label class="field"><span>Mobile phone</span><input name="phone" type="tel" required autocomplete="tel"></label>
          <label class="field"><span>Email</span><input name="email" type="email" autocomplete="email"></label>
          <label class="field"><span>Street address</span><input name="address" autocomplete="street-address"></label>
          <button class="btn btn-forest btn-block" type="submit">Send it</button>
          <p class="form-msg" role="status"></p>
        </form>
      </div>
    </aside>
  </div>
</section>
<section class="sec sec-tint">
  <div class="wrap">
    ${sectionHead('', 'Price sheet', 'The numbers behind the calculator')}
    <div class="price-sheet">
      <table class="data-table">
        <thead><tr><th>Item</th><th>Sample rate</th></tr></thead>
        <tbody>
          ${Object.values(p.finishes).map(f => `<tr><td>Deck floor, ${esc(f.label.toLowerCase())}</td><td>${money(f.low, 2)}–${money(f.high, 2)} / sq ft</td></tr>`).join('')}
          ${Object.values(p.condition).map(c => `<tr><td>Condition: ${esc(c.label.split(' — ')[0].toLowerCase())}</td><td>× ${c.mult.toFixed(2)}</td></tr>`).join('')}
          <tr><td>Railings</td><td>${money(p.railingPerFt.low)}–${money(p.railingPerFt.high)} / ft</td></tr>
          <tr><td>Stairs</td><td>${money(p.stairPerStep.low)}–${money(p.stairPerStep.high)} / step</td></tr>
          <tr><td>Minimum job</td><td>${money(p.minimumJob)}</td></tr>
        </tbody>
      </table>
      <div class="price-context">
        <h3>How that compares</h3>
        <p>Angi's 2026 cost guide puts professional deck staining at roughly <strong>$2 to $4 per square foot</strong>, with a typical job between <strong>$550 and $1,250</strong><sup class="fn"><a href="${src.angi.url}" target="_blank" rel="noopener">source</a></sup>. Bob Vila reports a national average around <strong>$775</strong><sup class="fn"><a href="${src.bobvila.url}" target="_blank" rel="noopener">source</a></sup>.</p>
        <p>Peeling decks cost more because the old finish has to be stripped. That's the most labor-heavy part of any job.</p>
        <p><a class="arrow-link" href="${r('services/maintenance-plans/')}">Maintenance plans with prices ${icon('arrow')}</a></p>
      </div>
    </div>
  </div>
</section>
${closingCta(cfg, r, 'Want a firm number? Send photos and we\'ll confirm your range.')}`;
}

// ---------- VISUALIZER ----------
export function visualizerPage(cfg, r) {
  const groups = [['transparent', 'Transparent'], ['semi-transparent', 'Semi-transparent'], ['solid', 'Solid']];
  return `
<section class="page-hero page-hero-tight">
  <div class="wrap">
    ${crumbs(r, [['Home', ''], ['Color Visualizer', 'visualizer/']])}
    <p class="kicker">Color visualizer</p>
    <h1>Try stain colors on your own deck</h1>
    <p class="page-lede">Upload a photo, paint over the deck boards, and pick a color. Everything happens in your browser. Your photo isn't uploaded anywhere unless you ask us to send you the result.</p>
  </div>
</section>
<section class="viz-app" id="viz">
  <div class="wrap viz-app-grid">
    <div class="viz-stage-col">
      <div class="viz-steps" role="list">
        <span role="listitem" data-step="1" class="is-on">1 · Photo</span>
        <span role="listitem" data-step="2">2 · Mark the deck</span>
        <span role="listitem" data-step="3">3 · Pick a color</span>
      </div>
      <div class="viz-stage" id="viz-stage">
        <div class="viz-empty" id="viz-empty">
          <p><strong>Start with a photo of your deck</strong></p>
          <label class="btn btn-cedar btn-lg">${icon('camera')} Upload a photo<input type="file" accept="image/*" id="viz-file" hidden></label>
          <p class="or">or try a sample</p>
          <div class="viz-samples">
            ${cfg.visualizerSamples.map(s => `<button type="button" class="viz-sample" data-sample="${s.id}"><img src="${r('assets/img/' + s.src)}" alt="" loading="lazy"><span>${esc(s.label)}</span></button>`).join('')}
          </div>
        </div>
        <div class="viz-canvas-wrap" id="viz-canvas-wrap" hidden>
          <canvas id="viz-base" class="viz-layer"></canvas>
          <canvas id="viz-out" class="viz-layer"></canvas>
          <canvas id="viz-mask" class="viz-layer viz-mask"></canvas>
          <canvas id="viz-ui" class="viz-layer viz-ui"></canvas>
          <div class="viz-compare" id="viz-compare" hidden><input type="range" min="0" max="100" value="50" id="viz-compare-range" aria-label="Compare before and after"><span class="ba-label ba-label-l">Before</span><span class="ba-label ba-label-r">After</span><div class="viz-compare-line"></div></div>
        </div>
      </div>
      <div class="viz-toolbar" id="viz-toolbar" hidden>
        <div class="tool-group" role="group" aria-label="Tools">
          <button type="button" class="tool is-on" data-tool="brush" title="Brush">${icon('brush')}<span>Brush</span></button>
          <button type="button" class="tool" data-tool="poly" title="Outline: click points, click the first point to close">${icon('pin')}<span>Outline</span></button>
          <button type="button" class="tool" data-tool="erase" title="Eraser">${icon('x')}<span>Eraser</span></button>
        </div>
        <label class="tool-size">Brush size <input type="range" id="viz-size" min="6" max="120" value="40"></label>
        <div class="tool-group">
          <button type="button" class="tool" id="viz-undo">↶<span>Undo</span></button>
          <button type="button" class="tool" id="viz-auto" hidden>✦<span>Suggest outline</span></button>
          <button type="button" class="tool" id="viz-clear">Clear</button>
          <button type="button" class="tool" id="viz-toggle-mask">Show mask</button>
          <button type="button" class="tool" id="viz-compare-btn">Before / after</button>
          <button type="button" class="tool" id="viz-new">New photo</button>
        </div>
      </div>
      <p class="viz-help" id="viz-help" hidden>Paint over the deck boards and railings. Use the outline tool for straight edges, and the eraser to clean up. The color shows up as you go.</p>
    </div>
    <aside class="viz-side">
      <h2 class="viz-side-h">Stain colors</h2>
      ${groups.map(([k, label]) => `
      <div class="swatch-group">
        <h3>${label}</h3>
        <div class="swatches">
          ${cfg.stains[k].map((s, i) => `<button type="button" class="swatch${k === 'semi-transparent' && i === 0 ? ' is-on' : ''}" data-hex="${s.hex}" data-opacity="${k}" data-name="${esc(s.name)}" style="--c:${s.hex}"><span class="swatch-chip"></span><span class="swatch-name">${esc(s.name)}</span></button>`).join('')}
        </div>
      </div>`).join('')}
      <p class="fine">Generic color names. Real stain looks different on every board, so we'll test it on your wood before we start.${cfg.business.brandsCarried.length ? ' Brands we carry: ' + cfg.business.brandsCarried.map(esc).join(', ') + '.' : ''}</p>
      <div class="viz-chosen"><span class="viz-chosen-chip" id="viz-chip"></span><div><span class="mono">Selected</span><strong id="viz-chosen-name">Cedar</strong><small id="viz-chosen-type">Semi-transparent</small></div></div>
      <button class="btn btn-cedar btn-block" type="button" id="viz-get" disabled>Send me this look</button>
      <div id="viz-lead" hidden>
        <form data-lead-form="visualizer" novalidate>
          <p class="fine">We'll email the full-size image and save your color with your estimate.</p>
          <label class="field"><span>Name</span><input name="name" required autocomplete="name"></label>
          <label class="field"><span>Email</span><input name="email" type="email" required autocomplete="email"></label>
          <label class="field"><span>Phone <small>(optional)</small></span><input name="phone" type="tel" autocomplete="tel"></label>
          <button class="btn btn-forest btn-block" type="submit">Send &amp; download</button>
          <p class="form-msg" role="status"></p>
        </form>
      </div>
    </aside>
  </div>
</section>
<section class="sec sec-tint">
  <div class="wrap three-up">
    <div><h3>Why does it look different from the can?</h3><p>Stain soaks into wood, so the wood's own color shows through, especially on semi-transparent. Old gray wood, new yellow pine and red cedar all take the same stain differently. This tool keeps your wood's grain and light and dark spots, so it's closer to real than a color chip.</p></div>
    <div><h3>Is my photo private?</h3><p>Yes. The image stays on your device while you work. It's only sent to us if you fill in the form to get the full-size image. See our <a href="${r('privacy/')}">privacy page</a>.</p></div>
    <div><h3>Tips for a good photo</h3><p>Shoot in daylight but not in harsh noon sun. Stand back far enough to get the whole deck. Sweep the leaves off first if you can. Wet boards look darker, so wait until it's dry.</p></div>
  </div>
</section>
${closingCta(cfg, r, 'Found a color you like? Let\'s put it on the real thing.')}`;
}

// ---------- ESTIMATE ----------
export function estimatePage(cfg, r) {
  return `
<section class="page-hero page-hero-tight">
  <div class="wrap">
    ${crumbs(r, [['Home', ''], ['Get an Estimate', 'estimate/']])}
    <p class="kicker">Free estimate · usually same day</p>
    <h1>Send us a few photos. We'll send a price range.</h1>
    <p class="page-lede">No one has to drive out first for most decks. If we need a closer look, we'll set up a quick visit or a video call.</p>
  </div>
</section>
<section class="sec">
  <div class="wrap est-grid">
    <form class="est-form" data-lead-form="estimate" novalidate>
      <fieldset>
        <legend><span class="step-n">1</span> Photos <small>(up to 5)</small></legend>
        <div class="photo-slots" id="photo-slots">
          <label class="photo-slot photo-slot-wide"><input type="file" accept="image/*" data-slot="0"><span class="photo-slot-in">${icon('camera')}<strong>Wide shot of the whole deck</strong><small>Stand back. Get it all in one picture. This helps most.</small></span></label>
          ${['Close-up of the worst spot', 'Railings', 'Stairs', 'Anything else'].map((t, i) => `<label class="photo-slot"><input type="file" accept="image/*" data-slot="${i + 1}"><span class="photo-slot-in">${icon('camera')}<strong>${t}</strong></span></label>`).join('')}
        </div>
      </fieldset>
      <fieldset>
        <legend><span class="step-n">2</span> About you</legend>
        <div class="field-grid">
          <label class="field"><span>Name</span><input name="name" required autocomplete="name"></label>
          <label class="field"><span>Mobile phone</span><input name="phone" type="tel" required autocomplete="tel"></label>
          <label class="field"><span>Email</span><input name="email" type="email" autocomplete="email"></label>
          <label class="field field-wide"><span>Street address</span><input name="address" required autocomplete="street-address"></label>
        </div>
      </fieldset>
      <fieldset>
        <legend><span class="step-n">3</span> About the deck</legend>
        <div class="field-grid">
          <label class="field"><span>Deck size</span><input name="size" placeholder="e.g. 16 × 12, or about 300 sq ft"></label>
          <label class="field"><span>When do you want it done?</span>
            <select name="timeframe"><option value="">Choose one</option><option>As soon as possible</option><option>In the next month</option><option>This fall</option><option>Next spring</option><option>Just getting prices</option></select></label>
          <label class="field"><span>What else? <small>(optional)</small></span>
            <select name="service"><option>Deck staining</option><option>Deck cleaning / restoration</option><option>Fence</option><option>Log home / cabin</option><option>Pergola / porch</option><option>Maintenance plan</option></select></label>
          <label class="field"><span>How did you hear about us?</span>
            <select name="heard"><option value="">Choose one</option><option>Google search</option><option>Google Maps</option><option>Friend or neighbor</option><option>Saw your truck or yard sign</option><option>Facebook / Nextdoor</option><option>Stain &amp; Seal Supply</option><option>Other</option></select></label>
          <label class="field field-wide"><span>Anything we should know? <small>(optional)</small></span><textarea name="notes" rows="3" placeholder="Peeling? Color you have in mind? Dogs in the yard? Gate code?"></textarea></label>
        </div>
      </fieldset>
      <input type="hidden" name="plan">
      <input type="hidden" name="color">
      <button class="btn btn-cedar btn-lg" type="submit">Send for my free estimate</button>
      <p class="form-msg" role="status"></p>
      ${cfg.mockup ? '<p class="fine">Demo: your request is saved in this browser only and shows up in the <a href="' + r('dashboard/') + '">Pro Partner Dashboard</a>. Nothing is emailed.</p>' : ''}
    </form>
    <aside class="est-side">
      <div class="est-card">
        <h2>What happens next</h2>
        <ol class="mini-steps">
          <li><strong>We look at your photos.</strong> Usually within a few hours during the week.</li>
          <li><strong>You get a price range by text.</strong> Plus any questions we have.</li>
          <li><strong>We confirm and book.</strong> A quick visit or video call, then a ${cfg.pricing.depositPercent}% deposit holds your date.</li>
        </ol>
      </div>
      <div class="est-card est-card-quiet">
        <h2>Rather talk?</h2>
        <p><a class="big-phone" href="tel:${cfg.business.phoneHref}">${icon('phone')} ${esc(cfg.business.phone)}</a></p>
        <p class="fine">${esc(cfg.business.hours)}. Texts welcome.</p>
      </div>
      <div class="est-card est-card-quiet">
        <h2>Just want a ballpark?</h2>
        <p><a class="arrow-link" href="${r('pricing/')}">Use the price calculator ${icon('arrow')}</a></p>
      </div>
    </aside>
  </div>
</section>`;
}

// ---------- AREAS ----------
export function areasIndex(cfg, r, areaGroups) {
  return `
<section class="page-hero">
  <div class="wrap">
    ${crumbs(r, [['Home', ''], ['Service Areas', 'areas/']])}
    <p class="kicker">Service areas</p>
    <h1>Where we stain decks around ${esc(cfg.location.metro)}</h1>
    <p class="page-lede">Every part of town is hard on wood in its own way. Pick your area to see what we run into there.</p>
  </div>
</section>
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
${closingCta(cfg, r)}`;
}

export function areaPage(cfg, r, a, { bySlug, src }) {
  const c = cfg.location.climate;
  const nearby = (a.nearby || []).map(s => bySlug[s]).filter(Boolean);
  return `
<section class="page-hero page-hero-split area-hero">
  <div class="wrap split">
    <div>
      ${crumbs(r, [['Home', ''], ['Service Areas', 'areas/'], [a.name, 'areas/' + a.slug + '/']])}
      <p class="kicker">${esc(a.county)}</p>
      <h1>${esc(a.headline)}</h1>
      <p class="page-lede">${esc(a.lede)}</p>
      <div class="hero-actions">
        <a class="btn btn-cedar" href="${r('estimate/')}">Free estimate in ${esc(a.name)}</a>
        <a class="btn btn-ghost" href="tel:${cfg.business.phoneHref}">${icon('phone')} ${esc(cfg.business.phone)}</a>
      </div>
    </div>
    <figure class="photo page-hero-photo">
      <img src="${r('assets/img/' + a.image)}" alt="${esc(a.imageAlt)}" loading="eager">
      ${a.image.includes('barnard') ? '<figcaption class="ph-note">George N. Barnard, 1860s. Public domain.</figcaption>' : '<figcaption class="ph-note">Stock photo — swap in a real local job photo</figcaption>'}
    </figure>
  </div>
</section>
<section class="sec">
  <div class="wrap area-body">
    <div class="prose">
      ${a.sections.map(s => `<h2>${esc(s.h)}</h2><p>${esc(s.p)}</p>`).join('')}
      <h2>Best time to book in ${esc(a.name)}</h2>
      <p>Same as the rest of the area: ${esc(c.bestMonths)} are the sweet spot. The driest months here on average are ${esc(c.driestMonths)}<sup class="fn"><a href="${src[c.sourceKey].url.replace(/&/g, '&amp;')}" target="_blank" rel="noopener">NOAA</a></sup>. Fall dates fill first, so get your photos in early. <a href="${r('learn/best-time-to-stain-a-deck/')}">Why fall works best</a>.</p>
    </div>
    <aside class="area-aside">
      <div class="est-card">
        <h2>What we see in ${esc(a.name)}</h2>
        <ul class="check">${a.woodNotes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>
      </div>
      <div class="est-card est-card-quiet">
        <h2>Neighborhoods</h2>
        <p>${a.neighborhoods.map(esc).join(' · ')}</p>
      </div>
      ${nearby.length ? `<div class="est-card est-card-quiet"><h2>Nearby</h2><ul class="pill-links">${nearby.map(n => `<li><a href="${r('areas/' + n.slug + '/')}">${esc(n.name)}</a></li>`).join('')}</ul></div>` : ''}
    </aside>
  </div>
</section>
<section class="sec sec-tint">
  <div class="wrap faq-grid">
    <div>${sectionHead('', 'Local question', `Asked in ${esc(a.name)}`)}</div>
    ${faqList([a.faq])}
  </div>
</section>
${closingCta(cfg, r, `Deck in ${esc(a.name)}? Send photos for a price range.`)}`;
}

// ---------- LEARN ----------
export function learnIndex(cfg, r, arts) {
  const [lead, ...rest] = arts;
  return `
<section class="page-hero">
  <div class="wrap">
    ${crumbs(r, [['Home', ''], ['Learn', 'learn/']])}
    <p class="kicker">Learn</p>
    <h1>Deck care, explained by the people who do it</h1>
    <p class="page-lede">Plain answers, with links to the wood scientists and testers we trust, so you can check our work.</p>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <a class="learn-lead" href="${r('learn/' + lead.slug + '/')}">
      <img src="${r('assets/img/' + lead.image)}" alt="" loading="lazy">
      <div><p class="kicker">${lead.readMin} min read</p><h2>${esc(lead.title)}</h2><p>${esc(lead.description)}</p><span class="arrow-link">Read it ${icon('arrow')}</span></div>
    </a>
    <ol class="learn-list">
      ${rest.map(a => `<li><a href="${r('learn/' + a.slug + '/')}"><span class="mono">${a.readMin} min</span><strong>${esc(a.title)}</strong><span>${esc(a.description)}</span></a></li>`).join('')}
    </ol>
  </div>
</section>
${closingCta(cfg, r)}`;
}

export function articlePage(cfg, r, a, bodyHtml, sourcesHtml, arts) {
  const more = arts.filter(x => x.slug !== a.slug).slice(0, 3);
  return `
<article class="article">
  <header class="article-head">
    <div class="wrap wrap-narrow">
      ${crumbs(r, [['Home', ''], ['Learn', 'learn/'], [a.short, 'learn/' + a.slug + '/']])}
      <p class="kicker">${a.readMin} min read · Updated ${new Date(a.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
      <h1>${esc(a.title)}</h1>
    </div>
    <figure class="article-photo wrap"><img src="${r('assets/img/' + a.image)}" alt="" loading="eager"></figure>
  </header>
  <div class="wrap wrap-narrow prose">
    ${bodyHtml}
    <aside class="article-cta">
      <p><strong>Want a pro to look at yours?</strong> Send photos and we'll send a price range.</p>
      <a class="btn btn-cedar" href="${r('estimate/')}">Get a Free Estimate</a>
    </aside>
    ${sourcesHtml}
  </div>
</article>
<section class="sec sec-tint">
  <div class="wrap">
    <p class="kicker">Keep reading</p>
    <ul class="more-list">${more.map(m => `<li><a href="${r('learn/' + m.slug + '/')}">${esc(m.title)} ${icon('arrow')}</a></li>`).join('')}</ul>
  </div>
</section>`;
}

// ---------- ABOUT / WARRANTY / CONTACT / PRIVACY ----------
export function aboutPage(cfg, r, src) {
  const b = cfg.business;
  return `
<section class="page-hero page-hero-split">
  <div class="wrap split">
    <div>
      ${crumbs(r, [['Home', ''], ['About', 'about/']])}
      <p class="kicker">About us</p>
      <h1>A small crew that only does one thing.</h1>
      <p class="page-lede">We don't build decks, paint living rooms or clean gutters. We stain and restore outdoor wood, and we're picky about it.</p>
    </div>
    ${photo(cfg, r, 'about', { cls: 'page-hero-photo', loading: 'eager' })}
  </div>
</section>
<section class="sec">
  <div class="wrap area-body">
    <div class="prose">
      <h2>Who we are</h2>
      <p>${esc(b.name)} is ${esc(b.crewSize)} based in ${esc(b.city)}. The owner, ${show(b.owner)}, is on every job. The person who gives you the price is the person brushing your deck.</p>
      <p class="sample-banner">Sample: this is where the owner tells their real story. How they got into staining, how long they've been at it, and why they care. Keep it short and true.</p>
      <h2>How we work</h2>
      <ul class="check">
        <li><strong>Prep is the job.</strong> Stain is the last 20%. Washing, stripping, brightening and drying are why a finish lasts.</li>
        <li><strong>Brush, not just spray.</strong> We back-brush every board so the stain goes into the wood.</li>
        <li><strong>Straight answers.</strong> If your deck needs a builder, not a stainer, we'll tell you.</li>
        <li><strong>Clean site.</strong> Plants covered, furniture put back, nothing left in the yard.</li>
        <li><strong>We cite our sources.</strong> When we tell you how long a stain lasts, we link to who said it.</li>
      </ul>
      <h2>Licensed and insured</h2>
      <p>Tennessee requires a Home Improvement license for residential jobs from $3,000 to $24,999 in Hamilton County and several others<sup class="fn"><a href="${src.tnHomeImprovement.url}" target="_blank" rel="noopener">TN.gov</a></sup>, and a contractor's license for projects of $25,000 or more<sup class="fn"><a href="${src.tnContractor.url}" target="_blank" rel="noopener">TN.gov</a></sup>.</p>
      <p>License: ${show(b.license)}<br>Insurance: ${show(b.insurance)}</p>
      <h2>A Stain &amp; Seal Supply Pro Partner</h2>
      <p>We're part of the Stain &amp; Seal Supply Pro Partners program. That means pro-grade products, real training on how to use them, and a network of other staining contractors to send you to if you're outside our area.</p>
    </div>
    <aside class="area-aside">
      <div class="est-card">
        <h2>At a glance</h2>
        <dl class="facts">
          <dt>Crew</dt><dd>${esc(cap(b.crewSize))}</dd>
          <dt>In business</dt><dd>${show(b.yearsInBusiness)} years</dd>
          <dt>Service area</dt><dd>${esc(cfg.location.region)}</dd>
          <dt>Hours</dt><dd>${esc(b.hours)}</dd>
          <dt>Warranty</dt><dd><a href="${r('warranty/')}">${cfg.warranty.horizontalYears}-yr floors / ${cfg.warranty.verticalYears}-yr vertical</a></dd>
        </dl>
      </div>
    </aside>
  </div>
</section>
${closingCta(cfg, r)}`;
}

export function warrantyPage(cfg, r) {
  const w = cfg.warranty;
  return `
<section class="page-hero">
  <div class="wrap">
    ${crumbs(r, [['Home', ''], ['Warranty', 'warranty/']])}
    <p class="kicker">Written warranty${w.sample ? ' · <span class="sample-tag">Sample terms</span>' : ''}</p>
    <h1>Our warranty, in plain English</h1>
    <p class="page-lede">${esc(w.summary)}</p>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <div class="warranty-terms">
      <div class="term"><span class="term-n">${w.horizontalYears}</span><span class="term-u">years</span><p>Deck floors, stairs and other walking surfaces</p></div>
      <div class="term"><span class="term-n">${w.verticalYears}</span><span class="term-u">years</span><p>Railings, posts, fences, siding and log walls</p></div>
    </div>
    <div class="warranty-cols">
      <div><h2>What's covered</h2><ul class="check">${w.covers.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <div><h2>What's not covered</h2><ul class="cross">${w.excludes.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <div><h2>Your part</h2><ul class="check">${w.conditions.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
    </div>
    ${w.sample ? '<p class="sample-banner">Sample warranty terms. Each Pro Partner sets their own term lengths and wording in site.config.json. Have a lawyer read it before launch.</p>' : ''}
    <p class="fine">Why is solid stain on floors different? Film finishes like solid stain are known to peel on walking surfaces. See <a href="${r('learn/semi-transparent-vs-solid-deck-stain/')}">semi-transparent vs. solid</a>.</p>
  </div>
</section>
${closingCta(cfg, r)}`;
}

export function contactPage(cfg, r) {
  const b = cfg.business;
  return `
<section class="page-hero page-hero-tight">
  <div class="wrap">
    ${crumbs(r, [['Home', ''], ['Contact', 'contact/']])}
    <p class="kicker">Contact</p>
    <h1>Call, text, or send a note</h1>
    <p class="page-lede">We're usually on a deck during the day. Texts get the fastest answer.</p>
  </div>
</section>
<section class="sec">
  <div class="wrap est-grid">
    <form class="est-form" data-lead-form="contact" novalidate>
      <div class="field-grid">
        <label class="field"><span>Name</span><input name="name" required autocomplete="name"></label>
        <label class="field"><span>Phone</span><input name="phone" type="tel" autocomplete="tel"></label>
        <label class="field field-wide"><span>Email</span><input name="email" type="email" autocomplete="email"></label>
        <label class="field field-wide"><span>Message</span><textarea name="notes" rows="5" required></textarea></label>
      </div>
      <button class="btn btn-cedar btn-lg" type="submit">Send message</button>
      <p class="form-msg" role="status"></p>
    </form>
    <aside class="est-side">
      <div class="est-card">
        <h2>Reach us</h2>
        <p><a class="big-phone" href="tel:${b.phoneHref}">${icon('phone')} ${esc(b.phone)}</a></p>
        <p><a href="sms:${b.sms}">Text us</a> · <a href="mailto:${esc(b.email)}">${esc(b.email)}</a></p>
        <p>${show(b.street)}<br>${esc(b.city)}, ${esc(b.state)} ${esc(b.zip)}</p>
        <p class="fine">${esc(b.hours)}</p>
      </div>
      <div class="est-card est-card-quiet">
        <h2>Need a price?</h2>
        <p><a class="arrow-link" href="${r('estimate/')}">Send photos for an estimate ${icon('arrow')}</a></p>
      </div>
    </aside>
  </div>
</section>`;
}

export function privacyPage(cfg, r) {
  const b = cfg.business;
  return `
<section class="page-hero page-hero-tight">
  <div class="wrap">
    ${crumbs(r, [['Home', ''], ['Privacy', 'privacy/']])}
    <p class="kicker">Privacy</p>
    <h1>Privacy policy</h1>
    <p class="page-lede">Short version: we use your info to give you a price and do the job. We don't sell it.</p>
  </div>
</section>
<section class="sec">
  <div class="wrap wrap-narrow prose">
    ${cfg.mockup ? '<p class="sample-banner">Demo site: forms on this site save to your own browser only (localStorage) so the dashboard can show them. Nothing is sent to a server. Clear your browser data to remove it.</p>' : ''}
    <h2>What we collect</h2>
    <p>When you ask for an estimate, use the calculator, or use the color visualizer and ask us to send the result, we collect what you type in (name, phone, email, address, deck details) and any photos you upload.</p>
    <h2>How we use it</h2>
    <ul class="check"><li>To give you a price and schedule your job</li><li>To text or email you about your job</li><li>To remind you when your deck is due for maintenance, if you're a customer</li><li>To ask for a review after your job, once</li></ul>
    <h2>What we don't do</h2>
    <p>We don't sell or rent your information. We don't add you to marketing lists you didn't ask for.</p>
    <h2>The color visualizer</h2>
    <p>Your deck photo is processed in your own browser. It is only sent to us if you fill in the form to get the full-size image.</p>
    <h2>Cookies and analytics</h2>
    <p>This site doesn't use advertising cookies. ${cfg.mockup ? 'The demo uses your browser\'s local storage to hold form entries for the dashboard.' : 'We may use basic, privacy-friendly visit counts.'}</p>
    <h2>Questions or removal</h2>
    <p>Email <a href="mailto:${esc(b.email)}">${esc(b.email)}</a> or call ${esc(b.phone)} and we'll delete your information.</p>
  </div>
</section>`;
}

export function notFoundPage(cfg, r) {
  return `
<section class="page-hero">
  <div class="wrap">
    <p class="kicker">404</p>
    <h1>That page wandered off.</h1>
    <p class="page-lede">Try the <a href="${r('')}">home page</a>, our <a href="${r('pricing/')}">price calculator</a>, or <a href="tel:${cfg.business.phoneHref}">call ${esc(cfg.business.phone)}</a>.</p>
  </div>
</section>`;
}
