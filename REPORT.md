# DeckStainers mockup: report for John (5-minute read)

*Built 2026-10-08 · for Caleb / Stain & Seal Supply Pro Partners*

## 1. The links

The site is built and committed, but **it isn't on GitHub yet**. This Mac doesn't have the GitHub command-line tool, and creating the repo is your call, so I stopped short of publishing anything. The one-paste steps are in **section 8**. Once that's done, these are the links:

| What | Link | Login |
|---|---|---|
| **Website (Chattanooga)** | https://johnr977.github.io/deckstainers-mockup/ | — |
| **Pro Partner Dashboard** | https://johnr977.github.io/deckstainers-mockup/dashboard/ | `demo` / `deck2026` |
| **Swap demo (Knoxville company)** | https://johnr977.github.io/deckstainers-mockup/demo-knoxville/ | — |
| Knoxville dashboard | …/demo-knoxville/dashboard/ | `demo` / `knox2026` |

**To look right now on this Mac:** in Terminal, run
`cd "/Users/rothimac/orca/workspaces/Deck Stainers Mock Website./leviathan" && npm run serve`, then open http://localhost:8080.

Screenshots are in the [`screenshots/`](screenshots/) folder: [home](screenshots/home.jpg), [phone](screenshots/home-phone.jpg), [visualizer](screenshots/viz.jpg), [calculator](screenshots/calc.jpg), [pipeline](screenshots/pipeline.jpg), [re-coats](screenshots/recoats.jpg), [dashboard on a phone](screenshots/dash-phone.jpg).

## 1b. Caleb's notes arrived, and how the mockup answers them

Caleb's request (saved in [`CALEB_NOTES.md`](CALEB_NOTES.md)): *a full turnkey website for staining contractors with a CRM on the back end; a plus would be backlinks to experts and a color rendering tool, so homeowners can upload photos of their job and see what it would look like cleaned and stained.*

- **Turnkey site + CRM:** built (sections 3–4 below).
- **Backlinks (to expertwoodcare.com and stainandsealsupply.com, per John):** every contractor site now links to both. There's a "We use EXPERT™ Stain & Seal" home section, a partner line in every footer, "Go deeper" links to EXPERT's own articles at the end of each Learn article, the EXPERT color gallery and Stain & Seal sample fan decks from the visualizer, and the About and Learn pages. The Chattanooga demo alone has **59 links to expertwoodcare.com and 50 to stainandsealsupply.com** across 41 pages, and every URL was checked live. Each partner site adds more, and the wording is editable in the config. *SEO note:* the contextual links in articles and sections are the valuable ones. Identical footer links on many partner sites count for little, and Google can treat them as a link scheme if they're traded for something, so keep them modest and descriptive.
- **"Cleaned and stained" rendering:** the visualizer now **cleans first** (evens out gray weathering and mildew, keeps the grain), **then stains**. There's a "Just cleaned" option and a toggle to compare. It's free and runs in the browser. A more photo-real AI version is the optional upgrade in `VISUALIZER_PLAN.md`.

## 2. What Caleb should look at first

1. **The color visualizer** (`/visualizer/`). For the clean-then-stain effect, pick the **"Close-up of deck boards"** sample (weathered gray), click **Suggest outline**, then try **Just cleaned**, then a stain color, and untick "Clean & brighten first" to compare. Or pick the "Backyard deck in the trees" sample. The deck outline is suggested for him, so he can just click colors. Only the deck boards change; the grain shows through on semi-transparent and flattens on solid. Drag the before/after slider. Then try his own deck photo with the brush. "Send me this look" asks for a name and email, then shows up in the dashboard as a lead with the picture attached.
2. **The price calculator** (`/pricing/`). Deck size, railings, stairs, condition and finish give a price range instantly. Nobody in Chattanooga publishes prices; this is the gap from the research. All rates come from one config file.
3. **The dashboard pipeline** (`/dashboard/`, login `demo` / `deck2026`). Leads → Pipeline → customer card → **Build estimate** (printable) → Schedule (mark a rain day and watch the job turn red with a "move to next dry day" button) → **Re-coats**, the recurring-money screen. Mark a job Done and it offers a one-tap Google review text.
4. **The swap.** Open the Knoxville demo next to the Chattanooga one. Same code, different config file: name, colors, phone, prices, warranty, service areas, local copy and NOAA rainfall all change.

