# CLAUDE.md — RVU Placements build constitution

Read this before writing any file, and re-read §A before writing any CSS.
`PLAN.md` says *what* to build and in what order. This file says *how*, and these rules do not bend for convenience.

**Project:** static 11-page placements site for RV University. Competition submission, due 15 Sep 2026.
**Design source:** Direction A — an editorial prospectus. Hairline rules do the work that borders, fills and shadows usually do.

---

## A. The contrast law — the rule most likely to be broken

RVU's gold is a light colour. On the paper ground it measures **2.08:1**. It fails the 4.5:1 body floor *and* the 3:1 large-text floor.

**Therefore: gold on a light ground is a graphic colour, not a text colour.** Rules, bars, fills, marks. Never letters.

| Need | Use |
|---|---|
| Gold text on paper — labels, eyebrows, links, medians | `#866c40` (`--rvu-gold-text`) · 4.64:1 · the **only** gold permitted for body copy on light |
| Gold display text on paper | `#b18733` (`--rvu-gold-deep`) · 3.08:1 · **≥24px, or ≥19px bold, only** |
| Gold fills, rules, bars, chart marks | `#d0a863` (`--rvu-gold`) · never text |
| Bright gold as text | put it on `#1a242b` (`--rvu-slate-deep`) → 7.11:1, passes at every size |
| Body text on paper | `#233039` (`--rvu-slate`) · 12.64:1 |
| Display headings and figures | `#04070a` (`--rvu-ink`) · 18.89:1 |
| Button label on gold fill | `#04070a` (9.10:1) or `#233039` (6.09:1) |
| Text on dark grounds | `#ffffff` on `#233039` · 13.52:1 |
| Gold text on the panel fill | **banned.** `#866c40` on `#ecf1f5` (`--rvu-panel`) measures **4.36:1** — it fails the 4.5:1 body floor. On `--rvu-panel`, eyebrows, labels and links take `#233039` (`--rvu-slate`) · 11.89:1 |

If you introduce a pair not in this table, measure it and record the ratio in a comment beside the declaration. No unmeasured pair ships.

### Palette tokens — declare all nine on `:root`, mirroring the theme's `--gcid-*` names

```css
--rvu-gold:       #d0a863;  /* theme --gcid-primary-color   · fills, rules, bars, marks */
--rvu-gold-deep:  #b18733;  /* in use on site               · large display text only   */
--rvu-gold-text:  #866c40;  /* derived                      · the only gold for copy    */
--rvu-slate:      #233039;  /* theme --gcid-secondary-color · body text; dark ground    */
--rvu-slate-deep: #1a242b;  /* derived                      · layered dark ground       */
--rvu-ink:        #04070a;  /* theme --gcid-body-color      · display headings, figures */
--rvu-panel:      #ecf1f5;  /* in use on site               · cool callout fill         */
--rvu-paper:      #faf7f1;  /* derived, low chroma          · warm page ground          */
--rvu-white:      #ffffff;  /*                              · cards, tables on paper    */
```

No colour outside these nine. No red — not for errors, not for "closed". Status is carried by weight, muting and wording, not hue. Errors use slate at full weight with a gold rule.

---

## B. Type

Two faces, three weights total. Both already enqueued by the RVU theme — that is an argument for the design, so do not import a third.

```
Playfair Display 600 · headings, figures
Cantarell 400        · body
Cantarell 700        · labels, eyebrows
```

| Token | px | Line-height | Tracking | Use |
|---|---|---|---|---|
| `--t-label` | 12 | 16 | 0.16em | eyebrows, figure captions, table heads, chips, pills |
| `--t-caption` | 13 | 20 | — | notes, methodology, cohort stamps |
| `--t-body` | 16 | 26 | — | cards, table cells, default |
| `--t-lead` | 20 | 32 | — | intros, standfirsts, door bodies |
| `--t-title` | 25 | 30 | −0.01em | door and card titles |
| `--t-sub` | 31 | 37 | −0.012em | sub-sections |
| `--t-section` | 39 | 44 | −0.015em | section openers |
| `--t-figure` | 49 | 49 | −0.015em | stat blocks, `tabular-nums` |
| `--t-display` | 76 | 76 | −0.02em | page titles, tablet up |
| `--t-hero` | 95 | 91 | −0.022em | hub page title, desktop |

