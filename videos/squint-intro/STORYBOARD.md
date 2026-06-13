# Storyboard: Squint Introduction Video

**Format:** 1920×1080
**Pacing:** Moderate — 5 beats, composed layouts, neo-brutalist cuts
**Audio:** Narration + energetic rock underscore + crisp UI click/snap SFX
**VO direction:** Dry, confident, brutally honest, punchy delivery
**Style basis:** DESIGN.md (Neo-Brutalist, black borders, hard shadows, Blaze Orange and Neo Green accents, Inter/JetBrains Mono typography)
**Narration start:** 0.2s

---

## Asset Audit

| Asset | Type | Where (beat #) | Role |
|---|---|---|---|
| `capture/screenshots/scroll-000.png` | PNG | Beat 2 | Visual reference for the user's initial screen state |
| `capture/screenshots/scroll-047.png` | PNG | SKIP | Substituted by composed card layouts for better animation quality |
| `capture/screenshots/scroll-094.png` | PNG | Beat 4 | Shows the landing page scorecard context |
| `capture/screenshots/scroll-100.png` | PNG | SKIP | Not needed for the core message |

---

## Beats

### BEAT 1 — HOOK (0:00–0:04.5)
*   **Concept:** High contrast hook to grab developer/founder attention.
*   **VO cue:** "Stop guessing if your landing page converts. Get it squinted."
*   **Visual description:** Dutch angle shot. Bright Blaze Orange background with a grain overlay. A massive white card with thick 2px black borders and an 8px hard black drop shadow slams into the center. Bold, black, uppercase text types on inside the card: "STOP GUESSING." then "GET SQUINTED."
*   **Composition + Accents:**
    *   *Composed*: Center title card div. Size: 70% width, 50% height. Text scales and slams down.
    *   *Accents*: None.
*   **Text Animations:**
    *   Headline: `slam-left` (punchy slam in from left)
    *   Tagline: `typewriter` (stepped reveal)
*   **SFX:** `sfx/impact-bass-1.mp3` at 0.1s, volume 0.5 (heavy impact on card slam)
*   **Timing:** Transition in at: 0.0s · GSAP duration: 4.35s

### BEAT 2 — THE AUDIT (4.35–11.20s)
*   **Concept:** Demonstration of the input and the "5-second scan" concept.
*   **VO cue:** "Squint runs a brutally honest 5-second scan of your page through the eyes of specialized AI personas."
*   **Visual description:** Close-up shot. An off-white browser mockup container enters. Inside, we see a clean, composed input field. The text `https://my-saas.com` types into the box, a cursor snaps to the Blaze Orange "Audit" button, and clicking it causes a glowing scanner sweep overlay to slide down across the screen.
*   **Composition + Accents:**
    *   *Composed*: Composed input container + "Audit" button. Scanning laser sweep is a `div` with a linear-gradient background.
    *   *Accents*: `capture/screenshots/scroll-000.png` fills 60% of the browser mockup background.
*   **Text Animations:**
    *   Input Text: `typewriter`
    *   Button: `pop` (button depress animation)
*   **SFX:** `sfx/click.mp3` at 2.2s, volume 0.3 (button click sound)
*   **Timing:** Transition in at: 4.35s · GSAP duration: 6.85s

### BEAT 3 — THE CRITICS (11.20–16.40s)
*   **Concept:** Introducing the brutally honest AI critics.
*   **VO cue:** "Like the Skeptical Engineer who hates jargon, or the Busy Founder looking for value."
*   **Visual description:** Medium shot. Two neo-brutalist critic cards slide in from the left and right. 
    1. Card 1 (Left, Orange highlight): "BUSY FOUNDER". A speech bubble pops up: *"What does this even do? Way too much generic corporate fluff."*
    2. Card 2 (Right, Green highlight): "SKEPTICAL ENGINEER". A speech bubble pops up: *"Show me the code. Where is your pricing page?"*
*   **Composition + Accents:**
    *   *Composed*: Two card containers staggered at 120ms intervals.
    *   *Accents*: None.
*   **Text Animations:**
    *   Founder Card: `slam-left`
    *   Engineer Card: `slam-right`
    *   Speech bubbles: `typewriter`
*   **SFX:** `sfx/pop.mp3` at 0.3s (Card 1 pop), `sfx/pop.mp3` at 1.0s (Card 2 pop), volume 0.4
*   **Timing:** Transition in at: 11.20s · GSAP duration: 5.20s

### BEAT 4 — SCORECARD & MOCKUPS (16.40–22.00s)
*   **Concept:** Revealing the results: scorecards and before/after improvements.
*   **VO cue:** "Get copy-ready fixes, conversion scorecards, and visual mockup transformations."
*   **Visual description:** Medium shot. On the left, a scorecard list animates in one-by-one showing metrics (Value Prop: 4/10, Copy: 3/10, Trust: 5/10). On the right, a mockup container shows a "BEFORE" screenshot of a page, then a vertical divider slides across revealing the "AFTER" mockup with clearer, punchier text.
*   **Composition + Accents:**
    *   *Composed*: Scorecard lines with numerical counters. Before-after slider line and mask.
    *   *Accents*: `capture/screenshots/scroll-094.png` (displays scorecard backdrop details at 30% opacity).
*   **Text Animations:**
    *   Score list: `fade-up` (staggered)
    *   Score values: `counter` (rolls up digits)
*   **SFX:** `sfx/ping.mp3` at 1.2s, volume 0.3 (score highlights)
*   **Timing:** Transition in at: 16.40s · GSAP duration: 5.60s

### BEAT 5 — CALL TO ACTION (22.00–27.90s)
*   **Concept:** Strong, high-contrast wrap-up.
*   **VO cue:** "Stop hoping. Audit your page now at Squint."
*   **Visual description:** Centered Wide shot. The background transitions to solid Blaze Orange. A massive black logo "SQUINT" slams down, stretching slightly on impact. The tagline "Stop hoping. Audit now." types below it in JetBrains Mono.
*   **Composition + Accents:**
    *   *Composed*: Centered big text block with bold border accent box below.
    *   *Accents*: None.
*   **Text Animations:**
    *   Main Logo: `slam-down`
    *   CTA Tagline: `typewriter`
*   **SFX:** `sfx/whoosh-cinematic.mp3` at 0.0s, volume 0.4 (cinematic finish)
*   **Timing:** Transition in at: 22.00s · GSAP duration: 5.90s

---

## Production Architecture

```
videos/squint-intro/
├── index.html
├── DESIGN.md
├── SCRIPT.md
└── STORYBOARD.md
```
