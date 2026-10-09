/* Shared stain-tint math, used by the color visualizer and the home page teaser.
   Each marked pixel keeps its own lightness relative to the deck's average, so wood grain,
   knots and shadows show through (strongly on transparent, lightly on solid). */
(function () {
  // coverage = how much the stain hides the wood; grain = how much texture survives.
  var MODES = {
    'transparent':      { alpha: 0.55, grain: 1.0 },
    'semi-transparent': { alpha: 0.80, grain: 0.85 },
    'solid':            { alpha: 0.95, grain: 0.28 }
  };
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
  function apply(o) {
    var mode = MODES[o.type], c = hexToRgb(o.hex);
    var cl = (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255 || 0.01;
    var r = o.rect, W = o.width, od = o.orig, out = o.out, m = o.mask, rw = r.x1 - r.x0;
    for (var y = r.y0; y < r.y1; y++) {
      for (var x = r.x0; x < r.x1; x++) {
        var gi = y * W + x, p = gi * 4, a = m[((y - r.y0) * rw + (x - r.x0)) * 4 + 3] / 255 * mode.alpha;
        if (a <= 0) { out[p] = od[p]; out[p + 1] = od[p + 1]; out[p + 2] = od[p + 2]; out[p + 3] = 255; continue; }
        var f = Math.max(0.05, cl + (o.lum[gi] - o.mean) * mode.grain) / cl;
        out[p] = od[p] + (c[0] * f - od[p]) * a;
        out[p + 1] = od[p + 1] + (c[1] * f - od[p + 1]) * a;
        out[p + 2] = od[p + 2] + (c[2] * f - od[p + 2]) * a;
        out[p + 3] = 255;
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
      var canvases = sw.map(function (s) {
        var c = document.createElement('canvas'); c.width = W; c.height = H; c.className = 'viz-demo-tint'; c.setAttribute('aria-hidden', 'true');
        frame.appendChild(c); return c;
      });
      var done = {};
      function show(k) {
        if (!done[k]) {
          var cx = canvases[k].getContext('2d'), out = cx.createImageData(W, H);
          apply({ orig: orig, out: out.data, mask: mask, lum: lum, mean: mean, width: W, rect: { x0: 0, y0: 0, x1: W, y1: H }, hex: sw[k].dataset.hex, type: sw[k].dataset.type });
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

  window.Tint = { MODES: MODES, luminance: luminance, meanOf: meanOf, apply: apply, fillOutline: fillOutline, teaser: teaser };
  document.querySelectorAll('[data-viz-demo]').forEach(teaser);
})();
