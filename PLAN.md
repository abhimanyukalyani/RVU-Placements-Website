# RVU Placements — Build Plan & Handoff Spec

**Project:** RV University Placement Website Page Revamp Competition entry
**Team:** AK + 1 (2-person team, as required)
**Due:** 15 Sep 2026 — emailed to placements@rvu.edu.in
**Plan written:** 12 Sep 2026
**Builds on:** `what-placement-pages-get-wrong.pdf` (competitive audit, 12 sites) and `rvu-placements-design-language.pdf` (Direction A tokens, contrast law, components, data rules)
**Hand off to:** Claude Code or VS Code. Read `CLAUDE.md` before writing any file.

---

## 0. The thesis

> The world's best careers services are excellent for students and publish no outcome data. Indian institutions publish numbers and abandon students. Nobody at all serves parents. **RVU does all three, from one source of data, with a date on every figure.**

That sentence is the hero subhead, the first slide of the deck, and the test for every decision below. If a feature does not serve it, cut it.

Five gaps from the audit, each assigned to a page so none can quietly go missing:

| # | Gap | Discharged by |
|---|---|---|
| 01 | Be the site that does both | Whole IA — three doors on `index.html` + `outcomes.html` |
| 02 | Adopt IPRS voluntarily | `outcomes.html` + `methodology.html` |
| 03 | Give parents a job | `parents.html` — three action cards, not reassurance |
| 04 | Sort recruiters by intent | `recruiters.html` intent router → `hire.html` intake |
| 05 | Date every number | `<figure-block>` component; `data/` carries `cohort_year` + `updated` |

---

## 1. What we are shipping

1. A **static website**, 11 pages, that opens by double-clicking `index.html` — no build step, no npm install, no server. Judges must not be blocked by tooling.
2. A **data spine**: every figure on every page resolves from `data/*.js`. No number is typed into markup. Change one file, the whole site updates. This is the demonstrable claim, not a slogan.
3. Four **working interactions** (eligibility checker, drives ledger, outcomes explorer, recruiter intake) — not mockups.
4. A short **submission deck / PDF** explaining the audit findings and the five gaps (built last, from the plan, once the site is done).

---

## 2. Stack and ground rules

| | |
|---|---|
| Markup | Hand-written HTML5, one file per page. No templating. |
| CSS | Plain CSS, custom properties, `@layer`. No Tailwind, no preprocessor. |
| JS | Vanilla ES5-compatible-ish ES2017. **Classic scripts, not `type="module"`** — ES modules are blocked over `file://` in Chrome. |
| Data | `data/*.js` files that assign onto a single global: `window.RVU = window.RVU || {}; RVU.placements = {...}`. Loaded with ordinary `<script src>` tags before `js/app.js`. Works from disk. |
| Fonts | Google Fonts: `Playfair+Display:wght@600` and `Cantarell:wght@400;700`. Already enqueued by the real RVU theme, so no new dependency in production. Fallbacks `Georgia, serif` / `Carlito, Helvetica Neue, sans-serif`. |
| Charts | Hand-built CSS bars and inline SVG. **No chart library.** |
| Icons | Inline SVG only, 1.5px stroke, `currentColor`. No icon font, no sprite CDN. |
| Images | None required. If a photo is used, it is a placeholder with a visible caption saying so. Prefer typographic and rule-based composition — that is what Direction A is. |
| Browser floor | Chrome/Edge/Safari current, Firefox current. No IE. |

**Two commands only, and both are optional:**
```
open index.html          # the primary way to view it
npx serve .              # only if a browser blocks local file reads
```

---

## 3. File tree

