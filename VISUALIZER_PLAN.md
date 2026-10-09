# Color visualizer: how it works now, and how to upgrade it

## How the mockup works (no paid APIs)

File: `src/assets/js/visualizer.js`. Everything runs in the homeowner's browser.

1. **Photo in.** Upload, or pick one of 3 sample decks. Large photos are scaled to 1400 px wide.
2. **Mark the deck.** Four layers of canvas sit on top of each other: original photo, tinted result, mask, and the drawing UI. Tools:
   - **Brush:** paints the mask with a round brush (size slider).
   - **Outline:** click points around straight-edged areas; click the first point (or double-click) to fill.
   - **Eraser:** removes mask.
   - **Undo:** up to 25 steps. **Clear** and **Show mask** are there too.
   - **Suggest outline** (sample photos only): a hand-drawn rough outline that the homeowner refines.
3. **Tint (luminance-preserving).** For each masked pixel:
   - Measure the pixel's lightness and the average lightness of the whole marked deck.
   - Target lightness = the stain color's own lightness + (this pixel's lightness − deck average) × *grain*.
   - Scale the stain color to that lightness, then blend it over the original by *coverage*.

   | Finish | Coverage | Grain kept |
   |---|---|---|
   | Transparent | 55% | 100% |
   | Semi-transparent | 80% | 85% |
   | Solid | 95% | 28% |

   So knots, board gaps, shadows and grain stay visible on transparent and semi-transparent. On solid they mostly flatten out, just like real solid stain. The rest of the photo (house, trees, furniture outside the mask) is never touched.
4. **Before / after** slider over the result.
5. **Lead gate.** "Send me this look" asks for name and email (phone optional). It saves a lead with the color and a small copy of the render, then downloads a full-size side-by-side image branded with the partner's name and phone.

Edges are only as good as the homeowner's brush work. That's the main thing an upgrade fixes.

The tint math lives in `src/assets/js/tint.js`, shared with the home page teaser, which tints the first sample photo live in the colors listed in `visualizer.teaserColors`. Sample photos, their deck outlines and teaser colors all come from the partner's `site.config.json` → `visualizer`.

## Upgrade 1: auto-masking with Segment Anything (recommended next)

**Goal:** the homeowner taps the deck once and the boards are selected automatically.

- **Model:** Meta's Segment Anything (SAM / SAM 2), Apache-2.0 licensed. Given a photo and one or more tap points, it returns a precise mask.
- **Two ways to run it:**
  1. **In the browser (no server cost):** export SAM's image encoder plus the small mask decoder to ONNX and run them with `onnxruntime-web` (WebGPU/WASM). The encoder is the heavy part. Run it once per photo (a few seconds on a recent phone, faster on desktop), then each tap is near-instant. Lighter variants (MobileSAM, EfficientSAM, SAM 2 "tiny") make this practical on phones.
  2. **On a server:** run the encoder on a hosted GPU (e.g. Replicate or a small GPU worker), send back the image embedding, and decode taps in the browser. Faster on old phones, but it costs per photo.
- **UX:** "Tap the deck floor." Show the mask; "Tap anything we missed" adds points; "Tap to remove" for negative points. Brush and eraser stay for touch-ups. Railings are a separate tap ("Do the railings too?") so homeowners can try two-tone looks (semi on floor, solid on rails).
- **Code changes:** add a `segment(points)` function that writes into the existing mask canvas. Everything downstream (tint, compare, lead gate) stays as is.
- **Privacy:** the browser option keeps photos on the device, which matches the promise on the page today.

## Upgrade 2: optional AI "cleaned and stained" enhance pass

**Goal:** show the deck as if it had been washed and restored, not just recolored. Gray, mildewed boards look like new wood.

- **How:** send the photo **and the mask** to an image-editing model with an inpainting prompt like "freshly cleaned and stained wood deck boards, [color name], semi-transparent, natural grain, same perspective and lighting." Composite the result back **only inside the mask**, so the house, yard and furniture can't change.
- **Why only as an optional extra:** whole-image AI edits regenerate the picture and can change the house, windows or landscaping. That would be misleading in a sales tool. Keeping it masked and labeled ("AI preview: your real result will vary") keeps it honest.
- **Cost control:** run it only behind the lead gate (after name/email), cache results per photo + color, and cap it per visitor per day.
- **Where it runs:** a serverless function holds the API key. The browser never sees it.

## Upgrade 3: smaller wins

- **Real product colors:** if a partner lists the brands they carry (`business.brandsCarried` in the config), load that brand's color names and swatches instead of generic ones. Get permission or use the manufacturer's published color data.
- **Two-tone:** separate floor and railing masks with their own colors.
- **Save and share:** a short link to the render that the homeowner can text to a spouse, which also lands in the CRM.
- **"Wood type" setting:** gray weathered, new yellow pine, cedar/redwood. Adjusts the base tone before tinting so predictions are closer on very gray or very yellow wood.
