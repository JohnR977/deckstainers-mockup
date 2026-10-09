// Learn articles. Each is a function of the config, so a Knoxville partner gets
// Knoxville rainfall numbers without anyone rewriting the article.
// cite(key) drops a numbered footnote that links out to the expert source.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function rainChart(cfg) {
  const c = cfg.location.climate;
  const max = Math.max(...c.monthlyRainIn);
  const min = Math.min(...c.monthlyRainIn);
  const bars = c.monthlyRainIn.map((v, i) => {
    const h = Math.round((v / max) * 100);
    const low = v <= min + 0.12 || (i === 8 || i === 9);
    return `<div class="rain-bar${low ? ' is-low' : ''}" style="--h:${h}%"><span class="rain-val">${v.toFixed(2)}</span><span class="rain-m">${MONTHS[i]}</span></div>`;
  }).join('');
  return `<figure class="rain-chart" aria-label="Average monthly rainfall in ${cfg.business.city}, inches">
    <div class="rain-bars">${bars}</div>
    <figcaption>Average rainfall by month, ${c.station}, in inches. NOAA 1991–2020 normals. Fall months highlighted.</figcaption>
  </figure>`;
}

export function articles(cfg) {
  const city = cfg.business.city;
  const st = cfg.business.stateName;
  const c = cfg.location.climate;
  return [
    {
      slug: 'best-time-to-stain-a-deck',
      title: `The best time to stain a deck in ${city}`,
      short: `Best time to stain in ${city}`,
      description: `Why ${c.bestMonths} are the best months to stain a deck in ${city}, with NOAA rainfall numbers and what the wood needs to dry.`,
      image: 'hero-wooded-deck.jpg',
      date: '2026-10-01',
      readMin: 4,
      body: (cite) => `
<p class="lede">Short answer: <strong>${c.bestMonths}</strong>. Spring is our second choice. Midsummer and winter are the hardest. Here's why.</p>

<h2>Stain needs dry wood and a few dry days</h2>
<p>Stain has to soak into the wood. If the boards are wet, it can't. The U.S. Forest Products Laboratory, the government's wood research lab, says to let a deck dry for at least two warm, windy days after cleaning before you finish it${cite('usdaFinishes')}. Home Depot's guide for pressure-treated wood says to let it dry 24 hours after cleaning${cite('homeDepot')}. On a shady deck in a humid valley, we lean toward the longer number.</p>
<p>So the real question is: <em>when does ${city} give you a run of dry days?</em></p>

<h2>What the rainfall numbers say</h2>
<p>${city} averages about <strong>${c.annualRainIn.toFixed(0)} inches of rain a year</strong>. The driest months on average are ${c.driestMonths}, and ${c.fewestRainDays} have the fewest rainy days${cite(c.sourceKey)}.</p>
${rainChart(cfg)}
<p>That lines up with what we see on the job. Fall gives us dry spells, cooler afternoons and less direct heat on the boards. Stain that goes on in mild weather soaks in evenly instead of flashing dry on the surface.</p>

<h2>Why not July?</h2>
<p>July is one of the wettest months here on average, and pop-up afternoon storms are common. Hot boards also dry the stain too fast, which leaves lap marks. We still work in summer, but we start early, work in the shade side first, and watch the radar.</p>

<h2>Why not winter?</h2>
<p>Most stains need air and wood temperatures above about 50°F while they dry. Check the label of the product you're using. Winter days are short and the boards stay damp in the morning. We use winter for estimates and booking.</p>

<h2>What about humidity?</h2>
<p>Average humidity here is ${c.humidity}${cite(c.humiditySourceKey)}. Humidity slows drying, which is one more reason we don't rush the wait between washing and staining.</p>

<h2>Bottom line</h2>
<ul class="check">
<li>Book early for ${c.bestMonths}. Those slots fill first.</li>
<li>Spring works well too once the pollen settles.</li>
<li>If your deck is peeling or gray now, get it on the calendar. Waiting another season usually means more prep and a bigger bill.</li>
</ul>`
    },
    {
      slug: 'oil-vs-water-based-deck-stain',
      title: 'Oil vs. water-based deck stain: the honest answer',
      short: 'Oil vs. water-based',
      description: 'Oil-based and water-based deck stains compared in plain English: how long they last, how they wear, and which is easier to redo.',
      image: 'deck-stained-topdown.jpg',
      date: '2026-09-18',
      readMin: 4,
      body: (cite) => `
<p class="lede">You'll hear strong opinions on this. The truth is the experts don't fully agree, and the "right" answer depends on how you want to take care of the deck later.</p>

<h2>Where the experts disagree</h2>
<p>Fine Homebuilding says most water-based stains actually <em>last longer</em> than oil-based ones, about two to three years. The catch is that when they do wear out, you often have to remove the old coat completely before recoating. Oil-based stains need refinishing more often, but the touch-up is easier${cite('fineHomebuilding')}.</p>
<p>Bob Vila's cost guide puts it the other way, with oil-based lasting about 3 to 5 years and water-based about 2 to 3${cite('bobvila')}.</p>
<p>Both are reputable. The difference comes from the products tested, the climate, and how "lasting" gets measured. That's why we don't sell one answer to everybody.</p>

<h2>How they wear, in plain words</h2>
<div class="compare">
  <div>
    <h3>Oil-based</h3>
    <ul>
      <li>Soaks deep into the wood and brings out the grain</li>
      <li>Wears away slowly. It fades more than it peels.</li>
      <li>Easy to recoat: clean it and add a coat where it's thin${cite('fineHomebuilding')}</li>
      <li>Stronger smell, slower to dry, harder cleanup</li>
    </ul>
  </div>
  <div>
    <h3>Water-based</h3>
    <ul>
      <li>Holds its color well and dries fast</li>
      <li>Low odor and easy cleanup</li>
      <li>Can last longer between coats${cite('fineHomebuilding')}</li>
      <li>When it's done, it may need to be stripped first</li>
    </ul>
  </div>
</div>

<h2>What we usually recommend</h2>
<p>For most decks around ${city}, we like a <strong>penetrating, semi-transparent</strong> stain, oil or a modern water-based "hybrid," and a maintenance coat every couple of years. The Forest Products Lab recommends penetrating finishes over film-forming ones for decks${cite('usdaFinishes')}. If you want to keep the cost of upkeep low, choose the product that's easiest to recoat. That way your second coat in three years is a quick wash-and-stain, not a strip job.</p>

<h2>Already have a finish on there?</h2>
<p>Stay with the same type if it's in good shape. Putting water-based over oil, or oil over a film that's still on the wood, is a common reason a new coat fails. When we're not sure what's on a deck, we test a spot first.</p>`
    },
    {
      slug: 'semi-transparent-vs-solid-deck-stain',
      title: 'Semi-transparent vs. solid stain on a deck',
      short: 'Semi-transparent vs. solid',
      description: 'The government wood lab says avoid solid stain on decks. Consumer Reports says solid scores best. Here is how to decide.',
      image: 'deck-bench-boards.jpg',
      date: '2026-09-04',
      readMin: 5,
      body: (cite) => `
<p class="lede">This is the one question where two trusted sources give opposite advice. We'll show you both and tell you how we decide on the job.</p>

<h2>Side 1: the wood scientists</h2>
<p>The U.S. Forest Products Laboratory has studied wood finishes for decades. Their advice for decks is clear: use <strong>penetrating</strong> finishes, not film-forming ones. They write that paints and solid-color stains "are prone to trap moisture and fail by peeling"${cite('usdaFinishes')}. Another of their guides says paint and solid-color stains "are not appropriate for fully exposed decks"${cite('usdaSouth')}, and a third says opaque stains shouldn't be used on decks and fences${cite('usdaFinishing')}.</p>
<p>Their own table gives semi-transparent stain on decking about 2–3 years on new smooth wood and 3–6 years on weathered, rougher wood${cite('usdaSouth')}.</p>

<h2>Side 2: Consumer Reports' testing</h2>
<p>Consumer Reports tests deck stains on panels outdoors. Their tester told KOMO News that "solid color staining always fares best in our testing," and that a solid color can last seven to 10 years, while clearer stains may need redoing every one to three years${cite('consumerReports')}.</p>

<h2>Why they disagree</h2>
<p>They're measuring different things. Consumer Reports rates how the finish <em>looks and protects</em> over time on test panels. The Forest Products Lab focuses on how the finish <em>fails</em> on a real deck, where water gets in at the board ends, cracks and nail holes. When a solid stain does fail on a floor, it peels, and peeling means stripping. When a semi-transparent wears, it fades, and fading means a quick recoat.</p>

<h2>How we decide</h2>
<div class="compare">
  <div>
    <h3>We lean semi-transparent when…</h3>
    <ul>
      <li>It's a walking surface: deck floors, stairs</li>
      <li>The deck is shady or damp (hello, Signal Mountain)</li>
      <li>You want to see the wood grain</li>
      <li>You want cheap, easy maintenance coats</li>
    </ul>
  </div>
  <div>
    <h3>Solid can make sense when…</h3>
    <ul>
      <li>It's vertical: railings, skirting, fences, siding</li>
      <li>The wood is mismatched or patched and you want one even color</li>
      <li>You understand a failed solid coat means stripping later</li>
      <li>There's good airflow and drainage</li>
    </ul>
  </div>
</div>
<p>A popular middle path: <strong>semi-transparent on the floor, solid on the railings.</strong> You get a grain look underfoot and a crisp, long-lasting color on the parts you look at most.</p>
<p>Our written warranty reflects this. Solid stain on deck floors gets a shorter term, and we tell you why up front.</p>`
    },
    {
      slug: 'staining-new-pressure-treated-wood',
      title: 'New pressure-treated deck? When to stain it',
      short: 'Staining new wood',
      description: 'How long to wait before staining a new pressure-treated deck, the 10-minute sprinkle test, and why waiting too long costs you.',
      image: 'brush-on-wood.jpg',
      date: '2026-08-21',
      readMin: 3,
      body: (cite) => `
<p class="lede">Brand-new deck? Don't stain it the day the builder leaves, and don't wait three years either.</p>

<h2>Why you wait</h2>
<p>Pressure-treated lumber comes from the yard wet. Home Depot's guide says it can take several weeks to dry${cite('homeDepot')}. Stain put on wet wood can't soak in. It sits on top and flakes off.</p>
<p>The Forest Products Lab's deck guide says wood that was treated with a water repellent at the factory, or recently treated, should weather for about 2 to 3 months before finishing${cite('usdaFinishes')}.</p>

<h2>The 10-minute sprinkle test</h2>
<ol class="steps-inline">
  <li>Sprinkle some water on a few boards in the sun and a few in the shade.</li>
  <li>Watch for 10 minutes.</li>
  <li>If it soaks in, the wood is ready. Plan to stain soon. If it beads up or pools, give it more time${cite('homeDepot')}.</li>
</ol>
<p>One exception: lumber stamped <strong>KDAT</strong> (kiln dried after treatment) has already been dried and can be stained right away${cite('homeDepot')}.</p>

<h2>Why you don't wait too long</h2>
<p>Bare wood in the sun turns gray within a season or two. That gray layer is damaged surface fiber. Stain won't stick well to it until it's cleaned and brightened, which adds a step and cost. The Forest Products Lab notes that most decks are retired early because of cracks and checks that timely finishing could have prevented${cite('usdaFinishes')}.</p>

<h2>Our advice for a new deck</h2>
<ul class="check">
  <li>Do the sprinkle test every few weeks after the deck is built.</li>
  <li>When it passes, book the first coat. For most decks that's within the first year.</li>
  <li>Ask about a maintenance plan. A new deck is the cheapest one to keep looking new.</li>
</ul>`
    },
    {
      slug: 'why-deck-stain-peels',
      title: 'Why deck stain peels (and how to stop it)',
      short: 'Why decks peel',
      description: 'The real reasons deck stain peels: film finishes, wet wood, and coating over old finish. Plus what fixes it for good.',
      image: 'boards-weathered-gray.jpg',
      date: '2026-08-07',
      readMin: 4,
      body: (cite) => `
<p class="lede">Peeling is the number one complaint we hear. It's almost never bad luck. There are a few causes, and they're all fixable.</p>

<h2>1. A film finish on a walking surface</h2>
<p>Paints and solid stains form a film on top of the wood. The Forest Products Lab says film-forming finishes on decks are prone to trap moisture and fail by peeling${cite('usdaFinishes')}. Semi-transparent stains, by comparison, won't blister or peel even if water gets into the wood${cite('usdaFinishes')}. They fade instead.</p>

<h2>2. The wood was wet</h2>
<p>Stain on damp wood can't grip. That happens when someone stains the day after a rain, the morning after washing, or on brand-new lumber that hasn't dried. The lab recommends at least two warm, windy days of drying after cleaning${cite('usdaFinishes')}.</p>

<h2>3. New coat on top of a failing coat</h2>
<p>If the old finish is lifting, a new coat on top is only as strong as what's underneath. It peels right along with it. This is the most common mistake we fix.</p>

<h2>4. Too much stain</h2>
<p>More isn't better. Penetrating stain should soak in. The extra that sits in puddles on top dries into a soft film that scuffs and flakes. We back-brush and wipe off any excess before it dries.</p>

<h2>5. Damaged surface from power washing</h2>
<p>A high-pressure wash can tear up soft wood. The lab warns that aggressive scrubbing or power washing can remove wood from the surface${cite('usdaFinishes')}. That fuzzy surface takes stain unevenly. We wash with low pressure and the right cleaner, and let the chemistry do the work.</p>

<h2>The fix</h2>
<ol class="steps-inline">
  <li>Strip what's failing, all of it, down to sound wood.</li>
  <li>Brighten the wood so it's open and even.</li>
  <li>Let it dry fully.</li>
  <li>Apply a penetrating stain and back-brush it in.</li>
  <li>Recoat on schedule, before it wears through.</li>
</ol>
<p>Stripping is the most work we do, so a peeling deck costs more than one that's just faded. Our <a href="../../pricing/">price calculator</a> shows the difference when you choose "Peeling."</p>`
    },
    {
      slug: 'how-often-to-restain-a-deck',
      title: `How often to restain a deck in ${st} humidity`,
      short: 'How often to restain',
      description: `How many years a deck stain really lasts in ${st}: what Angi, Bob Vila and the U.S. Forest Products Lab say, and what changes it.`,
      image: 'deck-chairs-rail.jpg',
      date: '2026-07-24',
      readMin: 4,
      body: (cite) => `
<p class="lede">Most decks around here want attention every <strong>two to three years</strong>. Railings and fences can usually go longer. Here's what the sources say, and what moves the number up or down.</p>

<h2>What the sources say</h2>
<table class="data-table">
  <thead><tr><th>Source</th><th>What they say</th></tr></thead>
  <tbody>
    <tr><td>Angi${cite('angi')}</td><td>Restain every two to three years</td></tr>
    <tr><td>Bob Vila${cite('bobvila')}</td><td>Oil-based every 3–5 years, water-based 2–3, solid 4–5</td></tr>
    <tr><td>USDA Forest Products Lab${cite('usdaSouth')}</td><td>Semi-transparent on decking: 2–3 years on new smooth wood, 3–6 years on weathered rough wood</td></tr>
    <tr><td>USDA Forest Products Lab${cite('usdaFinishes')}</td><td>Clear water-repellent sealers: about 1 year on exposed deck surfaces</td></tr>
  </tbody>
</table>
<p>Those are averages. The lab's own table says its numbers are for an average location in the continental United States${cite('usdaSouth')}. ${city} isn't average.</p>

<h2>Why ${st} is harder on decks</h2>
<p>We get about ${c.annualRainIn.toFixed(0)} inches of rain a year here${cite(c.sourceKey)}, and average humidity is ${c.humidity}${cite(c.humiditySourceKey)}. Wet wood that dries slowly grows mildew, and mildew breaks down a finish from the top. Add strong summer sun on open decks and you get wear from both sides.</p>

<h2>What makes yours last longer or shorter</h2>
<div class="compare">
  <div>
    <h3>Shorter</h3>
    <ul>
      <li>Full afternoon sun on the deck floor</li>
      <li>Heavy shade and leaf piles</li>
      <li>Clear or very light finishes (less pigment, less UV protection)</li>
      <li>Dogs, grills, planters, kids</li>
    </ul>
  </div>
  <div>
    <h3>Longer</h3>
    <ul>
      <li>Vertical surfaces: railings, fences, siding</li>
      <li>Good airflow under and around the deck</li>
      <li>Semi-transparent with good pigment</li>
      <li>A yearly wash and a quick check</li>
    </ul>
  </div>
</div>

<h2>The cheapest way to keep a deck nice</h2>
<p>Recoat <em>before</em> it wears through. A maintenance coat on a faded deck costs a fraction of stripping a failed one. That's the whole idea behind our <a href="../../services/maintenance-plans/">maintenance plans</a>, and why our dashboard reminds us to call you before your deck needs it.</p>
<p>And check the structure while you're at it. The North American Deck and Railing Association recommends homeowners check their deck every year${cite('nadra')}.</p>`
    }
  ];
}

export function makeCiter(sources) {
  const order = [];
  const fn = (key) => {
    if (!sources[key]) throw new Error('Unknown source: ' + key);
    let i = order.indexOf(key);
    if (i === -1) { order.push(key); i = order.length - 1; }
    return `<sup class="fn"><a href="#src-${i + 1}" aria-label="Source ${i + 1}">${i + 1}</a></sup>`;
  };
  fn.list = () => order.length ? `<section class="sources" aria-labelledby="src-h"><h2 id="src-h">Sources</h2><ol>${order.map((k, i) =>
    `<li id="src-${i + 1}"><a href="${sources[k].url.replace(/&/g, '&amp;')}" target="_blank" rel="noopener">${sources[k].name}</a></li>`).join('')}</ol></section>` : '';
  return fn;
}