```
rvu-placements/
├─ index.html                  01  Hub — the three doors
├─ students.html               02  Your journey (4-stage spine)
├─ eligibility.html            03  Eligibility checker  [interactive]
├─ drives.html                 04  Live drives ledger   [interactive]
├─ recruiters.html             05  For recruiters — intent router
├─ hire.html                   06  Hiring request intake [interactive]
├─ parents.html                07  For parents — give parents a job
├─ outcomes.html               08  Outcomes explorer     [interactive]
├─ methodology.html            09  How we report (IPRS disclosure)
├─ schools.html                10  Placement by school
├─ office.html                 11  The office — people, calendar, contact
│
├─ css/
│  ├─ tokens.css               :root custom properties — palette, type, spacing
│  ├─ base.css                 reset, typography, measure, focus rings
│  ├─ components.css           every component in §6
│  └─ pages.css                page-specific overrides only (keep tiny)
│
├─ js/
│  ├─ app.js                   boot, nav, active-state, figure/date rendering
│  ├─ render.js                shared renderers: figure block, distribution row, ledger row
│  ├─ eligibility.js           module 1
│  ├─ drives.js                module 2
│  ├─ outcomes.js              module 3
│  └─ intake.js                module 4
│
├─ data/
│  ├─ meta.js                  cohort year, updated date, source, maintainer
│  ├─ placements.js            cohort classification, salary stats, distribution, breakdowns
│  ├─ schools.js               six schools, programmes, per-school figures
│  ├─ drives.js                live + closed drives
│  ├─ recruiters.js            recruiter names by sector
│  ├─ eligibility.js           eligibility rules and criteria
│  ├─ journey.js               the 4 stages × per-year timeline content
│  └─ glossary.js              terms expanded in plain English (for parents)
│
├─ assets/
│  └─ favicon.svg              gold RVU mark on slate
│
├─ CLAUDE.md                   build constitution — read first, obey always
├─ PLAN.md                     this file
└─ README.md                   how to open it; what is placeholder; what is real
```

---

## 4. The data spine

**The rule:** every figure, name, date, count and label that could ever change lives in `data/`. If a coding agent types `₹17.4` into an `.html` file, that is a bug.

`data/meta.js` — read by every page, stamped into every figure block:
```js
window.RVU = window.RVU || {};
RVU.meta = {
  cohort_year: "2025–26",
  record_date: "2026-06-30",      // 3 months post-graduation, per IPRS
  updated: "2026-09-12",
  source: "Corporate & Alumni Relations placement sheet",
  maintainer: "Corporate & Alumni Relations, RV University",
  status: "placeholder",           // flips to "live" when real data lands
  audited_by: null                 // e.g. "Brickwork Ratings" when adopted
};
```

`data/placements.js` — shaped directly on the IPRS disclosure pattern:
```js
RVU.placements = {
  cohort: {                        // §5 "classify the cohort" — the denominator, visible
    total_graduates: 412,
    seeking_through_university: 318,
    continuing_further_study: 46,
    entrepreneurship_or_family_business: 21,
    placed_independently: 19,
    postponing_search: 8,
    // derived and displayed, never hard-coded:
    offers_made: 301,
    students_placed: 287
  },
  salary_inr_lpa: {                // min / max / mean / median — never a lone headline
    basic:            { min: 3.6, max: 42.0, mean: 11.2, median: 9.4,  n: 287 },
    guaranteed_cash:  { min: 3.6, max: 48.0, mean: 12.1, median: 10.1, n: 287 },
    max_earning_potential: { min: 3.6, max: 64.0, mean: 13.4, median: 10.8, n: 287 }
  },
  middle_80: {                     // IPRS optional reporting, top/bottom decile excluded
    basic: { min: 5.2, max: 24.0, mean: 10.1, median: 9.2, n: 230 }
  },
  distribution: [                  // powers the distribution row + explorer histogram
    { label: "Under ₹6 LPA",  from: 0,  to: 6,    count: 41 },
    { label: "₹6–10 LPA",     from: 6,  to: 10,   count: 118 },
    { label: "₹10–15 LPA",    from: 10, to: 15,   count: 78 },
    { label: "₹15–25 LPA",    from: 15, to: 25,   count: 38 },
    { label: "Above ₹25 LPA", from: 25, to: null, count: 12 }
  ],
  by_sector:   [ { name: "Technology & IT services", count: 96, min: 4.2, max: 42.0, mean: 12.8, median: 11.0 }, /* …14 categories */ ],
  by_function: [ { name: "Software engineering",     count: 74, min: 5.0, max: 42.0, mean: 13.6, median: 12.0 }, /* …10 categories */ ],
  by_location: [ { name: "Bengaluru",                count: 141, min: 3.6, max: 42.0, mean: 12.2, median: 10.4 }, /* …7 Indian + 7 global */ ],
  non_inr_note: "Offers outside India are converted to USD and PPP-adjusted using World Bank factors."
};
```