Tip: send a test estimate from the website, then open the dashboard in the **same browser**. It'll be at the top of Leads. (In the mockup, data lives in the browser. The real version needs a database; see `CRM_PLAN.md`.)

## 3. What was built

**Public website, 43 pages** (plain HTML/CSS/JS, no framework, fast):

- **Home** in the order the handoff asked for: hero with "Chattanooga" in the H1, Free Estimate button and click-to-call → trust bar → services → 4-step process → before/after slider → finish options (spec table) → reviews → visualizer teaser → service areas → FAQ (8 questions, cited) → closing call to action.
- **6 service pages:** Deck Staining · Cleaning & Restoration (wash, strip, brighten, sand) · Fence · Log Home & Cabin · Pergolas/Porches · **Maintenance Plans with prices shown**.
- **18 service-area pages**, one per city in the research, each with its own local angle: Signal Mountain shade and mildew, North Shore/St. Elmo multi-layer porch paint, Lookout Mountain tall view decks on both sides of the state line, Harrison and Soddy-Daisy lake moisture, Ooltewah and East Brainerd new builder decks and HOAs, Ringgold's post-2011 rebuilt decks, Dalton and Cleveland batched scheduling, and so on. The build script **warns if two area pages look copy-pasted** (none do).
- **Pricing calculator** (L×W or sq ft, railing feet, stairs, condition, finish, add-ons → range, deposit, "confirmed after photos or a visit").
- **Color visualizer** (brush, outline, eraser, undo, sample decks, generic color names by opacity, luminance-preserving tint, before/after, lead gate).
- **Get an Estimate**: up to 5 photos, with the first slot asking for a wide shot of the whole deck; name, phone, email, address, deck size, timeframe, "how did you hear about us."
- **Learn: 6 articles**, each footnoted with links to the experts: best time to stain in Chattanooga (with a NOAA rainfall chart), oil vs. water-based, semi-transparent vs. solid (it lays out the honest disagreement), new pressure-treated wood, why decks peel, how often to restain in Tennessee humidity.
- **About, Warranty** (terms pulled from the config), **Contact, Privacy, 404.**
- **SEO:** unique titles and descriptions; HomeAndConstructionBusiness, Service, FAQPage, Article and Breadcrumb structured data; sitemap.xml; robots.txt; Open Graph tags; alt text on every image; one H1 per page; mobile-first with a sticky Call / Estimate bar on phones. **Every page carries `noindex`** while it's a mockup. The audit script checks all of this and reports 0 problems.

**Pro Partner Dashboard (CRM):** fake login, sample fictional customers, Leads (filter by source), Pipeline (New → Contacted → Estimate Sent → Won → Scheduled → Done → Paid; tap-to-advance, drag on desktop), Customer card (call/text/email/map, deck details, photos, color, notes, history), Estimate builder (printable/PDF), Schedule (month calendar, 2-day jobs, rain days, auto-reschedule), Re-coat reminders (overdue / due soon, prewritten text), Review request. Big buttons and a bottom tab bar on phones. Written plainly.

**Turnkey part:** each business is **one folder**: `partners/chattanooga/` holds `site.config.json` (every word on every page, every photo name, colors, fonts, logo, prices, warranty, service areas, articles, sources) plus an `images/` folder. Dashboard settings sit apart in `crm.config.json`, so marketing never touches them. `partners/knoxville/` is the fictional **Holston Hollow Deck Co.**, built by the same code with its own image logo, fonts and colors. **[`MARKETING_GUIDE.md`](MARKETING_GUIDE.md)** shows a non-programmer how to change any picture, headline, color, font or the logo on the GitHub website. A checker explains any mistake in plain English, and the site republishes itself in about 2 minutes.

**Docs:** `CRM_PLAN.md` (how the real CRM works: Supabase, logins, texting, email, automations, build order), `VISUALIZER_PLAN.md` (Segment Anything auto-masking, optional AI enhance pass), `CREDITS.md` (every photo with source and license), `README.md` (how to build and add a partner).

## 4. Assumptions

