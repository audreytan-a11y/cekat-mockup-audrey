# Cekat Chat — product landing page (v2, "list + stage")

Static, no-build page. Open `index.html` through any static server, e.g.
`python3 -m http.server 8836` → http://localhost:8836/.
Hosted at `…/cekat-mockup-audrey/chat-v2/`, so **all paths are relative** (`./assets/…`, `css/…`, `js/…`).
Never use `/`-absolute paths or `<base>`. The only CDN is Google Fonts.

```
index.html
css/styles.css   tokens → base → section pattern → components → responsive → reduced motion
js/main.js       nav · reveal · marquee · step player · USP showcase · inline animations · count-up
assets/          logos, client logos, channel icons, headshots
                 + usp-icons.svg (icon sprite), qr-demo.svg, map-demo.svg (made for this page)
```

## Page order (same for every product page)
1. **Nav**: same as homepage-v1. Mark the current product with `.mega__item.is-current` + `aria-current="page"`.
2. **Hero**: a two-line `.h1`, one short sub line and 2 CTAs, with the visual (orbit plus chat card) on the right.
   Below it, `.proofstrip` + `.marquee` with client logos.
3. **USP showcase** `.usp-showcase`: the hook list (`.usp-list`) on the left, the animated `.usp-stage` on the right.
4. **Feature → benefit → proof** `.feature-block` ×4. Add `--rev` to flip sides.
5. **Results** `.section--navy.results`: big count-up numbers (`.stat`) with tiny labels, no boxes.
6. **Testimonials** `.tgrid`: the 3 strongest `.tcard`s, each with a client logo (or a grey text wordmark), quote, client and vertical. No personal names.
7. **Channels / integrations** `.channels`.
8. **FAQ**: native `<details class="faq__item">`.
9. **Final CTA** `.section--navy.cta`.
10. **Footer**: same as homepage-v1.

## Section pattern
```html
<section class="section [section--glow | section--tint | section--navy]">
  <div class="wrap">
    <header class="section__head rv">
      <p class="section__eyebrow">Label</p>
      <h2 class="section__title">Hook</h2>
      <p class="section__lead">One line.</p>
    </header>
    …
  </div>
</section>
```
`.rv` = reveal on scroll. Set `style="--d:.06s"` to stagger it.

### Feature block (feature → benefit → proof)
```html
<article class="feature-block [feature-block--rev]">
  <div class="feature-block__copy rv">
    <p class="section__eyebrow">Feature name</p>
    <h2 class="feature-block__title">Benefit hook</h2>
    <p class="feature-block__text">One short line (≤ 12 words).</p>
    <!-- ONE proof: a quote OR a stat -->
    <figure class="proof-quote"><blockquote>“…”</blockquote><figcaption><b>Client</b> · Vertical</figcaption></figure>
    <div class="proof-stat"><b>+30–40%</b><span>what it measures</span><small><b>Client</b> · Vertical</small></div>
  </div>
  <div class="feature-block__vis rv"> <div class="anim" data-loop>ONE main card (+ max one small accent)</div> </div>
</article>
```

### Style rules (Audrey, round 2: clean and minimal, Apple/Linear feel)
- No dot grids anywhere. Only soft white and blue gradients and subtle glows.
- Every section is a headline plus at most one short line. No paragraphs, no microcopy chips.
- Eyebrows are plain blue text (`.section__eyebrow`), never pills.
- Each illustration or stage scene is one main card with at most one small `.chip--float` accent.
- Proof is quiet: one quote or one stat per block. Client labels are short (e.g. "Retail", "Healthcare · Clinic").
- Leave plenty of whitespace (`--sec-pad: 150px` on desktop).

## The step engine (shared by stage scenes and every `.anim`)
Any `.scene` (in the stage) or `.anim` (anywhere else) is played by the same `Player` in `main.js`:

| attribute | effect |
|---|---|
| `data-step="n"` | hidden until step *n*, then gets `.on` (fade/slide in) |
| `data-act="n"` | never hidden; gets `.on` at step *n* (state change: toggle, highlight, slider) |
| `data-until="n"` | gets `.off` at step *n* (e.g. typing dots replaced by the reply) |
| `data-alloc-from / data-alloc-to` | on an `.alloc__bar`: animates the AI/human split |
| `.frame` children | alternate inside one scene (for hooks with 2+ ideas); the stage shows clickable frame dots, labelled by `data-label` |
| `data-gap`, `data-hold` | ms between steps / pause after the last step |
| `data-loop` (on `.anim`) | replay while in view |

