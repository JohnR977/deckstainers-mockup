# CALEB_NOTES.md

Caleb's wishes, from his voice recording, as relayed by John on 2026-10-08. Per HANDOFF.md, this file overrides the handoff where they differ.

> "I want a full turnkey website for staining contractors with a CRM on the backend. A plus would be backlinks to experts and a color rendering tool, so homeowners can upload their photos of their job and get a rendering of what it would look like cleaned and stained."

## How the mockup answers each point

| Caleb asked for | Where it is |
|---|---|
| **Full turnkey website for staining contractors** | One folder per contractor (`partners/<name>/`: `site.config.json` + `images/`). Same code, any business. See the Knoxville demo and `MARKETING_GUIDE.md`. |
| **CRM on the back end** | `/dashboard/`: leads, pipeline, customer cards, estimate builder, schedule with rain days, re-coat reminders, review requests. Real-database plan in `CRM_PLAN.md`. |
| **Backlinks to experts** (a plus) | John clarified this means links back to **[expertwoodcare.com](https://expertwoodcare.com/)** (the EXPERT stain brand) and **[stainandsealsupply.com](https://stainandsealsupply.com/)**. Every contractor site now links to both: a "We use EXPERT™ Stain & Seal" section on the home page, a partner line in the footer of every page, a "Go deeper" list on each article pointing to EXPERT's own guides, the color gallery and samples from the visualizer, the About page, and the Learn page (plus the Stain & Seal Experts podcast). On the Chattanooga demo that's 59 links to expertwoodcare.com and 50 to stainandsealsupply.com across 41 pages, all to real, checked URLs. The independent expert citations (USDA Forest Products Lab, Consumer Reports, NOAA, TN.gov…) stay too, because they make the advice credible. |
| **Color rendering: upload a photo, see it *cleaned and stained*** (a plus) | `/visualizer/`: upload or pick a sample, mark the deck, and the tool first **cleans** the wood in the browser (lifts gray and mildew, evens the tone, keeps the grain), then **stains** it in the chosen color. A "Just cleaned" option shows the wash alone. A before/after slider and a download (which becomes a CRM lead) are included. An optional AI "enhance" pass is described in `VISUALIZER_PLAN.md`. |