Other files, same pattern:

- **`schools.js`** — six schools; each `{ id, name, programmes[], cohort{}, salary_inr_lpa{}, top_recruiters[] }`. Fixes the dead-brochure-link failure on the current page: every school entry resolves to a real section, never a 404.
- **`drives.js`** — `{ id, company, sector, role, location, ctc_lpa, eligible_schools[], min_cgpa, opens, closes, stage, status }` where `status ∈ open | closing | closed | offers_out`.
- **`eligibility.js`** — `{ rules[], criteria_by_school{}, one_offer_policy, registration_window, pause_reasons[] }`. Every rule carries a `capability` string (how to stay eligible) alongside the `condition`.
- **`journey.js`** — four stages (Understand / Explore / Experience / Implement) × four years, each with `{ do[], office_offers[], deadline }`.
- **`glossary.js`** — `{ term, plain_english, example }`. LPA, CTC, CGPA, drive, pre-placement offer, cohort, median, denominator.
- **`recruiters.js`** — `{ sector, companies[] }` across five sector groups.

**Placeholder discipline.** Any figure that does not exist yet renders as `[XXX]` / `₹[XX.X] LPA` — never `0`, never `—`, never an empty box. `render.js` owns this: `fig(value, fmt)` returns the bracket form when `value == null`. The empty stat box is the exact failure mode of the live RVU page; the site must be incapable of reproducing it.

---

## 5. Site map and page specs

Navigation is **two-axis**, borrowed from MIT CAPD: a persistent audience switcher (Students · Recruiters · Parents) in the header, and within the student path a task-based menu. Every page has a visible "you are here".

---

### 01 · `index.html` — Placements hub

The one page all three audiences land on. It must sort them in under three seconds.

- **Hero.** Display XL `Placements`. Subhead = the thesis, in second person. Two pills: `See the outcomes` · `Start a hiring request`. Crop marks at the four corners (32px, gold 55%, inset 56px; omitted under 768px).
- **Three doors.** 4 columns each on the 12-col grid. Gold rule above, numbered label (`01 · FOR STUDENTS`), Playfair 27px title, one paragraph in the second person addressed to *that* reader, arrow link. Numbering is permitted here — it is an enumerated set, not a sequence.
  - `01 · For students` → "Your timeline year by year, an eligibility check that tells you where you stand, and every live drive in one list." → `students.html`
  - `02 · For recruiters` → "Tell us what stage you're at. We'll route you to the right cohort, the right window, and a named person." → `recruiters.html`
  - `03 · For parents` → "What the placement process actually is, what the numbers mean, and three things you can do." → `parents.html`
