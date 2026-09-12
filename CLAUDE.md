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

| Style | Size / line-height | Tracking | Use |
|---|---|---|---|
| Display XL | 132 / 122 | −0.02em | page title only |
| Display L | 48 / 53 | −0.015em | section openers |
| Display M | 32 / 36 | −0.01em | sub-sections |
| Heading | 27 / 32 | — | door and card titles |
| Figure | 58 / 58 | — | stat blocks, `tabular-nums` |
| Body L | 17 / 27 | — | intros, measure 62–68ch |
| Body | 15 / 24 | — | cards, table cells |
| Caption | 13 / 21 italic | — | notes, methodology, cohort stamps |
| Label | 10–11 / 16 uppercase | 0.16–0.18em | eyebrows, figure captions |

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
- `<noscript>` on every interactive module renders the underlying table so the content is never JS-gated.

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