**The ratio is 1.25 — a major third — anchored at 16px.** Every step is the one before it times 1.25, rounded to a whole pixel. To extend the scale, multiply or divide by 1.25; do not add a step by eye.

The table this replaced was not a scale. Its adjacent steps ran 2.75× · 1.5× · 1.19× · 1.59× · 1.13× · 1.15× · 1.18×. Two pairs (32/27 and 17/15) sat close enough to read as mistakes rather than distinctions, and there was a 2.75× gap from 132 to 48 with nothing in it.

- **Titles and section openers scale with the viewport, not with a breakpoint.** `--t-page-title: clamp(--t-figure, 8vw, --t-display)`, `--t-hub-title: clamp(--t-figure, 9vw, --t-hero)`, `--t-opener: clamp(--t-sub, 4.2vw, --t-section)`. There is no type override in any media query, so there is nothing to keep in sync.
- **Labels are 12px at every breakpoint.** The retired 10.5px label put both hero pills and the whole audience switcher below a readable size on a phone. Do not reintroduce a smaller label at any viewport: a scale with a mobile exception is a scale with a bug waiting in it.
- **Every `font-size` in `css/` resolves through a token.** A raw pixel value in a stylesheet is a defect. `grep -rn "font-size:" css/ | grep -v "var(--"` must return nothing. The print deck carries its own `--d-*` scale, on the same 1.25 ratio anchored at its 14px body, because a printed A4 slide is not anchored to a 16px reading size.
- Measure **62–68 characters** for running text. Never a full-width paragraph at 1080px.
- `text-wrap: balance` on every heading. `text-wrap: pretty` on body copy.
- `font-variant-numeric: tabular-nums` on **every** figure, table column and chart label.
- Fallbacks: `Playfair Display, Georgia, serif` · `Cantarell, Carlito, "Helvetica Neue", sans-serif`. Metrics are close enough that layout must not reflow.
- No italics beyond the caption style.

---

## C. Spacing and layout — reuse the theme's scale, don't invent one

```css
--content-max-width: 1080px;  /* outer container, from the theme        */
--wp-content-size:    823px;  /* the theme's reading measure for prose  */
--section-padding:     56px;  /* inside a section                       */
--section-gutter:      60px;  /* between major sections                 */
--module-gutter:       30px;  /* between cards and grid items           */
--row-gutter-vertical: 40px;  /* between stacked rows                   */
```

- Page margin 96px desktop → **16px minimum side gutter** at phone width. Set the side gutter **once** on the outer wrapper, and give that element vertical padding with `padding-block` — never a `padding` shorthand that zeroes the sides.
- 12 columns at 30px gutter. Three doors take 4 each; the figure row takes 3 each.
- Every multi-column row collapses to one column at **640px**.
- Tables keep their width inside `overflow-x: auto`. **The page body never scrolls sideways.**

---

## D. Components — hairlines instead of cards

```
1px gold, full strength     opens a section
1px slate @14–18%           divides rows
2px slate                   closes a major block
```

Border, fill, radius and shadow are spent **only** where something genuinely needs lifting. If you reach for a card, use a rule instead and check whether anything was lost.

- **Buttons** are the theme's own geometry: 800px pill radius, gold fill, `--rvu-ink` label. 12px padding, which meets the 44px floor.
- **Masthead crest**: RV University's own crest, from the official logo vector — `assets/rvu-crest.svg`, inlined so `currentColor` drives it and no tenth colour enters the palette. Decorative: `aria-hidden`, with the Playfair wordmark beside it carrying the accessible name. **40px tall, 36px at 640px, never below 36px** — the fine strokes close up under that. Use the crest, never the full lockup: the lockup's tagline band sets its smallest glyph at 1.87 units against an 84.53-unit height, which is 0.88px at a 40px masthead. That is a signage asset.
- **Crop marks**: 32px arms, 1px, gold @55% opacity, inset 56px from the page edge, four corners, `aria-hidden`, **omitted below 768px**. Decorative only. This is the one borrowed device — do not add a second.
- **Figure block**: Playfair 58px over a 10px uppercase caption, 1px vertical rules between, row bounded top and bottom by 1px slate. Medians take gold text; counts take ink.
- **Ledger row**: six columns, 19px vertical padding, 1px divider. Status is the **only** coloured text in the row. Alternate rows may take the paper tint; never stripe every row.
- **Door block**: gold rule above, numbered label, Playfair 27px title, paragraph, arrow link. Numbering is permitted *here only* — the three doors are an enumerated set, not a sequence. Pad the tap area to 44px on mobile.
- **Hit targets**: 44px minimum on every interactive element at every breakpoint.
- Use native `<details>`/`<summary>` for disclosure. Do not hand-build an accordion.

