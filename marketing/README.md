# Cekat Marketing — product landing page (v1)

Static, no-build page for **Cekat Marketing** (formerly “Tracker”, called “Marketing Suite” in the deck).
It is cloned from `../chat-v1/` and uses the same design system, nav and Products menu, type scale, bento grid,
player engine, feature blocks, results band, FAQ, CTA and footer. The content is rewritten from the Marketing deck.

```bash
python3 -m http.server 8834   # or the shared server: http://localhost:8834/marketing/
```

Hosted at a GitHub Pages **sub-path** (`…/cekat-mockup-audrey/marketing/`), so every path is **relative**
(`./assets/…`, `css/styles.css`, `js/main.js`). No `<base>`, no leading `/`. The only CDN is Google Fonts.

```
index.html        markup, one <section> per block + an inline SVG icon sprite (<symbol id="i-…">)
css/styles.css    tokens → base → nav → section → hero → micro-UI → players → bento tiles → how-it-works
                  → feature blocks → results → FAQ → CTA → footer → responsive → reduced motion
js/main.js        nav (click-only dropdowns) · reveal-on-scroll · players · count-up (ints, decimals, thousands)
assets/           logo, product icons, meta/tiktok/googleads icons, illus-qr.svg (Chat-only assets removed)
```

## Page structure

| # | Block | Notes |
|---|---|---|
| 1 | Nav | Same as Chat. Marketing is `is-current` (“You’re here”, `./`). Chat → `../chat/`, others → `../`. |
| 2 | Hero | “Cekat Marketing” pill, plain navy H1 “Stop guessing. Start growing.”, one line, Start Free Trial + Book a demo. Visual: a dashboard card (Ad spend $4,200 · Cost per lead $18.40 · ROAS 3.1×, plus a Revenue/Ad spend line chart) and one accent card (Ad → Chat → Paid, “Credited to Meta ad”). Motion: the line wipes in, the KPIs count up, the end dot pulses. |
| 3 | Bento `#features` | 10 tiles. Layout `01 01 02 02 / 01 01 03 04 / 05 06 03 07 / 08 08 09 10`. Deep accents are 02 (navy), 06 (blue) and 09 (navy), and none of them touch. |
| 4 | How it works `#how` | Unify → Analyze → Act cards on a thin line, plus “No developer…” line. |
| 5 | Feature blocks `#stories` | A: Ad-driven sales don’t hide as “organic” (Puffy Cotton Candy quote) · B: Teach Meta who actually buys (EuroMedica quote) · C: Meta shows 10 booked, Cekat shows who (no proof). |
| 6 | Results `#results` | EuroMedica 5× booking rate, 3× CTR · Puffy Cotton Candy 2× revenue (ROAS up), 3–4× in high season. |
| 7 | FAQ, CTA, footer | The CTA is “Decide with data, not feeling.” The ISO/UU PDP footer line is removed. |

### Bento tiles

| # | Size | Tile | Illustration (`.usp-card__art`) |
|---|---|---|---|
| 01 | big | Every source, one dashboard | `.srct` All-sources table (the Impressions column is hidden on mobile) |
| 02 | wide, navy | Ad sales don’t hide as “organic” | `.wifi` see ad → coworker → buys, with a Wi-Fi badge and “Credited to the ad” |
| 03 | tall | Teach Meta who actually buys | `.capi` stage toggles (`.tog--on` animates on) and “Sent to Meta” |
| 04 | 1×1 | Sync Meta, TikTok & Google | `.sync` logos + ✓ Connected |
| 05 | 1×1 | Track every creator | `.paste` link types in → Add → Tracking |
| 06 | 1×1, blue | Links & QR codes | `.qrc` QR scan line + CSS `@property` counter (1,180 → 1,284) |
| 07 | 1×1 | Which source books the most? | `.hbars` horizontal bars (Paid Ads #1A56DB, rest #93B4F5) |
| 08 | wide | See which ad works. Then watch it. | `.ads` top-ads list + `.phone` play + progress |
| 09 | 1×1, navy | Click a lead, see the journey | `.jrny` timeline |
| 10 | 1×1, 2 scenes | Reach them personally | `.seg` Clicked only / Booked a meeting → message → Send |

## Style rules (kept from Chat, plus Marketing-specific)

- Clean and minimal: white and navy with lots of air. No gradient text anywhere (the `.grad` helper is gone). No dot grids, no logo band or “Trusted by” line, no trial microcopy, no “2M+”, no ISO/UU PDP badges.
- **Charts:** Cekat blue `--c1:#1A56DB` for the primary series, pale blue `--c2:#93B4F5` for the secondary one, hairline grid `--grid:#EEF2F8`, white cards and minimal dots. No near-black lines and no teal/orange. Two-series charts carry a legend, and the pale series is never the only signal (it always has a label or value next to it).
- Every section is a headline plus at most one short line. Every illustration is one main card plus at most one accent (`.faccent` in the feature stages).
- Nav dropdowns open **on click only**. `prefers-reduced-motion` turns off every animation and reveals everything.
- Players work exactly as in chat-v1: `data-player`, `data-scenes`, `data-loop`, `data-trigger="view"`, `.a` / `.a-stamp` with `--d`.

## Content sources

- Copy and features: `../research/marketing-deck/deck-text.md` + `slide-01…10.png` (Unify → Analyze → Act).
- **Illustrative demo data only** (never presented as customer results): the deck dashboard numbers (412,000 impressions, 186 booked, “Reel · AI replies in 3s” …) plus US/USD extras ($4,200 ad spend, $18.40 CPL, 3.1× ROAS, Emily, Jake, Megan, Ryan, @jakecooks).
- Proof: only `../research/client-intel.json`, translated faithfully. Labels come from “Vertical (Matt)”: EuroMedica = Healthcare · Clinic, Puffy Cotton Candy = Retail · Food brands.
- `assets/products/marketing.svg` is still a placeholder icon (see the comment in the file).
