# CRM plan: from mockup to the real Pro Partner Dashboard

**Today (mockup):** the dashboard at `/dashboard/` is a single page that keeps everything in the browser's `localStorage`. The login is pretend (`demo` / `deck2026`). The sample customers are fictional. Leads sent from the website show up because the site and the dashboard share the same browser storage. That's fine for showing Caleb how it *feels*, but it can't work for real: a homeowner's phone and the contractor's phone don't share storage.

**This document:** how the real version would work. Nothing here is built yet.

---

## 1. What stays the same

The screens. They were designed for the real thing:

| Screen | What it does |
|---|---|
| **Leads** | Every website form (photo estimate, calculator, visualizer, contact) lands here with photos, source and timestamp. "New" leads are flagged. |
| **Pipeline** | Lead → Contacted → Quote Sent → Won → Scheduled → Done → Paid. **Automatic: no dragging, no move buttons.** Cards move only when an event happens (section 3b). |
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
events        (id, partner_id, lead_id, type, source, provider_event_id UNIQUE,
               occurred_at, received_at, payload_json)       -- append-only; drives the pipeline
stage_changes (id, partner_id, lead_id, from_stage, to_stage, event_id, at)  -- the time-stamped moves
```

Every table carries `partner_id`, and row-level security policies enforce `partner_id = auth.partner_id()`.

## 3b. The automatic pipeline: how real events move cards

**Caleb's rule:** nobody drags cards, and nobody pushes them. A card moves only when something happens, and every move is time-stamped. The mockup already works this way: `dashboard.js` → `EVENTS`, with "Simulate" buttons standing in for the outside world. The real version swaps those buttons for webhooks:

| Stage | Event that moves the card there | Where the event comes from in the real version |
|---|---|---|
| **Lead** | A new lead | Website forms, calculator and visualizer post to `POST /api/leads`. **Phone:** the partner's business number runs through Twilio. A call from an unknown number hits Twilio's incoming-call webhook and creates a Lead (caller ID, time, and optionally the recording and transcript). A missed call can auto-text back "Sorry we missed you. Send photos here: …". |
| **Contacted** | The contractor calls the lead | The **Call** button uses Twilio click-to-call: Twilio rings the contractor's cell, then connects the customer, so the call shows the business number. Twilio's call-status webhook (`completed`, duration > 0) records the call and moves the card. *Why not read the phone's call log? iPhones don't let apps read it, and Android needs special permissions. Routing calls through the business number works on any phone.* A "Log a call" button covers calls made some other way. |
| **Quote Sent** | The quote is sent from the estimate builder | The builder emails the quote PDF and a "view & accept" link through Resend or Postmark. The provider's **sent/delivered webhook** moves the card, using the provider's timestamp. An **open** event is logged in history but doesn't move anything. |
| **Won** | Deposit paid **or** quote signed | **Deposit:** the quote's "Pay deposit" button is a Stripe Checkout or Payment Link tagged with `lead_id` and `kind=deposit`. Stripe's `checkout.session.completed` webhook moves the card. **Signature:** the quote page has a simple typed-name + checkbox acceptance (stored with IP and time). For formal e-signatures, a Dropbox Sign or DocuSign "all signed" webhook does the same. Whichever comes first wins; the second is logged. |
| **Scheduled** | A job date is set | The contractor picks a date, or the customer picks one from a booking link sent after the deposit. Either writes the date and moves the card. |
| **Done** | The crew marks the job done | One tap in the app; this one stays human. It triggers the **review request**: a text (Twilio) and email go out that evening with the Google review link, once, honoring STOP / unsubscribe. |
| **Paid** | Final payment | A Stripe invoice or payment link tagged `kind=final`. The `invoice.paid` / `checkout.session.completed` webhook moves the card. Cash and checks: "Record a payment" in the app (logged with who recorded it). QuickBooks Payments could feed the same event instead of Stripe. |

**How it's built:**
- **One function decides moves.** `apply_event(lead, event)` runs inside a database transaction. It writes the `events` row, and if the event's stage is *ahead* of the card's stage, it writes a `stage_changes` row and updates the lead. Cards only move forward, so an early payment, a late "delivered" email or a repeated webhook can't drag a card backward. This is the same rule the mockup uses.
- **Every webhook is verified** (Twilio, Stripe and email providers all sign their requests). Each is **idempotent**: the provider's event ID is a unique key, so retries don't double-log.
- **Times are the real ones.** `occurred_at` comes from the provider (when the call ended, when Stripe took the money); `received_at` is when we heard about it. The card history shows `occurred_at`.
- **Live updates:** the dashboard subscribes to changes (Supabase Realtime), so a card moves on the contractor's phone the moment a customer pays.
- **Exceptions are events too.** A refund (`charge.refunded`), a cancelled job or a lost lead is recorded as an event that flags the card or moves it to a "Closed/Lost" list. There's no hand-dragging. *Decision for Caleb: should an owner be able to correct a wrong move, with a required reason in the history?*

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
| 5 | Texting + calls through the business number (10DLC registration starts on day 1 of the project, since it takes time) | 1 week |
| 5b | Automatic pipeline: event table, `apply_event`, webhooks for Twilio calls, email sent/delivered, Stripe deposit/final payments, quote acceptance | 1–1.5 weeks |
| 6 | Rain watch + reminders + review automations (scheduled jobs) | 1 week |
| 7 | Partner onboarding: config form → build → deploy per partner | 1–2 weeks |

## 7. Things to decide with Caleb

- One shared dashboard app for all partners (recommended), or one per partner?
- Who pays for texting: Stain & Seal Supply as part of the package, or the partner directly?
- Should the dashboard order stain from Stain & Seal Supply? A "materials for this job" button that pre-fills an order from the estimate's square footage would tie the CRM to the supply business.
- Is there a monthly subscription for partners, and what's included?
