# Cekat Chat — product landing page (v1, template)

Static, no-build page. Open `index.html` directly or serve the folder:

```bash
python3 -m http.server 8833   # http://localhost:8833/
```

Hosted at a GitHub Pages **sub-path** (`…/cekat-mockup-audrey/chat/`), so every path is **relative**
(`./assets/…`, `css/styles.css`, `js/main.js`). No `<base>`, no leading `/`. The only CDN is Google Fonts.

```
index.html        markup, one <section> per block (commented headers)
css/styles.css    tokens at the top → base → nav → section pattern → components → responsive → reduced motion
js/main.js        nav · reveal-on-scroll · players (card/illustration animations) · hero chat loop · count-up
assets/           logos, channel icons, headshots + illus-qr.svg / illus-serum.svg / illus-map.svg (made for this page)
```

## Style rules (Audrey, round 2): clean and minimal

- No dotted or dot-grid backgrounds anywhere. Soft blue glows are fine.
- Every section is a headline plus at most **one** short line (about 12 words). No body paragraphs, no bullet lists.
- Eyebrows are plain small blue text, not pills. No decorative status badges or microcopy chips.
- Every illustration is **one main card plus at most one small accent**.
- Proof stays, but quietly: a thin left rule, small type, and the client name with its vertical.
- Section spacing: `--sec-pad` is 96px desktop, 80px tablet, 64px mobile.
- Type scale (same as homepage-v1): hero h1 64px at 1440 (about 40px at 390), section h2 38px, card h3 20px, body 15–17px, nav 14px, buttons 15px.
- Nav dropdowns open **on click only** (never on hover). Closed panels get `pointer-events:none`; Esc or an outside click closes them.
- Logo row: one plain row of grey logos at 60% opacity, a 50s loop and soft edge fades. No tiles.
- Demo content is **US-flavoured and in USD**: US names (Emily, Megan, Jake), Brooklyn/Williamsburg, UPS Ground, “Scan to pay”, miles. No Rp, QRIS, local couriers or Indonesian demo names. Real client names, quotes, stats and the footer office address stay as they are.

## Section pattern

Every block uses the same skeleton, so it can be reused for any product:

```html
<section class="section [section--soft | section--navy]" id="…">
  <div class="wrap">
    <header class="section__head">
      <p class="section__eyebrow">Eyebrow</p>
      <h2 class="section__title">Title <span class="grad">highlight</span></h2>
      <p class="section__lead">One line.</p>
    </header>
    …content…
  </div>
</section>
```

