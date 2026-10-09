"""Re-render the homepage visualizer teaser images (src/assets/img/teaser-N.jpg).
Uses the same tint math as src/assets/js/visualizer.js. Run after changing stain colors:
    python3 tools/render-teaser.py
Needs Pillow only."""
import json
from PIL import Image, ImageDraw, ImageFilter
cfg = json.load(open('site.config.json'))
PICKS = [('semi-transparent', 0), ('semi-transparent', 1), ('semi-transparent', 3), ('semi-transparent', 4), ('solid', 2)]  # keep in sync with TEASER in src/content/pages.mjs
POLY = [[0.20, 1], [0.26, 0.86], [0.35, 0.72], [0.43, 0.67], [0.52, 0.665], [0.70, 0.66], [0.70, 0.70], [0.68, 0.74], [0.72, 0.80], [0.76, 1]]
MODES = {'transparent': (0.55, 1.0), 'semi-transparent': (0.80, 0.85), 'solid': (0.95, 0.28)}
im = Image.open('src/assets/img/hero-wooded-deck.jpg').convert('RGB'); W, H = im.size
m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon([(x * W, y * H) for x, y in POLY], fill=255)
m = list(m.filter(ImageFilter.GaussianBlur(1.5)).getdata())
px = list(im.getdata())
lum = [(0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 for r, g, b in px]
sel = [l for l, a in zip(lum, m) if a > 128]; mean = sum(sel) / len(sel)
for k, (typ, i) in enumerate(PICKS):
    s = cfg['stains'][typ][i]; c = [int(s['hex'][j:j + 2], 16) for j in (1, 3, 5)]
    cl = (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255; a0, g = MODES[typ]
    out = []
    for (r, gg, b), l, mm in zip(px, lum, m):
        if mm == 0: out.append((r, gg, b)); continue
        a = mm / 255 * a0; f = max(0.05, cl + (l - mean) * g) / cl
        out.append(tuple(max(0, min(255, int(o + (cc * f - o) * a))) for o, cc in zip((r, gg, b), c)))
    o = Image.new('RGB', (W, H)); o.putdata(out); o.save(f'src/assets/img/teaser-{k}.jpg', quality=80)
    print('teaser', k, s['name'])