Put a typing indicator and its reply in the same `.slot` so they share one spot in the layout.
**Resting state:** every scene and `.anim` loads with the conversation already finished. It only replays once it has been on screen for 0.9s, or when it becomes the active tab. When it stops or leaves the screen, it jumps back to the finished state, so a chat window is never empty.
- Step 1 appears straight away on every replay.
- Stage scenes with one idea play once, then hold. Scenes with 2+ `.frame`s keep alternating.
- With `prefers-reduced-motion`, or when a screenshot tool stretches the viewport to the full page height (`.is-capture`), everything shows its final state with no timers.

**Stage:** a clean soft-blue panel. Each scene is one main card, zoomed ×1.3 on desktop, with at most one `.chip--float` accent (`--tl`, `--tr`, `--bl` or `--br`). The accent bobs gently and has a slight mouse parallax.

### USP showcase wiring
```html
<button class="usp-item" role="tab" id="tab-X" aria-controls="scene-X" data-scene="X">icon + <b>title</b><small>line</small><i class="usp-item__bar"></i></button>
…
<div class="scene" id="scene-X" data-scene="X" role="tabpanel" aria-labelledby="tab-X">…</div>
```
- **Autoplay:** while the section is in view, the showcase moves to the next item after `max(5.2s, length of the scene)`. A progress bar runs on the active item.
- **Pause and stop:** autoplay pauses while the mouse is over the section. It stops for good after any click, item hover or arrow key.
- **Mobile (≤1024px):** the list turns into a row of chips you can swipe sideways. `.usp-caption` under the stage shows the active item's text.
- **Group labels:** `.usp-group` adds a label inside the list (3-3-3 here).

Reusable scene parts: `.cc` chat card, `.mb--cust` / `.mb--ai` bubbles, `.typing`, `.chip--float` (`--tl`, `--tr`, `--br`),
`.check`, `.map`, `.ship`, `.order` + `.qr`, `.fu` timeline, `.alloc` slider, `.sched` day/night, `.route`, `.summary`, `.note`, `.assign`, `.flow`.

## Cloning for another product (CRM, Marketing, Broadcasts, Automation, Analytics)
1. Copy this folder to `../crm-v1/` (or another name). Keep `assets/`, or point it at a shared copy using relative paths.
2. Nav: move `is-current` / `aria-current` to the new product. Point `Chat` at `../chat-v2/`.
3. Hero: change the eyebrow, the H1, the sub line and the visual. Inside the visual, keep `.anim` + `data-step` so it animates the same way.
4. USP showcase: replace the `.usp-item`s and their `.scene`s. Keep the `data-scene` / `aria-controls` pairs matching. Build scenes from the existing parts, or add new ones in CSS §11.
5. Feature blocks, results, testimonials: **only use numbers and quotes from `research/client-intel.json`**, always naming the client and vertical. The only company-wide claims allowed are "3,000+ brands" and "15 industries".
6. Design tokens are at the top of `styles.css`. Don't add new colours; stay with white and Cekat blues, with one or two navy sections.

## Pre-publish rules (shared with homepage-v1)
- **Demo content is US-flavoured, priced in USD.** Use US names, places, couriers and dollar prices (e.g. "$14.90", "UPS Ground", "Williamsburg · 1.2 mi"). Real client names, logos, quotes, stats and the footer office address stay as they are.
  Check: `grep -niE "Rp ?[0-9]|QRIS|JNE|\bCOD\b|Surabaya|Bandung|Jakarta|Kemang|[0-9] ?km\b|Rina|Budi|ongkir"`. The only hit should be the footer office address.
- **Nav dropdowns open on click only** (`.dd.is-open`). They close on an outside click or Esc. Closed panels use `pointer-events:none`. No hover listeners.
- **Type scale:** hero h1 64px at 1440 (about 37px at 390), section h2 38px, body 15–17px, nav 14px, buttons 15px.
- **Spacing:** section padding is 96px on desktop and 64px on mobile.
- **Logo row:** one plain row of muted grayscale logos with no tiles, on a 50s loop with masked edge fades.