| Block | Classes | Notes |
|---|---|---|
| Hero | `.hero`, `.hero__copy`, `.hero__vis`, `.proofbar`, `.marquee` | Visual is product-specific; keep the copy column, CTAs and proof strip as they are. |
| USP bento | `.usp-grid > .usp-card` + size `--big` (2×2) · `--wide` (2×1, text left / art right) · `--tall` (1×2) · default 1×1; tone `--l0…l3` (white → #e6eefb, hairline border) or `--d1`/`--d2` (deep blue accent) | Desktop: 4 columns × `--tile-h` (240px) rows. Chat layout = `01 01 02 02 / 01 01 03 04 / 05 06 03 07 / 08 08 09 09`, so auto-flow keeps 01→09 with no holes. Use only 2–3 deep accents and keep them apart. Tablet: 2 columns (big/wide span 2). Mobile: 1 column with fixed heights per size. Put the strongest hooks in the big tiles; 1×1 tiles need a one-line description and a compact illustration (≈80px). |
| Feature → benefit → proof | `.feature-block[--reverse]` > `__copy` + `__visual` | Eyebrow = the feature, `__title` = the benefit, `__text` = one line, then a quiet `.proof-quote` (with an optional `.proof-stat`). The visual sits in a `.stage` (`.stage--night` = navy). |
| Proof | `.proof-quote`, `.proof-stat`, `.proof-stat--line`, `.proof-quote--card`, `.stat--big` | **Only real data from `research/client-intel.json`, credited to that client.** |
| Results | `.section--navy.results > .results__grid > .stat--big` | `<span data-count="40">40</span>` counts up from 0. |
| Testimonials | `.quote-grid > .proof-quote--card` | Show 3. `.proof-quote__brand` holds a grey logo (`assets/logos-mono`) or a `.wordmark` text, so every quote starts on the same line. Avatar (`.avatar`) only when the headshot is from the same client; otherwise use `.badge-initials`. |
| Channels | `.channels__list`, `.meta-line` | |
| FAQ | `.faq__list > details.faq__item` | Native `<details>`, so it works with the keyboard and without JS. |
| Final CTA, footer | `.cta`, `.foot` | Footer is copied from `homepage-v1`. |

### Animation engine (“players”)

Any element with `data-player` is static by default (its composed final state) and animates while it is active.

- `data-scenes="n"` + `.scene` children (the first has `.is-on`): cycles between ideas. `data-scene-ms` sets the time per scene.
- With a single scene, `data-loop` sets how often the sequence replays.
- `data-mode="state"`: there are no scenes. JS sets `data-state="0…n-1"` and CSS styles each state (see the routing card).
- What starts a player: hover or keyboard focus on desktop. On touch devices (`hover: none`) it plays while in view. `data-trigger="view"` always plays while in view (used for the feature visuals).
- Inside the active scene, children animate in on the `.play` class: `.a` (fade/slide in at `style="--d:.6s"`), `.a-typing` (typing dots shown, then hidden), `.a-stamp`, `.a-draw`, `.a-travel`, `.a-pick`.
- `prefers-reduced-motion`: players never start, reveals show immediately and all keyframes are off.
- Cards with 2+ ideas get a tiny `.dots` indicator (`<span class="dots"><i></i><i></i></span>`). The active dot follows `data-scene`.
- Card illustrations are centred in the art area, which keeps the same bottom padding on every card. Keep the static (final) state complete with 2–3 elements, because that is what people see first.
- Hero chat: the bubbles before the first `data-typing` element are the resting state (never an empty window). The loop continues the conversation, older bubbles scroll off the top, and then it fades back to the resting state.

## Cloning for another product (CRM, Marketing, Broadcasts, Automation, Analytics)

1. Copy this folder to e.g. `../crm-v1/`. Assets, CSS and JS stay as they are.
2. In the nav dropdown (`.prod-menu`), move `is-current` and `aria-current="page"` to the new product. Point the other items to their pages (`../chat/`, `../crm/` …) once those exist. Today they point to `../` (home). Do the same in the footer "Product" column.
3. Hero: change the eyebrow, H1, sub-line and the `.hero__vis` illustration. Keep the CTAs and the proof strip.
4. USP grid: rewrite the 10 bento cards (4-col layout: 01 big · 02 wide · 03 tall · 04–07 small · 08 wide · 09–10 small; no holes, deep tiles never touching). Reuse the existing mini-components where they fit (`.bubble`, `.chip`, `.share`, `.fu`, `.collab__card`, `.route`, `.paycard`, `.map`), or build new ones inside `.usp-card__art`.
5. Feature blocks: 3–4 `.feature-block`, alternating `--reverse`. Each ends with real proof from `client-intel.json`.
6. Results, testimonials, FAQ: choose clients and numbers that match the product. Never invent quotes or stats. The only allowed company-level claims are “3,000+ brands” and “15 industries”.
7. Update `<title>` and `<meta name="description">`.

## Content sources

- Quotes and numbers: `../research/client-intel.json`, translated faithfully from Bahasa.
- Client labels come from the sheet's **“Vertical (Matt)”** column (`A -> B` becomes `A · B`, e.g. DokterHub = “Healthcare · Hospitals”). Meaningless suffixes are dropped: “Retail · Other” → “Retail”, “Services · Other” → “Services”, “Healthcare · Clinic (Skin, Hair, Dental)” → “Healthcare · Clinic”.
- Direction: `../moodboard/MOODBOARD.md` (“Chat page”, slide 10 = this layout, option 1).
- Naming: the intel sheet's “Universitas Multimedia Nusantara” row is shown as **Politeknik Multimedia Nusantara** everywhere, matching the logo asset and the YouTube story “Respons MNP Naik 90%”.
