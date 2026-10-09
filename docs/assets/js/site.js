/* Site-wide behavior: mobile nav, before/after sliders, FAQ, lead forms, photo slots. */
(function () {
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  // ---- mobile nav ----
  var toggle = $('.nav-toggle'), nav = $('#main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open);
    });
  }

  // ---- before/after sliders ----
  $$('[data-ba]').forEach(function (ba) {
    var frame = $('.ba-frame', ba), range = $('.ba-range', ba);
    var set = function (v) { frame.style.setProperty('--pos', v + '%'); };
    range.addEventListener('input', function () { set(range.value); });
    set(range.value);
  });

  // ---- home visualizer teaser: cycle swatches over the photo ----
  var demo = $('[data-viz-demo]');
  if (demo) {
    var sw = $$('li', demo), img = $('img', demo), i = 0;
    var tint = function (k) {
      sw.forEach(function (s, j) { s.classList.toggle('is-on', j === k); });
      // A light CSS approximation for the teaser. The real tool does per-pixel tinting.
      var hues = ['sepia(.55) saturate(1.3) hue-rotate(-12deg)', 'sepia(.7) saturate(1.6) hue-rotate(-25deg) brightness(.92)', 'sepia(.5) saturate(1.1) brightness(.85)', 'sepia(.6) brightness(.72) saturate(1.2)', 'grayscale(.7) brightness(1.02)'];
      img.style.filter = hues[k % hues.length];
    };
    sw.forEach(function (s, j) { s.addEventListener('click', function () { i = j; tint(i); }); });
    tint(0);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setInterval(function () { i = (i + 1) % sw.length; tint(i); }, 2600);
  }

  // ---- open/close helpers ----
  $$('[data-open]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = document.getElementById(b.dataset.open);
      t.hidden = !t.hidden;
      if (!t.hidden) { var f = $('input', t); if (f) f.focus(); }
    });
  });

  // ---- prefill from URL (?plan=…, ?color=…) ----
  var params = new URLSearchParams(location.search);
  ['plan', 'color'].forEach(function (k) {
    var el = $('input[name="' + k + '"]');
    if (el && params.get(k)) el.value = params.get(k);
  });
  if (params.get('plan')) { var svc = $('select[name="service"]'); if (svc) svc.value = 'Maintenance plan'; }

  // ---- photo slots (estimate form) ----
  var photos = [];
  $$('.photo-slot input[type=file]').forEach(function (inp) {
    inp.addEventListener('change', function () {
      var slot = inp.closest('.photo-slot'), n = +inp.dataset.slot, file = inp.files[0];
      if (!file) return;
      DS.shrink(file, 1000, 0.72).then(function (url) {
        photos[n] = url;
        slot.classList.add('has-img');
        var old = $('img.preview', slot); if (old) old.remove();
        var im = document.createElement('img'); im.className = 'preview'; im.src = url; im.alt = 'Your photo';
        slot.appendChild(im);
        if (!$('.remove', slot)) {
          var x = document.createElement('button'); x.type = 'button'; x.className = 'remove'; x.setAttribute('aria-label', 'Remove photo'); x.textContent = '×';
          x.addEventListener('click', function (e) { e.preventDefault(); photos[n] = null; inp.value = ''; slot.classList.remove('has-img'); var p = $('img.preview', slot); if (p) p.remove(); x.remove(); });
          slot.appendChild(x);
        }
      });
    });
  });

  // ---- lead forms ----
  $$('[data-lead-form]').forEach(function (form) {
    var source = form.dataset.leadForm;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = $('.form-msg', form);
      msg.className = 'form-msg'; msg.textContent = '';
      var bad = $$('[required]', form).filter(function (el) { return !el.value.trim(); });
      var email = $('input[type=email]', form);
      if (email && email.value && !/^\S+@\S+\.\S+$/.test(email.value)) bad.push(email);
      if (bad.length) {
        msg.classList.add('err');
        msg.textContent = 'Please fill in: ' + bad.map(function (el) { return el.closest('.field').querySelector('span').childNodes[0].textContent.trim(); }).join(', ');
        bad[0].focus();
        return;
      }
      var data = {};
      new FormData(form).forEach(function (v, k) { if (typeof v === 'string' && v.trim()) data[k] = v.trim(); });
      data.source = source;
      data.photos = photos.filter(Boolean);
      if (data.size) data.deck = { size: data.size };
      Promise.resolve(DS.extra[source] ? DS.extra[source](data) : data).then(function (d) {
        var priv = {};
        Object.keys(d).forEach(function (k) { if (k.charAt(0) === '_') { priv[k] = d[k]; delete d[k]; } });
        var res = DS.addLead(d);
        if (!res.ok) { msg.classList.add('err'); msg.textContent = 'Sorry, this demo browser is out of storage. Please call us instead.'; return; }
        msg.classList.add('ok');
        var first = (d.name || '').split(' ')[0];
        msg.textContent = {
          estimate: 'Got it, ' + first + '! We\'ll text you a price range soon.',
          calculator: 'Sent! We\'ll confirm your range by text.',
          visualizer: 'Sent! Your image is downloading now.',
          contact: 'Thanks, ' + first + '. We\'ll get back to you today.'
        }[source] + (res.trimmed ? ' (Some photos were too large for this demo.)' : '');
        if (source !== 'visualizer') {
          $$('input:not([type=hidden]), textarea, select', form).forEach(function (el) { if (el.type !== 'file') el.value = ''; });
          $$('.photo-slot', form).forEach(function (s) { s.classList.remove('has-img'); var p = $('img.preview', s); if (p) p.remove(); var x = $('.remove', s); if (x) x.remove(); });
          photos = [];
        }
        if (DS.after && DS.after[source]) DS.after[source](Object.assign({}, d, priv));
      });
    });
  });
})();
