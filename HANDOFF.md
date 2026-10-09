# HANDOFF: DECKSTAINERS.COM — the turnkey staining contractor website + CRM (MOCKUP)
For Claude Code · written 2026-10-08 for John Roth. The job is for his son Caleb.

---

## 1. WHAT THIS IS, IN ONE BREATH
Caleb runs **Stain & Seal Supply** (stainandsealsupply.com). Staining contractors join his **Pro Partners**
program. He wants an **all-in-one package** for them: a professional website plus a simple CRM on the back
end, built for the **one-guy-in-a-truck, two-guys-in-a-truck** staining business.

This build is the **mockup** that proves it. It is set up as **deckstainers.com**, SEO-tuned for
**Chattanooga, Tennessee**. Caleb will look at it on GitHub Pages and decide.

**The bar: it has to look like a professional marketing agency built it, not AI.** That's the whole test.

## 2. READ THESE FIRST
1. `RESEARCH.md` in this folder: 16 competitor sites reviewed, what every top site has, the gaps we can
   own, homeowner questions with sources, the visualizer plan, expert links and Chattanooga SEO. **Build
   from it.**
2. `CALEB_NOTES.md`: Caleb's own wishes, transcribed from a voice recording. **If this file exists, it
   overrides anything here.** If it doesn't exist yet, build from this handoff and list your assumptions
   in the report.

## 3. WHAT TO BUILD
A static site that runs on **GitHub Pages**: plain HTML/CSS/JS, or Astro/Vite building to static files. No
server needed for the mockup. **One config file** (`site.config.json` or similar) holds the business name,
phone, city, service areas, colors, logo, prices and warranty, so any Pro Partner can be swapped in. That
is the "turnkey" part. **Show the swap working**: a second config, e.g. a fictional Knoxville company, that
builds the same site with different details.

### A. The public website (deckstainers.com, Chattanooga)
Pages:
- **Home**, in this order:
  - hero: H1 with Chattanooga in it, "Get a Free Estimate" button, click-to-call
  - trust bar
  - services
  - 4-step process
  - before/after slider
  - finish options
  - reviews
  - visualizer teaser
  - service areas
  - FAQ
  - closing CTA
- **Service pages:** Deck Staining · Deck Cleaning & Restoration (wash, strip, brighten, sand) · Fence Staining ·
  Log Home & Cabin Staining · Pergolas/Porches · Maintenance Plans (with prices shown; this is the gap nobody fills).
- **Service-area pages:** one per city in RESEARCH.md. Each needs real, different local copy (Signal Mountain
  shade and mildew, North Shore older homes, Lookout Mountain views, the GA side, and so on). **No copy-paste
  pages with the city name swapped.** Google punishes that, and it reads like AI.
- **Pricing / Estimate Calculator:** deck size (L×W or sq ft), railing feet, stairs, condition (good / weathered /
  peeling), finish type → a price **range**. Use config numbers, and tell the homeowner the range is confirmed
  after photos or a visit.
- **Color Visualizer** (see C).
- **Get an Estimate:** the photo-upload estimate form (up to 5 photos, ask for one wide shot of the whole deck),
  plus name, phone, email, address, deck size, timeframe and how they heard about us.
- **Learn:** 4–6 real articles:
  - Best time to stain a deck in Chattanooga (Sept–Oct, with the climate facts cited)
  - Oil vs. water-based
  - Semi-transparent vs. solid (tell the honest disagreement)
  - New pressure-treated wood: when to stain
  - Why decks peel
  - How often to restain in Tennessee humidity

  Each one links out to the expert sources in RESEARCH.md. **These outbound links to experts are a feature
  Caleb asked for.**
- **About**, **Warranty** (clear written terms, as config values), **Contact**, **Privacy**.

SEO, done properly:
- unique titles and meta descriptions
- LocalBusiness / HomeAndConstructionBusiness + Service + FAQPage JSON-LD
- sitemap.xml and robots.txt
- Open Graph tags
- fast pages, alt text, mobile first

**While it sits on GitHub Pages as a mockup, add `noindex`** so Google doesn't index a demo. Remove it at launch.

### B. The CRM back end ("Pro Partner Dashboard")
A simple CRM for a one- or two-man crew. For the mockup, store data in the browser (localStorage) and
seed realistic **fictional** sample data. Put it behind a fake login at `/dashboard`.

