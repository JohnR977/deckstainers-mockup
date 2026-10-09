/* Shared "clean, then stain" math, used by the color visualizer and the home page teaser.
   1. CLEAN (optional): simulates a wash + brightener on the marked boards. Gray weathering and
      mildew blotches (the slow, large-scale dark/light patches) are pulled toward an even,
      fresh-wood tan, while the fine detail (grain, board gaps, nail lines) is kept and slightly
      sharpened. 35% of the large-scale shading stays, so real shadows don't vanish.
   2. STAIN: each marked pixel keeps its own lightness relative to the deck's average, so grain,
      knots and shadows show through (strongly on transparent, lightly on solid).
   It's a simulation, not a photo of the finished job, and the page says so. */
(function () {
  // coverage = how much the stain hides the wood; grain = how much texture survives.
  var MODES = {
    'transparent':      { alpha: 0.55, grain: 1.0 },
    'semi-transparent': { alpha: 0.80, grain: 0.85 },
    'solid':            { alpha: 0.95, grain: 0.28 },
    'none':             { alpha: 0,    grain: 1.0 }   // "just cleaned", no stain
  };
  // Cleaning settings: fresh, washed-and-brightened wood tone and how strongly to apply it.
  var FRESH = [206, 153, 97], FRESH_L = (0.2126 * 206 + 0.7152 * 153 + 0.0722 * 97) / 255;
  var CLEAN = { strength: 0.88, targetL: 0.58, keepShading: 0.35, grainBoost: 1.25 };

  // Large-scale lightness (box blur via a summed-area table). Computed once per photo.
  function blurLum(lum, W, H) {
    var R = Math.max(6, Math.round(W / 50)), S = new Float64Array((W + 1) * (H + 1)), out = new Float32Array(W * H);
    for (var y = 0; y < H; y++) { var row = 0; for (var x = 0; x < W; x++) { row += lum[y * W + x]; S[(y + 1) * (W + 1) + x + 1] = S[y * (W + 1) + x + 1] + row; } }
    for (var y2 = 0; y2 < H; y2++) for (var x2 = 0; x2 < W; x2++) {
      var x0 = Math.max(0, x2 - R), x1 = Math.min(W, x2 + R + 1), y0 = Math.max(0, y2 - R), y1 = Math.min(H, y2 + R + 1);
      out[y2 * W + x2] = (S[y1 * (W + 1) + x1] - S[y0 * (W + 1) + x1] - S[y1 * (W + 1) + x0] + S[y0 * (W + 1) + x0]) / ((x1 - x0) * (y1 - y0));
    }
    return out;
  }
  // Settings for one render: M = average lightness of the marked deck in the original photo.
  function cleanPlan(blur, M) { return { blur: blur, M: M, T: 0.5 * M + 0.5 * CLEAN.targetL }; }
  function hexToRgb(h) { var n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function luminance(data) {
    var lum = new Float32Array(data.length / 4);
    for (var i = 0, p = 0; i < lum.length; i++, p += 4) lum[i] = (0.2126 * data[p] + 0.7152 * data[p + 1] + 0.0722 * data[p + 2]) / 255;
    return lum;
  }
  // Average lightness of the marked (alpha > 50%) pixels. mask = RGBA data for the full image.
  function meanOf(lum, mask) {
    var sum = 0, n = 0;
    for (var i = 0, p = 3; i < lum.length; i += 3, p += 12) if (mask[p] > 128) { sum += lum[i]; n++; }
    return n ? sum / n : 0.5;
  }
  // Tint a rectangle. orig/out: full-image RGBA; mask: RGBA for just the rectangle.
  // Clean (if o.clean) then stain a rectangle. orig/out: full-image RGBA; mask: RGBA for just the rectangle.
  function apply(o) {
    var mode = MODES[o.type] || MODES['semi-transparent'], c = hexToRgb(o.hex || '#000000');
    var cl = (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255 || 0.01;
    var r = o.rect, W = o.width, od = o.orig, out = o.out, m = o.mask, rw = r.x1 - r.x0, k = o.clean;
    var mean = k ? k.T : o.mean;
    for (var y = r.y0; y < r.y1; y++) {
      for (var x = r.x0; x < r.x1; x++) {
        var gi = y * W + x, p = gi * 4, ma = m[((y - r.y0) * rw + (x - r.x0)) * 4 + 3] / 255;
        if (ma <= 0) { out[p] = od[p]; out[p + 1] = od[p + 1]; out[p + 2] = od[p + 2]; out[p + 3] = 255; continue; }
        var sr = od[p], sg = od[p + 1], sb = od[p + 2], sl = o.lum[gi];
        if (k) {
          // washed + brightened wood: even out the big blotches, keep (and lift) the grain
          var nl = k.T + (k.blur[gi] - k.M) * CLEAN.keepShading + (sl - k.blur[gi]) * CLEAN.grainBoost;
          nl = nl < 0.04 ? 0.04 : nl > 0.96 ? 0.96 : nl;
          var g = nl / FRESH_L, ca = ma * CLEAN.strength;
          sr += (FRESH[0] * g - sr) * ca; sg += (FRESH[1] * g - sg) * ca; sb += (FRESH[2] * g - sb) * ca;
          sl = sl + (nl - sl) * ca;
        }
        var a = ma * mode.alpha;
        if (a > 0) {
          var f = Math.max(0.05, cl + (sl - mean) * mode.grain) / cl;
          sr += (c[0] * f - sr) * a; sg += (c[1] * f - sg) * a; sb += (c[2] * f - sb) * a;
        }
        out[p] = sr; out[p + 1] = sg; out[p + 2] = sb; out[p + 3] = 255;
      }
    }
  }
  // Fill a polygon given as fractions of the picture ([[0,0],[1,0],…]) onto a canvas context.
  function fillOutline(ctx, outline, W, H) {
    ctx.beginPath();
    outline.forEach(function (pt, i) { i ? ctx.lineTo(pt[0] * W, pt[1] * H) : ctx.moveTo(pt[0] * W, pt[1] * H); });
    ctx.closePath(); ctx.fill();
  }

  // Home page teaser: tint the sample deck live in each swatch color.
  function teaser(el) {
    var frame = el.querySelector('.viz-demo-frame'), sw = [].slice.call(el.querySelectorAll('li[data-hex]'));
    var outline = JSON.parse(el.dataset.outline || '[[0,0],[1,0],[1,1],[0,1]]');
    var img = new Image();
    img.onload = function () {
      var W = Math.min(1100, img.naturalWidth), H = Math.round(img.naturalHeight * W / img.naturalWidth);
      var base = document.createElement('canvas'); base.width = W; base.height = H;
      var bx = base.getContext('2d'); bx.drawImage(img, 0, 0, W, H);
      var orig = bx.getImageData(0, 0, W, H).data, lum = luminance(orig);
      var mk = document.createElement('canvas'); mk.width = W; mk.height = H;
      var mx = mk.getContext('2d'); mx.fillStyle = '#000'; fillOutline(mx, outline, W, H);
      var mask = mx.getImageData(0, 0, W, H).data, mean = meanOf(lum, mask);
      var plan = el.dataset.clean === 'false' ? null : cleanPlan(blurLum(lum, W, H), mean);
      var canvases = sw.map(function (s) {
        var c = document.createElement('canvas'); c.width = W; c.height = H; c.className = 'viz-demo-tint'; c.setAttribute('aria-hidden', 'true');
        frame.appendChild(c); return c;
      });
      var done = {};
      function show(k) {
        if (!done[k]) {
          var cx = canvases[k].getContext('2d'), out = cx.createImageData(W, H);
          apply({ orig: orig, out: out.data, mask: mask, lum: lum, mean: mean, clean: plan, width: W, rect: { x0: 0, y0: 0, x1: W, y1: H }, hex: sw[k].dataset.hex, type: sw[k].dataset.type });
          cx.putImageData(out, 0, 0); done[k] = 1;
        }
        sw.forEach(function (s, j) { s.classList.toggle('is-on', j === k); });
        canvases.forEach(function (c, j) { c.classList.toggle('is-on', j === k); });
      }
      var i = 0, timer;
      sw.forEach(function (s, j) { s.addEventListener('click', function () { clearInterval(timer); i = j; show(i); }); });
      show(0);
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(function () { i = (i + 1) % sw.length; show(i); }, 2600);
    };
    img.src = el.dataset.src;
  }

  window.Tint = { MODES: MODES, luminance: luminance, meanOf: meanOf, blurLum: blurLum, cleanPlan: cleanPlan, apply: apply, fillOutline: fillOutline, teaser: teaser };
  document.querySelectorAll('[data-viz-demo]').forEach(teaser);
})();