- **Figure row.** Three figure blocks: `Offers made`, `Recruiting organisations`, `Median package`. Median in gold text (`--rvu-gold-text`), counts in ink. **Directly beneath: the cohort stamp** — `Cohort 2025–26 · recorded 30 Jun 2026 · updated 12 Sep 2026 · maintained by Corporate & Alumni Relations`. Caption style, 13px italic.
- **Distribution row.** Immediately after the figure row, in the same view — the design language forbids a package figure without its spread being reachable. Five buckets, CSS bars in `--rvu-gold`, counts tabular.
- **Denominator line.** One sentence in plain English: `287 of 318 students seeking placement through the university received an offer. 46 continued to further study; 21 to entrepreneurship or a family business; 19 placed independently.` No percentage appears anywhere without this.
- **Recruiter strip.** Names as text, set in Cantarell 700 uppercase with hairline dividers — not a logo wall. Nobody's logo is misused and it looks more editorial than every peer site.
- **Closing this week.** Three ledger rows pulled live from `drives.js` where `status === "closing"`, then `All live drives →`.
- **Footer.** Office contact, single memorable recruiting address (`placements@rvu.edu.in` — Northeastern's move), methodology link, last-updated stamp.

### 02 · `students.html` — Your journey

The LSE idea, which the audit called the most portable finding in the whole study.

- **Four-stage spine**, stages as verbs: `Understand → Explore → Experience → Implement`. Horizontal on desktop with a connecting hairline; stacked at 640px. Each stage is a door into its own content: what it is, what you do, what the office gives you.
- **"Start here"** block pinned above the spine — Oxford's one weakness was that a first-timer had to descend three menu levels. First-year students get a single obvious entry point.
- **Timeline by year.** Year 1 → final year, each with activities, office offerings, and hard deadlines, read from `journey.js`. Deadlines that have passed render muted; the next one is highlighted.
- **Eligibility, framed as capability.** Three or four sentences on how to stay eligible — never a disqualification list. Then the pill `Am I eligible? →` to `eligibility.html`.
- **Resources.** Grouped by task, not by department: CV and cover letter, interview practice, aptitude, higher study, internships.

### 03 · `eligibility.html` — Eligibility checker `[interactive]`

See §7.1.

### 04 · `drives.html` — Live drives ledger `[interactive]`

See §7.2. No peer site in the audit publishes drive windows at all; this page alone is a differentiator.

### 05 · `recruiters.html` — For recruiters

Waterloo is the benchmark, and the audit calls this the single most winnable gap in the brief.

- **Intent router as the first thing on the page.** Four large targets, in the employer's words:
  1. `We want to hire now` → `hire.html?intent=now`
  2. `We're planning to hire later this year` → `hire.html?intent=planning`
  3. `We want to offer internships or projects` → `hire.html?intent=internship`
  4. `We just want information` → `#how-it-works` (stays on page, no form)
- **What happens after you submit** — the thing no Indian site in the audit tells a recruiter. Four numbered steps with an actual time commitment against each: acknowledgement within 1 working day, cohort and eligibility shortlist within 3, slot confirmed, drive runs. Placeholder numbers, clearly stated as target service levels.
- **Our students and programmes.** Table from `schools.js`: school, programmes, cohort size, availability window. A recruiter can match a role to a cohort without emailing anyone.
- **Drive windows, stated plainly.** Recruiting calendar by term, internship durations (8 / 12 / 24 weeks), final-placement window, PPO route. Waterloo states work terms in plain numbers; so do we.
- **How to hire — step by step guide**, plus a `Write a job description that reaches the right cohort` helper (Waterloo's move, adapted).
- **No pricing.** Instead: what the university provides at no cost — pre-screened shortlists, campus logistics, interview infrastructure, coordinator support.
- **One address**, repeated: `placements@rvu.edu.in`, plus a named contact and phone.

### 06 · `hire.html` — Hiring request `[interactive]`

See §7.4.

### 07 · `parents.html` — For parents

Stanford is the only model in twelve sites, and the audit's instruction is to copy the *move*, not the page: give parents a job.

- **Three plain questions** as the page's spine: `What support does RVU give my child?` · `How can I help?` · `What do the numbers mean?`
- **Give parents a job.** Three action cards, each a real action with a form or contact behind it:
  1. `Refer a recruiter` — you know a company that hires; tell us and we'll approach them. Routes into the same intake as `hire.html` with `source=parent_referral`.
  2. `Offer an informational interview` — 30 minutes with a student in your field.
  3. `Join the parent & alumni network` — quarterly briefing, and first sight of drive outcomes.
- **What the numbers mean**, in plain English, with **no unexplained abbreviations**. LPA expanded on first use. Every figure gets a sentence: *"The median is the middle offer — half the class received more, half less. We lead with the median rather than the highest offer because one exceptional offer tells you nothing about your child's likely outcome."* This single paragraph is the most quotable thing on the site.
- **An honest section: what placement does not guarantee.** Short, unhedged. Trust is the deliverable on this page, and no peer site attempts it.
- **Glossary**, from `glossary.js`, inline expandable.
- **Who to contact** — a named person, not a form.

### 08 · `outcomes.html` — Outcomes explorer `[interactive]`

See §7.3. Median first, spread always visible, denominator stated, every number dated.

### 09 · `methodology.html` — How we report

The page that makes the data credible, and the one nobody else has.

- **Disclosure statement.** RVU is not a business school and is not required to report this way; it reports on the IPRS pattern voluntarily. Say exactly that.
- **Definitions**: who counts as seeking placement, what basic salary excludes, how CTC is composed, how one-time joining benefits are treated, record date vs publication date.
- **Cohort classification table** — the full graduate pool, every student in exactly one bucket, totals reconciling to `total_graduates`. A visible check, not a claim.
- **Timing**: recorded three months post-graduation, published at six, raw data retained twelve.
- **Deviations**: a table, honestly populated — for a placeholder submission, "no external audit yet; adoption planned" is the honest entry and a stronger signal than silence.
- **Archive**: by cohort year, with prior years listed even when the file is `[pending]`.

### 10 · `schools.html` — Placement by school

Fixes the concrete failure the audit found on the live page: all six school brochure links are dead.

- Six sections from `schools.js`, each with programmes, cohort size, figure row, distribution, top recruiters, and an availability window for recruiters.
- Every link resolves to an anchor on this page or a real page. **Zero dead links is an acceptance criterion.**
- Verify school names against rvu.edu.in before shipping — they are placeholders in `schools.js` until checked.

### 11 · `office.html` — The office

- Named people with roles and direct contacts (Sivakumar S, Senior Manager – Placements and Alumni Affairs, as the office lead — confirm titles before ship).
- Academic-year calendar of placement activity — Oxford's Term Planner, adapted.
- Where each audience should start. One line each.

---

## 6. Component inventory

Build these once in `components.css` + `render.js`; every page composes from them.

| Component | Spec |
|---|---|
| `figure-block` | Playfair 58px tabular-nums over a 10px uppercase caption. Medians `--rvu-gold-text`, counts `--rvu-ink`. Separated by 1px vertical rules inside a row bounded top and bottom by 1px slate @14–18%. **Always renders its cohort stamp.** |
| `distribution-row` | Label, CSS bar in `--rvu-gold`, tabular count. Bars share a max; no axis furniture. |
| `ledger-row` | Six-column grid, 19px vertical padding, 1px divider. **Status is the only coloured text in the row.** Alternate rows may take `--rvu-paper`; never stripe every row. |
| `door-block` | Gold rule above, numbered label, Playfair 27px title, body paragraph, arrow link. Tap area padded to 44px on mobile. |
| `pill` / `chip` | Theme geometry: 800px radius, gold fill, `--rvu-ink` label. 12px padding meets the 44px floor. Chips for filters and status. |
| `hairline` | 1px gold at full strength opens a section · 1px slate @14–18% divides rows · 2px slate closes a major block. These replace cards — border, fill, radius and shadow are spent only where something genuinely needs lifting. |
| `crop-marks` | 32px arms, 1px, gold @55%, inset 56px, four corners, decorative, `aria-hidden`, omitted below 768px. |
| `eyebrow` | Cantarell 700, 10–11px, uppercase, 0.16–0.18em tracking, `--rvu-gold-text`. |
| `cohort-stamp` | 13px italic caption: cohort year · record date · updated date · maintainer. |
| `audience-switcher` | Persistent header nav, three targets, current one marked with `aria-current="page"` and a gold underline. |
| `disclosure` | Native `<details>`/`<summary>` for glossary and rule detail. No JS accordion. |
| `data-table` | Inside `overflow-x: auto`. Tabular-nums on every numeric column. Header row 1px slate below. |

---

## 7. The four interactive modules

All four are client-side, read only from `window.RVU.*`, and degrade to readable static content with JS off (`<noscript>` renders the full underlying table).

### 7.1 Eligibility checker — `eligibility.js`

**Input:** school (select) · programme (select, filtered by school) · year of study (select) · CGPA (number) · backlogs (number) · already holding an offer (yes/no).

**Output — three states, never a bare "ineligible":**
- `Eligible` — green-free treatment; slate text, gold rule. Lists what you can apply to right now, linked into `drives.html` pre-filtered.
- `Eligible with conditions` — names the condition and **what to do about it**, with a deadline and a person.
- `Not currently eligible` — states the single blocking criterion, **what would change it, and by when**. Framed as capability, per the voice rules: "how to stay eligible", never grounds for disqualification.

Always shows the **one-offer policy** in plain words and how it applies to the entered state.

**Acceptance:** no combination of inputs produces a dead end. Every result contains at least one link and one next action. Result is announced to screen readers via `aria-live="polite"`. State is URL-encoded so a result can be shared.

### 7.2 Drives ledger — `drives.js`

Filterable list of every drive. Filter chips: `Eligible to me` (uses the last checker result from `sessionStorage`) · school · sector · status · `Closing this week`. Sort by closing date (default), CTC, or company.

Each row: company · role · eligible schools · CTC · closes · status. Status is the only coloured text. `closing` takes `--rvu-gold-text`; `closed` is muted; nothing uses red.

**Acceptance:** empty filter states say what to change, never "no results". Row count and active filters announced on change. Table works with JS disabled.

### 7.3 Outcomes explorer — `outcomes.js`

Not a dashboard — an argument, in four moves:

1. **The denominator first.** Cohort classification as a segmented bar: every graduate in exactly one bucket, totals reconciling visibly. This is the page's opening claim, and it is the thing Plaksha's otherwise-strong reporting cannot support.
2. **Median first, maximum beside it, never larger.** Enforced in CSS: the max figure is capped at 60% of the median's font size. The rule is structural, not editorial discretion.
3. **The whole distribution.** Histogram from `distribution`, with a toggle to `Middle 80%` (top and bottom decile excluded) — an IPRS option almost nobody exercises, and it visibly answers "is the mean being pulled by one outlier".
4. **Breakdowns.** Tabs for sector / function / location. Each row carries its own min · max · mean · median **and the count of data points behind it** — so a thin cell can't masquerade as a trend.

Every view stamped with cohort year and update date. A `Download the outcomes report` button that resolves to `[pending]` and says so honestly.

**Acceptance:** no view can display a percentage without its denominator in the same view. No view can display a package figure without the distribution reachable in the same view. Both enforced in `render.js`, not left to the author.

### 7.4 Recruiter intake — `intake.js`

Waterloo's structure: **classify by stage first, then route.**

- **Step 1 — stage.** Prefilled from `?intent=`. Four options: hire now · planning to hire · internships or projects · information only. "Information only" never sees a form; it gets the answers inline.
- **Step 2 — role.** Function, number of positions, location, work term (8 / 12 / 24 weeks or full-time), earliest start.
- **Step 3 — cohort match.** The form **tells the recruiter something before they submit**: given function + work term, here are the eligible schools, approximate cohort size, and the next available drive window, computed from `schools.js` and `drives.js`. This is the whole point — the form gives before it takes.
- **Step 4 — you.** Organisation, contact, designation, email, phone, website, preferred mode (campus / virtual / hybrid).
- **Confirmation.** Restates what happens next with the service levels from `recruiters.html`, plus the named coordinator and `placements@rvu.edu.in`.

Fields are grouped to map onto the 20-field working sheet Corporate Relations already keeps — **field names must be reconciled against that sheet before ship**; until then they are placeholders and `data/intake-fields.js` carries a `TODO: confirm against CR sheet` note.

No backend. Submit renders a confirmation panel and logs a JSON payload to the console shaped exactly as the sheet expects — which is also the demo: *this form already speaks your spreadsheet's language.*

**Acceptance:** keyboard-completable end to end. Every field labelled (no placeholder-as-label). Errors are inline, specific, and announced. Progress is visible. Back never loses entered data.

---

## 8. Build order

Three working days. Build in this order; each phase leaves the site in a demonstrable state, so a slip loses the last page, not the submission.

**Phase 0 — foundations (2–3 h).** `CLAUDE.md` into the repo. `tokens.css` with all nine palette values + spacing scale mirroring `--gcid-*`. `base.css` with type scale, 62–68ch measure, focus rings, `text-wrap: balance/pretty`, tabular-nums, `prefers-reduced-motion` wrapper. Header/footer/audience switcher. **Gate: a blank page renders with correct type and spacing and passes the contrast table before any content is written.**

**Phase 1 — data spine (2 h).** All eight `data/*.js` files with complete, internally consistent placeholder data. Cohort numbers must reconcile. `render.js` with `fig()`, `pct()`, `stamp()`, `bracket()`. **Gate: `pct()` throws if called without a denominator. `fig(null)` returns `[XXX]`.**

**Phase 2 — hub + components (4 h).** `index.html` end to end, which forces every core component into existence. **Gate: the hub renders entirely from `data/`; grep the HTML for digits and find none in content positions.**

**Phase 3 — student path (5 h).** `students.html`, `eligibility.html`, `drives.html`. Two of the four interactions. **Gate: checker and ledger work, share state, and have no dead ends.**

**Phase 4 — recruiters + parents (5 h).** `recruiters.html`, `hire.html`, `parents.html`. The two highest-differentiation audiences. **Gate: intake completes by keyboard; parents page has zero unexplained abbreviations.**

**Phase 5 — data pages (4 h).** `outcomes.html`, `methodology.html`, `schools.html`. **Gate: the median-first CSS cap holds; every school link resolves.**

**Phase 6 — office + polish (2 h).** `office.html`, favicon, `README.md`, 404-proofing, responsive pass at 1440 / 1024 / 768 / 390 px.

**Phase 7 — QA gate (2 h).** Run §9 in full. Fix. Re-run.

**Phase 8 — submission (3 h).** Deck/PDF from the audit + this plan, zip, email. **Do not start Phase 8 before Phase 7 passes** — a polished deck over a broken site loses to the reverse.

If time runs short, cut in this order: `office.html` → `schools.html` detail (keep the page, thin the content) → `hire.html` step 3 richness. **Never cut:** the cohort stamp, the denominator line, the distribution row, or the parents' plain-English figures paragraph. Those four are the submission's argument.

---

## 9. QA gate

Run all of it. A single failure blocks Phase 8.

**Data integrity**
- [ ] `grep -rn "₹[0-9]" *.html` returns nothing. Same for bare digit-percentages in content.
- [ ] Cohort buckets sum exactly to `total_graduates` on `methodology.html`.
- [ ] Every page displaying any figure also displays the cohort stamp.
- [ ] No percentage anywhere without its denominator in the same view.
- [ ] No package figure without the distribution reachable in the same view.
- [ ] Every unpopulated figure renders `[XXX]` — zero instances of `0`, `—`, or an empty box.
- [ ] Max package never rendered larger than, or without, the median.

**Contrast — re-measure, don't assume**
- [ ] `#d0a863` never used as text on a light ground. Anywhere. (2.08:1 — fails both floors.)
- [ ] `#b18733` only at ≥24px, or ≥19px bold.
- [ ] Gold body text, labels and links on light grounds use `#866c40` only.
- [ ] Gold on dark grounds uses `#1a242b` as the ground (7.11:1).
- [ ] Every text/ground pair on the site appears in the design language's measured table, or has been measured and recorded.

**Accessibility**
- [ ] Keyboard-complete: every interaction, including the 4-step intake.
- [ ] Visible focus ring on every interactive element, 3:1 against its ground.
- [ ] 44px minimum hit target at every breakpoint — including the door-block text links on mobile.
- [ ] One `<h1>` per page; heading levels never skip.
- [ ] All form fields have real `<label>`s. Placeholders are not labels.
- [ ] Dynamic results announced via `aria-live`.
- [ ] Crop marks and decorative rules `aria-hidden="true"`.
- [ ] All motion inside `@media (prefers-reduced-motion: reduce)`.

**Responsive**
- [ ] No horizontal body scroll at 390px. Tables scroll inside their own `overflow-x: auto`.
- [ ] Every multi-column row collapses to one column at 640px.
- [ ] Side gutter never below 16px — set once on the outer wrapper, vertical padding via `padding-block` only.
- [ ] Crop marks absent below 768px.

**Integrity**
- [ ] Zero dead links. Every school link, every brochure link, every footer link resolves. (This is the live page's headline failure; reproducing it would be fatal.)
- [ ] Opens correctly from `file://` — no module errors, no blocked fetches.
- [ ] Every prose claim carries a number, or has been cut. No superlatives.
- [ ] Every control names its action: "Start a hiring request", not "Submit".
- [ ] `README.md` states plainly which data is placeholder.

---

## 10. Submission package

```
RVU-Placements-<Name1>-<Name2>/
├─ site/                    the 11 pages, openable offline
├─ RVU-Placements-Proposal.pdf   8–10 pages
├─ README.md                what to open first; what is placeholder
└─ (optional) live URL      if hosted
```

Deck outline — argument, not screenshots:
1. The thesis (§0), one sentence.
2. What twelve placement pages get wrong — the scorecard.
3. The five gaps, and RVU's position in the empty quadrant.
4. The IA: three doors, two-axis nav.
5. The data spine: one source, every number dated, empty boxes impossible by construction.
6. Students: the four-stage journey + the eligibility checker.
7. Recruiters: sorted by intent, told what happens next.
8. Parents: given a job, not a photograph.
9. Voluntary IPRS-pattern disclosure — more transparent than nearly every Indian university.
10. What it takes to ship: WordPress page template in the existing theme, no new fonts, figures from ACF or a sheet sync.

Slide 10 matters more than it looks. The audit's finding is that peer pages fail because they are *unmaintained*, not because they are ugly. Showing that this design cannot go stale is the winning argument.

---

## 11. Handoff

**Claude Code**
```
mkdir rvu-placements && cd rvu-placements
# drop CLAUDE.md and PLAN.md in, then:
claude
```
Opening prompt:
> Read CLAUDE.md and PLAN.md. Build Phase 0 only: css/tokens.css, css/base.css, the shared header/footer/audience-switcher partial markup, and a blank index.html that renders them. Then stop and show me the contrast check for every pair you used. Do not write content or data yet.

Then one phase per prompt, in order. Do not let it skip ahead — Phase 2 written before Phase 1 exists is how numbers end up hard-coded in HTML.

**VS Code**
Same two files at the repo root; Copilot or the Claude extension picks up `CLAUDE.md` as project context. Build in the same phase order.

---

## 12. Decisions still open

Answer these before Phase 1 so the placeholders don't have to be rewritten:

1. **School names and programme lists** — confirm the six schools against rvu.edu.in.
2. **The 20-field Corporate Relations sheet** — actual field names, to shape `intake.js`. This is the difference between a plausible form and one the office could use on Monday.
3. **Office contacts** — names, titles, direct lines for `office.html`. *(The address is settled: `placements@rvu.edu.in`, RV University's published placements address.)*
4. **Placeholder vs. real figures** — current plan is clearly-labelled placeholders with a `status: "placeholder"` flag. Confirm that reads as honest rather than incomplete to the judges; the alternative is real published RVU figures where they exist and brackets elsewhere.
5. **Hosting** — a live URL (GitHub Pages, Netlify) alongside the zip makes judging easier. Decide before Phase 8.
