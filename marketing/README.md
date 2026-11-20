# Cekat Marketing — product landing page (v1)

Static, no-build page for **Cekat Marketing** (formerly “Tracker”, called “Marketing Suite” in the deck).
It is cloned from `../chat-v1/` and uses the same design system, nav and Products menu, type scale, bento grid,
player engine, feature blocks, results band, FAQ, CTA and footer. The content is rewritten from the Marketing deck.

```bash
python3 -m http.server 8834   # or the shared server: http://localhost:8834/marketing/
```

Hosted at a GitHub Pages **sub-path** (`…/cekat-mockup-audrey/marketing/`), so every path is **relative**
(`./assets/…`, `css/styles.css?v=mk5`, `js/main.js?v=mk5`; bump the `v=` param on every release). No `<base>`, no leading `/`. The only CDN is Google Fonts.

```
index.html        markup, one <section> per block + an inline SVG icon sprite (<symbol id="i-…">)
css/styles.css    tokens → base → nav → section → hero → micro-UI → players → bento tiles
                  → feature blocks → results → FAQ → CTA → footer → responsive → reduced motion
js/main.js        nav (click-only dropdowns) · reveal-on-scroll · hero scenes · flow rail · players · count-up
assets/           logo, product icons, meta/tiktok/googleads icons, illus-qr.svg (Chat-only assets removed)
```

## Page structure (mk2 — Audrey review, deck slides 28–31)

| # | Block | Notes |
|---|---|---|
| 1 | Nav | Same as Chat. Marketing is `is-current`. Chat → `../chat/`, CRM → `../crm/`, others → `../`. Click-only dropdown. |
| 2 | Hero | mk5: homepage product-card pattern. H1 “Scale what works.” (navy) + rotating solid-blue line 2 (“Stop redoing what doesn’t.” / “See CTR, conversion and sales by source.”, fixed reserved height). Sub “See which ad, creator or link brings revenue, from first click to paid.” Visual `.hx` card: slide 1 Ad → Chat → Booked journey, slide 2 CTR/Conversion/Sales by source (`[data-metric]`, same as the Analyze tile). ONE 3s timer (main.js “HERO SYNC”), dots, pause on hover/focus/out of view. Reduced motion: first pair static, dots still switch. Old 4-scene card: `../backups/marketing-v1-pre-mk5-hero`. |
| 3 | Features `#features` | “Scale what works. Stop what doesn’t.” Bento grouped in `.flow` → 3 `.grp` (01 Unify · 02 Analyze · 03 Act), each with its own named-area `.usp-grid--*`, one deep tile per group, and a left rail that fills on scroll. Quiet line under the groups: “No developer…”. The old `#how` section is gone. |
| 4 | Feature blocks `#stories` | `section--soft`, same shape as chat-v1 `#features`: no eyebrows, title + solid-blue `.grad` span, one line, quote + “Client · Vertical”. |
| 5 | Results, FAQ, CTA, footer | Unchanged. |

### Bento groups

| Group | Desktop areas (4 cols) | Cards |
|---|---|---|
| Unify | `src src sync crt / src src qr qr` | All sources (table) · Sync Meta, TikTok & Google · Track every creator · Links & QR (blue) |
| Analyze | `org org org bars / ads ads ads bars` | Ad-driven sales don’t hide as “organic” (navy) · Which source books the most? (tall bars) · See which ad works, then watch it |
| Act | `capi capi jrny seg` (330px row) | Teach Meta who actually buys · Click a lead, see the journey (navy) · Reach them personally |

Tablet (761–1024) uses 2-col areas; mobile is one column with fixed per-card heights (see the mk2 block at the end of `styles.css`).
Card numbers were dropped: the group step numbers replace them.

## Style rules (kept from Chat, plus Marketing-specific)

- Clean and minimal: white and navy with lots of air. No gradient text anywhere: `.grad` is solid `color:var(--primary)`, as in chat-v1. No dot grids, no logo band or “Trusted by” line, no trial microcopy, no “2M+”, no ISO/UU PDP badges.
- **Charts:** Cekat blue `--c1:#1A56DB` for the primary series, pale blue `--c2:#93B4F5` for the secondary one, hairline grid `--grid:#EEF2F8`, white cards and minimal dots. No near-black lines and no teal/orange. Two-series charts carry a legend, and the pale series is never the only signal (it always has a label or value next to it).
- Every section is a headline plus at most one short line. Every illustration is one main card plus at most one accent (`.faccent` in the feature stages).
- Nav dropdowns open **on click only**. `prefers-reduced-motion` turns off every animation and reveals everything.
- Players work exactly as in chat-v1: `data-player`, `data-scenes`, `data-loop`, `data-trigger="view"`, `.a` / `.a-stamp` with `--d`.

## Content sources

- Copy and features: `../research/marketing-deck/deck-text.md` + `slide-01…10.png` (Unify → Analyze → Act).
- **Illustrative demo data only** (never presented as customer results): the deck dashboard numbers (412,000 impressions, 186 booked, “Reel · AI replies in 3s” …) plus US/USD extras ($4,200 ad spend, $18.40 CPL, 3.1× ROAS, Emily, Jake, Megan, Ryan, @jakecooks).
- Proof: only `../research/client-intel.json`, translated faithfully. Labels come from “Vertical (Matt)”: EuroMedica = Healthcare · Clinic, Puffy Cotton Candy = Retail · Food brands.
- `assets/products/marketing.svg` is still a placeholder icon (see the comment in the file).
