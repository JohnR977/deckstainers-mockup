# CRM plan: from mockup to the real Pro Partner Dashboard

**Today (mockup):** the dashboard at `/dashboard/` is a single page that keeps everything in the browser's `localStorage`. The login is pretend (`demo` / `deck2026`). The sample customers are fictional. Leads sent from the website show up because the site and the dashboard share the same browser storage. That's fine for showing Caleb how it *feels*, but it can't work for real: a homeowner's phone and the contractor's phone don't share storage.

**This document:** how the real version would work. Nothing here is built yet.

---

## 1. What stays the same

The screens. They were designed for the real thing:

| Screen | What it does |
|---|---|
| **Leads** | Every website form (photo estimate, calculator, visualizer, contact) lands here with photos, source and timestamp. "New" leads are flagged. |
| **Pipeline** | New → Contacted → Estimate Sent → Won → Scheduled → Done → Paid. Big "next step" buttons; drag-and-drop on desktop. |
| **Customer card** | Tap-to-call/text/email/map, deck details, photos, chosen color, notes, full history. |
| **Estimate builder** | Sq ft × rate, railings, stairs, add-ons, discount, deposit, then a printable estimate. |
| **Schedule** | Month calendar of 2-day jobs with rain days marked and a "move to next dry day" button. |
| **Re-coat reminders** | Past customers due for a maintenance coat at 2–3 years. One tap to text them. This is the recurring-revenue engine. |
| **Review request** | When a job is marked Done, one tap texts or emails the Google review link. |

The front end is plain JavaScript with no framework, so it can be moved onto a real backend without a rewrite. Every read and write already goes through one small module (`src/assets/js/store.js`). Swapping its insides from `localStorage` to API calls is the main change.

## 2. Architecture

```
Homeowner's browser                     Pro Partner's phone
  website forms ──┐                        dashboard (same screens)
                  ▼                              ▲
          Serverless API  ──────────────►  Postgres database
          (validate, spam check,           (multi-tenant: one row-level
           resize photos)                   "partner_id" on every table)
                  │                              ▲
                  ├──► Photo storage (bucket)    │
                  ├──► Text messages (Twilio) ───┘ (replies come back in)
                  └──► Email (Resend / Postmark)
```

**Recommended stack: Supabase.** One vendor gives you Postgres, logins, file storage, and row-level security (each partner sees only their own customers). It also has a generous free tier to start. **Neon** plus a separate auth provider is a fine alternative if Caleb's team prefers it.

- **Hosting the websites:** stays static (GitHub Pages, Cloudflare Pages or Netlify). Each partner gets their own build from their own folder (`partners/<name>/site.config.json` + `images/`). Dashboard settings stay apart in `crm.config.json`. A custom domain per partner (e.g. `deckstainers.com` for the Chattanooga partner).
- **Forms:** the site posts to one API endpoint (`POST /api/leads`) with the partner's `slug`. The endpoint checks a hidden honeypot field and a rate limit, resizes photos, stores them in a bucket, and inserts the lead.
- **Logins:** email magic link or phone code (no passwords to forget). Roles: `owner`, `crew` (crew can see the schedule and customer cards but not prices, optional), and `admin` (Stain & Seal Supply staff, read-only across partners for support).

## 3. Data model (first cut)

```sql
partners      (id, slug, business_name, phone, timezone, settings_json, created_at)
users         (id, partner_id, name, phone, email, role)
customers     (id, partner_id, name, phone, email, address, lat, lng, created_at)
leads         (id, partner_id, customer_id, source, stage, deck_json, color_json,
               estimate_low, estimate_high, timeframe, heard_from, notes, created_at)
photos        (id, partner_id, lead_id, storage_path, kind /* wide|closeup|visualizer */)
estimates     (id, partner_id, lead_id, lines_json, discount, deposit_pct, total,
               sent_at, accepted_at, pdf_path)
jobs          (id, partner_id, lead_id, start_date, days, status, done_at, paid_at,
               product, color, finish /* drives the re-coat clock */)
rain_days     (id, partner_id, date, source /* manual|forecast */)
reminders     (id, partner_id, job_id, due_on, sent_at, channel, result)
messages      (id, partner_id, customer_id, direction, channel, body, sent_at, status)
events        (id, partner_id, lead_id, at, text)   -- the history timeline
```

Every table carries `partner_id`, and row-level security policies enforce `partner_id = auth.partner_id()`.

## 4. Texting and email

- **Texting (Twilio or similar):** each partner gets a local number. Outbound: estimate ready, "we're on the way," rain delay, review request, re-coat reminder. Inbound replies thread into the customer card. In the US, business texting requires **A2P 10DLC registration** (brand and campaign) before messages are delivered reliably. Budget a week or two for approval.
- **Templates** live in the partner's settings and are written at an 8th-grade level, like the mockup's. The mockup already has review and re-coat messages you can reuse.
- **Email (Resend or Postmark):** estimate PDFs, the visualizer image ("send me this look"), and receipts.
- **Consent:** website forms get a checkbox for "OK to text me about my estimate." Reminder texts honor STOP automatically.

## 5. Automations (the money features)

1. **New lead alert:** text the owner within seconds: "New photo estimate from Megan in Signal Mountain. Tap to see photos."
2. **Rain watch:** every morning, pull the National Weather Service forecast (free API, api.weather.gov) for each job's location. If rain is likely on a booked day, flag it and suggest the next dry day. The owner approves with one tap and the customer gets a text.
3. **Review request:** when a job moves to Done, text the review link that evening (owner can turn it off per job).
4. **Re-coat reminders:** on `done_at + finish_years − 60 days`, queue a reminder. The owner can auto-send or approve each one. Uses the same years the mockup uses (`dashboard.reminderYears` in the config).
5. **Stale lead nudge:** if an estimate has sat in "Estimate Sent" for 5 days, remind the owner to follow up.

## 6. Build order (suggested)

| Phase | What | Rough effort |
|---|---|---|
| 1 | Supabase project, schema, row-level security, login | 1 week |
| 2 | `/api/leads` + photo upload; website forms post to it | 1 week |
| 3 | Swap `store.js` to API calls; dashboard reads live data | 1 week |
| 4 | Estimate PDFs + email | 3–4 days |
| 5 | Texting (10DLC registration starts on day 1 of the project, since it takes time) | 1 week |
| 6 | Rain watch + reminders + review automations (scheduled jobs) | 1 week |
| 7 | Partner onboarding: config form → build → deploy per partner | 1–2 weeks |

## 7. Things to decide with Caleb

- One shared dashboard app for all partners (recommended), or one per partner?
- Who pays for texting: Stain & Seal Supply as part of the package, or the partner directly?
- Should the dashboard order stain from Stain & Seal Supply? A "materials for this job" button that pre-fills an order from the estimate's square footage would tie the CRM to the supply business.
- Is there a monthly subscription for partners, and what's included?
