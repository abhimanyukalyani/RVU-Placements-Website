# RVU Placements — competition entry

A static, 11-page revamp of the RV University placements site. Built for the
page-revamp competition; submission due 15 September 2026.

## How to open it

Double-click `index.html`. That is the whole of it — no build step, no
`npm install`, no server.

```
open index.html
```

If a browser blocks local file reads (some Safari and Firefox configurations
do), serve the folder instead:

```
npx serve .
```

Everything is classic scripts and plain CSS on purpose: `type="module"` and
`fetch()` are both blocked over `file://` in Chrome, and a judge should not be
blocked by tooling.

## What is real, and what is placeholder

**Every figure on this site is a placeholder.** Nothing here has been supplied
by the placement office. The numbers are internally consistent — the cohort
buckets sum to the graduating class, the distribution and all three breakdowns
sum to the number placed, per-school cohorts reconcile to the university
totals, and `min ≤ median ≤ mean ≤ max` holds in every salary block — but they
describe no real cohort. `data/meta.js` carries `status: "placeholder"`, and
`methodology.html` says so in its deviations table.

Unpopulated values render as `[XXX]`, `₹[XX.X] LPA` or `[pending]` — never as
`0`, never as a dash, never as an empty box. An empty statistic box is the
specific failure of the current live page, and this build is constructed so it
cannot reproduce it.

### Verified

| What | Source |
|---|---|
| The eight school names | Confirmed against rvu.edu.in |
| Which six schools are in the placement cohort | Confirmed; the two exclusions are published on `methodology.html` |

### Not verified — every item, and what each needs

**Figures — all of them.** Every number on every page:

| Figure | File |
|---|---|
| Cohort size, classification, offers made, students placed | `data/placements.js` |
| Salary min / max / mean / median, all three measures | `data/placements.js` |
| Middle-80% band | `data/placements.js` |
| The five distribution buckets | `data/placements.js` |
| Breakdowns by sector, function and location | `data/placements.js` |
| Per-school cohorts and packages | `data/schools.js` |
| Drive packages, windows and CGPA floors | `data/drives.js` |
| Cohort year, record date, publication date | `data/meta.js` |

**Office names and contacts.** `data/office.js`. The office lead is recorded as
**Sivakumar S, Senior Manager — Placements and Alumni Affairs** and is marked
`verified: false`. The other four roles have `name: null` and render as
`[pending]`. No direct phone number is known for anyone; all five entries
currently point at the shared address. Roles are rendered before names so the
page never presents a guessed name as a confirmed one. **Needs: confirmation of
every name, title and direct line with the office.**

**The Corporate Relations intake field list.** `data/intake-fields.js` carries
`sheet_reconciled: false`, and every `sheet_column` value is a guess:

`Enquiry type` · `Function` · `Sector` · `Headcount` · `Location` ·
`Engagement type` · `Start date` · `CTC band` · `Company name` ·
`Contact person` · `Designation` · `Email` · `Phone` · `Website` · `Mode` ·
`Notes`

That is 16 fields against a working sheet said to have 20. **Needs:
reconciliation against the actual 20-field Corporate Relations sheet.** This is
the difference between a plausible form and one the office could use on Monday.

**Everything else outstanding:**

| What | Where | Needs |
|---|---|---|
| Programme lists (all eight schools) | `data/schools.js` | Confirming; deliberately left empty rather than guessed |
| Recruiting organisation names | `data/recruiters.js` | The placement sheet — currently `[Organisation 01]`…`[Organisation 20]` |
| Per-school top recruiters | `data/schools.js` | The placement sheet |
| Drive company names | `data/drives.js` | The placement sheet |
| Eligibility thresholds and the one-offer policy | `data/eligibility.js` | Confirming with the office |
| Academic-year calendar and deadline dates | `data/journey.js`, `data/office.js` | The academic calendar |
| Target service levels | `data/intake-fields.js` | Agreeing them with the office before publishing |
| Whether `recruit@rvu.edu.in` can be a real address | Site-wide | A decision by the office |

**What is real** is the structure: the information architecture, the data
spine, the four interactive modules, the contrast and accessibility work, and
the reporting discipline. Swapping the placeholder data for the office's own
figures is a change to `data/`, not a rebuild.

## What is here

```
index.html          Hub — the three doors
students.html       Your journey — four-stage spine, timeline by year
eligibility.html    Eligibility checker          [interactive]
drives.html         Live drives ledger           [interactive]
recruiters.html     For recruiters — intent router
hire.html           Hiring request               [interactive]
parents.html        For parents
outcomes.html       Outcomes explorer            [interactive]
methodology.html    How we report — IPRS-pattern disclosure
schools.html        Placement by school
office.html         The office — people, calendar, contacts
deck.html           Submission deck — print to PDF, A4 landscape

css/    tokens · base · components · deck
js/     app · render · eligibility · drives · outcomes · intake
data/   meta · placements · schools · drives · recruiters ·
        eligibility · journey · glossary · intake-fields · office
```

`CLAUDE.md` is the build constitution — palette, contrast law, type, spacing,
components, data-display rules, voice. `PLAN.md` is the build plan.

## The deck

`deck.html` is the submission deck: ten sections, one per A4 landscape page,
built from the same tokens and type scale as the site. To produce the PDF,
open it and print — **A4, Landscape, Margins: None, Background graphics: on**.
Printing from a browser is also what gives it the real Playfair Display and
Cantarell.

## The one thing to know about the data

No number is typed into any page. Every figure resolves from `data/*.js`
through `js/render.js`, which enforces the display rules structurally rather
than by convention:

- `fig(null)` returns `[XXX]`. There is no code path that renders an
  unpopulated figure as `0`.
- `pct()` **throws** if called without a denominator.
- A figure row that lacks a cohort stamp has one inserted.
- A maximum placed outside a median block throws.
- `checkViews()` throws if a view states a package figure with no distribution
  reachable in it, or a percentage with no denominator in it.

`grep -rn "₹[0-9]" *.html` returns nothing, and is meant to keep returning
nothing.

## Known limitation: JavaScript

Because every figure is read from one source at load, the figures do not
appear with JavaScript disabled. Each interactive module carries a `<noscript>`
notice saying what is unavailable and where to get it. Those notices
deliberately do not restate any figure — a static copy is a second source, and
a second source is what goes stale.

This is an artefact of the static build, not of the design. In the WordPress
port the same figures render server-side from Advanced Custom Fields, so both
the no-JavaScript fallback and search indexing resolve without changing the
data spine. `methodology.html` explains this to the reader.

## Verified

- No horizontal scroll at 1440 / 1024 / 768 / 390px; side gutter never below 16px
- Zero dead links across all 11 pages
- One `<h1>` per page, no skipped heading levels
- Every interactive control at least 44px; visible focus ring throughout
- Every text/ground colour pair measured against WCAG and recorded in a comment
  beside its declaration
- Opens from `file://` with a clean console
