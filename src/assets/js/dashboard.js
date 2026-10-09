/* Pro Partner Dashboard — a deliberately simple CRM for a 1–2 man staining crew.
   MOCKUP: fake login, data in localStorage, seeded with FICTIONAL sample customers.
   The real version is described in CRM_PLAN.md. */
(function () {
  var C = window.DASH_CONFIG;
  var SLUG = C.slug;
  var AUTH = 'ds:' + SLUG + ':auth', SEEDED = 'ds:' + SLUG + ':seeded', RAIN = 'ds:' + SLUG + ':rain';
  var STAGES = [['new', 'New'], ['contacted', 'Contacted'], ['estimate', 'Estimate Sent'], ['won', 'Won'], ['scheduled', 'Scheduled'], ['done', 'Done'], ['paid', 'Paid']];
  var STAGE_NAME = {}; STAGES.forEach(function (s) { STAGE_NAME[s[0]] = s[1]; });
  var SOURCE = { estimate: 'Photo estimate', calculator: 'Calculator', visualizer: 'Visualizer', contact: 'Contact form', phone: 'Phone call', reminder: 'Re-coat', referral: 'Referral' };
  var view = document.getElementById('view');

  // ---------- helpers ----------
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(n) { return '$' + Math.round(n || 0).toLocaleString('en-US'); }
  function day(offset, hour) { var d = new Date(); d.setHours(hour == null ? 10 : hour, 0, 0, 0); d.setDate(d.getDate() + offset); return d.toISOString(); }
  function ymd(d) { d = new Date(d); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function fromYmd(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2], 9); }
  function nice(d, withYear) { return new Date(d).toLocaleDateString('en-US', { weekday: withYear ? undefined : 'short', month: 'short', day: 'numeric', year: withYear ? 'numeric' : undefined }); }
  function ago(d) {
    var s = (Date.now() - new Date(d)) / 1000;
    if (s < 3600) return Math.max(1, Math.round(s / 60)) + ' min ago';
    if (s < 86400) return Math.round(s / 3600) + ' hr ago';
    if (s < 172800) return 'yesterday';
    return Math.round(s / 86400) + ' days ago';
  }
  function img(src) { return /^data:|^https?:/.test(src) ? src : '../' + src; }
  function first(n) { return (n || '').split(/[ &]/)[0]; }
  function digits(p) { return (p || '').replace(/[^\d+]/g, ''); }
  function toast(t) { var el = document.getElementById('toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { el.classList.remove('on'); }, 2600); }
  function leads() { return DS.read() || []; }
  function save(list) { if (!DS.write(list)) toast('Storage is full in this demo browser.'); }
  function get(id) { return leads().filter(function (l) { return l.id === id; })[0]; }
  function update(id, fn, note) {
    var list = leads();
    list.forEach(function (l) { if (l.id === id) { fn(l); if (note) (l.history = l.history || []).push({ at: new Date().toISOString(), text: note }); } });
    save(list);
  }
  function rainDays() { try { return JSON.parse(localStorage.getItem(RAIN)) || []; } catch (e) { return []; } }
  function setRain(list) { localStorage.setItem(RAIN, JSON.stringify(list)); }
  function recoatYears(l) { return (C.reminderYears || {})[(l.deck && l.deck.finish) || 'semi-transparent'] || 2; }
  function dueDate(l) { var d = new Date(l.doneDate); d.setFullYear(d.getFullYear() + recoatYears(l)); return d; }
  function estTotal(l) {
    if (l.estimateDoc) return l.estimateDoc.total;
    if (l.estimate) return (l.estimate.low + l.estimate.high) / 2;
    return 0;
  }
  function estLabel(l) {
    if (l.estimateDoc) return money(l.estimateDoc.total);
    if (l.estimate) return money(l.estimate.low) + '–' + money(l.estimate.high);
    return '';
  }

  // ---------- seed (fictional sample customers) ----------
  function seed() {
    var S = function (o) { return Object.assign({ id: DS.uid(), photos: [], history: [], notes: '' }, o); };
    var h = function (at, text) { return { at: at, text: text }; };
    var list = [
      S({ name: 'Megan Alvarez', phone: '(423) 555-0181', email: 'megan.a@example.com', address: 'Ridge Trail Rd, Signal Mountain', source: 'estimate', stage: 'new', createdAt: day(0, new Date().getHours() - 2),
        deck: { size: '20 × 14', sqft: 280, rail: 40, stairs: 6, condition: 'weathered', finish: 'semi-transparent' }, timeframe: 'This fall', heard: 'Google search',
        photos: ['assets/img/hero-wooded-deck.jpg'], notes: 'Lots of mildew on the shady side. Two dogs.' }),
      S({ name: 'Darnell Hughes', phone: '(423) 555-0127', email: 'dhughes@example.com', address: 'Hixson Pike area, Hixson', source: 'calculator', stage: 'new', createdAt: day(0, Math.max(7, new Date().getHours() - 5)),
        deck: { size: '16 × 12', sqft: 192, rail: 28, stairs: 4, condition: 'weathered', finish: 'semi-transparent' }, estimate: { low: 1000, high: 1290 } }),
      S({ name: 'Priya Raman', phone: '(423) 555-0164', email: 'priya.r@example.com', address: 'Snow Hill Rd area, Ooltewah', source: 'visualizer', stage: 'new', createdAt: day(-1, 19),
        color: { name: 'Driftwood Gray', hex: '#8b8378', type: 'semi-transparent' }, deck: { finish: 'semi-transparent' }, photos: ['assets/img/deck-bench-boards.jpg'], notes: 'Tried Driftwood Gray in the color visualizer.' }),
      S({ name: 'Tom & Linda Brewer', phone: '(423) 555-0109', email: 'brewers@example.com', address: 'Ringgold Rd area, East Ridge', source: 'estimate', stage: 'contacted', createdAt: day(-3, 9),
        deck: { size: 'about 300 sq ft', sqft: 300, rail: 36, stairs: 5, condition: 'peeling', finish: 'semi-transparent' }, photos: ['assets/img/boards-weathered-gray.jpg', 'assets/img/boards-old.jpg'],
        notes: 'Old solid stain peeling on the floor. Needs a full strip.', history: [h(day(-3, 9), 'Came in from the website (estimate)'), h(day(-2, 8), 'Texted. They want it done before Thanksgiving.')] }),
      S({ name: 'Chris Watts', phone: '(423) 555-0133', email: 'cwatts@example.com', address: 'Dayton Blvd area, Red Bank', source: 'contact', stage: 'contacted', createdAt: day(-4, 14),
        notes: 'Small front porch floor and steps. Asked if we do porches.', history: [h(day(-4, 14), 'Came in from the website (contact)'), h(day(-4, 16), 'Called back, left voicemail.')] }),
      S({ name: 'Jasmine Cole', phone: '(423) 555-0172', email: 'jcole@example.com', address: 'Gunbarrel Rd area, East Brainerd', source: 'estimate', stage: 'estimate', createdAt: day(-6, 11),
        deck: { size: '18 × 14', sqft: 252, rail: 32, stairs: 4, condition: 'weathered', finish: 'semi-transparent' }, photos: ['assets/img/deck-boards-angle.jpg'],
        estimateDoc: { lines: [{ label: 'Deck floor wash, brighten, semi-transparent stain', qty: 252, unit: 'sq ft', price: 3.4 }, { label: 'Railing', qty: 32, unit: 'ft', price: 9 }, { label: 'Stairs', qty: 4, unit: 'steps', price: 24 }], discount: 0, depositPct: C.depositPercent, total: 1240, sentAt: day(-5, 10) },
        history: [h(day(-6, 11), 'Came in from the website (estimate)'), h(day(-5, 10), 'Estimate sent: $1,240')] }),
      S({ name: 'Robert Ellison', phone: '(423) 555-0118', email: 'rellison@example.com', address: 'Scenic Hwy area, Lookout Mountain', source: 'phone', stage: 'estimate', createdAt: day(-8, 15),
        deck: { size: 'two levels, ~620 sq ft', sqft: 620, rail: 110, stairs: 14, condition: 'weathered', finish: 'semi-transparent' }, color: { name: 'Walnut', hex: '#5a3a24', type: 'semi-transparent' },
        estimateDoc: { lines: [{ label: 'Deck floors, two levels', qty: 620, unit: 'sq ft', price: 3.3 }, { label: 'Railing', qty: 110, unit: 'ft', price: 8.5 }, { label: 'Stairs', qty: 14, unit: 'steps', price: 26 }], discount: 0, depositPct: C.depositPercent, total: 3345, sentAt: day(-7, 10) },
        history: [h(day(-8, 15), 'Phone call. Tall deck, needs ladders.'), h(day(-7, 10), 'Estimate sent: $3,345')] }),
      S({ name: 'Kevin Doyle', phone: '(423) 555-0150', email: 'kdoyle@example.com', address: 'Apison Pike area, Collegedale', source: 'referral', stage: 'won', createdAt: day(-10, 10),
        deck: { size: '14 × 12', sqft: 168, rail: 24, stairs: 3, condition: 'good', finish: 'semi-transparent' }, color: { name: 'Cedar', hex: '#a85a2c', type: 'semi-transparent' }, estimate: { low: 760, high: 980 },
        history: [h(day(-10, 10), 'Referral from a past customer.'), h(day(-2, 17), 'Said yes! Deposit paid. Needs a date.')] }),
      S({ name: 'Angela Moreno', phone: '(423) 555-0144', email: 'amoreno@example.com', address: 'Hwy 58 area, Harrison', source: 'estimate', stage: 'scheduled', createdAt: day(-14, 10), jobDate: ymd(day(3)), days: 2,
        deck: { size: 'lakeside, ~400 sq ft', sqft: 400, rail: 60, stairs: 8, condition: 'weathered', finish: 'semi-transparent' }, color: { name: 'Chestnut', hex: '#7a4a2a', type: 'semi-transparent' }, estimateDoc: { lines: [], discount: 0, depositPct: 25, total: 2180 },
        history: [h(day(-14, 10), 'Came in from the website (estimate)'), h(day(-6, 12), 'Scheduled.')] }),
      S({ name: 'Sam Patel', phone: '(423) 555-0196', email: 'spatel@example.com', address: 'Dayton Pike area, Soddy-Daisy', source: 'calculator', stage: 'scheduled', createdAt: day(-12, 10), jobDate: ymd(day(8)), days: 2,
        deck: { size: '24 × 16', sqft: 384, rail: 48, stairs: 6, condition: 'good', finish: 'transparent' }, color: { name: 'Honey Toner', hex: '#c98a3c', type: 'transparent' }, estimate: { low: 1250, high: 1560 } }),
      S({ name: 'Grace Whitfield', phone: '(706) 555-0122', email: 'gwhitfield@example.com', address: 'McFarland Ave area, Rossville', source: 'estimate', stage: 'done', createdAt: day(-30, 10), jobDate: ymd(day(-6)), doneDate: day(-5, 16),
        deck: { size: '12 × 10', sqft: 120, rail: 22, stairs: 3, condition: 'weathered', finish: 'semi-transparent' }, color: { name: 'Redwood', hex: '#8e3b25', type: 'semi-transparent' }, estimateDoc: { lines: [], discount: 0, depositPct: 25, total: 720 },
        history: [h(day(-5, 16), 'Job done. Customer happy with Redwood.')] }),
      S({ name: 'Mike Turner', phone: '(706) 555-0187', email: 'mturner@example.com', address: 'Battlefield Pkwy area, Fort Oglethorpe', source: 'estimate', stage: 'paid', createdAt: day(-45, 10), doneDate: day(-20, 15), paidDate: day(-19, 9), reviewRequested: day(-19, 9),
        deck: { sqft: 260, finish: 'semi-transparent' }, color: { name: 'Walnut', hex: '#5a3a24', type: 'semi-transparent' }, estimateDoc: { lines: [], discount: 0, depositPct: 25, total: 1460 } }),
      // Past customers: these drive the re-coat reminders.
      S({ name: 'Helen Brooks', phone: '(423) 555-0105', email: 'hbrooks@example.com', address: 'Mountain Creek Rd area, Signal Mountain', source: 'estimate', stage: 'paid', createdAt: day(-760), doneDate: day(-715), paidDate: day(-714),
        deck: { sqft: 310, finish: 'semi-transparent' }, color: { name: 'Cedar', hex: '#a85a2c', type: 'semi-transparent' }, estimateDoc: { lines: [], discount: 0, depositPct: 25, total: 1520 } }),
      S({ name: 'Luis Ortega', phone: '(423) 555-0168', email: 'lortega@example.com', address: 'Middle Valley area, Hixson', source: 'phone', stage: 'paid', createdAt: day(-830), doneDate: day(-790), paidDate: day(-789),
        deck: { sqft: 220, finish: 'semi-transparent' }, color: { name: 'Chestnut', hex: '#7a4a2a', type: 'semi-transparent' }, estimateDoc: { lines: [], discount: 0, depositPct: 25, total: 1090 } }),
      S({ name: 'Beth Carver', phone: '(423) 555-0139', email: 'bcarver@example.com', address: 'Hunter Rd area, Ooltewah', source: 'estimate', stage: 'paid', createdAt: day(-640), doneDate: day(-610), paidDate: day(-609),
        deck: { sqft: 180, finish: 'semi-transparent' }, color: { name: 'Weathered Oak', hex: '#9c7f5e', type: 'semi-transparent' }, estimateDoc: { lines: [], discount: 0, depositPct: 25, total: 880 } }),
      S({ name: 'Dave Kim', phone: '(423) 555-0177', email: 'dkim@example.com', address: 'North Shore, Chattanooga', source: 'referral', stage: 'paid', createdAt: day(-1090), doneDate: day(-1065), paidDate: day(-1064),
        deck: { sqft: 140, finish: 'solid' }, color: { name: 'Slate Gray', hex: '#5d6164', type: 'solid' }, estimateDoc: { lines: [], discount: 0, depositPct: 25, total: 1340 } })
    ];
    list.forEach(function (l) { if (!l.history.length) l.history.push({ at: l.createdAt, text: 'Came in (' + (SOURCE[l.source] || l.source) + ')' }); });
    var existing = (DS.read() || []).filter(function (l) { return !l.sample; });
    list.forEach(function (l) { l.sample = true; });
    save(existing.concat(list).sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); }));
    setRain([ymd(day(4))]);
    localStorage.setItem(SEEDED, '1');
  }

  // ---------- auth (pretend) ----------
  document.getElementById('demo-creds').textContent = C.demoUser + ' / ' + C.demoPass;
  document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target;
    if (f.u.value.trim() === C.demoUser && f.p.value === C.demoPass) { sessionStorage.setItem(AUTH, '1'); boot(); }
    else document.querySelector('.login-msg').textContent = 'That doesn\'t match. Try the demo login below.';
  });
  document.getElementById('logout').addEventListener('click', function () { sessionStorage.removeItem(AUTH); boot(); });
  document.getElementById('reset-demo').addEventListener('click', function () {
    if (!confirm('Put the sample customers back the way they started? Leads you sent from the website stay.')) return;
    var keep = (DS.read() || []).filter(function (l) { return !l.sample; });
    DS.write(keep); seed(); route(); toast('Demo data reset.');
  });

  function boot() {
    var authed = sessionStorage.getItem(AUTH) === '1';
    document.getElementById('login').hidden = authed;
    document.getElementById('app').hidden = !authed;
    if (!authed) { document.querySelector('#login input').focus(); return; }
    if (!localStorage.getItem(SEEDED)) seed();
    if (!location.hash) location.hash = '#leads'; else route();
  }

  // ---------- router ----------
  window.addEventListener('hashchange', route);
  function route() {
    if (sessionStorage.getItem(AUTH) !== '1') return;
    var parts = location.hash.slice(1).split('/');
    var name = parts[0] || 'leads';
    document.querySelectorAll('[data-tab]').forEach(function (t) {
      var on = t.dataset.tab === name || (name === 'customer' && t.dataset.tab === 'leads') || (name === 'estimate' && t.dataset.tab === 'pipeline');
      t.classList.toggle('on', on); if (on) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
    });
    var fn = { leads: Leads, pipeline: Pipeline, customer: Customer, estimate: Estimate, schedule: Schedule, reminders: Reminders }[name] || Leads;
    view.innerHTML = fn(parts[1]);
    if (fn.after) fn.after(parts[1]);
    badges();
    view.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
  function badges() {
    var all = leads(), n = all.filter(function (l) { return l.stage === 'new'; }).length;
    var due = all.filter(function (l) { return l.doneDate && (l.stage === 'paid' || l.stage === 'done') && (dueDate(l) - Date.now()) < 90 * 864e5 && !l.reminded; }).length;
    var b1 = document.getElementById('badge-new'), b2 = document.getElementById('badge-due');
    b1.hidden = !n; b1.textContent = n; b2.hidden = !due; b2.textContent = due;
  }

  // ---------- shared bits ----------
  function stagePill(s) { return '<span class="pill pill-' + s + '">' + STAGE_NAME[s] + '</span>'; }
  function srcTag(s) { return '<span class="src src-' + s + '">' + esc(SOURCE[s] || s) + '</span>'; }
  function chip(c) { return c ? '<span class="chip" style="background:' + esc(c.hex) + '" title="' + esc(c.name) + '"></span>' : ''; }
  function head(title, sub, right) { return '<div class="vh"><div><h1>' + title + '</h1>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>' + (right || '') + '</div>'; }
  function smsLink(phone, body) { return 'sms:' + digits(phone) + '?&body=' + encodeURIComponent(body); }
  function mailLink(email, subj, body) { return 'mailto:' + encodeURIComponent(email || '') + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(body); }

  // ---------- LEADS ----------
  var leadFilter = 'all';
  function Leads() {
    var all = leads();
    var filters = [['all', 'All'], ['new', 'New'], ['estimate', 'Photo estimate'], ['calculator', 'Calculator'], ['visualizer', 'Visualizer'], ['contact', 'Contact']];
    var list = all.filter(function (l) {
      if (leadFilter === 'all') return l.stage !== 'paid';
      if (leadFilter === 'new') return l.stage === 'new';
      return l.source === leadFilter;
    });
    var newCount = all.filter(function (l) { return l.stage === 'new'; }).length;
    return head('Leads', newCount ? '<strong>' + newCount + ' new</strong>. Call or text them first.' : 'All caught up.', '<button class="b b-cedar" data-act="add-lead">+ Add a lead</button>') +
      '<div class="add-lead" id="add-lead" hidden><form id="add-form" class="card form-grid">' +
        '<label class="f"><span>Name</span><input name="name" required></label>' +
        '<label class="f"><span>Phone</span><input name="phone" type="tel" required></label>' +
        '<label class="f"><span>Address or area</span><input name="address"></label>' +
        '<label class="f"><span>How they found you</span><select name="source"><option value="phone">Phone call</option><option value="referral">Referral</option></select></label>' +
        '<label class="f f-wide"><span>Notes</span><input name="notes" placeholder="What do they want done?"></label>' +
        '<button class="b b-forest" type="submit">Save lead</button></form></div>' +
      '<div class="chips">' + filters.map(function (f) { return '<button class="fchip' + (leadFilter === f[0] ? ' on' : '') + '" data-filter="' + f[0] + '">' + f[1] + '</button>'; }).join('') + '</div>' +
      (list.length ? '<ul class="lead-list">' + list.map(function (l) {
        return '<li><a class="lead-row' + (l.stage === 'new' ? ' is-new' : '') + '" href="#customer/' + l.id + '">' +
          (l.photos && l.photos[0] ? '<img src="' + esc(img(l.photos[0])) + '" alt="">' : '<span class="noimg">' + esc(first(l.name).charAt(0)) + '</span>') +
          '<span class="lr-main"><strong>' + esc(l.name) + '</strong><span class="lr-sub">' + esc(l.address || '') + '</span>' +
          '<span class="lr-meta">' + srcTag(l.source) + ' ' + (estLabel(l) ? '<span class="lr-est">' + estLabel(l) + '</span>' : '') + (l.deck && l.deck.size ? ' <span class="lr-size">' + esc(l.deck.size) + '</span>' : '') + ' ' + chip(l.color) + '</span></span>' +
          '<span class="lr-right">' + stagePill(l.stage) + '<small>' + ago(l.createdAt) + '</small></span></a></li>';
      }).join('') + '</ul>' : '<p class="empty">Nothing here yet.</p>') +
      '<p class="hint">Leads from the website (photo estimates, the calculator, the color visualizer and the contact form) show up here on their own. Try it: <a href="../estimate/" target="_blank" rel="noopener">send a test estimate</a>.</p>';
  }
  Leads.after = function () {
    view.querySelectorAll('[data-filter]').forEach(function (b) { b.addEventListener('click', function () { leadFilter = b.dataset.filter; route(); }); });
    view.querySelector('[data-act="add-lead"]').addEventListener('click', function () { var a = document.getElementById('add-lead'); a.hidden = !a.hidden; if (!a.hidden) a.querySelector('input').focus(); });
    document.getElementById('add-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target, d = { name: f.name.value.trim(), phone: f.phone.value.trim(), address: f.address.value.trim(), source: f.source.value, notes: f.notes.value.trim() };
      if (!d.name) return;
      DS.addLead(d); toast('Lead saved.'); route();
    });
  };

  // ---------- PIPELINE ----------
  function Pipeline() {
    var all = leads();
    var cols = STAGES.map(function (s) {
      var items = all.filter(function (l) { return l.stage === s[0]; });
      if (s[0] === 'paid') items = items.filter(function (l) { return Date.now() - new Date(l.paidDate || l.createdAt) < 60 * 864e5; });
      var sum = items.reduce(function (a, l) { return a + estTotal(l); }, 0);
      return '<section class="col" data-stage="' + s[0] + '"><header><h2>' + s[1] + '</h2><span>' + items.length + (sum ? ' · ' + money(sum) : '') + '</span></header>' +
        '<ul>' + items.map(function (l) {
          var i = STAGES.findIndex(function (x) { return x[0] === l.stage; });
          return '<li class="pcard" draggable="true" data-id="' + l.id + '">' +
            '<a href="#customer/' + l.id + '"><strong>' + esc(l.name) + '</strong><span>' + esc((l.address || '').split(',').pop().trim()) + '</span>' +
            (estLabel(l) ? '<em>' + estLabel(l) + '</em>' : '') + (l.jobDate ? '<span class="pdate">📅 ' + nice(fromYmd(l.jobDate)) + '</span>' : '') + '</a>' +
            '<div class="pmove">' + (i > 0 ? '<button data-move="-1" aria-label="Move back to ' + STAGES[i - 1][1] + '">◀</button>' : '<span></span>') +
            (i < STAGES.length - 1 ? '<button data-move="1" class="fwd">' + STAGES[i + 1][1] + ' ▶</button>' : '') + '</div></li>';
        }).join('') + '</ul></section>';
    }).join('');
    return head('Pipeline', 'Move each job along as it happens. Tap the button to push it to the next step.') + '<div class="board">' + cols + '</div>' +
      '<p class="hint">Paid jobs drop off the board after 60 days. They stay in the customer list and come back as re-coat reminders.</p>';
  }
  function move(id, dir) {
    var l = get(id), i = STAGES.findIndex(function (x) { return x[0] === l.stage; }), to = STAGES[i + dir];
    if (!to) return;
    setStage(id, to[0]);
  }
  function setStage(id, stage) {
    update(id, function (l) {
      l.stage = stage;
      if (stage === 'done' && !l.doneDate) l.doneDate = new Date().toISOString();
      if (stage === 'paid' && !l.paidDate) l.paidDate = new Date().toISOString();
      if (stage === 'estimate' && l.estimateDoc && !l.estimateDoc.sentAt) l.estimateDoc.sentAt = new Date().toISOString();
    }, 'Moved to ' + STAGE_NAME[stage]);
    toast('Moved to ' + STAGE_NAME[stage] + (stage === 'done' ? '. Send a review request!' : ''));
  }
  Pipeline.after = function () {
    view.querySelectorAll('[data-move]').forEach(function (b) {
      b.addEventListener('click', function () { move(b.closest('.pcard').dataset.id, +b.dataset.move); route(); });
    });
    var dragId = null;
    view.querySelectorAll('.pcard').forEach(function (c) { c.addEventListener('dragstart', function (e) { dragId = c.dataset.id; e.dataTransfer.effectAllowed = 'move'; }); });
    view.querySelectorAll('.col').forEach(function (col) {
      col.addEventListener('dragover', function (e) { e.preventDefault(); col.classList.add('over'); });
      col.addEventListener('dragleave', function () { col.classList.remove('over'); });
      col.addEventListener('drop', function (e) { e.preventDefault(); col.classList.remove('over'); if (dragId) { setStage(dragId, col.dataset.stage); route(); } });
    });
  };

  // ---------- CUSTOMER CARD ----------
  function Customer(id) {
    var l = get(id);
    if (!l) return '<p class="empty">Customer not found. <a href="#leads">Back to leads</a></p>';
    var d = l.deck || {};
    var maps = 'https://maps.google.com/?q=' + encodeURIComponent(l.address || '');
    var reviewText = 'Hi ' + first(l.name) + ', thanks for having us out to do your deck! If you\'re happy with it, would you leave us a quick Google review? It really helps a small business. ' + C.business.googleReviewUrl + ' — ' + C.business.name;
    var isDone = l.stage === 'done' || l.stage === 'paid';
    var detail = function (k, v) { return v ? '<div><dt>' + k + '</dt><dd>' + v + '</dd></div>' : ''; };
    var fin = d.finish ? d.finish.charAt(0).toUpperCase() + d.finish.slice(1) : '';
    var cond = d.condition ? d.condition.charAt(0).toUpperCase() + d.condition.slice(1) : '';
    return '<a class="back" href="#leads">← Leads</a>' +
      '<div class="cust-head"><div><h1>' + esc(l.name) + '</h1><p>' + esc(l.address || 'No address yet') + '</p><p class="meta">' + srcTag(l.source) + ' · came in ' + ago(l.createdAt) + (l.heard ? ' · heard from: ' + esc(l.heard) : '') + '</p></div>' +
      '<label class="stage-select"><span>Stage</span><select id="stage">' + STAGES.map(function (s) { return '<option value="' + s[0] + '"' + (s[0] === l.stage ? ' selected' : '') + '>' + s[1] + '</option>'; }).join('') + '</select></label></div>' +
      '<div class="quick">' +
        (l.phone ? '<a class="q" href="tel:' + digits(l.phone) + '"><b>📞</b>Call</a><a class="q" href="' + smsLink(l.phone, 'Hi ' + first(l.name) + ', this is ' + C.business.name + ' about your deck. ') + '"><b>💬</b>Text</a>' : '') +
        (l.email ? '<a class="q" href="mailto:' + esc(l.email) + '"><b>✉️</b>Email</a>' : '') +
        (l.address ? '<a class="q" href="' + maps + '" target="_blank" rel="noopener"><b>📍</b>Map</a>' : '') +
        '<a class="q q-cedar" href="#estimate/' + l.id + '"><b>🧾</b>' + (l.estimateDoc ? 'Edit estimate' : 'Build estimate') + '</a>' +
      '</div>' +
      (isDone ? '<section class="card review-card"><h2>' + (l.reviewRequested ? 'Review request sent ✓' : 'Ask for a Google review') + '</h2>' +
        '<p>' + (l.reviewRequested ? 'Sent ' + ago(l.reviewRequested) + '. You can send a friendly reminder once if they haven\'t left one.' : 'The job is done. Happy customers rarely think to leave a review unless you ask. One tap:') + '</p>' +
        '<div class="row"><a class="b b-cedar" data-review="sms" href="' + smsLink(l.phone, reviewText) + '">Text the review link</a>' +
        '<a class="b b-outline" data-review="email" href="' + mailLink(l.email, 'Thanks from ' + C.business.name, reviewText) + '">Email it</a></div>' +
        '<details class="tpl"><summary>See the message</summary><p>' + esc(reviewText) + '</p></details></section>' : '') +
      '<div class="cust-grid">' +
        '<section class="card"><h2>Deck</h2><dl class="dl">' +
          detail('Size', esc(d.size || (d.sqft ? d.sqft + ' sq ft' : ''))) + detail('Sq ft', d.sqft) + detail('Railing', d.rail ? d.rail + ' ft' : '') + detail('Stairs', d.stairs ? d.stairs + ' steps' : '') +
          detail('Condition', esc(cond)) + detail('Finish', esc(fin)) +
          detail('Color', l.color ? chip(l.color) + ' ' + esc(l.color.name) : '') + detail('Estimate', estLabel(l)) +
          detail('When', esc(l.timeframe)) + detail('Service', esc(l.service)) + detail('Plan', esc(l.plan)) +
          detail('Job date', l.jobDate ? nice(fromYmd(l.jobDate), true) : '') + detail('Done', l.doneDate ? nice(l.doneDate, true) : '') +
          detail('Re-coat due', l.doneDate ? nice(dueDate(l), true) : '') +
        '</dl>' +
        (l.stage === 'won' || l.stage === 'scheduled' ? '<label class="f"><span>Job date (2-day job)</span><input type="date" id="jobdate" value="' + (l.jobDate || '') + '"></label>' : '') +
        '</section>' +
        '<section class="card"><h2>Photos</h2>' + (l.photos && l.photos.length ? '<div class="photos">' + l.photos.map(function (p) { return '<a href="' + esc(img(p)) + '" target="_blank" rel="noopener"><img src="' + esc(img(p)) + '" alt="Customer photo"></a>'; }).join('') + '</div>' : '<p class="muted">No photos yet. Text them and ask for one wide shot of the whole deck.</p>') + '</section>' +
        '<section class="card"><h2>Notes</h2>' + (l.notes ? '<p class="note">' + esc(l.notes) + '</p>' : '') +
          '<form id="note-form" class="row"><input name="n" placeholder="Add a note…" aria-label="Add a note"><button class="b b-forest" type="submit">Add</button></form></section>' +
        '<section class="card"><h2>History</h2><ol class="hist">' + (l.history || []).slice().reverse().map(function (h) { return '<li><time>' + nice(h.at) + '</time>' + esc(h.text) + '</li>'; }).join('') + '</ol>' +
          '<p class="muted small">Contact: ' + esc(l.phone || '') + (l.email ? ' · ' + esc(l.email) : '') + '</p></section>' +
      '</div>';
  }
  Customer.after = function (id) {
    var s = document.getElementById('stage');
    if (s) s.addEventListener('change', function () { setStage(id, s.value); route(); });
    var jd = document.getElementById('jobdate');
    if (jd) jd.addEventListener('change', function () {
      update(id, function (l) { l.jobDate = jd.value; l.days = l.days || 2; if (l.stage === 'won') l.stage = 'scheduled'; }, 'Scheduled for ' + nice(fromYmd(jd.value), true));
      toast('Scheduled.'); route();
    });
    var nf = document.getElementById('note-form');
    if (nf) nf.addEventListener('submit', function (e) { e.preventDefault(); var v = nf.n.value.trim(); if (!v) return; update(id, function () {}, v); route(); });
    view.querySelectorAll('[data-review]').forEach(function (a) {
      a.addEventListener('click', function () { update(id, function (l) { l.reviewRequested = new Date().toISOString(); }, 'Review request sent by ' + (a.dataset.review === 'sms' ? 'text' : 'email')); setTimeout(route, 400); });
    });
  };

  // ---------- ESTIMATE BUILDER ----------
  function defaultDoc(l) {
    var p = C.pricing, d = l.deck || {};
    var fin = p.finishes[d.finish] || p.finishes['semi-transparent'];
    var cond = p.condition[d.condition] || p.condition.good;
    var rate = Math.round(((fin.low + fin.high) / 2) * cond.mult * 100) / 100;
    var lines = [{ label: 'Deck floor: wash, brighten, ' + (d.finish || 'semi-transparent') + ' stain' + (d.condition === 'peeling' ? ' (strip old finish)' : ''), qty: d.sqft || 0, unit: 'sq ft', price: rate }];
    if (d.rail) lines.push({ label: 'Railing', qty: d.rail, unit: 'ft', price: Math.round((p.railingPerFt.low + p.railingPerFt.high) / 2 * cond.mult) });
    if (d.stairs) lines.push({ label: 'Stairs', qty: d.stairs, unit: 'steps', price: Math.round((p.stairPerStep.low + p.stairPerStep.high) / 2) });
    return { lines: lines, discount: 0, depositPct: C.depositPercent, total: 0 };
  }
  function calcDoc(doc) {
    var sub = doc.lines.reduce(function (a, x) { return a + (+x.qty || 0) * (+x.price || 0); }, 0);
    var total = Math.max(0, sub - (+doc.discount || 0));
    if (sub > 0 && total < C.pricing.minimumJob) total = C.pricing.minimumJob;
    return { sub: sub, total: Math.round(total), deposit: Math.round(total * (+doc.depositPct || 0) / 100) };
  }
  var draft = null;
  function Estimate(id) {
    var l = get(id);
    if (!l) return '<p class="empty">Not found.</p>';
    if (!draft || draft.id !== id) draft = { id: id, doc: JSON.parse(JSON.stringify(l.estimateDoc && l.estimateDoc.lines.length ? l.estimateDoc : defaultDoc(l))) };
    var doc = draft.doc, t = calcDoc(doc), B = C.business, w = C.warranty;
    var rows = doc.lines.map(function (x, i) {
      return '<tr><td><input data-i="' + i + '" data-k="label" value="' + esc(x.label) + '" aria-label="Item"></td><td><input data-i="' + i + '" data-k="qty" type="number" step="any" value="' + esc(x.qty) + '" aria-label="Quantity"></td><td class="unit">' + esc(x.unit || '') + '</td><td><input data-i="' + i + '" data-k="price" type="number" step="any" value="' + esc(x.price) + '" aria-label="Price each"></td><td class="amt">' + money((+x.qty || 0) * (+x.price || 0)) + '</td><td><button class="x" data-del="' + i + '" aria-label="Remove line">×</button></td></tr>';
    }).join('');
    var addons = (C.pricing.addOns || []).map(function (a) { return '<button class="fchip" data-addon="' + a.id + '">+ ' + esc(a.label) + '</button>'; }).join('');
    return '<a class="back no-print" href="#customer/' + id + '">← ' + esc(l.name) + '</a>' +
      head('Estimate', 'Change any number. Totals update as you type.', '<div class="row no-print"><button class="b b-outline" id="print">Print / PDF</button><button class="b b-cedar" id="save-est">Save &amp; mark sent</button></div>') +
      '<div class="est-doc">' +
        '<div class="est-top"><div><strong class="est-biz">' + esc(B.name) + '</strong><span>' + esc(B.street) + ', ' + esc(B.city) + ', ' + esc(B.state) + ' ' + esc(B.zip) + '</span><span>' + esc(B.phone) + ' · ' + esc(B.email) + '</span><span>' + esc(B.license) + '</span></div>' +
          '<div class="est-for"><span class="mono">Estimate for</span><strong>' + esc(l.name) + '</strong><span>' + esc(l.address || '') + '</span><span>' + esc(l.phone || '') + '</span><span>' + nice(new Date(), true) + '</span></div></div>' +
        '<table class="est-table"><thead><tr><th>Item</th><th>Qty</th><th></th><th>Price</th><th>Amount</th><th></th></tr></thead><tbody>' + rows + '</tbody></table>' +
        '<div class="row no-print"><button class="b b-ghost" id="add-line">+ Add a line</button>' + addons + '</div>' +
        '<div class="est-totals">' +
          '<div><span>Subtotal</span><b>' + money(t.sub) + '</b></div>' +
          '<div><span>Discount</span><b>−$<input id="disc" type="number" value="' + esc(doc.discount) + '" aria-label="Discount"></b></div>' +
          '<div class="tot"><span>Total</span><b>' + money(t.total) + '</b></div>' +
          '<div><span>Deposit to book (<input id="dep" type="number" value="' + esc(doc.depositPct) + '" aria-label="Deposit percent">%)</span><b>' + money(t.deposit) + '</b></div>' +
          (t.total === C.pricing.minimumJob && t.sub < C.pricing.minimumJob ? '<p class="muted small">Minimum job price applied.</p>' : '') +
        '</div>' +
        '<div class="est-terms"><p><strong>Warranty:</strong> ' + esc(w.summary) + '</p><p>Price good for 30 days. Weather may move your start date. We\'ll text you before we come. Wood condition can change once it\'s clean, and we\'ll talk with you before doing anything extra.</p>' +
        (l.color ? '<p><strong>Color:</strong> ' + esc(l.color.name) + ' (' + esc(l.color.type) + ')</p>' : '') +
        '<div class="sign"><span>Customer signature</span><span>Date</span></div></div>' +
      '</div>';
  }
  Estimate.after = function (id) {
    var doc = draft.doc;
    view.querySelectorAll('[data-i]').forEach(function (inp) {
      inp.addEventListener('change', function () { var x = doc.lines[+inp.dataset.i]; x[inp.dataset.k] = inp.dataset.k === 'label' ? inp.value : +inp.value; route(); });
    });
    view.querySelectorAll('[data-del]').forEach(function (b) { b.addEventListener('click', function () { doc.lines.splice(+b.dataset.del, 1); route(); }); });
    document.getElementById('add-line').addEventListener('click', function () { doc.lines.push({ label: 'Extra work', qty: 1, unit: 'job', price: 0 }); route(); });
    view.querySelectorAll('[data-addon]').forEach(function (b) {
      b.addEventListener('click', function () {
        var a = C.pricing.addOns.filter(function (x) { return x.id === b.dataset.addon; })[0], l = get(id);
        doc.lines.push({ label: a.label, qty: a.unit === 'sq ft' ? ((l.deck && l.deck.sqft) || 0) : 1, unit: a.unit, price: a.price }); route();
      });
    });
    document.getElementById('disc').addEventListener('change', function (e) { doc.discount = +e.target.value || 0; route(); });
    document.getElementById('dep').addEventListener('change', function (e) { doc.depositPct = +e.target.value || 0; route(); });
    document.getElementById('print').addEventListener('click', function () { window.print(); });
    document.getElementById('save-est').addEventListener('click', function () {
      var t = calcDoc(doc); doc.total = t.total; doc.sentAt = new Date().toISOString();
      update(id, function (l) { l.estimateDoc = doc; if (['new', 'contacted'].indexOf(l.stage) > -1) l.stage = 'estimate'; }, 'Estimate sent: ' + money(t.total));
      draft = null; toast('Saved. Marked as Estimate Sent.'); location.hash = '#customer/' + id;
    });
  };

  // ---------- SCHEDULE ----------
  var monthOffset = 0;
  function jobDays(l) { var out = [], d = fromYmd(l.jobDate); for (var i = 0; i < (l.days || 2); i++) { out.push(ymd(d)); d.setDate(d.getDate() + 1); if (d.getDay() === 0) d.setDate(d.getDate() + 1); } return out; }
  function Schedule() {
    var all = leads(), rain = rainDays();
    var jobs = all.filter(function (l) { return l.jobDate && ['scheduled', 'won', 'done'].indexOf(l.stage) > -1; });
    var needs = all.filter(function (l) { return l.stage === 'won' && !l.jobDate; });
    var now = new Date(), m = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    var start = new Date(m); start.setDate(1 - m.getDay());
    var byDay = {}; jobs.forEach(function (l) { jobDays(l).forEach(function (d, i) { (byDay[d] = byDay[d] || []).push({ l: l, n: i + 1 }); }); });
    var cells = '';
    for (var i = 0; i < 42; i++) {
      var d = new Date(start); d.setDate(start.getDate() + i);
      var k = ymd(d), isRain = rain.indexOf(k) > -1, inMonth = d.getMonth() === m.getMonth(), today = k === ymd(now);
      var items = byDay[k] || [];
      cells += '<div class="day' + (inMonth ? '' : ' out') + (today ? ' today' : '') + (isRain ? ' rain' : '') + '" data-day="' + k + '">' +
        '<div class="day-h"><span>' + d.getDate() + '</span><button class="rain-btn" data-rain="' + k + '" aria-label="' + (isRain ? 'Clear rain' : 'Mark rain') + ' on ' + nice(d) + '" title="Mark a rain day">' + (isRain ? '🌧' : '☁︎') + '</button></div>' +
        items.map(function (it) { return '<a class="job' + (isRain ? ' clash' : '') + '" href="#customer/' + it.l.id + '">' + esc(first(it.l.name)) + ' <small>day ' + it.n + '</small></a>'; }).join('') + '</div>';
    }
    var clashes = jobs.filter(function (l) { return l.stage !== 'done' && jobDays(l).some(function (d) { return rain.indexOf(d) > -1; }); });
    var upcoming = jobs.filter(function (l) { return l.stage === 'scheduled' && fromYmd(l.jobDate) >= new Date(now.getFullYear(), now.getMonth(), now.getDate()); }).sort(function (a, b) { return a.jobDate < b.jobDate ? -1 : 1; });
    return head('Schedule', 'Most jobs take 2 days: wash day, then stain day. Tap ☁︎ on a day to mark rain.', '<div class="row"><button class="b b-ghost" data-mo="-1">◀</button><strong class="mo">' + m.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) + '</strong><button class="b b-ghost" data-mo="1">▶</button></div>') +
      (clashes.length ? '<div class="alert">🌧 <strong>' + clashes.length + ' job' + (clashes.length > 1 ? 's' : '') + ' land on a rain day.</strong> ' + clashes.map(function (l) { return '<button class="b b-sm b-cedar" data-push="' + l.id + '">Move ' + esc(first(l.name)) + ' to next dry day</button>'; }).join(' ') + '</div>' : '') +
      '<div class="sched"><div class="cal"><div class="dow">' + ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(function (x) { return '<span>' + x + '</span>'; }).join('') + '</div><div class="grid">' + cells + '</div></div>' +
      '<aside class="sched-side">' +
        '<section class="card"><h2>Next up</h2>' + (upcoming.length ? '<ul class="up">' + upcoming.map(function (l) { return '<li><a href="#customer/' + l.id + '"><strong>' + nice(fromYmd(l.jobDate)) + '</strong> ' + esc(l.name) + '<small>' + esc(l.address || '') + '</small></a></li>'; }).join('') + '</ul>' : '<p class="muted">Nothing booked.</p>') + '</section>' +
        '<section class="card"><h2>Needs a date</h2>' + (needs.length ? needs.map(function (l) { return '<div class="need"><a href="#customer/' + l.id + '">' + esc(l.name) + '</a><input type="date" data-sched="' + l.id + '" aria-label="Pick a date for ' + esc(l.name) + '"></div>'; }).join('') : '<p class="muted">All won jobs are booked.</p>') + '</section>' +
        '<p class="hint">Mockup: you mark rain days by hand. The real version pulls the National Weather Service forecast for your area every morning and flags jobs on rainy days for you.</p>' +
      '</aside></div>';
  }
  function nextDry(fromKey, days) {
    var rain = rainDays(), d = fromYmd(fromKey);
    for (var tries = 0; tries < 60; tries++) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() === 0) continue;
      var ok = true, c = new Date(d);
      for (var i = 0; i < days; i++) { if (rain.indexOf(ymd(c)) > -1) { ok = false; break; } c.setDate(c.getDate() + 1); if (c.getDay() === 0) c.setDate(c.getDate() + 1); }
      if (ok) return ymd(d);
    }
    return fromKey;
  }
  Schedule.after = function () {
    view.querySelectorAll('[data-mo]').forEach(function (b) { b.addEventListener('click', function () { monthOffset += +b.dataset.mo; route(); }); });
    view.querySelectorAll('[data-rain]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); var r = rainDays(), k = b.dataset.rain, i = r.indexOf(k); if (i > -1) r.splice(i, 1); else r.push(k); setRain(r); route(); });
    });
    view.querySelectorAll('[data-push]').forEach(function (b) {
      b.addEventListener('click', function () {
        var l = get(b.dataset.push), to = nextDry(l.jobDate, l.days || 2);
        update(l.id, function (x) { x.jobDate = to; }, 'Rain delay. Moved to ' + nice(fromYmd(to), true));
        toast(first(l.name) + ' moved to ' + nice(fromYmd(to)) + '. Text them!'); route();
      });
    });
    view.querySelectorAll('[data-sched]').forEach(function (inp) {
      inp.addEventListener('change', function () { update(inp.dataset.sched, function (l) { l.jobDate = inp.value; l.days = 2; l.stage = 'scheduled'; }, 'Scheduled for ' + nice(fromYmd(inp.value), true)); toast('Booked.'); route(); });
    });
  };

  // ---------- RE-COAT REMINDERS ----------
  function Reminders() {
    var all = leads().filter(function (l) { return l.doneDate && (l.stage === 'paid' || l.stage === 'done'); });
    var now = Date.now();
    var rows = all.map(function (l) { return { l: l, due: dueDate(l), days: Math.round((dueDate(l) - now) / 864e5) }; }).sort(function (a, b) { return a.due - b.due; });
    var groups = [
      ['Overdue', rows.filter(function (r) { return r.days < 0; })],
      ['Due in the next 90 days', rows.filter(function (r) { return r.days >= 0 && r.days <= 90; })],
      ['Later', rows.filter(function (r) { return r.days > 90; })]
    ];
    var potential = rows.filter(function (r) { return r.days <= 90; }).reduce(function (a, r) { return a + (r.l.deck && r.l.deck.sqft ? r.l.deck.sqft * 0.95 : 300); }, 0);
    return head('Re-coat reminders', 'This is where repeat work comes from. A maintenance coat at 2–3 years is a quick job, and customers who hear from you first don\'t call someone else.') +
      '<div class="stat-row"><div class="stat"><b>' + groups[0][1].length + '</b><span>overdue</span></div><div class="stat"><b>' + groups[1][1].length + '</b><span>due soon</span></div><div class="stat"><b>' + money(potential) + '</b><span>in re-coat work waiting (est.)</span></div></div>' +
      groups.map(function (g) {
        if (!g[1].length) return '';
        return '<h2 class="grp">' + g[0] + '</h2><ul class="rem-list">' + g[1].map(function (r) {
          var l = r.l, yrs = recoatYears(l);
          var msg = 'Hi ' + first(l.name) + ', it\'s ' + C.business.name + '. It\'s been about ' + yrs + ' years since we stained your deck' + (l.color ? ' (' + l.color.name + ')' : '') + '. A quick maintenance coat now keeps it from needing a full strip later. Want me to pencil you in this season?';
          return '<li class="rem' + (l.reminded ? ' done' : '') + '"><div class="rem-main">' + chip(l.color) + '<div><a href="#customer/' + l.id + '"><strong>' + esc(l.name) + '</strong></a><span>' + esc(l.address || '') + '</span>' +
            '<small>Last job ' + nice(l.doneDate, true) + ' · ' + esc((l.deck && l.deck.finish) || '') + ' · due ' + nice(r.due, true) + (r.days < 0 ? ' (<b class="late">' + (-r.days) + ' days late</b>)' : ' (in ' + r.days + ' days)') + '</small>' +
            (l.reminded ? '<small class="ok">Reminded ' + ago(l.reminded) + '</small>' : '') + '</div></div>' +
            '<div class="row"><a class="b b-cedar b-sm" data-remind="' + l.id + '" href="' + smsLink(l.phone, msg) + '">Text reminder</a>' +
            '<a class="b b-outline b-sm" data-remind="' + l.id + '" href="' + mailLink(l.email, 'Time for a deck re-coat?', msg) + '">Email</a>' +
            '<button class="b b-ghost b-sm" data-repeat="' + l.id + '">Add to pipeline</button></div></li>';
        }).join('') + '</ul>';
      }).join('') +
      '<p class="hint">Re-coat timing comes from your settings: ' + Object.keys(C.reminderYears).map(function (k) { return k + ' ' + C.reminderYears[k] + ' yrs'; }).join(', ') + '. The real version texts these automatically if you turn that on.</p>';
  }
  Reminders.after = function () {
    view.querySelectorAll('[data-remind]').forEach(function (a) {
      a.addEventListener('click', function () { update(a.dataset.remind, function (l) { l.reminded = new Date().toISOString(); }, 'Re-coat reminder sent'); setTimeout(route, 400); });
    });
    view.querySelectorAll('[data-repeat]').forEach(function (b) {
      b.addEventListener('click', function () {
        var o = get(b.dataset.repeat);
        DS.addLead({ name: o.name, phone: o.phone, email: o.email, address: o.address, source: 'reminder', stage: 'contacted', color: o.color,
          deck: { sqft: o.deck && o.deck.sqft, finish: o.deck && o.deck.finish, condition: 'good', size: o.deck && o.deck.sqft ? o.deck.sqft + ' sq ft' : '' },
          notes: 'Repeat customer. Maintenance coat, same color' + (o.color ? ' (' + o.color.name + ')' : '') + '.' });
        update(o.id, function (l) { l.reminded = l.reminded || new Date().toISOString(); }, 'Added a re-coat job to the pipeline');
        toast('Added to pipeline as Contacted.'); route();
      });
    });
  };

  boot();
})();