Caleb's notes (above) set the goals but not the details, so these are my calls:

- **Business name** "DeckStainers of Chattanooga": fictional, as the handoff said. Phone (423) 555-0142 is a 555 number.
- **Crew:** "a two-man crew, owner on every job." Hours Mon–Sat 7–6.
- **Prices are samples** chosen to land inside Angi's $2–$4/sq ft national range: semi-transparent $2.40–$3.10/sq ft for a deck in good shape, ×1.25 weathered, ×1.70 peeling; railings $6–9/ft; stairs $18–28/step; $650 minimum; 25% deposit. A 16×12 weathered deck with 28 ft of rail and 4 steps comes out $860–$1,170.
- **Maintenance plans (samples):** $149/yr check-up, $0.95/sq ft maintenance coat every 2–3 years, $39/mo "Worry-Free."
- **Warranty (sample):** 2 years on floors, 3 on vertical surfaces, 1 year for solid stain on floors (because film finishes are known to peel on decks).
- **Re-coat reminders:** semi-transparent and transparent at 2 years, solid at 3.
- **Colors** are generic names (Cedar, Redwood, Walnut, Driftwood Gray…). `brandsCarried` is empty, so no brand names appear.
- **Photos** are free CC0 stock (see CREDITS.md). The before/after pair is an **illustration** made from one stock photo and labeled as such on the site.
- **Reviews** are clearly marked "Sample review — replace with your Google reviews." The star rating, years in business, license number and insurance all show a **SAMPLE** tag. The structured data does *not* publish a star rating until it's real.
- **Rain days** in the dashboard are marked by hand in the mockup; the real version would pull the free National Weather Service forecast.

## 5. Corrections to RESEARCH.md (found while fact-checking)

Every fact on the site was re-checked against its source. A few research items were wrong or dead, so I fixed them on the site:

- **USDA Handbook 647 link is dead** (fpl.fs.usda.gov returns errors). Replaced with the same authors' *Exterior Wood in the South* (FPL-GTR-69), which has the same finish-life table: https://research.fs.usda.gov/download/treesearch/9660.pdf
- **TN licensing link was a 404.** The new page (https://www.tn.gov/commerce/regboards/contractors/license/get/home-improvement.html) says the Home Improvement license covers **$3,000 to $24,999** (not $25,000) in Bradley, Davidson, Hamilton, Haywood, Knox, Marion, Robertson, Rutherford and Shelby counties. Projects of $25,000+ need a full contractor license.
- **Chattanooga rain:** NOAA 1991–2020 normals say **55.00 in./yr**. **October is the driest month (3.59 in.), then August (3.67).** September is wetter (4.23) but ties October for the fewest rainy days. "Sept–Oct is the best season" still holds; the site words it precisely.
- **Oil vs. water-based:** Fine Homebuilding says water-based usually lasts *longer*; Bob Vila says oil lasts longer. The article shows both rather than picking one.
- **NADRA "yearly check"** comes from a different NADRA page than the one in the research; the site links the right one.
- **Bob Vila's low end** is $540, not $550 (Angi's is $550).

## 6. Replace before going live

| Item | Where | Notes |
|---|---|---|
| **Business name, owner, street address, phone, email** | `partners/chattanooga/site.config.json` → `business` | Phone and email are fake (555 / .example). |
| **License #, insurance amount, years in business, star rating, review count** | `business` | Shown with SAMPLE tags until `"sample": false`. |
| **Reviews** | `reviews.items` | Real Google reviews with the customer's OK, or leave the list empty to hide the section. |
| **Prices, minimum, deposit, add-ons** | `pricing` | Set your own. |
| **Maintenance plan prices** | `maintenancePlans` | |
| **Warranty terms** | `warranty` | Have a lawyer read them. |
| **All photos** | `partners/chattanooga/images/` (see MARKETING_GUIDE.md §5) | Real job photos at 1600–2000 px. Especially the before/after pair. |
| **Owner story** | About page | Placeholder paragraph marked Sample. |
| **Google review link** | `business.googleReviewUrl` | Used by the dashboard's review request. |
| **Brands carried** | `business.brandsCarried` | Optional; enables real color names. |
| **Domain + `mockup: false`** | top of config | Removes noindex and the demo banner. |
| **Forms → real backend** | see CRM_PLAN.md | In the mockup, forms only save in the visitor's own browser. |