---

## E. How figures may be shown — enforced in code, not left to judgement

These are structural rules. `js/render.js` owns them so a page author cannot break them by accident.

1. **Median first.** The median package is the headline. The maximum may appear beside it as a highlight — **never alone, and never larger**. Cap the max at 60% of the median's font size in CSS so this cannot drift.
2. **Show the spread.** Wherever a package figure appears, the full distribution is reachable **in the same view**. That is what `distribution-row` is for.
3. **State the denominator.** No percentage without its cohort size. `"100% placed"` is not a permitted figure unless the number placed and the number seeking both appear. `pct()` must throw if called without a denominator.
4. **Classify the cohort.** Graduates split into: seeking placement through the university · continuing to further study · entrepreneurship or family business · placed independently · postponing the search. The base of every figure is visible. No silent denominator.
5. **Date every number.** Each figure carries its cohort year and the date the data was last updated. Almost no peer institution does this; it is the cheapest credibility signal available and the outward face of the single-source spine.
6. **Brackets until live.** Unpopulated figures render `[XXX]` or `₹[XX.X] LPA` — **never** `0`, never `—`, never an empty box. An empty stat box is the exact failure mode of the current RVU page.
7. **One source.** No number is typed into the design. Every figure resolves from `data/*.js`. If a digit appears in a content position in any `.html` file, that is a bug, and `grep -rn "₹[0-9]" *.html` must return nothing.

---

## F. Voice

- **Address one reader.** Each door speaks to its own audience in the second person. The current live hero — "Empowering Industry Innovators with Top-Tier Talent" — addresses recruiters on a page students arrive at first. Do not repeat that mistake.
- **Controls name actions.** "Start a hiring request", not "Submit". "See the outcomes", not "Learn more". The label says what happens.
- **Rules as capability.** Eligibility is written as *how to stay eligible*, never as grounds for disqualification. Same facts, opposite framing. This applies to every error message and every negative result state.
- **Plain for parents.** No unexplained abbreviations anywhere in the parents' path. LPA expanded on first use. Every figure gets a sentence saying what it means.
- **No superlatives.** A claim carries a number or it is cut. Delete "world-class", "cutting-edge", "top-tier", "best-in-class" on sight.

---

## G. Technical rules

- **Classic scripts, not ES modules.** `type="module"` is blocked over `file://` in Chrome and the site must open by double-clicking `index.html`. Data files assign onto one global: `window.RVU = window.RVU || {}; RVU.placements = {…}`.
- **No `fetch()` for local data** — same reason. Data arrives via `<script src>`.
- No framework, no Tailwind, no preprocessor, no chart library, no icon font, no CDN beyond Google Fonts.
- Icons are inline SVG, 1.5px stroke, `currentColor`.
- Every transition, reveal and animation wrapped in `@media (prefers-reduced-motion: reduce)`.
- One `<h1>` per page. Heading levels never skip.
- Every form field has a real `<label>`. A placeholder is not a label.
- Dynamic results announced with `aria-live="polite"`.
- Visible focus ring on every interactive element, 3:1 against its ground. Never `outline: none` without a replacement.
- **Zero dead links.** Every link resolves to a real page or a real anchor. The live RVU page ships six dead school links; reproducing that would be fatal to the submission.
- **`<noscript>` on every interactive module** carries a notice that states plainly what is unavailable and links to the page that answers the same question without JS — `methodology.html`, or the office contact.
- **A static fallback must never restate a figure.** Doing so creates a second source, which §E.7 forbids. The earlier rule here — that `<noscript>` render the underlying table — conflicted with §E.7 directly. §E.7 wins: one source, always.
- This constraint is an artefact of the static build, not of the design. In the WordPress port the figures render server-side from ACF, so both the no-JS fallback and the SEO concern resolve without changing the data spine. Say so on `methodology.html` rather than leaving a reader to infer it.

---

## H. Production path — keep it portable

rvu.edu.in runs WordPress with WP Rocket and a page builder. This static build must port without a rewrite:

