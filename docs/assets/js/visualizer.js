/* Deck stain color visualizer.
   The homeowner marks the deck boards (brush / outline / eraser, with undo), picks a stain,
   and we tint only the marked pixels. The tint keeps each pixel's own lightness relative to the
   deck's average, so wood grain, knots and shadows still show through, strongly for transparent
   and semi-transparent, lightly for solid. Nothing leaves the browser unless they ask for the image.
   Upgrades (Segment Anything auto-mask, AI enhance pass) are described in VISUALIZER_PLAN.md. */
(function () {
  var root = document.getElementById('viz');
  if (!root) return;
  var $ = function (id) { return document.getElementById(id); };
  var base = $('viz-base'), outC = $('viz-out'), maskC = $('viz-mask'), ui = $('viz-ui');
  var bctx = base.getContext('2d'), octx = outC.getContext('2d'), mctx = maskC.getContext('2d', { willReadFrequently: true }), uctx = ui.getContext('2d');
  var MAX_W = 1400;
  var W = 0, H = 0, orig = null, lum = null, outData = null, meanL = 0.5;
  var tool = 'brush', size = 40, poly = [], undo = [], drawing = false, last = null, dirty = null, raf = 0;
  var color = { hex: '#a85a2c', name: 'Cedar', type: 'semi-transparent' };
  var sampleId = null, hasMask = false;
  var dataRoot = document.body.dataset.root || '../';

  function setStep(n) { document.querySelectorAll('.viz-steps [data-step]').forEach(function (s) { s.classList.toggle('is-on', +s.dataset.step <= n); }); }

  // ---------- load an image ----------
  function load(src, id) {
    var img = new Image();
    img.onload = function () {
      var s = Math.min(1, MAX_W / img.naturalWidth);
      W = Math.round(img.naturalWidth * s); H = Math.round(img.naturalHeight * s);
      [base, outC, maskC, ui].forEach(function (c) { c.width = W; c.height = H; });
      bctx.drawImage(img, 0, 0, W, H);
      orig = bctx.getImageData(0, 0, W, H);
      lum = Tint.luminance(orig.data);
      outData = octx.createImageData(W, H);
      outData.data.set(orig.data);
      octx.putImageData(outData, 0, 0);
      mctx.clearRect(0, 0, W, H);
      undo = []; poly = []; hasMask = false; sampleId = id || null;
      size = +$('viz-size').value * (W / 1000);
      $('viz-empty').hidden = true;
      $('viz-canvas-wrap').hidden = false;
      $('viz-toolbar').hidden = false;
      $('viz-help').hidden = false;
      $('viz-auto').hidden = !sampleId;
      $('viz-compare').hidden = true;
      $('viz-get').disabled = true;
      setStep(2);
      if (sampleId) applyPreset();
    };
    img.src = src;
  }

  $('viz-file').addEventListener('change', function (e) {
    var f = e.target.files[0]; if (!f) return;
    var fr = new FileReader(); fr.onload = function () { load(fr.result, null); }; fr.readAsDataURL(f);
  });
  document.querySelectorAll('.viz-sample').forEach(function (b) {
    b.addEventListener('click', function () {
      var s = window.SITE.samples.filter(function (x) { return x.id === b.dataset.sample; })[0];
      load(dataRoot + 'assets/img/' + s.file, s.id);
    });
  });
  $('viz-new').addEventListener('click', function () {
    $('viz-empty').hidden = false; $('viz-canvas-wrap').hidden = true; $('viz-toolbar').hidden = true; $('viz-help').hidden = true; setStep(1);
    $('viz-file').value = '';
  });

  // ---------- mask editing ----------
  function snapshot() { undo.push(mctx.getImageData(0, 0, W, H)); if (undo.length > 25) undo.shift(); }
  function grow(x0, y0, x1, y1) {
    var pad = size;
    var r = { x0: Math.max(0, Math.floor(Math.min(x0, x1) - pad)), y0: Math.max(0, Math.floor(Math.min(y0, y1) - pad)), x1: Math.min(W, Math.ceil(Math.max(x0, x1) + pad)), y1: Math.min(H, Math.ceil(Math.max(y0, y1) + pad)) };
    dirty = dirty ? { x0: Math.min(dirty.x0, r.x0), y0: Math.min(dirty.y0, r.y0), x1: Math.max(dirty.x1, r.x1), y1: Math.max(dirty.y1, r.y1) } : r;
    if (!raf) raf = requestAnimationFrame(function () { raf = 0; var d = dirty; dirty = null; render(d); });
  }
  function pt(e) {
    var r = ui.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
  }
  function stroke(a, b) {
    mctx.save();
    mctx.globalCompositeOperation = tool === 'erase' ? 'destination-out' : 'source-over';
    mctx.strokeStyle = mctx.fillStyle = '#b0602b';
    mctx.lineWidth = size; mctx.lineCap = mctx.lineJoin = 'round';
    mctx.beginPath(); mctx.moveTo(a.x, a.y); mctx.lineTo(b.x + 0.01, b.y); mctx.stroke();
    mctx.restore();
    hasMask = true;
    grow(a.x, a.y, b.x, b.y);
  }
  function fillPoly(points, erase) {
    snapshot();
    mctx.save();
    mctx.globalCompositeOperation = erase ? 'destination-out' : 'source-over';
    mctx.fillStyle = '#b0602b';
    mctx.beginPath();
    points.forEach(function (p, i) { i ? mctx.lineTo(p.x, p.y) : mctx.moveTo(p.x, p.y); });
    mctx.closePath(); mctx.fill(); mctx.restore();
    hasMask = true;
    render(null);
  }
  function drawUI(hover) {
    uctx.clearRect(0, 0, W, H);
    var lw = Math.max(2, W / 500);
    if (poly.length) {
      uctx.strokeStyle = '#fff'; uctx.lineWidth = lw; uctx.setLineDash([lw * 4, lw * 3]);
      uctx.beginPath(); poly.forEach(function (p, i) { i ? uctx.lineTo(p.x, p.y) : uctx.moveTo(p.x, p.y); });
      if (hover) uctx.lineTo(hover.x, hover.y);
      uctx.stroke(); uctx.setLineDash([]);
      poly.forEach(function (p, i) { uctx.fillStyle = i === 0 ? '#d99b62' : '#fff'; uctx.beginPath(); uctx.arc(p.x, p.y, lw * (i === 0 ? 4 : 2.5), 0, 7); uctx.fill(); });
    } else if (hover && tool !== 'poly') {
      uctx.strokeStyle = 'rgba(255,255,255,.9)'; uctx.lineWidth = lw;
      uctx.beginPath(); uctx.arc(hover.x, hover.y, size / 2, 0, 7); uctx.stroke();
    }
  }

  ui.addEventListener('pointerdown', function (e) {
    if (!orig) return;
    var p = pt(e);
    if (tool === 'poly') {
      var close = poly.length > 2 && Math.hypot(p.x - poly[0].x, p.y - poly[0].y) < Math.max(14, W / 60);
      if (close) { fillPoly(poly, false); poly = []; drawUI(); return; }
      poly.push(p); drawUI(p); return;
    }
    ui.setPointerCapture(e.pointerId);
    snapshot(); drawing = true; last = p; stroke(p, p);
  });
  ui.addEventListener('pointermove', function (e) {
    if (!orig) return;
    var p = pt(e);
    if (drawing) { stroke(last, p); last = p; }
    drawUI(p);
  });
  ['pointerup', 'pointercancel'].forEach(function (ev) {
    ui.addEventListener(ev, function () { if (drawing) { drawing = false; render(null); } });
  });
  ui.addEventListener('pointerleave', function () { if (!drawing) drawUI(null); });
  ui.addEventListener('dblclick', function () { if (tool === 'poly' && poly.length > 2) { fillPoly(poly, false); poly = []; drawUI(); } });

  document.querySelectorAll('[data-tool]').forEach(function (b) {
    b.addEventListener('click', function () {
      tool = b.dataset.tool; poly = []; drawUI();
      document.querySelectorAll('[data-tool]').forEach(function (x) { x.classList.toggle('is-on', x === b); });
    });
  });
  $('viz-size').addEventListener('input', function (e) { size = +e.target.value * (W / 1000 || 1); });
  $('viz-undo').addEventListener('click', function () {
    if (poly.length) { poly.pop(); drawUI(); return; }
    var s = undo.pop(); if (!s) return; mctx.putImageData(s, 0, 0); render(null);
  });
  $('viz-clear').addEventListener('click', function () { snapshot(); mctx.clearRect(0, 0, W, H); hasMask = false; render(null); });
  $('viz-toggle-mask').addEventListener('click', function (e) { var on = maskC.classList.toggle('is-visible'); e.currentTarget.classList.toggle('is-on', on); });
  // Each sample photo's rough deck outline comes from site.config.json → visualizer.samples[].deckOutline
  function applyPreset() {
    var s = window.SITE.samples.filter(function (x) { return x.id === sampleId; })[0];
    if (!s || !s.deckOutline) return;
    fillPoly(s.deckOutline.map(function (p) { return { x: p[0] * W, y: p[1] * H }; }), false);
  }
  $('viz-auto').addEventListener('click', applyPreset);

  // ---------- tint (math lives in tint.js, shared with the home page teaser) ----------
  function render(rect) {
    if (!orig) return;
    var full = !rect;
    var r = rect || { x0: 0, y0: 0, x1: W, y1: H };
    if (r.x1 - r.x0 <= 0 || r.y1 - r.y0 <= 0) return;
    var m = mctx.getImageData(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0).data;
    if (full) meanL = Tint.meanOf(lum, m);
    Tint.apply({ orig: orig.data, out: outData.data, mask: m, lum: lum, mean: meanL, width: W, rect: r, hex: color.hex, type: color.type });
    octx.putImageData(outData, 0, 0, r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0);
    if (full) {
      $('viz-get').disabled = !hasMask;
      if (hasMask) setStep(3);
    }
  }

  // ---------- swatches ----------
  function choose(btn) {
    document.querySelectorAll('.swatch').forEach(function (s) { s.classList.toggle('is-on', s === btn); });
    color = { hex: btn.dataset.hex, name: btn.dataset.name, type: btn.dataset.opacity };
    $('viz-chip').style.background = color.hex;
    $('viz-chosen-name').textContent = color.name;
    $('viz-chosen-type').textContent = btn.dataset.typeLabel;
    render(null);
  }
  document.querySelectorAll('.swatch').forEach(function (b) { b.addEventListener('click', function () { choose(b); }); });
  choose(document.querySelector('.swatch.is-on') || document.querySelector('.swatch'));

  // ---------- before / after ----------
  var cmp = $('viz-compare'), cmpR = $('viz-compare-range');
  function setCmp(v) { outC.style.clipPath = 'inset(0 0 0 ' + v + '%)'; cmp.style.setProperty('--pos', v + '%'); }
  $('viz-compare-btn').addEventListener('click', function (e) {
    var on = cmp.hidden; cmp.hidden = !on; e.currentTarget.classList.toggle('is-on', on);
    if (on) setCmp(cmpR.value); else outC.style.clipPath = '';
  });
  cmpR.addEventListener('input', function () { setCmp(cmpR.value); });

  // ---------- lead gate ----------
  $('viz-get').addEventListener('click', function () { $('viz-lead').hidden = false; $('viz-lead').querySelector('input').focus(); });
  function sideBySide() {
    var c = document.createElement('canvas'), gap = Math.round(W * 0.02), bar = Math.round(H * 0.09);
    c.width = W * 2 + gap; c.height = H + bar;
    var x = c.getContext('2d');
    x.fillStyle = '#1d221f'; x.fillRect(0, 0, c.width, c.height);
    x.drawImage(base, 0, 0); x.drawImage(outC, W + gap, 0);
    x.fillStyle = '#f5f0e6'; x.font = Math.round(bar * 0.38) + 'px Georgia, serif'; x.textBaseline = 'middle';
    x.fillText(window.SITE.words.viz.before, gap, H + bar / 2);
    x.fillText(window.SITE.words.viz.after + ' ' + color.name + ' (' + color.type + ')', W + gap * 2, H + bar / 2);
    x.textAlign = 'right'; x.font = Math.round(bar * 0.28) + 'px sans-serif'; x.fillStyle = '#d99b62';
    x.fillText(window.SITE.name + ' · ' + window.SITE.phone, c.width - gap, H + bar / 2);
    return c;
  }
  DS.extra.visualizer = function (d) {
    var full = sideBySide();
    d.color = { name: color.name, hex: color.hex, type: color.type };
    d.notes = 'Tried ' + color.name + ' (' + color.type + ') in the color visualizer.';
    d.deck = { finish: color.type };
    // store a smaller copy for the CRM; the homeowner downloads the full one
    return DS.shrink(outC.toDataURL('image/jpeg', 0.85), 900, 0.7).then(function (small) {
      d.photos = [small];
      d._download = full.toDataURL('image/jpeg', 0.9);
      return d;
    });
  };
  DS.after = DS.after || {};
  DS.after.visualizer = function (d) {
    var a = document.createElement('a');
    a.href = d._download; a.download = 'my-deck-' + color.name.toLowerCase().replace(/\s+/g, '-') + '.jpg';
    document.body.appendChild(a); a.click(); a.remove();
  };
})();
