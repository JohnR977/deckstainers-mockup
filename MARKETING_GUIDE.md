# Marketing guide: changing words, photos, colors, fonts and the logo

You never need to touch code, the CRM or the pipeline. Each business has **one folder**, and everything on its website comes from that folder:

```
partners/chattanooga/
   site.config.json   ← every word, photo name, color, font and the logo
   images/            ← every picture
   crm.config.json    ← dashboard settings. Not yours, leave it alone.
```

(The Knoxville demo is `partners/knoxville/`, and it works the same way.)

---

## 1. The easy way: edit on the GitHub website

1. Go to the project on GitHub and open `partners/chattanooga/site.config.json`.
2. Click the **pencil icon** ("Edit this file").
3. Press **Ctrl+F** (or **Cmd+F** on a Mac) and **search for the words you see on the website.** Every word lives in this file, so whatever you see on a page, you'll find here.
4. Change the text **between the quote marks**.
5. Click **Commit changes** (green button). Type a short note like "New home page headline" and confirm.
6. Wait about 2 minutes, then refresh the website.

**Did it work?** Open the **Actions** tab on GitHub.
- **Green check:** your change is live.
- **Red X:** something needs fixing. Click the red run, then the **"Check the config files for mistakes"** step. It tells you exactly what's wrong, in plain English, like:
  > `photos.hero says "Deck.JPG" but the file is named "deck.jpg". Capital letters must match exactly.`

  The old version of the site stays up until you fix it, so nothing breaks for customers.

**Undo a change:** open the file on GitHub → **History** → pick the version you want → copy the text back.

## 2. The three rules of this file

The file is in a format called JSON. It's picky, but only about three things:

1. **Only change what's inside the "quotes".** Leave the names on the left side alone (`"headline":`).
2. **Keep the commas** at the ends of lines. A missing or extra comma is the #1 mistake, and the checker tells you the line number.
3. **Use straight quotes `"`, never curly ones `“ ”`.** Don't paste from Word. If your text needs a double quote inside it, type `\"` (example: `"We call it \"the strip job\""`). Apostrophes (`'`) are fine as they are.

Anything starting with `_help` or `_note` is a note for you. The website ignores it.

## 3. Where things are

Searching for the words you see is fastest. This map helps when you're adding something new:

| On the website | In site.config.json |
|---|---|
| Business name, phone, address, hours, license | `business` |
| Colors, fonts, logo | `brand` (see section 6) |
| Home page hero photo, About photo, before/after pair | `photos` |
| Every headline, paragraph, button and FAQ on fixed pages | `wording` → `home`, `pricingPage`, `estimatePage`, `aboutPage`, `warrantyPage`, `contactPage`, `privacyPage`, … |
| Menu at the top / footer links | `wording.nav` / `wording.footer` |
| Google titles and descriptions | `wording.seo` (services, areas and articles have their own `seoTitle` / `description`) |
| The 6 service pages | `services` (each has `name`, `lede`, `intro`, `steps`, `faq`, `photo`) |
| The service-area (city) pages | `areas`, plus `areaGroups` for which cities show and in what order |
| The Learn articles | `articles` (`body` is a list of headings, paragraphs and lists) |
| Reviews | `reviews.items`. Leave the list empty `[]` to hide the section. |
| Stain color names and swatches | `stains` |
| Visualizer sample decks and home page teaser colors | `visualizer` |
| Sources the articles link to (including every EXPERT and Stain & Seal Supply page) | `sources` |
| "We use EXPERT™ Stain & Seal" section on the home page | `wording.home.products` (`"show": false` hides it) |
| Partner line in the footer | `wording.footer.partnerLine` |
| "Go deeper" links under each article | `articles` → `goDeeper` |

**Ask the owner before changing** `pricing`, `maintenancePlans` and `warranty`. Those are prices and promises, not marketing copy.

## 4. Fill-in words and formatting

Words in curly braces fill in automatically, so the copy stays right if the business details change:

| Type | Shows |
|---|---|
| `{business}` / `{short}` | DeckStainers of Chattanooga / DeckStainers |
| `{city}` `{state}` `{stateName}` | Chattanooga · TN · Tennessee |
| `{phone}` `{email}` `{hours}` | from `business` |
| `{crew}` / `{Crew}` | a two-man crew / A two-man crew |
| `{metro}` `{region}` `{radius}` | from `location` |
| `{bestMonths}` `{driestMonths}` `{annualRain}` `{humidity}` | from `location.climate` (real NOAA numbers) |
| `{floorYears}` `{railYears}` | warranty years |
| `{deposit}` `{minimumJob}` | 25% · $650 |
| `{area}` | the city name (area pages only) · `{service}` the service name (service pages only) |

If you mistype one, for example `{citty}`, the checker says *"Did you mean {city}?"*

Formatting, without any code:

| Type | You get |
|---|---|
| `**strong words**` | **strong words** |
| `*your* deck` | *your* deck |
| `[see prices](/pricing/)` | a link to a page on this site (start with `/`) |
| `[Angi](https://www.angi.com/…)` | a link to another website |
| `[Angi](source:angi)` | a link to a source from the `sources` list |
| `{cite:angi}` | a small footnote link to that source |

**Links to EXPERT and Stain & Seal Supply** are already in `sources` (keys like `expertColors`, `supplierExpert`, `supplierProPartner`). Use them anywhere: `[see our colors](source:expertColors)`. Keep links natural and helpful, with descriptive words, not a pile of keyword links. Google discounts links that look like a scheme.

**Facts need a source.** If you add a number (a cost, how many years a stain lasts, rainfall), add the source to `sources` and cite it. Don't invent numbers.

## 5. Changing photos

1. **Prepare the photo:** a JPG about **2000 pixels wide** and under about 1 MB. Name it in **lowercase with dashes**, no spaces: `signal-mountain-cedar-deck.jpg`.
2. **Upload it** to the `images` folder: on GitHub, open `partners/chattanooga/images/` → **Add file → Upload files** → Commit.
3. **Point to it** in `site.config.json`. Find the photo you're replacing (search for its old file name) and type the new name exactly, capital letters included.
4. **Describe it** in the `alt` / `photoAlt` text right next to it, e.g. "Cedar deck in Signal Mountain after a semi-transparent stain." Blind visitors and Google both read this.
5. **Mark it as yours:** change `"isStock": true` (or `"photoIsStock": true`) to `false`. That removes the small "Stock photo — swap in a real job photo" label.

Special cases:
- **Before/after slider** (`photos.beforeAfter`): use two photos of the **same deck from the same spot**, then set `"isIllustration": false`.
- **Visualizer sample decks** (`visualizer.samples`): each one has a `deckOutline` that marks where the deck is. If your new photo is all deck boards, use `[[0,0],[1,0],[1,1],[0,1]]` (the whole picture). Otherwise ask a developer to trace it. The **first** sample is also the photo on the home page teaser.
- The old photo can stay in the folder. The checker lists unused files so you can tidy up later.

## 6. Colors, fonts and the logo (`brand`)

**Colors:** codes like `#1f3a2e`. Find codes at htmlcolorcodes.com.

| Name | Used for |
|---|---|
| `primary` / `primaryDark` | dark bands (the "How it works" section, footer), logo box |
| `accent` / `accentLight` | buttons, small labels, highlights |
| `background` / `backgroundAlt` | page background / tinted sections |
| `text` | body text |

Keep text readable: dark `primary` and `text`, light `background`.

**Fonts:** any font from **fonts.google.com**, typed exactly as Google spells it:

```json
"headings": { "name": "Lora", "weights": "400;500;600", "italic": true },
"body":     { "name": "Source Sans 3", "weights": "400;500;600;700" },
"labels":   { "name": "JetBrains Mono", "weights": "500" }
```

If a font doesn't appear, the font may not come in those weights. Set `"weights": "400"`. A developer can run `npm run check:online` to confirm Google accepts the names.

**Logo:**
- **Image logo:** upload an `.svg` or `.png` (a transparent background is best) to `images/`, then set `"image": "my-logo.svg"` and adjust `"imageHeight"` (in pixels, 40–50 looks right). The Knoxville demo does this.
- **Text logo:** leave `"image": ""` and fill in `mark` (2 letters in the box), `name` and `subline`.
- **Browser tab icon:** `"favicon": "my-icon.png"` (square, 512×512). Leave it empty for an automatic one.

The logo, colors and fonts also brand the Pro Partner Dashboard. You don't touch the dashboard itself.

## 7. Adding and removing things

- **An FAQ question:** copy a whole `{ "q": "...", "a": "..." }` block, paste it below, put a comma between blocks, and change the words.
- **A service area (city):** copy one whole entry in `areas`, then change `slug` (lowercase-with-dashes, e.g. `"walden"`), `name` and every sentence. Then add the slug to a list in `areaGroups`. **Write genuinely local copy.** Google punishes city pages that are the same text with the name swapped, and the checker warns you if two pages read too much alike.
- **An article:** copy one entry in `articles`. Its `body` is a list made of `{ "h2": "Heading" }`, plain `"paragraph text"`, `{ "checklist": ["…", "…"] }`, `{ "steps": [...] }`, `{ "compare": [...] }` and `{ "table": {...} }` blocks.
- **Reviews:** replace the sample `reviews.items` with real Google reviews (with the customer's OK), then set `"sample": false`. Use `[]` to hide the section.
- **Remove a sample tag:** anything shown as `{ "value": "…", "sample": true }` (license number, years in business, rating) shows a SAMPLE tag until you put the real value in and change `true` to `false`.

## 8. For whoever runs the computer (optional)

On a computer with the project and Node installed: `npm run check` (checks for mistakes), `npm run build` (makes the site), `npm run serve` (preview at http://localhost:8080). Code lives in `src/`. Marketing never needs to open it.