- Keep markup semantic and shallow so it maps to a custom page template or clean Gutenberg blocks.
- Mirror the theme's `--gcid-*` custom property names so the two token systems stay legible to each other.
- Figures are designed to come from ACF fields, a custom post type, or a scheduled sync from the placement sheet. Keeping every number in `data/` is what makes that a swap rather than a rebuild.
- No new webfont request. No added layout shift. No added weight.

---

## I. Before you say a phase is done

- [ ] `grep -rn "₹[0-9]" *.html` → empty
- [ ] every new colour pair measured and the ratio recorded in a comment
- [ ] 390px: no horizontal body scroll, side gutter ≥16px
- [ ] keyboard-complete, visible focus, 44px targets
- [ ] every figure carries its cohort stamp
- [ ] no percentage without its denominator in the same view
- [ ] no dead links
- [ ] opens correctly from `file://`

---

## J. Motion — four primitives, and nothing else

Motion is a budget, not a palette. Four effects exist; adding a fifth is a change to this section, not a styling decision.

1. **Scroll-linked bar fill.** Every bar on the site — distribution, school breakdown, cohort segments — fills as the reader scrolls and **locks permanently once full**. It never animates a second time, including on scroll back up.
2. **Section reveal.** A section's contents fade and rise 12px on first entry, once, 380ms `ease-out`. Never again.
3. **The recruiter ticker.** One continuous horizontal band, paused on hover and on focus.
4. **The figure count-up.** A figure block counts from zero to its value, once, and locks — but **not until the reader has scrolled**. The hub's figure row sits close enough to the top that entry alone fired it on load, so the numbers climbed before anyone had looked at them. Defer the observer, never the animation: the count is the only thing that writes a zero, so a reader who never scrolls keeps the real figure on screen throughout. Added deliberately, replacing this section's earlier blanket ban on counters — the ban existed because a counter shows a wrong number on a site whose whole argument is that its numbers are right, so the effect is allowed **only** under all four of these:
   - **The target is never computed.** It is read from the DOM as rendered by `render.js`, kept verbatim, and written back unchanged at the end. The settled value is byte-identical to the data; only the middle of the animation is ever wrong.
   - **Never on a non-quantity.** A bracketed placeholder has nothing to count to and a date is not a quantity. Both are skipped, so `[XXX]` and `30 Jun 2026` never animate. The regex is anchored, so anything containing more than one number cannot match.
   - **`tabular-nums` is required** on anything that counts, or the box changes width on every frame.
   - **Nothing is announced.** The element is not a live region, so a screen reader reads the settled value once, not every frame.

Plus the existing focus and hover transitions. **No parallax, no scroll-jacking, no carousels beyond the ticker.**

### The two rules that make it safe

- **Nothing is hidden by CSS alone.** Every element rests in its finished, readable state by default. `js/motion.js` applies an offset only at the moment it has committed to animating it back. Delete `js/motion.js` and every page reads identically — bars full, sections visible. A rule that parks content at `opacity: 0` and waits for script is a rule that deletes the page when the script fails.
- **`prefers-reduced-motion` is checked once, at the top of `motion.js`.** Under it the file observes nothing and writes nothing, and the stylesheet forces the resting state. The bar arrives already complete, which is the readable state, so no information is lost. This is required by §G and is not optional.

### How the fill is built

- Animate `transform: scaleX(var(--fill))` with `transform-origin: left center`. **Never animate `width`** — it forces layout on every scroll frame.
- `IntersectionObserver` starts a `requestAnimationFrame` loop per bar; progress maps the bar's position through the viewport to 0→1, reaching 1 when its top hits 65% of viewport height so it completes before leaving the screen.
- At 1: set `--fill: 1`, set `data-filled="true"`, cancel the loop, `unobserve`.
- **Read every `getBoundingClientRect()` first, write every value after.** Interleaving reads and writes makes the browser recompute layout once per bar per frame.
- `RVU.motion.scan()` is idempotent and re-callable: views that rebuild their bars (the outcomes explorer's tabs and toggle) call it after rendering, and a bar already seen or already full is left alone.
- **Do not use `animation-timeline: view()` as the primary path.** MDN lists it as limited availability and not Baseline, so it would silently do nothing in some browsers. It may be added inside `@supports` as an enhancement, but only once the JS path is complete and working.

---