Screens:
- **Leads:** every form, calculator and visualizer submission lands here with its photos and source.
- **Pipeline board:** New → Contacted → Estimate Sent → Won → Scheduled → Done → Paid.
- **Customer card:** contact info, deck details, photos, color chosen, notes, history.
- **Estimate builder:** sq ft × rate, add-ons, deposit → printable estimate.
- **Schedule:** a simple job calendar with weather/rain days in mind.
- **Maintenance reminders:** "this deck is due for re-coat" at 2–3 years. This is the money feature: recurring work.
- **Review request:** after a job is marked Done, a one-click text/email asking for a Google review.

**Keep it SIMPLE.** These men are in a truck, on a phone. Big buttons. Write it at an 8th-grade level.

Write `CRM_PLAN.md` explaining how the real version would work later: a real database (e.g. Supabase or Neon), logins, texting, and email. **Don't build any of that now.**

### C. The color visualizer (the showpiece)
1. The homeowner uploads a photo of the deck, or picks one of 3 sample decks.
2. They brush or click to mark the deck boards, with a simple polygon/brush tool, an eraser, and undo.
3. They pick a stain color: a swatch grid by opacity (transparent, semi-transparent, solid) with generic color
   names like "Cedar," "Redwood," "Walnut," "Driftwood Gray." **Don't use brand color names or trademarks**
   unless the config lists the brands the Pro Partner actually carries.
4. The deck is tinted in the browser with a luminance-preserving blend, so the wood grain shows through on
   semi-transparent. Show before/after with a slider.
5. To download the full render or "send me this look," they enter name and email, and it becomes a CRM lead
   with the image attached.

Write `VISUALIZER_PLAN.md` for later upgrades: auto-masking with Segment Anything, and an optional AI
"cleaned and stained" enhance pass. **Don't call any paid API in the mockup.**

## 4. DESIGN: MAKE IT LOOK AGENCY-BUILT
- Pick a real design direction and commit to it. Something like: warm wood tones, deep forest green or
  charcoal, one strong serif for headlines and a clean sans for body, generous white space, real photo crops.
- **Avoid the AI look:** no purple gradients, no glassy cards everywhere, no emoji icons, no "Elevate your
  outdoor oasis" copy, no stock-sounding filler, and no identical card grids on every section.
- **Copy reads like a local tradesman wrote it** with a good marketer's help: short, specific, confident.
  "We wash, we brighten, we stain. Most decks take two days."
- **Photos:**
  - Use free-license stock (Unsplash/Pexels) of decks.
  - **Record each photo's source and license** in `CREDITS.md`.
  - Mark every placeholder photo clearly in the config so Caleb knows to swap in real job photos.

## 5. HARD RULES
1. **No fake reviews presented as real.** Review cards say "Sample review — replace with your Google reviews,"
   or come from a config list left empty. Same for star counts, BBB ratings, years in business and license
   numbers: they're config values marked SAMPLE. Never invent ones that look real.
2. **Don't copy any competitor's text or design.** Learn the patterns and write everything new.
3. **Cite every fact** (cost, recoat years, climate) with a link, from RESEARCH.md or a new real source.
   Never make up a number.
4. **The sample business is fictional:** "DeckStainers of Chattanooga." Never use a real Chattanooga company's
   name, logo or phone. Use 555-style phone numbers.
5. Stay in this folder. Back up before replacing files. Never delete; move throwaways to `_to_delete/`.
   Commit to git as you go.

## 6. PUT IT ON GITHUB (so Caleb can look)
- Repo name: **`deckstainers-mockup`** under John's GitHub account (JohnR977).
- Turn on **GitHub Pages** from the main branch / `docs` folder (or a Pages workflow for Astro/Vite).
- Free-plan Pages needs a **public** repo. That's fine: the data is fictional and the page is `noindex`.
- If you're not logged in to GitHub on this Mac, **don't stop.** Finish the build, then write the exact
  steps in the report so John can push it with one paste.
- **Give John the live URL** (e.g. `https://johnr977.github.io/deckstainers-mockup/`).

## 7. FINISH WITH A REPORT → `REPORT.md` (plain English, 5-minute read for John)
- The live link, and the dashboard link with the demo login.
- What was built, page by page.
- **What Caleb should look at first:** visualizer, calculator, dashboard pipeline.
- Assumptions you made, especially anything CALEB_NOTES.md didn't cover.
- Which sample items must be replaced before going live: photos, reviews, prices, license and warranty.
- What the real (non-mockup) version would need, with rough costs: domain, hosting, database, texting.