## 7. What the real (non-mockup) version needs, with rough costs

Checked on vendor pricing pages 2026-10-08. Confirm before quoting a partner.

| Piece | Option | Cost |
|---|---|---|
| Domain | Porkbun .com | **$11.08/yr** ([porkbun](https://porkbun.com/products/domains)). Cloudflare's price isn't published on its page; trackers say about $10–11. |
| Website hosting | GitHub Pages / Cloudflare Pages | **$0.** GitHub Pages: free for public repos, 1 GB site, soft 100 GB/mo bandwidth ([docs](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)). Cloudflare Pages free has no stated bandwidth limit ([docs](https://developers.cloudflare.com/pages/platform/limits/)). |
| Database + logins + photo storage | Supabase | Free to start (500 MB database, 1 GB files; **pauses after 1 week idle**). **Pro $25/mo**, which won't pause and adds daily backups ([pricing](https://supabase.com/pricing)). Neon is a pay-as-you-go alternative. |
| Texting | Twilio | **$1.15/mo** per local number + **$0.0083 per text** + carrier fees of about $0.0035–0.005 per text ([pricing](https://www.twilio.com/en-us/sms/pricing/us)). A one-time A2P 10DLC registration is required; Twilio's help article reportedly lists $4.50–$46 brand + $15 campaign vetting + $1.50–$10/mo, but I couldn't open it to confirm. |
| Email | Resend / Postmark | Resend **free up to 3,000/mo**, $20/mo for 50k ([pricing](https://resend.com/pricing)). Postmark from **$15/mo** ([pricing](https://postmarkapp.com/pricing)). |
| Visualizer auto-mask (optional) | SAM 2 on Replicate | About **$0.018 per photo** ([replicate](https://replicate.com/meta/sam-2)), or $0 if run in the browser (see VISUALIZER_PLAN.md). |
| AI "enhance" pass (optional) | OpenAI image editing | Priced per token; per-image cost not confirmed. Keep it optional and behind the lead gate. |

**Ballpark per partner:** about **$5/month** for a crew sending ~300 texts (number $1.15 + 300 × ~$0.013 per text with carrier fees), plus the 10DLC campaign fee once registered, plus a shared **$25/mo** Supabase Pro for the whole program and ~$11/yr per domain. Development time is the real cost; `CRM_PLAN.md` sketches about 6–8 weeks for one developer.

## 8. Put it on GitHub (one paste)

1. Go to https://github.com/new while signed in as **JohnR977**. Name it `deckstainers-mockup`, set it to **Public**, and **don't** add a README. Click **Create repository**.
2. In Terminal, paste:
   ```bash
   cd "/Users/rothimac/orca/workspaces/Deck Stainers Mock Website./leviathan" && git remote add origin https://github.com/JohnR977/deckstainers-mockup.git && git push -u origin leviathan:main
   ```
   (If it asks for a password, GitHub wants a personal access token, not your account password. Or install the GitHub tool with `brew install gh`, run `gh auth login`, and push again.)
3. On GitHub: **Settings → Pages → Source: GitHub Actions.** That's it. The included workflow (`.github/workflows/deploy.yml`) checks the config, builds both sites and publishes them, now and every time anyone saves a change. Watch it in the **Actions** tab. A green check means it's live.
   *(Fallback: Source "Deploy from a branch" → `main` / `/docs` also works, but then changes made on the GitHub website won't rebuild automatically.)*
4. Open https://johnr977.github.io/deckstainers-mockup/

The data is fictional and every page has `noindex`, so a public repo is fine, as the handoff noted.

## 9. Known limits of the mockup

- The dashboard only sees leads sent from **the same browser**, because there's no server yet.
- Text and email buttons open your phone's messaging and email apps with the message filled in; nothing sends automatically.
- The visualizer's "suggest outline" exists only for the sample photos. For uploads, the homeowner brushes the deck themselves until Segment Anything is added.
- The rawpixel stock photos are 1024 px wide (their bigger files carry a watermark), so they're a bit soft on large screens. Real job photos will fix this.
